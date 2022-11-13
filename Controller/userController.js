
const User = require('../Models/User');
const Post = require('../Models/Post');
// const Post = require('../Models/Follow');
const Follow = require('../Models/Follow');

exports.sharedProfileData = async function(req, res, next) {
    let isVisitorsProfile = false
    let isFollowing = false
    if (req.session.user) {
        isVisitorsProfile = req.profileUser._id.equals(req.session.user._id)
        isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId)
    }

    req.isVisitorsProfile = isVisitorsProfile
    req.isFollowing = isFollowing

    // retrieve post, follower, and following counts
    let postCountPromise =  Post.countPostsByAuthor(req.profileUser._id)
    let followerCountPromise =  Follow.countFollowersById(req.profileUser._id)
    let followingCountPromise =  Follow.countFollowingById(req.profileUser._id)

    //noticeably faster for returning prmoise
    //array distructuring
    let [postCount, followerCount, followingCount] = await Promise.all([postCountPromise, followerCountPromise,followingCountPromise])

    req.postCount = postCount
    req.followerCount = followerCount
    req.followingCount = followingCount
    
    
    next()
}
//Allowing only logged in user session data 
exports.onlyLoggedIn  =   function(req, res, next)   { 
    if  (req.session.user)  {//because there's only ever going to be a user object within the session data if a user has successfully logged in.
        next() //callling next function that tells express to call the next function in parameters.

    }   else {//If visitor not logged in
        req.flash('errors','LoL! You must be loggedIn to perform this action.')
        req.session.save(function() {
            res.redirect('/');
        })

    }
}


exports.login = function(req,res)  {
    let user = new User(req.body)
    //Setting up the (new modern best practice approach) promise way and leveraging our new created promise in model view here.
    user.login().then(function(result)    {
        req.session.user = {avatar: user.avatar, username: user.data.username, _id: user.data._id};
        req.session.save(function() {
            res.redirect('/');
        })
    }).catch(function(e) {  
         
        req.flash('errors',e);

        //we want to be sure to not perform the redirect until that database action has actually completed our session package will automatically save to the database anytime we call response dot sand or response dot redirect. But there's no guarantee that it would finish in time before the redirect. So, we should manually tell our session to save data and callback function(within a save parenthesis) that it will call once it's actually updated that session data in the database.

        req.session.save(function() {//Now, it's adding a flash object to store any potential messages(flash:{errors,'invalid username/password'}) we would want to show to the user.and it'll available even after a redirect home-guest page.
            res.redirect('/');
        })
    });
}

exports.logout = function(req,res)     {
    //Now, withins this function, our browser has store the session data in session object and we will destroy that session using destryo method when userclicks in logout.
    req.session.destroy(function()  {
    res.redirect('/');    
    })
}

exports.register = function(req, res)   {
    
    //Creating a user(small u) instance(object) using User(capital U) blueprint constructor. 
    let user = new User(req.body);//new keyword is used to create an object by using User contructor or blueprint function which has capitalized U here.
        // res.send("thank you for registering");
    user.register().then(   ()=>    {
        req.session.user = {username: user.data.username, avatar: user.avatar, _id:user.data._id} 
        req.session.save(function() {
            res.redirect('/')
        })

        ////Catch is going to request if our promise is rejects in then().
    }).catch((regErrors)  =>  {
        regErrors.forEach(function(error)  {
            req.flash('regErrors',error)
        })
        req.session.save(function() {
            res.redirect('/')
        })
    })
         

}

exports.home = async function(req,res) {
    
    if  (req.session.user)  { 
        // res.render('home-dashboard'/*,{username: req.session.user.username, avatar: req.session.user.avatar}*/);//Now, we have username properties which should also manage in HTML Template also.Second argument is the way that we can pass data into the template.//here, another avatar property is to update the avatar session from user requested in our home html template.
        //we have remove that second object because, we used locals.user method to remove duplication of code for user session data.

        //fetch feed of posts for current user
        let posts = await Post.getFeed(req.session.user._id)
        res.render('home-dashboard',{posts: posts})
        
    }
    else    {
        res.render('home-guest',{regErrors: req.flash('regErrors')});//regErrors here is a collection.//Not only show the user once with as we are going to delete this flash error message from our database also.that's wwhy.
    }
}

exports.ifUserExists = function(req, res, next) {
    User.findByUsername(req.params.username).then(function(userDocument){
        req.profileUser = userDocument
        next()
    }).catch(function() {
        res.render("404")
    })
}

exports.profilePostsScreen = function(req,res) {
    // asking our post model for posts by a certain author _id
    Post.findByAuthorId(req.profileUser._id).then(function(posts) {
        res.render('profile', {
        currentPage : "posts",
        posts : posts,
        profileUsername: req.profileUser.username, profileAvatar: req.profileUser.avatar, 
        isFollowing: req.isFollowing,
        isVisitorsProfile : req.isVisitorsProfile,
        //counting purposes for
        counts: {postCount : req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
    })
    // console.log(isVisitorsProfile)
    }).catch(function() {
        res.render('404')
    })
//    console.log(isvisitorsProfile)
}

exports.profileFollowersScreen = async function(req, res) {
    try {
        let followers = await Follow.getFollowersById(req.profileUser._id)
        res.render('profile-followers',{
        currentPage : "followers",
        followers: followers,
        profileUsername: req.profileUser.username, profileAvatar: req.profileUser.avatar, 
        isFollowing: req.isFollowing,
        isVisitorsProfile : req.isVisitorsProfile,
        counts: {postCount : req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
    })
    } catch {
        res.render('404')
    }
}
exports.profileFollowingScreen = async function(req, res) {
    try {
        let following = await Follow.getFollowingById(req.profileUser._id)
        res.render('profile-following',{
        currentPage : "following",
        following: following,
        profileUsername: req.profileUser.username, profileAvatar: req.profileUser.avatar, 
        isFollowing: req.isFollowing,
        isVisitorsProfile : req.isVisitorsProfile,
        counts: {postCount : req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
    })
    } catch {
        res.render('404')
    }
}
