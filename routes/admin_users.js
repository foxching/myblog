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
router.get('/', ensureAuthenticated, ensureAdministrator, async (req, res) => {

     try {
        const users = await  Admin.aggregate([
        {
            $lookup: {
                from: 'posts',
                localField: "_id",
                foreignField: "author",
                as: "userPosts"
            }
        }
    ])
    res.render('admin/users', { users: users })
    } catch (error) {
        console.log(error)
    }
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

router.get('/edit-user/:id', ensureAuthenticated, ensureAdministrator, async (req, res) => {
    const userId = req.params.id
    try {
        const user = await Admin.findOne({ "_id": ObjectId(userId) })
        res.render('admin/edit-user', { user: user, roles: displayRoles(), userRole: user.role.replace(/\s+/g, '-').toLowerCase() })
    } catch (error) {
        console.log(error)
    }
})

/* 
* POST edit user
*/
router.post('/edit-user', async (req, res) => {
    const { email, firstname, lastname, role, bio } = req.body;
    const id = req.body._id
    try {
        const user = await Admin.findOne({ email: email, _id: { $ne: id } })
        if(user){
            res.send({ status: "error", msg: "Email Add already exists" })
        }else {
            await  Admin.updateOne({ "_id": ObjectId(id) }, {
                $set: {
                    "email": email, "firstname": firstname, "lastname": lastname, "role": role, "bio": bio
                }
            })
            res.send({ status: "success", msg: "Profile updated successfully" })
        }
    } catch (error) {
        console.log(error)
    }


})

/* 
* GET delete user
*/

router.get('/delete-user/:id', ensureAuthenticated, ensureAdministrator, async (req, res) => {
    try {
        const users = await Admin.find({})
        const userInfo = await Admin.findOne({ "_id": req.params.id })
        res.render('admin/notice', { users: users, userInfo, userInfo })
    } catch (error) {
        console.log(error)
    }


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

router.post('/update-pass',  (req, res) => {
    let userId = req.body._id;
    let newPassword = req.body.newPassword

    if (newPassword == "") {
        res.send({ status: "error", msg: "Please generate a new password!" })
    } else {
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
    }


})


module.exports = router