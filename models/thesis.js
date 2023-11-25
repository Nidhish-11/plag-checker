const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const thesisSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    thesis: {
        type: String,
        required: true
    }
});

const ThesisRepo = mongoose.model('ThesisRepo', thesisSchema);
module.exports = ThesisRepo;