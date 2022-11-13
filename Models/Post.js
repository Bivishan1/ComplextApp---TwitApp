
//for all copy pasting brad codes here. 
const postsCollection = require('../db').db().collection("posts")
const followsCollection = require('../db').db().collection("follows")
const ObjectID = require('mongodb').ObjectID
const User = require('./User')
const userCollection = require('../db').db().collection('users');
const sanitizeHTML = require('sanitize-html')

let Post = function(data, userid, requestedPostId) {
  this.data = data
  this.error = []
  this.userid = userid
  this.requestedPostId = requestedPostId
}

Post.prototype.cleanUp = function() {
  if (typeof(this.data.title) != "string") {this.data.title = ""}
  if (typeof(this.data.body) != "string") {this.data.body = ""}
  // if (typeof(this.data.userid) != "string") {this.data.body = ""}

//   // get rid of any bogus properties
  this.data = {
    title: sanitizeHTML(this.data.title.trim(), {allowedTags: [], allowedAttributes: {}}),
    body:sanitizeHTML(this.data.body.trim(), {allowedTags: [], allowedAttributes: {}}),
    createdDate: new Date(),
    author: ObjectID(this.userid)
    
  }
  // console.log("userid =",this.userid);
}

Post.prototype.validate = function() {
  if (this.data.title == "") {this.error.push("You must provide a title.")}
  if (this.data.body == "") {this.error.push("You must provide post content.")}
  // if (this.data.userid == "") {this.error.push("userid not here.")}
  // console.log("userid validate =",this.userid);
}

Post.prototype.create = function() {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.error.length) {
      // save post into database
      postsCollection.insertOne(this.data).then((info) => {
        resolve(info.ops[0]._id)
      }).catch(() => {
        this.error.push("Please try again later.")
        reject(this.error)
      })
    } else {
      reject(this.error)
    }
  })
}


//for updated save changes only
Post.prototype.update = function() {
  return new Promise(async (resolve,reject) => {
    try {
      let post = await Post.findSingleById(this.requestedPostId, this.userid)
      //console
      if (post.isVisitorOwner) {
        //actually update the db if real owner
        let status = await this.actuallyUpdate()
        resolve(status)
      }  else {
         reject()
      }
    } catch  {
      reject()
    }
  })
}

//Trying code from online forums 
// Post.findSingleById = function(id) {
//     return new Promise(async function(resolve, reject) {
//       if (typeof(id) != "string" || !ObjectID.isValid(id)) {
//         reject()
//         return
//       }
//       let posts = await postsCollection.aggregate([
//         {$match: {_id: new ObjectID(id)}},
//         {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
        
//       ]).toArray()
      
  
//       if (posts.length) {
//         console.log(posts[0])
//         resolve(posts[0])
//       } else {
//         reject()
//       }
//     })
//   }
  
//   module.exports = Post

//actuallyUpdate function definition
Post.prototype.actuallyUpdate = function() {
  return new Promise( async(resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.error.length) {
      await postsCollection.findOneAndUpdate({_id: new ObjectID(this.requestedPostId)}, {$set: {title: this.data.title, body: this.data.body}})
      resolve('success')
    } else {
      resolve('failure')
    }
  })
}


//Basic code
Post.reusablePostQuery = function(uniqueOperations, visitorId) {
  return new Promise(async function(resolve, reject) {
    let aggOperations = uniqueOperations.concat([
      {$addFields: {authorId: { $toObjectId: "$author"}}},
  {$lookup: {from: "users", localField: "authorId", foreignField: "_id", as: "authorDocument"}},
  {$project: {
    title : 1,
    body : 1,
    createdDate : 1,
    authorId: "$author",
    author: {$arrayElemAt: ["$authorDocument", 0]}
  }}
    ])

 let posts = await postsCollection.aggregate(aggOperations).toArray()

    // clean up author property in each post object
    posts = posts.map(function(post) {
      post.isVisitorOwner = post.authorId.equals(visitorId)
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar
      }

      return post
    })

    resolve(posts)
  })
}

//Duplicate Copyright
Post.findSingleById = function(id, visitorId) {
  return new Promise(async function(resolve, reject) {
    if (typeof(id) != "string" || !ObjectID.isValid(id)) {
      reject();
      return
    }
    let posts = await Post.reusablePostQuery([
      {$match: {_id: new ObjectID(id)}}
    ], visitorId)

    if (posts.length) {
      console.log(posts[0])
      resolve(posts[0])
    } else {
      reject()
    }
  })
}

Post.findByAuthorId = function(authorId) {
  return Post.reusablePostQuery([
    {$match: {author: authorId}},
    {$sort: {createdDate: -1}} // first post should be come first
  ])
}

Post.delete = function(postIdToDelete, currentUserId ) {
  return new Promise (async (resolve, reject) =>{
    try {
      let post =await Post.findSingleById(postIdToDelete, currentUserId)
      if (post.isVisitorOwner) {
        await postsCollection.deleteOne({_id: new ObjectID(postIdToDelete)})
        resolve()
      } else {
        reject()
      }
    } catch  {
      reject()
    }
  })
}

Post.countPostsByAuthor = function(id) {
  return new Promise(async (resolve, reject) => {
    let postCount = await postsCollection.countDocuments({author: id})
    resolve(postCount)
  })

}
  

Post.getFeed = async function(id) {
  // create an array of the user ids that the current user follows 
let followedUsers = await followsCollection.find({authorId : new ObjectID(id)}).toArray()
followedUsers = followedUsers.map(function(followedDoc) {
return followedDoc.followedId
})

  // look for posts where the author is i nthe above array of folloed users
  return Post.reusablePostQuery([
    {$match : {author: {$in: followedUsers}}} , 
    {$sort : {createdDate : -1 }}
  ])


}
  module.exports = Post








// Post.findSingleById = function(id) {
//   return new Promise(async function(resolve, reject) {
//     if (typeof(id) != "string" || !ObjectID.isValid(id)) {
//       reject()
//       return
//     }
//     let posts = await postsCollection.aggregate([
//       {$match: {_id: new ObjectID(id)}},
//       {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
//       {$project: {
//         title: 1,
//         body: 1,
//         createdDate: 1,
//         author: {$arrayElemAt: ["$authorDocument", 0]}
//       }}
//     ]).toArray()

//     // clean up author property in each post object
//     posts = posts.map(function(post) {
//       post.author = {
//         username: post.author.username,
//         avatar: new User(post.author, true).avatar
//       }

//       return post
//     })

//     if (posts.length) {
//       console.log(posts[0])
//       resolve(posts[0])
//     } else {
//       reject()
//     }
//   })
// }

// module.exports = Post