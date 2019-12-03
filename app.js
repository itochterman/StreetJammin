require('./db');
require('./auth');

const routes = require('./routes/index');
const users = require('./routes/users');
const express = require('express');
const router = express.Router();

const passport = require('passport');
const passportLocal = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//schema models
User = mongoose.model('User');
const Course = mongoose.model('Courses');

const app = express();

// enable sessions
const session = require('express-session');
const sessionOptions = {
    secret: 'secret cookie thang (store this elsewhere!)',
    resave: true,
    saveUninitialized: true
};
app.use(session(sessionOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// middleware for passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));

// serialize and desrialize a user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// drop req.user into the context of every template by adding properties to res.locals
app.use(function(req, res, next){
	res.locals.user = req.user;
	next();
});

app.use('/', routes);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// handling login
app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/login',
  passport.authenticate('local', { successRedirect: '/',failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

// handling register
app.get('/register', (req, res) => {
  res.render('register');
});
app.post('/register', (req, res) => {
    User.register( new User({_id: new mongoose.Types.ObjectId(), username: req.body.username,}) ,req.body.password,
    function(err,user){
        if (err){
          console.log(err);
          res.render('register', {message: 'ERROR IN CREATING ACCOUNT'})
        }
        else{
          passport.authenticate('local', (req, res) =>{
            res.redirect('/view')
          });
        }
    });
});

app.get('/view', (req, res) => {

  if(req.user===undefined){
    res.redirect("/login");
  }
  else{
    if (Object.keys(req.query).length === 0) {
      Course.find({user: res.locals.user._id}).populate('user').exec(function(err, result) {
        if(err){
          console.log(err);
        }
        else{
          res.render("view", {
            courses: result
          });
        }
      });
    }
    else{

      Course.find(filtered).populate('user').exec(function(err, result) {
        if(err){
          console.log(err);
        }
        else{
          res.render("view", {
            courses: result
          });
        }
      });

    }
  }

});

app.get('/add', (req, res) => {
  if(req.user===undefined){
    res.redirect("/login");
  }else{
    res.render('add');
  }
});
app.post('/add', (req, res) => {
  if(req.user===undefined){
    res.redirect("/login");
  }
  else{
    new Course({
      user: res.locals.user._id,
      name: req.body.name,
      rank: req.body.rank,
      semester: req.body.semester
    }).save(function(err){
      if(err){
        console.log(err);
        res.render( 'add', {message: 'ERROR IN ADDING'});
      }
      else{
        res.redirect('/view');
      }
    });
  }
});

// from heroku tutorial
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
