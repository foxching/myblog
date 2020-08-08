const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID
const Page = require('../models/page')
const { ensureAuthenticated, ensureRights } = require('../config/auth');


/* 
* GET pages
*/
router.get('/', ensureAuthenticated, ensureRights, async (req, res) => {
    try {
        const pages = await Page.find({}).populate('author').exec()
        res.render('admin/pages', { pages: pages })
    } catch (error) {
        console.log(error)
    }

})


/* 
* GET new page
*/
router.get('/add-page', ensureAuthenticated, ensureRights, (req, res) => {
    res.render('admin/add-page', { newPage: new Page() })
})


/* 
* POST new page
*/
router.post('/create-page', async (req, res) => {
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

    try {
        const page = await Page.findOne({ slug: newPage.slug })
        if (page) {
            res.send({ status: "error", msg: "Page title already exists" })
        } else {
            await newPage.save()
            const pages = await Page.find({})
            req.app.locals.pages = pages;
            res.send({ status: "success", msg: "Page added successfuly" })
        }
    } catch (error) {

    }
})


/* 
* GET edit page
*/
router.get('/edit-page/:id', ensureAuthenticated, ensureRights, async (req, res) => {
    try {
        const page = await Page.findById({ "_id": ObjectId(req.params.id) })
        res.render('admin/edit-page', { page: page })
    } catch (error) {
        console.log(error)
    }
})


/* 
* POST edit page
*/
router.post('/edit-page', async (req, res) => {
    let title = req.body.title;
    let slug =
        req.body.slug.replace(/\s+/g, '-').toLowerCase() == ''
            ? req.body.title.replace(/\s+/g, '-').toLowerCase()
            : req.body.slug.replace(/\s+/g, '-').toLowerCase()
    let content = req.body.content
    let id = req.body._id;

    try {
        const page = await Page.findOne({ slug: slug, _id: { $ne: id } })
        if (page) {
            res.send({ status: "error", msg: "Page title already exists" })
        } else {
            const page = await Page.findById(id)
            page.title = title;
            page.slug = slug;
            page.content = content
            page.updatedBy = req.user.id
            page.updatedAt = new Date()
            await page.save()
            const pages = await Page.find({})
            req.app.locals.pages = pages;
            res.send({ status: "success", msg: "Page updated successfuly" })
        }
    } catch (error) {
        console.log(error)
    }

})


/* 
* POST delete page
*/
router.post('/delete-page', async (req, res) => {
    const id = req.body._id
    try {
        await Page.findByIdAndRemove({ "_id": ObjectId(id) })
        const pages = await Page.find({})
        req.app.locals.pages = pages;
        res.send({ status: "success", msg: "Page removed successfuly" })
    } catch (error) {
        console.log(error)
    }
})



module.exports = router