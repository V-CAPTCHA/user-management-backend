require("dotenv").config();
const express = require('express');

//import routes
const authentication = require('./routes/authentication');
const users = require('./routes/users');
const keys = require('./routes/keys');

//Create app
const app = express();

//Router
app.use('/api', authentication);
app.use('/api/users', users);
app.use('/api/keys', keys);

module.exports = app;