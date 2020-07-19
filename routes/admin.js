const express = require('express');
const router = express.Router();
const Setting = require('../models/setting')
const Admin = require('../models/user')


router.get('/', (req, res) => {
    res.render('admin/login')
})

router.post('/do-admin-login', (req, res) => {
    Admin.findOne({ "email": req.body.email, "password": req.body.password }, function (err, admin) {
        if (admin !== "") {
            req.session.admin = admin
        }
        res.send(admin)
    })
})

router.get('/dashboard', (req, res) => {
    if (req.session.admin) {
        res.render('admin/dashboard')
    } else {
        res.redirect('/admin')
    }
})


router.get('/settings', (req, res) => {
    if (req.session.admin) {
        Setting.findOne({}, function (err, setting) {
            res.render('admin/settings', { setting: setting.post_limit })
        })
    } else {
        res.redirect('/admin')
    }
})

router.post('/settings', (req, res) => {
    Setting.updateOne({}, { "post_limit": req.body.post_limit }, { upsert: true }, function (err, document) {
        res.redirect('/admin/settings')
    })
})

router.get('/do-logout', (req, res) => {
    req.session.destroy()
    res.redirect('/admin')
})




module.exports = router