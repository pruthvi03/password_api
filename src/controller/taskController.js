const User = require('../models/users');
const Task =  require('../models/tasks');

const createNewTaskFun = async (req, res)=>{
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id
        })
        await task.save();
        req.flash('success_msg', 'New Task is added');
        res.redirect('/');
    } catch (error) {
        req.flash('error_msg', error.message);
        res.redirect('/');
    }
}

const deleteTask = async (req, res)=>{
    try {
        await Task.deleteOne({_id:req.body._id});
        req.flash('success_msg', 'One task is deleted');
        res.redirect('/');
    } catch (error) {
        req.flash('error_msg', error.message);
        res.redirect('/');       
    }
}

module.exports ={
    createNewTaskFun,
    deleteTask
}