const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const ObjectId = require('mongodb').ObjectID
const generator = require('generate-password');
const Admin = require('../models/user')
const Post = require('../models/post')
const Page = require('../models/page')
const { ensureAuthenticated, ensureAdministrator } = require('../config/auth');
const { displayRoles } = require('../util/helper')

/* 
* GET all users
*/
router.get('/', ensureAuthenticated, ensureAdministrator, (req, res) => {
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
router.get('/add-user', ensureAuthenticated, ensureAdministrator, (req, res) => {
    res.render('admin/add-user', { newUser: new Admin(), roles: displayRoles() })
})

/* 
* POST admin add user
*/
router.post('/add-user', (req, res) => {
    const { username, email, firstname, lastname, role, password } = req.body;

    if (password.length < 6) {
        res.send({ status: "error", msg: "Password must be atleast 6 character" })
    } else {
        Admin.findOne({ email: email }, function (err, user) {
            if (user) {
                res.send({ status: "error", msg: "Email Add already exists" })
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
                                res.send({ status: "success", msg: "User added successfully" })
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

router.get('/edit-user/:id', ensureAuthenticated, ensureAdministrator, (req, res) => {
    const userId = req.params.id
    Admin.findOne({ "_id": ObjectId(userId) }, function (err, user) {
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
            res.send({ status: "error", msg: "Email Add already exists" })
        } else {
            Admin.updateOne({ "_id": ObjectId(userId) }, {
                $set: {
                    "email": email, "firstname": firstname, "lastname": lastname, "role": role, "bio": bio
                }
            }, function (err, user) {
                res.send({ status: "success", msg: "Profile updated successfully" })
            })
        }
    })


})

/* 
* GET delete user
*/

router.get('/delete-user/:id', ensureAuthenticated, ensureAdministrator, (req, res) => {
    Admin.find({}, function (err, users) {
        if (err) return console.log(err)
        Admin.findOne({ "_id": req.params.id }, function (err, userInfo) {
            if (err) return console.log(err)
            res.render('admin/notice', { users: users, userInfo, userInfo })
        })
    })


})

/* 
* POST delete user with options
*/
router.post('/delete-user', (req, res) => {
    let choice = req.body.option

    console.log(req.body)
    if (choice == "option1") {
        Admin.findByIdAndRemove({ "_id": ObjectId(req.body.userId) }, function (err, user) {
            if (err) return console.log(err)
            Post.deleteMany({ "author": ObjectId(req.body.userId) }, function (err) {
                if (err) return console.log(err)
                Page.deleteMany({ "author": ObjectId(req.body.userId) }, function (err, page) {
                    if (err) return console.log(err)
                    Page.find({}).exec(function (err, pages) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });
                    res.send({ status: "success", msg: "User Removed successfully" })
                })

            })
        })
    } else {
        Admin.findByIdAndRemove({ "_id": ObjectId(req.body.userId) }, function (err, user) {
            if (err) return console.log(err)
            Post.updateMany({ "author": ObjectId(req.body.userId) }, { "author": ObjectId(req.body.user) }, function (err) {
                if (err) return console.log(err)
                Page.updateMany({ "author": ObjectId(req.body.userId) }, { "author": ObjectId(req.body.user) }, function (err, page) {
                    if (err) return console.log(err)
                    Page.find({}).exec(function (err, pages) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });
                    res.send({ status: "success", msg: "User Removed and all Contents assigned" })
                })

            })
        })
    }
})

/* 
* GET generate pass
*/
router.get('/create-pass', ensureAuthenticated, ensureAdministrator, (req, res) => {
    const password = generator.generate({
        length: 10,
        numbers: true
    });
    res.send(password)
})

router.post('/update-pass', (req, res) => {
    let userId = req.body._id;
    let newPassword = req.body.newPassword

    Admin.findOne({ "_id": ObjectId(userId) }, function (err, user) {
        if (err) return console.log(err)
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newPassword, salt, (err, hash) => {
                if (err) throw err;
                user.password = hash;
                user
                    .save(function (err, user) {
                        if (err) return console.log(err)
                        res.send({ status: "success", msg: "Password updated successfully" })
                    })
            });
        });

    })
})


module.exports = router