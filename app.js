require("dotenv").config();
const express = require('express');

//import routes
const authentication = require('./routes/authentication.routes');
const users = require('./routes/users.routes');
const keys = require('./routes/keys.routes');
const dashboard = require('./routes/dashboard.routes');

//Create app
const app = express();
app.use(express.json());


//Router
app.use('/api', authentication);
app.use('/api/users', users);
app.use('/api/keys', keys);
app.use('/api/dashboard', dashboard);


module.exports = app;