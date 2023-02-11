const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    collecton: String,
    image: String,
    rating: Number,
    overview: String,
    type: String,
    likes: Number,
    marketplace: String,
    blockchain: String,
    expireDate: Date,
    discount: Number,
    status: String,
    RegisteredDate:{
        type: Date,
        default: Date.now, 
    },
})

module.exports = ProductModel = new mongoose.model("AddProduct",ProductSchema);