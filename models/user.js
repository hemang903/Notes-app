const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/Notes_data");

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    mobileNumber: String,
    password: String, 
    age: Number,
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: "post"}]
});

module.exports = mongoose.model("user", userSchema);