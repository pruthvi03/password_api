const mongoose = require('mongoose');

const url = "mongodb://127.0.0.1:27017/password_api";

mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
}).then(() => { console.log("Database connection established!!!") })
    .catch(err => { console.log(err.message) });