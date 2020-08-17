const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID
const Category = require('../models/category')
const { ensureAuthenticated, ensureRights } = require('../config/auth');


/* 
* GET categories
*/
router.get('/', ensureAuthenticated, ensureRights, async (req, res) => {
    try {
        const categories = await Category.find({}).populate('author').exec()
        res.render('admin/categories', { headerTitle: "Categories", categories: categories })
    } catch (error) {
        console.log(error)
    }
})

/* 
* GET new category
*/
router.get('/add-category', ensureAuthenticated, ensureRights, (req, res) => {
    res.render('admin/add-category', { headerTitle: "New Category", newCategory: new Category() })
})

/* 
* POST new category
*/
router.post('/add-category', async (req, res) => {
    let newCategory = new Category({
        title: req.body.title,
        slug: req.body.title.replace(/\s+/g, '-').toLowerCase(),
    });
    try {
        const category = await Category.findOne({ "slug": newCategory.slug })
        if (category) {
            res.send({ status: "error", msg: "Category title already exists" })
        } else {
            await newCategory.save()
            const categories = await Category.find()
            req.app.locals.categories = categories
            res.send({ status: "success", msg: "Category added successfuly" })
        }
    } catch (error) {
        console.log(error)
    }
})

/* 
* GET edit category
*/
router.get('/edit-category/:id', ensureAuthenticated, ensureRights, async (req, res) => {
    const id = req.params.id
    try {
        const category = await Category.findById({ "_id": ObjectId(id) })
        res.render('admin/edit-category', { headerTitle: "Edit Category", category: category })
    } catch (error) {
        console.log(error)
    }

})

/* 
* POST edit category
*/
router.post('/edit-category', async (req, res) => {
    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let id = req.body._id;

    try {
        const category = await Category.findOne({ "slug": slug, "_id": { $ne: id } })
        if (category) {
            res.send({ status: "error", msg: "Category title already exists" })
        } else {
            let category = await Category.findById(id)
            category.title = title;
            category.slug = slug;
            category.updatedAt = new Date()
            await category.save()
            const categories = await Category.find()
            req.app.locals.categories = categories
            res.send({ status: "success", msg: "Category updated successfuly" })

        }
    } catch (error) {
        console.log(error)
    }

})

/* 
* POST delete category
*/
router.post('/delete-category', async (req, res) => {
    const id = req.body._id
    try {
        await Category.findOneAndRemove({ "_id": ObjectId(id) })
        const categories = await Category.find()
        req.app.locals.categories = categories
        res.send({ status: "success", msg: "Category removed successfuly" })
    } catch (error) {
        console.log(error)
    }
})



module.exports = router