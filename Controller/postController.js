
// const Post = require('../Models/Post')

// exports.viewCreateScreen = function(req, res) {
//   res.render('create-post')
// }

// exports.create = function(req, res) {
//   let post = new Post(req.body, req.session.user._id)
//   post.create().then(function() {
//     res.send("New post created.")
//   }).catch(function(errors) {
//     res.send(errors)
//   })
// }


//------------------Old Code----------------------//
const Post = require('../Models/Post');//Capital P in the sense that, this is going to be our blueprint for creating post object.


exports.viewCreateScreen = function(req, res)   {
    res.render('create-post')/*, {username: req.session.user.username, avatar: req.session.user.avatar}*///inserting second argument as  another object which is our data that get pass into the create-post template.
    //we have remove that second object because, we used locals.user method to remove duplication of code for user session data.
}



exports.create = function(req, res)     {
    let post = new Post(req.body, req.session.user._id) //lowercase post is going to be our object of that blueprint constructor Post.
    
//We are accessing create method by creating object name post(lowercase) of that blueprint Post through model file Post.js.we could set this method(create) up to return a promise and promises can either resolve or reject.    
//Since, it going to return promise, we write that create () after this .then and .catch. Here, then will handle the things if promise is successfull or resolves. and catch will handle the things if it fails or rejects.
    post.create().then(function(newId)   {
        // res.send('New Post Created');
        req.flash('success','New Post Successfully created.')
        req.session.save(() => res.redirect(`/post/${newId}`)) 
       
        //we can imagine that when our promise rejects it's going to reject back with an array of errors.
    }).catch(function(errors)    {
        // res.send(error)
        errors.forEach(error => req.flash('errors',error))
        req.session.save(() => res.redirect('/create-post'))
    })   
    
}

//Without comments 
exports.viewSingle = async function(req, res)  {
    try {
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        res.render('single-post-screen', {post: post})
    } catch {
        res.render('404');
    }
}

exports.viewEditScreen = async function(req, res) {
    try {
        let post = await Post.findSingleById(req.params.id)
        if (post.authorId == req.visitorId) {
            res.render("edit-post", {post: post})
        } else {
            req.flash('errors','you do not have permission this action')
            req.session.save(() => res.redirect('/'))
        }
    } catch {
        res.render('404')
    }
}

exports.edit = function(req, res) {
    let post = new Post(req.body, req.visitorId, req.params.id)
    post.update().then((status)=> {
        // if the post was successfully updated in the database
        // or user did have permission, but there are validation errors
        if (status == "success") {
            // post was updated in db
            req.flash('success', 'Post successfully updated')
            req.session.save(function() {
                res.redirect(`/post/${req.params.id}/edit`)
            })
        } else { // if they leave titile and body field blank
            post.error.forEach(function(errors) {
                req.flash('errors',errors)
            })
            req.session.save(function() {
                res.redirect(`/post/${req.params.id}/edit`)
            })
        }
    }).catch(() => {
        // a post with the requsted id doesn't exits then
        // or if the current visitor is not the owner of the request post
        req.flash('errors','you do not have persmission to perform that actions.')
        req.session.save(function() {
            res.redirect('/')
        })


    })
}


exports.delete = function(req,res) {
    Post.delete(req.params.id, req.visitorId).then(()=>{
        req.flash('success','Post Successfully Deleted')
        req.session.save(()=>res.redirect(`/profile/${req.session.user.username}`))
    }).catch(()=>{
        req.flash('errors','You do not have permission to perform this delete action')
        req.session.save(()=>res.redirect('/'))
    })
}

//---With Comments------
// //Mostly we are using reusable files from includes folder to remove the duplication of code.
// //Creating a function that response to the /post route.
// exports.viewSingle = async function(req, res)  {//this is going to return our promise function from the model Post.js
//     try {
//         let post = await Post.findSingleById(req.params.id);// This is going to be  asynchronous request from the server,so we used "await" promise keywork.
//         res.render('single-post-screen', {post: post})//second argument is This would be an object of data that we want to pass into that template.
//     } catch {
//         res.render('404');
//     }
// }

