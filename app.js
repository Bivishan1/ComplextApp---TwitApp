
const express = require('express');
const app = express();

const session = require('express-session'); 
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const markdown = require('marked')
const sanitizeHTML = require('sanitize-html')

let sessionOptions = session({
    secret : 'Javascript is awesome superb',//just type here that can't guess
    store : new MongoStore({client: require('./db')}),//default only declarable store variable it's store in memory.
    resave : false,
    saveUninitialized: false, //resave and this properties are so boring properties, but need to define to take leverage.
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
})

//Above session setting is complete configuration to enable sesssion.
//Now, we just need to tell express actually use this.
app.use(sessionOptions);//Now, our express app supports session.
app.use(flash());//calling a flash() package,which added flash feature to our application.

//So altogether when we say app.use we are telling express to run this function for every request and because we are including before  our router code(which is just under this line of code.)
//This means this will run first and then since we are calling next Express will move on to run the actual relevant functions for a particular wrapped(cover for specific purpose).
//But big picture this means that we now have access to a user property from within any of our EGF templates.
//Main purpose of this line code is, remove the duplicate code in every user sessioon data.
app.use(function(req, res, next) {

//make our markdown function available from within ejs templates
res.locals.filterUserHTML = function(content) {
  return sanitizeHTML(markdown(content), {allowedTags: ['p','br','ul','ol','li','strong','bold','i','em','h1','h2','h3','h4','h5','h6'],allowedAttributes:{}})
}

  // make all error and success flash message available from all templates 
  res.locals.errors = req.flash('errors')
  res.locals.success = req.flash('success')


  //making current user id available on the req objects
  if (req.session.user) {req.visitorId = req.session.user._id} else {req.visitorId = 0}
    res.locals.user = req.session.user//that locals object provides us to access any propety or object available from within our E J S templates so we can add any objects or properties we want onto this locals object.
  
    //make user session data available from within view templates
    res.locals.user = req.session.user
    next();
  })


const router = require('./router');

app.use(express.urlencoded({extended: false}));
app.use(express.json());//sending json data over the web.
//to tell our Express server to make that folder accessible.
app.use(express.static('public'));
app.set('views','views');
app.set('view engine','ejs');



app.use('/', router);

// app.listen(4000);
module.exports = app;//to run app.js file after the db.js file before connecting it into database.//exporting outside