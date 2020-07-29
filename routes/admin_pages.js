const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID
const Page = require('../models/page')
const { ensureAuthenticated } = require('../config/auth');


/* 
* GET pages
*/
router.get('/', ensureAuthenticated, (req, res) => {
    Page.find({}).populate('author').exec(function (err, pages) {
        if (err) return console.log(err)
        res.render('admin/pages', { pages: pages })
    })

})


/* 
* GET new page
*/
router.get('/add-page', ensureAuthenticated, (req, res) => {
    res.render('admin/add-page', { newPage: new Page() })
})


/* 
* POST new page
*/
router.post('/create-page', (req, res) => {
    let newPage = new Page({
        title: req.body.title,
        slug:
            req.body.slug.replace(/\s+/g, '-').toLowerCase() == ''
                ? req.body.title.replace(/\s+/g, '-').toLowerCase()
                : req.body.slug.replace(/\s+/g, '-').toLowerCase(),
        content: req.body.content,
        author: req.user.id,
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
                Page.find({}).exec(function (err, pages) {
                    if (err) {
                        console.log(err);
                    } else {
                        req.app.locals.pages = pages;
                    }
                });
                res.send('Page added successfuly')
            })
        }
    })
})


/* 
* GET edit page
*/
router.get('/edit-page/:id', ensureAuthenticated, (req, res) => {
    Page.findById({ "_id": ObjectId(req.params.id) }, function (err, page) {
        if (err) return console.log(err)
        res.render('admin/edit-page', { page: page })
    })
})


/* 
* POST edit page
*/
router.post('/edit-page', (req, res) => {
    let title = req.body.title;
    let slug =
        req.body.slug.replace(/\s+/g, '-').toLowerCase() == ''
            ? req.body.title.replace(/\s+/g, '-').toLowerCase()
            : req.body.slug.replace(/\s+/g, '-').toLowerCase()
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
                page.updatedBy = req.user.id
                page.updatedAt = new Date()
                page.save(function (err) {
                    if (err) return console.log(err)
                    Page.find({}).exec(function (err, pages) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });
                    res.send("Page Updated Successfully")
                })
            })
        }

    })

})


/* 
* POST delete page
*/
router.post('/delete-page', (req, res) => {
    Page.findByIdAndRemove({ "_id": ObjectId(req.body._id) }, function (err) {
        Page.find({}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
        res.send('Page Removed')

    })
})



module.exports = router