const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const db = require('./models')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const helpers = require('./_helpers')

const app = express()
const port = process.env.PORT || 3000

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const passport = require('./config/passport')

app.engine('handlebars', handlebars({
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helper')
}))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(methodOverride('_method'))
app.use('/upload', express.static(__dirname + '/upload'))

app.use(session({ secret: 'forumSecret', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = helpers.getUser(req)
  next()
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

require('./routes')(app)

module.exports = app
