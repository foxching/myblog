const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Admin = require('../models/user')
const Post = require('../models/post')


router.get('/', ensureAuthenticated, (req, res) => {
    Admin.aggregate([
        {
            $lookup: {
                from: 'posts',
                localField: "_id",
                foreignField: "author",
                as: "userPosts"
            }
        }
    ], function (err, users) {
        res.render('admin/users', { users: users })
    })
})

router.get('/edit-user/:id', ensureAuthenticated, (req, res) => {
    const userId = req.params.id
    const roles = [
        {
            "slug": "administrator", "title": "Administrator"
        },
        {
            "slug": "editor", "title": "Editor"
        },
        {
            "slug": "subscriber", "title": "Subscriber"
        }
    ]
    Admin.findOne({ "_id": userId }, function (err, user) {
        if (err) return console.log(err)
        res.render('admin/edit-user', { user: user, roles: roles, userRole: user.role.replace(/\s+/g, '-').toLowerCase() })
    })
})

module.exports = router