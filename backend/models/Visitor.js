
const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    sex: { type: String, enum: ['Male', 'Female'], required: true },
    office: { type: String, required: true 
    },
}, {timestamps: true});

module.exports = mongoose.model('Visitor', visitorSchema);