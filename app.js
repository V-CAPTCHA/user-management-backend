require("dotenv").config();
const express = require('express');

//import routes
const users = require('./routes/users');

//Create app
const app = express();

//Router
app.use('/api/users', users);

module.exports = app;