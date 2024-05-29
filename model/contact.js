const mongoose = require('mongoose')



// Membuat Schema
const Contact = mongoose.model('Contact', {
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
    }
});

module.exports = Contact;