const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer')
const ObjectId = require('mongodb').ObjectID
const User = require('../models/user')
const Post = require('../models/post')
const Category = require('../models/category')
const Setting = require('../models/setting')
const { formatDate, truncate } = require('../util/helper')

/* 
* GET all posts
*/
router.get('/', async (req, res, next) => {
    const searchOptions = {};
    if (req.query.title != null && req.query.title != '') {
        searchOptions.title = new RegExp(req.query.title, 'i');
    }

    try {
        const setting = await Setting.findOne({})
        let postLimit = parseInt(setting.post_limit)
        let page = req.query.page || 1
        const posts = await Post.find(searchOptions)
            .sort({ "createdAt": "desc" })
            .skip((postLimit * page) - postLimit)
            .limit(postLimit)
            .populate('author')
            .exec()
        const count = await Post.countDocuments(searchOptions)
            .exec()
        res.render('user/posts', {
            headerTitle: 'Posts',
            posts: posts,
            formatDate,
            truncate,
            dateFormat: setting.dateFormat,
            timeFormat: setting.timeFormat,
            current: page,
            postPages: Math.ceil(count / postLimit),
            searchOptions: req.query,
            title: req.query.title
        })

    } catch (error) {
        console.log(error)
    }
});


/* 
* GET post by slug
*/
router.get('/:slug', async (req, res) => {
    try {
        const setting = await Setting.findOne({})
        const post = await Post.findOne({ slug: req.params.slug }).populate('author').exec()
        if (!post) return res.render('404')
        res.render('user/post', {
            headerTitle: post.title,
            post: post,
            formatDate,
            dateFormat: setting.dateFormat,
            timeFormat: setting.timeFormat,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
})



/* 
* POST new comment
*/
router.post('/add-comment', async (req, res) => {
    let comment_id = ObjectId()
    let postId = req.body.post_id

    const { email, username, comment } = req.body
    if (email == "" || username == "" || comment == "") {
        return res.send({ status: "error", msg: "All fields must not be empty" })
    }

    try {
        await Post.updateOne(
            { "_id": new ObjectId(postId) },
            { $push: { comments: { _id: comment_id, username: req.body.username, email: req.body.email, comment: req.body.comment } } })
        res.send({
            status: "success",
            msg: "Comment Posted",
            _id: comment_id
        });
    } catch (error) {
        console.log(error)
    }
})

/* 
* POST new reply with send email features
*/
router.post('/add-reply', (req, res) => {
    let reply_id = ObjectId()

    const { username, reply } = req.body
    if (username == "" || reply == "") {
        return res.send({ status: "error", msg: "Value must not be empty", commentId: req.body.comment_id })
    }


    Post.updateOne(
        { "_id": new ObjectId(req.body.post_id), "comments._id": new ObjectId(req.body.comment_id) },
        { $push: { "comments.$.replies": { _id: reply_id, username: req.body.username, reply: req.body.reply } } },
        (err, ) => {
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

                transporter.sendMail(mailOptions, (err, info) => {
                    res.send({
                        status: "success",
                        msg: "Replied Successfully",
                        commentId: req.body.comment_id,
                        _id: reply_id
                    })
                })
            }
        })
})

/* 
* GET posts per category
*/
router.get('/category/:category', async (req, res) => {

    const categorySlug = req.params.category;
    try {
        const category = await Category.findOne({ slug: categorySlug })
        if (!category) return res.render('404')
        const setting = await Setting.findOne({})
        let postLimit = parseInt(setting.post_limit)
        let page = req.query.page || 1
        const posts = await Post.find({ category: category.slug })
            .populate('author')
            .sort({ "createdAt": "desc" })
            .skip((postLimit * page) - postLimit)
            .limit(postLimit)
            .exec()
        const count = await Post.find({ category: category.slug })
            .countDocuments()
            .exec()
        res.render('user/category', {
            headerTitle: categorySlug,
            posts: posts,
            formatDate,
            truncate,
            dateFormat: setting.dateFormat,
            timeFormat: setting.timeFormat,
            current: page,
            category: categorySlug,
            author: "",
            postPages: Math.ceil(count / postLimit),
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
})

/* 
* GET posts per author
*/
router.get('/author/:username', async (req, res) => {
    const authorSlug = req.params.username;
    try {
        const user = await User.findOne({ "username": authorSlug })
        if (!user) return res.render('404')
        let setting = await Setting.findOne({})
        let postLimit = parseInt(setting.post_limit)
        let page = req.query.page || 1
        const posts = await Post.find({ author: user.id })
            .populate('author')
            .sort({ "createdAt": "desc" })
            .skip((postLimit * page) - postLimit)
            .limit(postLimit)
            .exec()
        const count = await Post.find({ author: user.id })
            .countDocuments()
            .exec()
        res.render('user/category', {
            headerTitle: authorSlug,
            posts: posts,
            formatDate,
            truncate,
            dateFormat: setting.dateFormat,
            timeFormat: setting.timeFormat,
            current: page,
            category: "",
            author: authorSlug,
            postPages: Math.ceil(count / postLimit),
            searchOptions: req.query
        })

    } catch (error) {
        console.log(error)
    }
})



module.exports = router