const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const ObjectId = require('mongodb').ObjectID
const Admin = require('../models/user')
const { ensureAuthenticated } = require('../config/auth');
const { displayRoles } = require('../util/helper')

/* 
* GET all users
*/
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

/* 
* GET new user
*/
router.get('/add-user', ensureAuthenticated, (req, res) => {
    res.render('admin/add-user', { newUser: new Admin(), roles: displayRoles() })
})

/* 
* POST admin add user
*/
router.post('/add-user', (req, res) => {
    const { username, email, firstname, lastname, role, password } = req.body;

    if (password.length < 6) {
        res.send("Password must be atleast six character")
    } else {
        Admin.findOne({ email: email }, function (err, user) {
            if (user) {
                res.send("Email already exists")
            } else {
                const newUser = new Admin({
                    username,
                    firstname,
                    lastname,
                    email,
                    role,
                    password
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save(function (err, user) {
                                if (err) return console.log(err)
                                res.send('User added successfully')
                            })
                    });
                });
            }
        })
    }



})

/* 
* GET edit user
*/

router.get('/edit-user/:id', ensureAuthenticated, (req, res) => {
    const userId = req.params.id
    Admin.findOne({ "_id": userId }, function (err, user) {
        if (err) return console.log(err)
        res.render('admin/edit-user', { user: user, roles: displayRoles(), userRole: user.role.replace(/\s+/g, '-').toLowerCase() })
    })
})

/* 
* POST edit user
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