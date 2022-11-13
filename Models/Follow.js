const usersCollection = require('../db').db().collection("users")//exports mongoDB client
const followsCollection = require('../db').db().collection("follows")
const ObjectID = require('mongodb').ObjectID

// to lookup the user avatar
const User = require('./User')


let Follow = function (followedUsername, authorId) {
 this.followedUsername =followedUsername;
 this.authorId = authorId;
 this.errors = []
}

Follow.prototype.cleanUP = async function() {
 if (typeof(this.followedUsername) != "string") {
  this.followedUsername = ""
 }
}

Follow.prototype.validate = async function(action) {
 //folowedUsername must exist in database
 let followedAccount = await usersCollection.findOne({username: this.followedUsername})
 if (followedAccount) {
  this.followedId = followedAccount._id
 } else {
  this.errors.push("You can't follow user that doesn't exist")
 }

let doesFollowExist = await followsCollection.findOne({followedId : this.followedId, authorId : new ObjectID(this.authorId)})
if (action == "create") {
 if (doesFollowExist) {
  this.errors.push("You already followed this user")
 }
}
if (action == "delete") {
 if (!doesFollowExist) {
  this.errors.push("You can can not stop following if you do not follow")
 } 
}

//should not able to follow yourrself
 if (this.followedId.equals(this.authorId)) {
  this.errors.push("You can't follow yourself")
 }

}


Follow.prototype.create =  function() {
 return new Promise(async(resolve,reject) => {
  this.cleanUP
  await this.validate("create")
  if (!this.errors.length) {
   await followsCollection.insertOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})
   resolve()//our promise is ready to resolve
  } else {
   reject(this.errors)
  }
 })
}

//Delete unfollowing user

Follow.prototype.delete =  function() {
 return new Promise(async(resolve,reject) => {
  this.cleanUP
  await this.validate("delete")
  if (!this.errors.length) {
   await followsCollection.deleteOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})
   resolve()//our promise is ready to resolve
  } else {
   reject(this.errors)
  }
 })
}

Follow.isVisitorFollowing = async function(followedId,visitorId) {
 let followDoc = await followsCollection.findOne({followedId: followedId, authorId: new ObjectID(visitorId)})
 if (followDoc) {
  return true
 } else {
  return false
 }
}

Follow.getFollowersById = function(id) {
 return new Promise(async (resolve, reject) => {
  try {
     let followers = await followsCollection.aggregate([
      {$match : {followedId: id}},
      {$lookup : {from : "users", localField: "authorId", foreignField: "_id", as: "userDoc"}},
      {$project: {
       username: {$arrayElemAt: ["$userDoc.username", 0]},
       email: {$arrayElemAt: ["$userDoc.email", 0]}
      }}
     ]).toArray()
     followers = followers.map(function(follower) {
      // create a user
      let user = new User(follower, true)
      return {username: follower.username, avatar: user.avatar}
     })
     resolve(followers)

  } catch {
    reject()
  }
 }) 
}

// Following 
Follow.getFollowingById = function(id) {
 return new Promise(async (resolve, reject) => {
  try {
     let followers = await followsCollection.aggregate([
      {$match : {authorId: id}},
      {$lookup : {from : "users", localField: "followedId", foreignField: "_id", as: "userDoc"}},
      {$project: {
       username: {$arrayElemAt: ["$userDoc.username", 0]},
       email: {$arrayElemAt: ["$userDoc.email", 0]}
      }}
     ]).toArray()
     followers = followers.map(function(follower) {
      // create a user
      let user = new User(follower, true)
      return {username: follower.username, avatar: user.avatar}
     })
     resolve(followers)

  } catch {
    reject()
  }
 })  
}

Follow.countFollowersById = function(id) {
  return new Promise(async (resolve, reject) => {
    let followerCount = await followsCollection.countDocuments({followedId: id})
    resolve(followerCount)
  })

}

Follow.countFollowingById = function(id) {
  return new Promise(async (resolve, reject) => {
    let count = await followsCollection.countDocuments({authorId: id})
    resolve(count)
  })

}


module.exports = Follow