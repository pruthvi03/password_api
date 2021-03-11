require('./db/mongoose');

const { urlencoded } = require('express');
const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const path = require('path');
const userRouter = require('./router/userRouter');
 
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static('public'));
app.use(userRouter);
app.use(cookieParser())
app.listen(port, () => {
    console.log(`Server is running on port ${port}`); 
});
