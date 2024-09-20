const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    Datum: String,
    Symptome: String,
    Auslöser: String
});

module.exports = mongoose.model('Post', schema);