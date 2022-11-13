//Inludes all database connection and strings.
//to connect into db, first install mongoDB package by entering "npm install mongodb"

//To pull in .env file in our db.js file
const dotenv = require('dotenv');
dotenv.config();//config is method.As soon as we run config here that package is going to load in all of the values that we defined within our .env file.
//So it knows specifically to look for a file named dot EMV and it's going to take care of the rest.


const mongodb = require('mongodb');
//const connectionString = 'mongodb+srv://todoAppUser:gentalman_147@cluster0-ayygs.mongodb.net/ComplexApp?retryWrites=true&w=majority';//comment because we connect database through .env file.
mongodb.connect(process.env.CONNECTIONSTRING,{useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {//process.env.connectionstring is So in the Node.js environment this is how you access environment variables process .env and then the name of the variable which is here CONNECTIONSTRING is variable of .env file.
//Now, We can look inside the client parameter and then call a method named D.B. and this will return the actual database object that we can work with right from there we can find a collection and then we can perform CRUD operations to create read update and delete database documents.
module.exports = client;//.db();//to access into the database object to store value on their properties of object. ;) :D :p 
 //So this way if we require this file from within another file it's going to return the database that we can work with.
 //Removing .db because of need to store session data in Mongodb database not in database(temporary) only.and adding this .db into our User.js model file in const = userCollection(./db/..)

//We're doing this because of we want to run our db connection first then after we want to listen the page port or after rendering from database.
const app = require('./app');
 app.listen(process.env.PORT);//USING .env to listen port 
//So, after running npm run watch from package.json file, we even need also edit there as 'npm run db' to run from first db file also. 
// Now, as we come onto this stage, closing all file tabe except User.js 
})

