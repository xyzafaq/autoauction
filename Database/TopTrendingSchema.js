const mongoose = require('mongoose');
const TopTrendingSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    loveReact: Number,
    image:{
        type: Buffer,
        ContentType: String,
    }
})

const TopTrendingModel = new mongoose.model('TopTrending',TopTrendingSchema);
module.exports = TopTrendingModel