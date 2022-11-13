//Importing constructor named User from Models folder.
const User = require('../Models/User');//double dot dot to move out from the current directory because this userController.js file is within the Controller directory.





exports.login = function(req,res)  {//Creating an login object's property which stores function. 
    let user = new User(req.body); //passinig the form data that the user just submitted so request dot body.
    //Here, we setup the traditional callback approach to handle this situtation where there is an unknown timing situtation(how long does is gonna take for login from db?) of login function (from model view right?)
    //Here, we send a response to the browser when login function has had a chance of complete.and we don't know how long it's going to take.
    // user.login(function(result){
    //     res.send(result);
    // });//Calling from imaginary method(login).a brand new function login.(which will going to create on model view.)

//Allowing only logged in user session data 
    exports.onlyLoggedIn  =   function(req, res, next)   { 
        if  (req.session.user)  {//because there's only ever going to be a user object within the session data if a user has successfully logged in.
            next() //callling next function that tells express to call the next function in parameters.

        }   else {//If visitor not logged in
            req.flash('errors','you must be logged in to perform that action.')
            req.session.save(function() {
                res.redirect('/');
            })

        }
};


    //Setting up the (new modern best practice approach) promise way and leveraging our new created promise in model view here.
    user.login().then(function(result)    {//calling then method which determines what should be return after satisfying the condition.
        //After successfully login then user.login() will return promise and go to then mthod then return below statement
        //Now, we have req object with session object that is unique per browser visitor./ and .user property can be anything alike .me , .anyone anything you like give property.
        // req.session.user = {favColor: 'blue', username: user.data.username};//Just storing the session data when user logged in DB about current user. //Here, we can store any information that is only for specific user. They always send along their cookies with the HTTP request.So,Currently our server is store broswer session data in temporary memory. when we restart the computer or any save changes in our code it will reset the our run node watch server session memory and clear it..So, it's necessary to store permanent as in MongoDB database memory. :D :p 
        //After MongoDB, our browser session id has stored in database and our server identies that and returns a result to the database.
        //Meaning our server is going to remember this browser session data. In other words we can use this browser session data from any of our URL or roots. So, let go into the end of this page where exports.home render our home page.
        //that user object properties has it's value to store the browser session in mongoDB database, to check whether it works well or not.
        //So, every time a web browser sends an HTTP request it's going to send along with it any and all cookies for the current domain.That's just the normal default behavior of browsers. They always send along their cookies with the request.
        //Now, through the server session, Firefox checked the browser cookie it would have a value that matches this unique session identifier. So that's a general overview of how a server can identify or distinguish or trust incoming requests.
        // res.send(result);
        req.session.user = {avatar: user.avatar, username: user.data.username};//So, in our memory there's going to avatar property in user object of User blueprint. //So as long as that user stays logged in we don't need to calculate their gravatar again
        //Even though the session package would usually automatically update or save the session data for us,however we can manually tell it to save because of there is no guarantee of default automated save session data in database. To guarantee and be 100% that, we do manutally
        //And now within these parentheses of save method, we give it a callback function and it will not call that function until it's actually had a chance to complete that action of saving the new data to the database.
        req.session.save(function() {
            res.redirect('/');
        })
    }).catch(function(e) {   //calling cathc method what should be response if there is any error and not satisfying the condition.
        // res.send(e);//instead of just showing this error message we return flash errors message package, whici is:
        req.flash('errors',e);//it's a session package//We should give 2 arguments here, where The first argument is the name of a collection or an array of messages that we want to start building or adding onto. So we could call it anything but let's call it errors.and second argument is where we would include the actual error message to the first array package.
        //So this could be a string of text that says sorry there was a problem but in this case instead of directly typing out a string here let's instead just say E. Right. Because that's the value that our promise is going to reject with. And so that will get passed into this function. So essentially this is just a string of text that says invalid user name slash password and really all this flash package is going to do is help us add and remove data from our session.

        //we want to be sure to not perform the redirect until that database action has actually completed our session package will automatically save to the database anytime we call response dot sand or response dot redirect. But there's no guarantee that it would finish in time before the redirect. So, we should manually tell our session to save data and callback function(within a save parenthesis) that it will call once it's actually updated that session data in the database.

        req.session.save(function() {//Now, it's adding a flash object to store any potential messages(flash:{errors,'invalid username/password'}) we would want to show to the user.and it'll available even after a redirect home-guest page.
            res.redirect('/');
        })
    });
}

