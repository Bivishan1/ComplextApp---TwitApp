# Twit App - Introduction To Computer Science, Final Project 2021.
Twit App is a web based app which has basic functionality like twitter where users will able to register, create, delete and update their own post as well as view post of following user and it also make  visible guest users to see other users followers and whom they are following. In addition, user also can follow and unfollow each other. This web app database has the ability to block any malicious activity with suspecious script and sql injection in the cloud. 

[See in Action](https://youtu.be/nhHzw0SVqSg)

## There are five main sections on this web app

### Registration

A new user will face the first registration page to create/register their own account.
* Gravatar [Visit Here](https://en.gravatar.com/)<br>
=> I have used this service to display user avatar in our web application. It is one of the popular website where user can pull up their user avatar into web application or any kind of application profile. Where user only need to register through the same email account they used to register in this website.

### Login
Only registered users will able to login to Twit App account and they must provide login credentials to login otherwise it will throw error message.<br>
1. <i>Home Feed </i><br>
=> After login from a new user, they will see the blank/empty feed in their home feed. Only after follow some users they will able to see their posts in home feed including their username, avatar and post upload date.

### Create Post
This section has only two parts 1. Title 2. Body. In the <b>Title</b>, user can provide their post title and in __Body__ part they can provide some description about their post.

### Following Users
To follow the user, we have to go to their profile through profile link e.g. ```localhost:4000/profile/username ```. 

### Profile
In profile section, users can edit, update and delete their post to the database. They can also check followers and following account in the profile section.

## Workflow of Registration
 There is some validations rules to register the new user where __Username__ field should be greater than 0 and less than or equals to 7 characters and it should contain only letters and numbers, __Email__ field should also have valid email format e.g. test@test.com, __Password__ should have greater than 6 chracters and should not exceed 50 chracters. We have also optional field which is __Address__.

 ## Workflow of Login
 Login has a controller of main database system where user only allowed to login after successful registration. Anything they input into the login field will map with the database system and check if they are match or not with the database record.

 ## Workflow of Create Post
 In the create post, users are allowed to use the features of mark down i.e. readme.md. In contrast to, other types of bogus properties and script are not allowed into the <b>Title</b> and <b>Body</b> field.

## Workflow of following users
We can follow any user account from their profile link. Only after following, we can see the followed user's post in our home feed. Anyone can see and check how many followers along with the followers real account and whom they are following of any specific user. 

## Workflow of Profile
When user click on profile, they will not allow to follow themselves meaning the follow button has assigned to guest users instead of themselves. Untill the user session is stored untill the specific time,the database returns the vistirOwner is true and works well accordingly.

## Structure/design of program
Twit App is written mainly in JS framework  called <b>NodeJs</b>. CSS Bootstrap library is used for interface and layout/style. Fonts awesome are used for font styles and google fonts are for font family.

Main Folders:<br>
### Controller<br>
Controllers contains all of the logic, validation and database interaction. Following are the main controllers we have used in our system: <br>

*. _userController.js_ : User controller which handles all the required user function that handles user type of activities and exports into the model file and other field that required it to run for example: userProfile, loggedIn, userRegister, loggedOut etc. 

*. _postController.js_ : It handles the post related activities and validate the authorization into the post for example: who can see post, edit & delete post screen, show user specific post etc.

*. _followController.js_ : This controller handles the function to follow and unfollow user.

### Models
Models files are basically focus with the database system  where we enforce rules or business logic on data or we could say model our data.
*. _Follow.js_ :- It construct the data modal for follow users.

*. _Post.js_:- It construct the data modal for post in the database through constructor with properties in database system.

*. _User.js_ :- It define the user object logic that checks the incoming data for validation errors and all of the code that makes  up the bleuprint of what a user should be.

### node_modules

==>All the NodeJs packages that required to manage in client and server side execution e.g. express js, email validator, node & server utilities etc.

#### views

  => All the files inside this folder determines how does our application looks like in web browser.

     i. include
      ==> This modules contain the main features of the web application where users have to see and able to see original post in the browser where URL request is made in the browser.

### Other files 
* .env = It defines the connection string of database and port to run the application.<br>
* app.js = It uses the Express framework to create a server that listens for incoming request. 
* package.json = Jason file which will keep track of all of the packages that our app needs.
* db.js = Performs all the actioins that required to connect to the database. 
* router.js = It includes all the routes that required to render the requested URL.

There are other supporting js files as well.

## Future Development
I want to complete the chat session and search feature in a real time in the future so that user can search available users in search button and chat with them. 

## Struggles / Issues
I wasn't quite familiar with MongoDB AtLast and NPM packages before so it took me lots of harder and rough time to familiar with their packages. 
And also Gravatar api hard to map with the database that there are different calls/features. 



 
      

   