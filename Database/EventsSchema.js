const mongoose = require('mongoose');
const EventsSchema = new mongoose.Schema({
    by: String,
    title: String,
    para1: String,
    para2: String,
    para3: String,
    para4: String,
    participants: [
        {
            name: String,
            email: String,
            phone: String,
            vehicle: String,
            registration: String,
            instagram: String,
            notes: String,
            img_url: String,
            date:{
                type: Date,
                default: Date.now,
            }
        }
    ],
    images: [{ type: String }],
    date:{
        type: Date,
        default: Date.now,
    }
})
const EventsModel = new mongoose.model('Event',EventsSchema);
module.exports = EventsModel