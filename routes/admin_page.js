const express = require('express');
const router = express.Router();
const Page = require('../models/page')


router.get('/', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        Page.find({}, function (err, pages) {
            res.render('admin/pages', { pages: pages })
        })
    }

})


router.get('/add-page', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        res.render('admin/add-page', { newPage: new Page() })
    }

})

router.post('/create-page', (req, res) => {
    let newPage = new Page({
        title: req.body.title,
        slug:
            req.body.slug.replace(/\s+/g, '=').toLowerCase() == ''
                ? req.body.title.replace(/\s+/g, '=').toLowerCase()
                : req.body.slug.replace(/\s+/g, '=').toLowerCase(),
        content: req.body.content,
        sorting: 100
    });
    Page.findOne({ slug: newPage.slug }, function (err, page) {
        if (page) {
            res.send('Page title already exists')
        } else {
            newPage.save(function (err) {
                if (err) {
                    console.log(err);
                }
                res.send('Page added successfuly')
            })
        }
    })
})



module.exports = router