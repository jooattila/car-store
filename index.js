const express = require('express'),
  app = express(),
  parser = require('body-parser'),
  path = require('path'),
  ehandlebars = require('express-handlebars'),
  helpers = require('handlebars-helpers'),
  session = require('express-session'),
  router = require('./routes/router');

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', ehandlebars({
  extname: 'hbs',
  defaultView: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: helpers(),
}));


// session middleware beállítása
app.use(session({
  secret: '142e6ecf42884f03',
  resave: false,
  saveUninitialized: true,
}));


app.use(express.urlencoded({ extended: true }));

app.use(parser.urlencoded({ extended: true }));

app.use('/', router);

app.use(express.static('static'));

app.listen(10522, () => console.log('Server listening on port: 10522'));
