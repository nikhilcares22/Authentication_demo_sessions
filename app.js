var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    LocalStrategy = require('passport-local'),
    // passportLocalMongoose = require('passport-local-mongoose'),
    port = 3030;

var User = require('./models/user');

mongoose.connect('mongodb://localhost/authdemo_app', { useUnifiedTopology: true, useNewUrlParser: true });

app.use(require("express-session")({
    secret: "jumbo is the best",
    resave: false,
    saveUninitialized: false
}));
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//+++++++++++++++
//ROUTES
//+++++++++++++++


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/secret', isLoggedIn, (req, res) => {
    res.render('secret');
});

//auth routes

//show sign up form
app.get('/register', (req, res) => {
    res.render('register');
});

//Signup route
app.post('/register', (req, res) => {
    User.register(new User({ username: req.body.username }), req.body.password, (error, user) => {
        if (error) {
            console.log(error);
            return res.render('register');
        } else {
            passport.authenticate("local")(req, res, () => {
                console.log(user);
                res.redirect('/secret');
            })
        }
    });
});

//LOGIN ROUTES
//render login form 
app.get('/login', (req, res) => {
    res.render('login');
});

//LOGIN LOGIC
//middleware are functions that runs before our final callback
app.post('/login', passport.authenticate('local', {
        successRedirect: '/secret',
        failureRedirect: '/login'
    }),
    (req, res) => {});

app.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/')
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
};

app.listen(port, () => {
    console.log(`server listening at ${port}`);
});