const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title:{
        type:String,
        require:true,
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    owner:{
        type: mongoose.Schema.ObjectId,
        require: true,
        ref:'User'
    }
},{timestamps:true});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;