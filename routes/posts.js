const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer')
const ObjectId = require('mongodb').ObjectID
const Post = require('../models/post')
const Category = require('../models/category')
const Setting = require('../models/setting')

/* 
* GET all posts
*/
router.get('/', function (req, res, next) {
    var page = req.query.page || 1
    Setting.findOne({}, function (err, setting) {
        let postLimit = parseInt(setting.post_limit)
        Post.find({})
            .sort({ "createdAt": "desc" })
            .skip((postLimit * page) - postLimit)
            .limit(postLimit)
            .exec(function (err, posts) {
                Post.countDocuments().exec(function (err, count) {
                    if (err) return next(err)
                    res.render('user/home', {
                        posts: posts,
                        current: page,
                        postPages: Math.ceil(count / postLimit),
                    })
                })
            })
    })
});


/* 
* GET post by slug
*/
router.get('/:slug', (req, res) => {
    Post.findOne({ slug: req.params.slug }, function (err, post) {
        if (err) return console.log(err)
        res.render('user/post', { post: post })
    })
})


/* 
* POST new comment
*/
router.post('/add-comment', function (req, res) {
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

/* 
* POST new reply
*/
router.post('/add-reply', (req, res) => {
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

/* 
* GET posts per category
*/
router.get('/category/:category', (req, res) => {
    var categorySlug = req.params.category;
    Category.findOne({ slug: categorySlug }, function (err, category) {
        var page = req.query.page || 1
        Setting.findOne({}, function (err, setting) {
            let postLimit = parseInt(setting.post_limit)
            Post.find({ category: categorySlug })
                .sort({ "createdAt": "desc" })
                .skip((postLimit * page) - postLimit)
                .limit(postLimit)
                .exec(function (err, posts) {
                    if (err) return console.log(err)
                    Post.find({ category: categorySlug }).countDocuments().exec(function (err, count) {
                        if (err) return console.log(err)
                        res.render('user/category', {
                            posts: posts,
                            current: page,
                            category: categorySlug,
                            postPages: Math.ceil(count / postLimit),
                        })
                    })
                })
        })
    })
})





module.exports = router