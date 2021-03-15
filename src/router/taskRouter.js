const express = require("express");
const taskRouter = express.Router();
const auth = require('../middleware/auth');
const taskFuns = require('../controller/taskController');

taskRouter.route("/users/new-task")
    .post(auth, taskFuns.createNewTaskFun);
taskRouter.route("/users/delete-task")
    .delete(auth, taskFuns.deleteTask);
module.exports = taskRouter;
