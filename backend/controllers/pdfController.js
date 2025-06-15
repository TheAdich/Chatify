const fs = require('fs');
const pdf = require('pdf-parse');
const { v4 } = require('uuid')
const client = require('../postgresDb/connection');
const multer = require('multer');
const { set } = require('mongoose');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})

const upload = multer({ storage: storage });


const getChunks = (text) => {
    try {
        const chunkSize = 600;
        const overlap = 100;
        const chunks = [];
        const words = text.split(/\s+/);
        // removing \\n and \r characters
        const cleanedWords = words.map(word => word.replace(/\\n|\\r/g, ' ').trim()).filter(word => word.length > 0);

        for (let i = 0; i < cleanedWords.length; i += chunkSize - overlap) {
            const chunk = cleanedWords.slice(i, i + chunkSize).join(' ');
            if (chunk.trim()) {
                chunks.push(chunk);
            }
        }
        return chunks;

    }
    catch (error) {
        console.error('Error in getChunks:', error);
        throw new Error('Failed to generate text chunks');
    }
};

const generateEmbeddings = async (chunk, taskType) => {

    try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: chunk,
            config: {
                taskType: taskType || 'RETRIEVAL_DOCUMENT'
            }
        });

        //console.log(response.embeddings[0].values);
        return response.embeddings[0].values;
    } catch (error) {
        console.error('Error generating embeddings:', error);
        throw new Error('Failed to generate embeddings');
    }
}



const pdfController = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const filePath = file.path;
        //console.log(file, filePath);
        let dataBuffer = fs.readFileSync(filePath);
        const extract_data = await pdf(dataBuffer);
        const { text } = extract_data;
        const chunks = getChunks(JSON.stringify(text));
        const file_name = file.originalname;
        
        const file_uniq_id = `${v4()}`;
        const embedding_object = [];
        //generate embeddings for each chunk
        for (const chunk of chunks) {
            const embedding_vector = await generateEmbeddings(chunk, "RETRIEVAL_DOCUMENT");
            embedding_object.push({
                file_name: file_name,
                file_uniq_id: file_uniq_id,
                content: chunk,
                embedding: embedding_vector
            })
            setTimeout(() => { }, 200); // Adding a delay to avoid rate limiting
        }

        //Insert the data into Postgres
        const query = 'INSERT INTO pdf_chunks (file_name, file_uniq_id, content, embedding) VALUES($1, $2, $3, $4::vector)';
        const pgVector = await Promise.allSettled(embedding_object.map(async (item) => {
            const values = [item.file_name, item.file_uniq_id, item.content, Array.isArray(item.embedding) ? JSON.stringify(item.embedding) : item.embedding];
            try {
                //console.log(values[3]);
                await client.query(query, values);
            } catch (err) {
                console.error('Error inserting data:', err);
                throw err; // Rethrow to handle it in the catch block
            }
        }
        ));



        // Check if any insertion failed   
        pgVector.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Error inserting chunk ${index + 1}:`, result.reason);
            }
            else {
                console.log(`Chunk ${index + 1} inserted successfully`);
            }
        });

       
        fs.unlinkSync(filePath);
        return res.status(200).json({ message: 'File uploaded successfully', file_uniq_id:file_uniq_id });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


const generateAnswer = async (question, relevant_chunks) => {
    try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents:

                `Answer the question based on the following context:

                        ${relevant_chunks.map(chunk => `- ${chunk}`).join('\n')}\n\n
                        Question: ${question}\nAnswer:'
                `
            ,
            config: {
                systemInstruction: `You are an expert assistant trained to provide precise, well-structured, and contextually accurate answers.
                Your response should be detailed yet concise, similar to how a domain expert would explain it to a college-level reader.
                If the answer involves multiple steps or points, structure it in a readable and organized manner. Use bullet points or numbered lists if helpful.
                Always infer from the given context and avoid making up information not found there.`,
                maxOutputTokens: 1024,
                temperature: 0.6,
            }
        })
        //console.log(response.candidates[0].content);
        return response.candidates[0].content.parts[0].text;
    } catch (err) {
        console.log(err);
        throw new Error('Failed to generate answer');
    }
}

const automated_answer = async (req, res) => {
    try {
        const { question, file_uniq_id } = req.body;
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }
        // first we get the embeddings for the question
        const question_embedding = await generateEmbeddings(question, "RETRIEVAL_QUERY");

        // then we query the postgres db to get the most similar chunks
        const similarity_threshold = 0.4;
        const query = `
            SELECT content, 1-(embedding <=> $2::vector) AS similarity
            FROM pdf_chunks
            WHERE file_uniq_id = $1
            AND 1-(embedding <=> $2::vector) > $3
            ORDER BY similarity DESC
            LIMIT 5;
        `
        const values = [file_uniq_id, Array.isArray(question_embedding) ? JSON.stringify(question_embedding) : question_embedding, similarity_threshold];
        const result = await client.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No relevant results found. Ask relevant Questions Please!' });
        }
        console.log(result.rows);
        const relevant_chunks = result.rows.map(row => row.content);
        // Now we can use the relevant chunks to generate an answer
        const rag_answer = await generateAnswer(question, relevant_chunks);
        //return res.status(200).json({ answer: user_answer });
        return res.status(200).json({ answer: rag_answer });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { upload, pdfController, automated_answer };