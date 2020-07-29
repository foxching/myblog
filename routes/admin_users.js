const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Admin = require('../models/user')
const Post = require('../models/post')


router.get('/', ensureAuthenticated, (req, res) => {
    Admin.find({}, function (err, users) {
        if (err) return console.log(err)
        Post.find({ "author": req.user.id }, function (err, posts) {
            if (err) return console.log(err)
            res.render('admin/users', { users: users, posts: posts })
        })

    })

})

module.exports = router