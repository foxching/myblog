const express = require('express');
const router = express.Router();
const Post = require('../models/post')
const Setting = require('../models/setting')
const Page = require('../models/page')



/* GET home page. */
router.get('/:slug', function (req, res, next) {
    const slug = req.params.slug
    Page.findOne({ slug: slug }, function (err, page) {
        if (err) return console.log(err)
        if (!page) {
            res.redirect('/')
        } else {
            res.render('user/index', { content: page.content })
        }
    })
});

/* GET home page. */
router.get('/', function (req, res, next) {
    Page.findOne({ slug: 'home' }, function (err, page) {
        if (err) console.log(err)
        res.render('user/index', { content: page.content })
    })
});





module.exports = router