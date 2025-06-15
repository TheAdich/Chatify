const {Client}=require('pg');

const client = new Client({
    connectionString: process.env.PG_CONNECTION_STRING,
    ssl:{
        rejectUnauthorized: false
    }
})



module.exports = client;    