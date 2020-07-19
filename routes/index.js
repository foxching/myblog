const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer')
const ObjectId = require('mongodb').ObjectID
const Post = require('../models/post')
const Setting = require('../models/setting')


router.get('/get-posts/:start/:limit', (req, res) => {
    let start = parseInt(req.params.start)
    let limit = parseInt(req.params.limit)

    Post.find({}).sort({ "_id": -1 }).skip(start).limit(limit).exec(function (err, posts) {
        res.send(posts)
    })
})


router.get('/', (req, res) => {
    Setting.findOne({}, function (err, setting) {
        let postLimit = parseInt(setting.post_limit)
        Post.find({}).sort({ "createdAt": "desc" }).limit(postLimit).exec(function (err, posts) {
            res.render('user/home', { posts: posts, postLimit: postLimit })
        })
    })
})

router.get('/posts/:id', (req, res) => {
    console.log(req.params.id)
    Post.findOne({ "_id": ObjectId(req.params.id) }, function (err, post) {
        if (err) return console.log(err)
        res.render('user/post', { post: post })
    })
})

router.post('/do-comment', function (req, res) {
    let comment_id = ObjectId()
    Post.updateOne(
        { "_id": new ObjectId(req.body.post_id) },
        { $push: { comments: { _id: comment_id, username: req.body.username, email: req.body.email, comment: req.body.comment } } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send({
                    text: "Comment Successfully",
                    _id: result.id
                });
            }
        }
    );
})

router.post('/do-reply', (req, res) => {
    let reply_id = ObjectId()
    Post.updateOne(
        { "_id": new ObjectId(req.body.post_id), "comments._id": new ObjectId(req.body.comment_id) },
        { $push: { "comments.$.replies": { _id: reply_id, username: req.body.username, reply: req.body.reply } } },
        function (err, result) {
            if (err) {
                console.log(err)
            } else {
                let transporter = nodemailer.createTransport({
                    "service": "gmail",
                    "auth": {
                        "user": "rechielagria@gmail.com",
                        "pass": "Ruth@Ching_123"
                    }
                })

                let mailOptions = {
                    "from": "My Blog",
                    "to": req.body.comment_email,
                    "subject": "New Reply",
                    "text": req.body.username + ' has replied on your comment.  http://localhost:3000/posts/' + req.body.post_id
                }

                transporter.sendMail(mailOptions, function (err, info) {
                    res.send({
                        text: "Replied Successfully",
                        _id: reply_id
                    })
                })
            }
        })
})



module.exports = router