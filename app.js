var express = require('express');
var path = require('path');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/scrapper');
var forexRouter = require('./routes/forex');
var app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/scrapper', usersRouter);
app.use('/api/forex-data', forexRouter);

module.exports = app;
