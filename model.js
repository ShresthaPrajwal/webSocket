const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String}, 
    date: new Date(), 
    text: {type: String}
});
