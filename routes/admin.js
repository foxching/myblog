const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs')
const ObjectId = require('mongodb').ObjectID
const Setting = require('../models/setting')
const Admin = require('../models/user')

const { ensureAuthenticated, forwardAuthenticated, ensureAdministrator, ensureRights, ensureOwnProfile } = require('../config/auth');


/* 
* GET admin login form
*/
router.get('/', forwardAuthenticated, (req, res) => {
    res.render('admin/login')
})


/* 
* POST admin login form
*/
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/admin',
        failureFlash: true
    })(req, res, next);
})

/* 
* GET admin register form
*/
router.get('/register', forwardAuthenticated, (req, res) => {
    res.render('admin/register')
})

/* 
* POST admin register form
*/
router.post('/register', (req, res) => {
    const { username, email, password, password2 } = req.body;
    let errors = [];

    if (!username || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('admin/register', {
            errors,
            username,
            email,
            password,
            password2
        });
    } else {
        Admin.findOne({ email: email }, (err, user) => {
            if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('admin/register', {
                    errors,
                    username,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new Admin({
                    username,
                    email,
                    password
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save((err, user) => {
                                if (err) return console.log(err)
                                req.flash(
                                    'success_msg',
                                    'You are now registered and can log in'
                                );
                                res.redirect('/admin');
                            })
                    });
                });
            }
        })
    }
})

/* 
* GET edit profile
*/
router.get('/profile/edit/:id', ensureAuthenticated, ensureOwnProfile, async (req, res) => {

    try {
        const user = await Admin.findOne({ "_id": req.params.id })
        res.render('admin/profile', { user: user })
    } catch (error) {
        console.log(error)
    }

})

/* 
* POST edit profile
*/

router.post('/profile/edit/', ensureAuthenticated, async (req, res) => {
    let email = req.body.email
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let bio = req.body.bio
    let userId = req.body._id;

    try {
        const user = await Admin.findOne({ email: email, _id: { $ne: userId } })
        if (user) {
            res.send({ status: "error", msg: "Email Add already exists" })
        } else {
            await Admin.updateOne({ "_id": ObjectId(userId) }, {
                $set: {
                    "email": email, "firstname": firstname, "lastname": lastname, "bio": bio
                }
            })
            res.send({ status: "success", msg: "Your profile updated successfully" })
        }
    } catch (error) {
        console.log(error)
    }
})

/* 
* POST update password
*/
router.post('/profile/update-pass', (req, res) => {
    let oldPass = req.body.oldPassword
    let newPass = req.body.newPassword;
    let confirmPass = req.body.confirmPassword;
    let userId = req.body._id

    Admin.findOne({ "_id": ObjectId(userId) }, (err, user) => {
        if (err) return console.log(err)
        if (!user) {
            res.send({ status: "error", msg: "User not found" })
        }
        bcrypt.compare(oldPass, user.password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) {
                res.send({ status: "error", msg: "Old Password is incorrect" })
            } else {
                if (newPass != confirmPass) {
                    res.send({ status: "error", msg: "Passwords dont match" })
                } else {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newPass, salt, (err, hash) => {
                            if (err) throw err;
                            user.password = hash;
                            user
                                .save((err, user) => {
                                    if (err) return console.log(err)
                                    res.send({ status: "success", msg: "Password updated successfully" })
                                })
                        });
                    });
                }
            }
        });
    })

})


/* 
* GET admin dashboard
*/
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('admin/dashboard')
})

/* 
* GET admin settings
*/
router.get('/settings', ensureAuthenticated, ensureAdministrator, async (req, res) => {

    try {
        const setting = await Setting.findOne({})
        res.render('admin/settings', { setting: setting.post_limit })
    } catch (error) {
        console.log(error)
    }
})


/* 
* POST update admin settings
*/
router.post('/settings', async (req, res) => {

    try {
        await Setting.updateOne({}, { "post_limit": req.body.post_limit }, { upsert: true })
        res.redirect('/admin/settings')
    } catch (error) {
        console.log(error)
    }
})

/* 
* GET admin error routes
*/
router.get('/error', ensureAuthenticated, (req, res) => {
    res.render('admin/error')
})



/* 
* GET admin redirect logout
*/
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/admin');
})



module.exports = router