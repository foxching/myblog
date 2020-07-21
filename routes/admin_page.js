const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID
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

router.get('/edit-page/:id', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        Page.findById({ "_id": ObjectId(req.params.id) }, function (err, page) {
            if (err) return console.log(err)
            res.render('admin/edit-page', { page: page })
        })

    }
})

router.post('/edit-page', (req, res) => {
    let title = req.body.title;
    let slug =
        req.body.slug.replace(/\s+/g, '=').toLowerCase() == ''
            ? req.body.title.replace(/\s+/g, '=').toLowerCase()
            : req.body.slug.replace(/\s+/g, '=').toLowerCase()
    let content = req.body.content
    let id = req.body._id;
    Page.findOne({ slug: slug, _id: { $ne: id } }, function (err, category) {
        if (category) {
            res.send("Page Title Exists")
        } else {
            Page.findById(id, function (err, page) {
                if (err) return console.log(err)
                page.title = title;
                page.slug = slug;
                page.content = content
                page.save(function (err) {
                    if (err) return console.log(err)
                    res.send("Page Updated Successfully")
                })
            })
        }

    })

})

router.post('/delete-page', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        Page.remove({ "_id": ObjectId(req.body._id) }, function (err) {
            res.send('Page Removed')
        })
    }
})




module.exports = router