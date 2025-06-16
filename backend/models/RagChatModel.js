const e = require('express');
const mongoose = require('mongoose');
const { create } = require('./userUploadedDocs');
const ragChatSchema = new mongoose.Schema({
    file_uniq_id:{
        type: String,
        required: true,
    },
    type:{
        type:String,
        required: true,
        enum: ['user', 'bot'],  
    },
    content:{
        type: String,
    }
},{timestamps:true})

const RagChatModel = mongoose.model('RagChat', ragChatSchema);
module.exports = RagChatModel;