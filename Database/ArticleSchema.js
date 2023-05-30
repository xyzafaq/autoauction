const mongoose = require('mongoose');
const ArticleSchema = new mongoose.Schema({
    by: String,
    title: String,
    para1: String,
    para2: String,
    para3: String,
    para4: String,
    category: String,
    images: [{ type: String }],
    date:{
        type: Date,
        default: Date.now,
    }
})
const ArticleModel = new mongoose.model('Article',ArticleSchema);
module.exports = ArticleModel