exports.logout = function(req,res)     {
    //Now, withins this function, our browser has store the session data in session object and we will destroy that session using destryo method when userclicks in logout.
    req.session.destroy(function()  {//We don't need to wait to show just a simple text message,but in this case we really do need to wait until the session has been destroyed to run that destroy function
    res.redirect('/');    
    })
}

exports.register = function(req, res)   {
    // console.log(req.body);
    //Creating a user(small u) instance(object) using User(capital U) blueprint constructor. 
    let user = new User(req.body);//new keyword is used to create an object by using User contructor or blueprint function which has capitalized U here.
        // res.send("thank you for registering");
    user.register().then(   ()=>    {
        req.session.user = {username: user.data.username, avatar: user.avatar} //user.data.username is whatever use registered successfully with their username.//that req.seesion.user for actually log them in and after session that .user was create propery to save them on session and equal to the object.//avatar for profile avatar image.//Now we should access that session of data(user.avatar) within our home dashboard html template to update the source element of image attribute.So, jump to home function under below.
        req.session.save(function() {
            res.redirect('/')
        })

        ////Catch is going to request if our promise is rejects in then().
    }).catch(   (regErrors)  =>  {//regErrors will be the value that the promise rejects with.
        regErrors.forEach(function(error)  {//regErrors here are used instead user.error because regErrors will call the promise and It's only calling the promise and letting the model deal with all of the data and the variable names.So on and so forth.
            req.flash('regErrors',error)
        })
        req.session.save(function() {
            res.redirect('/')
        })
    })//calling method from blueprint and do something in register field. calling from ./model/User
    //We remove below of this code was because that user.register() is going to return promise through our model User.js file.
//     //user.error.forEach(function(errors)  {//forEach gonna call this function once for each item of that errors array.
//     req.flash('regErrors',errors)
// })
// //there is we just want to redirect back to the Home page url.
// // Here, the flash is going to adjust our session data that's going to require a trip to the database. So we don't actually want to redirect until that database action has completed. So let's manually tell our session to save.
// req.session.save(function() { //now this function will not run until the session data in the database has actually had a chance to complete and be updated.
//     res.redirect('/');//now let's just go adjust our home function to use that session data.in below code.
// });
// if  (user.error.length) {//If there is error in error array. then should return below statement.
         

// }
// else {
//     res.send("Congrats! No errors");
// }

//Because of this code is going to return a promise, so, we put await and if promise is successfullly and resolve then then() will be take care of it and if it reject catch() wil take care of it.
}

exports.home = function(req,res) {//exporting Home method 
    // res.render('home-guest');//that returns home guest page to the user without session.
    //Now, using session, if the current visitor or browser has session data within it(means already logged in application), then it returns Welcomee to our app. otherwise if they don't have seesion data send them back guest home register page.
    
    if  (req.session.user)  { //yedi yo user object le session object ma successfully login garyo vane matra saave basne bho, otherwise no way.
        // res.send('Welcome to the actual application');
        res.render('home-dashboard',{username: req.session.user.username, avatar: req.session.user.avatar});//Now, we have username properties which should also manage in HTML Template also.Second argument is the way that we can pass data into the template.//here, another avatar property is to update the avatar session from user requested in our home html template.
    }
    else    {
        res.render('home-guest',{errors: req.flash('errors'),regErrors: req.flash('regErrors')});//regErrors here is a collection.//Not only show the user once with as we are going to delete this flash error message from our database also.that's wwhy.
    }//Now, when we send new request in base url , then it's gonna work.
    //And, cookie ko storage ma vako cokie name sid sanga unique value hunxa, jun hamro node server le identify garera, same browser or same user who has type correcnt username and password hoki hain vanera tai value bata verify garxa server ko memory bata , ra server le browser lai send garxa.
    //So our session package sent instructions to the browser to create a cookie with the name of connect dot s I.D.. And this is the important part. It has a unique value now this value is a unique identifier for that particular bit of session data
    // that's being stored in the server's memory. Once a web browser has a cookie it's going to send any and all cookies for the current domain back to the server with every single request.
    // And this is going to happen automatically.
    //This because of cookie value return from the server to the browser. 
}