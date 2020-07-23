const express = require('express');
const router = express.Router();
const Post = require('../models/post')
const Setting = require('../models/setting')
const Page = require('../models/page')


/* 
* GET pages per slug
*/
router.get('/:slug', (req, res) => {
    Page.findOne({ slug: req.params.slug }, function (err, page) {
        if (err) return console.log(err)
        if (page == null) {
            res.redirect('/')
        } else {
            res.render('user/page', { page: page })
        }

    })
})


/* 
* GET posts to home
*/
router.get('/', (req, res) => {
    Setting.findOne({}, function (err, setting) {
        let postLimit = parseInt(setting.post_limit)
        Post.find({}).sort({ "createdAt": "desc" }).limit(postLimit).exec(function (err, posts) {
            res.render('user/home', { posts: posts, postLimit: postLimit })
        })
    })
})




module.exports = router