
const bcrypt = require('bcryptjs');

//Imporintg database from db.js file.
const userCollection = require('../db').db().collection('users');//giving .db because of we remove .db from db.js to store session data in our mongoDB database. 
//Now, go to step #2 beloww end of  this file. 

//calling a NPM package we'd just install now(npm install validator)to validate the input field in the form.
const validator = require('validator');

//Grabing md5 algroithm package for hashing value of avatar images of email.
const md5 = require('md5');

let User = function (data, getAvatar)  { //blueprint or function constructor. This will be the reusable blueprint that can be used to create user objects which is gonna leverage within userController file.
    this.data = data
    this.error = []
    if (getAvatar == undefined) {getAvatar = false}
    if (getAvatar) {this.getAvatar()}
}

User.prototype.cleanUp = function() {
    if  (typeof(this.data.username) != 'string') {this.data.username == ''};
    if  (typeof(this.data.email) != 'string') {this.data.email == ''};
    if  (typeof(this.data.password) != 'string') {this.data.password == ''};


    //get rid of any bogus(not true or genuine;fake) properties 
//to update field value by creating object properties.in case if user enter any bogus properties like skyColor: blue , favFood: jam like that,
//So, this way, we are overwriting or updating our properties
this.data = {
    username : this.data.username.trim().toLowerCase(),//to remove the empty space from the beginning or end of the line. 
    email : this.data.email.trim().toLowerCase(),
    password : this.data.password
 }

}

User.prototype.login = function()   {
    //calling method cleanup
   // this.cleanUp();//checks our data value must be string.//cleanup method is for signup not for a login.so. it throw an error message, while we use it.
    //let's check the username are existing or not in database.
    return new Promise((resolve,reject) => {    //we used arrow function because the this keyword function well instead in a traditional way.
        //Here this userCollection is a object and findone method is also used a traditional approach like callback function to return it's value.MongoDB also works on this function but it's also provide a modern promise way appraoch in database.
        // userCollection.findOne({username: this.data.username}, (err, attemptedUser) =>   { ////one of the great things about an Arrow function is that it doesn't manipulate or change the this keyword.
        // Now, Using a promise method 
        //this.cleanUp();
        userCollection.findOne({username: this.data.username} ).then((attemptedUser) => {
            if  (attemptedUser && bcrypt.compareSync( this.data.password,attemptedUser.password)) { //So whatever the this keyword was set to outside of this function is what it will still equal. In other words. Now when we say this dot data dot password this will be pointing towards what we want it to be pointing towards.
                
                this.data = attemptedUser
                //first argument let's include the password that the user just typed in. This would be something that is not already hashed. and then for the second value instead of B this would be the hashed value from our database
                // console.log(this.data);//just checking entered user credentials in console log.
                //Now, calling avatar funtion, when successfully login.
                this.getAvatar()

                resolve("Congrats! It matches");
            }
            else    {
                // console.log(this.data);
                // console.log("Wrong username/ password")
                reject('Invalid username / password');
            }
        }).catch( function() {
            reject('Please try again later');//So this is just sort of a generic error message implying that there's something wrong with the server or some unforeseen error that we didn't account for.
        //Meaning it has nothing to do with the user typing in an incorrect user name or password. It's just an error on our side as a developer.
        })
       
    })
}
//After creating this new promise, now, we are going to leverage this promises in our controller.



//Creating a validate method.
User.prototype.validate = function()    {
    
    return new Promise(async (resolve, reject)  =>  {//description of this statement is on next same below statement. watch out. ;) :p //arrow function is use because this point will be should able to still point towards our overall object.
        
        if  (this.data.username == "") {this.error.push("You must provide a username")};
        if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {this.error.push("Username can only contain letters and numbers")};
        if  (this.data.username.length > 0 && this.data.username.length < 4) {this.error.push('Username should at least 4 characters')};
        if  (!validator.isEmail(this.data.email)) {this.error.push("You must provide a valid email address")};
        if  (this.data.password == "") {this.error.push("You must provide a password")};
        if  (this.data.password.length > 0 && this.data.password.length < 7) {this.error.push('Password should at least 6 characters')};
        if  (this.data.password.length >50) {this.error.push("Password can't exceeded 50 characters")};
        // if  (this.data.username.length > 0 && this.data.username.length < 4) {this.error.push('Username should at least 3 characters')};
        if  (this.data.username.length >7) {this.error.push("Username can't exceeded 7 characters")};
    
        //Through a live fly error message, in the text box. Checks Only if username is valid them check t o see if it's already taken
        if  (this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
        let usernameExists = await userCollection.findOne({username: this.data.username})
        if  (usernameExists) {this.error.push('This username is already taken')}
    }
   
        //Through a live fly error message, in the text box. Checks Only if email is valid them check t o see if it'ss already taken
        if  (validator.isEmail(this.data.email)) {
            let emailExists = await userCollection.findOne({email: this.data.email})
            if  (emailExists) {this.error.push('This email is already being used')}
        }  
       resolve()
    }
)}




//Here, before we submitted the data we setting up business logic for user form validation here.
//this is what our user controller going to call in the above validator async function is this.prototype.register method.
User.prototype.register = function()    {//To return promise because of async function, we put that function in function and returned new promise because of async function method.
 return new Promise(async (resolve, reject) =>   {
 this.cleanUp()
 await this.validate() 
 
 //Step #2: Only if there are no valdation errors.
 //then save the user data into database.
 //We create a seperate file to connect into our mongoDB database to leverage all database feature from one file.. ;) :D :p
 if(!this.error.length) {
     //hashing password 
     let salt = bcrypt.genSaltSync(10);//Once we generate the salt, now we can generate the hash.
     this.data.password = bcrypt.hashSync(this.data.password,salt); //first argument is value the user just type,second one is our salt value.
     await userCollection.insertOne(this.data) //making sure that this database option should complete before it called resolve below.//and this MongoDB method returns a Promise.
     //calling just here because we don't wanna save in database permanently because in future getAvatar url may update their url and i have to every user profile to change and update individually where here it auto. generate that link on the fly when we need it and we are storing it on our user object memory only. ;) :D
     this.getAvatar();
     resolve() //It makes sure that the things were run successfully of above code. 
     }
     else{
        reject(this.error)
     }
     })
}

//Profile images maintainance on this file because, this feature relies on the data for a user it makes sense to include this in a model.
User.prototype.getAvatar = function()   {
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}/?s=128`;//adding new property to our user object.//Here only changing value is email which is going to hash value by using javascript grocer store or NPM package name MD5 which gives access to us specific hashing algorithm that our gravatar expects,gravat means one website to create avatar(profile images).
}

User.findByUsername = function(username) {
    return new Promise(function(resolve, reject) {
        if (typeof(username) != "string") {
            reject()
            return       
         }
         userCollection.findOne({username: username}).then(function(userDoc) {
            if (userDoc) {
                userDoc = new User(userDoc, true)
                userDoc = {
                    _id : userDoc.data._id,
                    username : userDoc.data.username,
                    avatar: userDoc.avatar
                }
                resolve(userDoc)
            } else {
                reject()
            }
         }).catch(function() {
             reject()
         })
    })
}

module.exports = User;