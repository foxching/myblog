const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const ObjectId = require('mongodb').ObjectID
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

/* 
* POST edit post
*/
router.post('/edit-user', (req, res) => {
    let email = req.body.email
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let role = req.body.role
    let bio = req.body.bio
    let userId = req.body._id;
    Admin.findOne({ email: email, _id: { $ne: userId } }, function (err, user) {
        if (user) {
            res.send("Email Already exists")
        } else {
            Admin.updateOne({ "_id": ObjectId(userId) }, {
                $set: {
                    "email": email, "firstname": firstname, "lastname": lastname, "role": role, "bio": bio
                }
            }, function (err, user) {
                res.send('Profile Updated Successfully')
            })
        }
    })


})


module.exports = router