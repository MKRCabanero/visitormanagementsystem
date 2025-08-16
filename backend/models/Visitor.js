
const mongoose = require('mongoose');

//Visitor schema
const visitorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Name is require'], trim: true, minlength:1, maxlength: 80 },
    age: { type: Number, required: true },
    sex: { type: String, enum: ['Male', 'Female'], required: true },
    office: { type: String, required: [true, 'Office to visit is required'], trim: true, minlength:1, maxlength: 80 
    },
}, {timestamps: true});

module.exports = mongoose.model('Visitor', visitorSchema);