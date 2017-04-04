
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mysql = require('mysql')
var router = require('./router/index')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var session = require('express-session')
var flash = require('connect-flash')
var config = require('./config.js')

var connection = mysql.createConnection({
  host : config.db.host,
  port : config.db.port,
  user : config.db.user,
  password : config.db.password,
  database : config.db.database
})

connection.connect()

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.set('view engine', 'ejs')

app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use(router)

app.listen(config.server.port, function() {
  console.log('Server Start Port 3000!')
})

app.get('/main', function(req, res) {
  var queryString = 'select name, img, date_format(postTime, "%Y-%m-%d / %H:%i") as postTime, likeNum, content, postNum from USER u join post p on u.id = p.userId where u.id = ? order by p.postTime desc limit ?, 5;'
  
  if(!req.user) return res.redirect('/login')
  
  var query = connection.query(queryString, [req.user, 0], function(err, rows) {
    if(err) throw err

    if(rows) {
      return res.render('main.ejs', {'id' : req.user, 'contents' : rows})
    } else {
      console.log('no')
      return res.render('main.ejs')
    }
  })
})

app.post('/pull', function(req, res) {
  var queryString = 'select name, img, date_format(postTime, "%Y-%m-%d / %H:%i") as postTime, likeNum, content, postNum from USER u join post p on u.id = p.userId where u.id = ? order by p.postTime desc limit ?, 5;'
  
  var query = connection.query(queryString, [req.user, req.body.count * 5], function(err, rows) {
    if(err) throw err

    if(rows) {
      return res.json(rows)
    }
    
  })
})

app.post('/like', function(req, res) {
  var queryString = 'update post set likeNum = likeNum + 1 where postNum = ?;'

    console.log("like")

  var query = connection.query(queryString, [req.body.postNum], function(err, rows) {
    if(err) throw err

    if(rows.affectedRows === 0) {
      console.log("false")
      return res.json({'result' : false})
    } else {
      console.log("true")
      return res.json({'result' : true})
    }
  })
})

