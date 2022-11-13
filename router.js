

const express = require('express');
const router = express.Router();
let userController = require('./Controller/userController');
const postController = require('./Controller/postController');
const followController = require('./Controller/followController');


//User related routes
router.get('/',userController.home);
router.post('/register',userController.register);
router.post('/login',userController.login);
router.post('/logout',userController.logout);

//profile related routes
router.get('/profile/:username', userController.ifUserExists, userController.sharedProfileData, userController.profilePostsScreen)
router.get('/profile/:username/followers', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowersScreen)
router.get('/profile/:username/following', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowingScreen)


//Post Related routes
router.get('/create-post',  userController.onlyLoggedIn, postController.viewCreateScreen);
router.post('/create-post', userController.onlyLoggedIn, postController.create);
router.get('/post/:id', postController.viewSingle ); //the named(what name user gives in id part) part is now flexible. :id will represent whatever the user includes after the /post/
router.get('/post/:id/edit', userController.onlyLoggedIn, postController.viewEditScreen)
router.post('/post/:id/edit', userController.onlyLoggedIn, postController.edit)
router.post('/post/:id/delete', userController.onlyLoggedIn, postController.delete)

//follow related routes
router.post('/addFollow/:username', userController.onlyLoggedIn, followController.addFollow, )
router.post('/removeFollow/:username', userController.onlyLoggedIn, followController.removeFollow )


module.exports = router;