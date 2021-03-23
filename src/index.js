require('./db/mongoose');

const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser')
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const methodOverride = require('method-override')
const userRouter = require('./router/userRouter');
const taskRouter = require('./router/taskRouter');
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static('public'));
app.use(cookieParser());

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));
// middleware for connect flash
app.use(flash());
// middleware session express
app.use(session({
    secret: "nodejs",
    resave: true,
    saveUninitialized:true
}));
// setting message glabally
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash(("success_msg"));
    res.locals.error_msg = req.flash(("error_msg"));
    next();
});

// app.use()
app.use(userRouter);
app.use(taskRouter);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`); 
});
