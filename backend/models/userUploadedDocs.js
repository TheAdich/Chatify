const mongoose = require('mongoose');
const userUploadedDocsSchema = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    file_name:{
        type: String,
        required: true
    },
    file_uniq_id:{
        type: String,
        required: true,
        unique: true
    }
})

const userUploadedDocs = mongoose.model('UserUploadedDocs', userUploadedDocsSchema);

module.exports = userUploadedDocs;