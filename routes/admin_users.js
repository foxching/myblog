const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const ObjectId = require('mongodb').ObjectID
const generator = require('generate-password');
const User = require('../models/user')
const Post = require('../models/post')
const Page = require('../models/page')
const { ensureAuthenticated, ensureAdministrator } = require('../config/auth');
const { displayRoles } = require('../util/helper')

/* 
* GET all users
*/
router.get('/', ensureAuthenticated, ensureAdministrator, async (req, res) => {

    try {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: 'posts',
                    localField: "_id",
                    foreignField: "author",
                    as: "userPosts"
                }
            }
        ])
        res.render('admin/users', { headerTitle: "Users", users: users })
    } catch (error) {
        console.log(error)
    }
})

/* 
* GET new user
*/
router.get('/add-user', ensureAuthenticated, ensureAdministrator, (req, res) => {
    res.render('admin/add-user', { headerTitle: "New User", newUser: new User(), roles: displayRoles() })
})

/* 
* POST admin add user
*/
router.post('/add-user', (req, res) => {
    const { username, email, firstname, lastname, role, password } = req.body;

    if (password.length < 6) {
        res.send({ status: "error", msg: "Password must be atleast 6 character" })
    } else {
        User.findOne({ email: email }, (err, user) => {
            if (user) {
                res.send({ status: "error", msg: "Email Add already exists" })
            } else {
                const newUser = new User({
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
                            .save((err) => {
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
        const user = await User.findOne({ "_id": ObjectId(userId) })
        res.render('admin/edit-user', { headerTitle: "Edit User", user: user, roles: displayRoles(), userRole: user.role.replace(/\s+/g, '-').toLowerCase() })
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
        const user = await User.findOne({ email: email, _id: { $ne: id } })
        if (user) {
            res.send({ status: "error", msg: "Email Add already exists" })
        } else {
            await User.updateOne({ "_id": ObjectId(id) }, {
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
        const users = await User.find({})
        const userInfo = await User.findOne({ "_id": req.params.id })
        res.render('admin/notice', { headerTitle: "Delete User", users: users, userInfo, userInfo })
    } catch (error) {
        console.log(error)
    }


})

/* 
* POST delete user with options
*/
router.post('/delete-user', async (req, res) => {
    let choice = req.body.option
    let userId = req.body.userId
    let otherId = req.body.otherId

    try {
        if (choice === "option1") {
            await User.findByIdAndRemove({ "_id": ObjectId(userId) })
            await Post.deleteMany({ "author": ObjectId(userId) })
            await Page.deleteMany({ "author": ObjectId(userId) })
            const pages = await Page.find({}).exec()
            req.app.locals.pages = pages;
            res.send({ status: "success", msg: "User Removed successfully" })
        } else {
            await User.findByIdAndRemove({ "_id": ObjectId(userId) })
            await Post.updateMany({ "author": ObjectId(userId) }, { "author": ObjectId(otherId) })
            await Page.updateMany({ "author": ObjectId(userId) }, { "author": ObjectId(otherId) })
            const pages = await Page.find({}).exec()
            req.app.locals.pages = pages;
            res.send({ status: "success", msg: "User Removed and all Contents assigned" })
        }
    } catch (error) {

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

/* 
* POST update  password
*/
router.post('/update-pass', (req, res) => {
    let userId = req.body._id;
    let newPassword = req.body.newPassword

    if (newPassword == "") {
        res.send({ status: "error", msg: "Please generate a new password!" })
    } else {
        User.findOne({ "_id": ObjectId(userId) }, (err, user) => {
            if (err) return console.log(err)
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newPassword, salt, (err, hash) => {
                    if (err) throw err;
                    user.password = hash;
                    user
                        .save((err, user) => {
                            if (err) return console.log(err)
                            res.send({ status: "success", msg: "Password updated successfully" })
                        })
                });
            });

        })
    }


})


module.exports = router