const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
    category: String,
    title: String,
    userEmail: String,
    keyFactors: [{ type: String }],
    equipmenatAndFeatures: [{ type: String }],
    condition: [{ type: String }],
    serviceHistory: [{ type: String }],
    duration: Number,
    startPrice: Number,
    price: Number,
    side: String,
    country: String,
    OdometerReading: String,
    unit: String,
    TransmissionType: String,
    color: String,
    EngineDisplacement: String,
    VIN: String,
    ModelNumber: String,
    lotNumber: String,
    saleType: String,
    summary: String,
    youtubeLink: String,
    thumbnail: String,
    endTime: Date,
    exteriorImages: [{ type: String }],
    interiorImages: [{ type: String }],
    mechanicalImages: [{ type: String }],
    documentsImages: [{ type: String }],
    bids:[
        {
            email: String,
            username: String,
            country: String,
            price: Number,
            automatic: Boolean,
            date:{
                type: Date,
                default: Date.now,
            }
        }
    ],
    offers:[
        {
            email: String,
            username: String,
            country: String,
            price: Number,
            automatic: Boolean,
            date:{
                type: Date,
                default: Date.now,
            }
        }
    ],
    date:{
        type: Date,
        default: Date.now,
    },
    sold:{
        price: Number,
        status: Boolean,
        date: Date,
    }
})
const ProductModel = new mongoose.model('Product',ProductSchema);
module.exports = ProductModel