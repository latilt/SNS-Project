var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var session = require('express-session')
var flash = require('connect-flash')
var config = require('../config.js')

var connection = mysql.createConnection({
  host : config.db.host,
  port : config.db.port,
  user : config.db.user,
  password : config.db.password,
  database : config.db.database
})
connection.connect();


router.get('/', function(req, res){
	var msg = "";
	var errMsg = req.flash('error')
	if(errMsg) msg = errMsg;
	res.render('login.ejs', {'msg':msg});
});

passport.serializeUser(function(user, done){
	done(null, user.id)
})

passport.deserializeUser(function(id, done){
  console.log("login deserializeUser", id)
	done(null, id);
})

passport.use('local-login', new LocalStrategy({
		usernameField: 'id',
		passwordField: 'password',
		passReqToCallback: true
	},function(req, id, password, done){
		var query = connection.query('select pw from USER where id=?', [id], function(err, rows){
			if(err) return done(err)
			if(rows.length){
				if(password === rows[0].pw){
				return done(null, {'id':id})
				} else {
				return done(null, false, {message: '비밀번호 다름'})
				}
			} else {
				return done(null, false, {message: '그런 유저 없음'})
			}
		})
	}
));
/*
router.post('/', passport.authenticate('local-login', {
	successRedirect: '/main',
	failureRedirect: '/login',
	failureFlash: true })
)
*/
router.post('/', function(req, res, next){
	passport.authenticate('local-login', function(err, user, info){
		if(err) res.status(500).json(err);
		if(!user) return res.status(401).json(info.message);

		req.logIn(user, function(err){
			if(err) { return next(err)};
			return res.json(user);
		})
	})(req, res, next);
})

module.exports = router;

// app.use(session({
// 	secret: 'keyboard cat',
// 	resave: false,
// 	saveUninitialized: true
// }));
// app.use(passport.initialize());
// app.use(passport.session());
//
//
