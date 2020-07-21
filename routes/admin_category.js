const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID
const Category = require('../models/category')


router.get('/', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        Category.find({}, function (err, categories) {
            res.render('admin/categories', { categories: categories })
        })
    }

})


router.get('/add-category', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        res.render('admin/add-category', { newCategory: new Category() })
    }

})

router.post('/add-category', (req, res) => {
    let newCategory = new Category({
        title: req.body.title,
        slug: req.body.title.replace(/\s+/g, '=').toLowerCase(),

    });
    Category.findOne({ slug: newCategory.slug }, function (err, category) {
        if (category) {
            res.send('Category title already exists')
        } else {
            newCategory.save(function (err) {
                if (err) {
                    console.log(err);
                }
                res.send('Category added successfuly')
            })
        }
    })
})


router.get('/edit-category/:id', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        Category.findById({ "_id": ObjectId(req.params.id) }, function (err, category) {
            res.render('admin/edit-category', { category: category })
        })

    }
})



router.post('/edit-category', (req, res) => {
    let title = req.body.title;
    let slug = title.replace(/\s+/g, '=').toLowerCase();
    let id = req.body._id;
    Category.findOne({ slug: slug, _id: { $ne: id } }, function (err, category) {
        if (category) {
            res.send("Category Title Exists")
        } else {
            Category.findById(id, function (err, category) {
                if (err) return console.log(err)
                category.title = title;
                category.slug = slug;
                category.save(function (err) {
                    if (err) return console.log(err)
                    res.send("Category Updated Successfully")
                })
            })
        }

    })

})

router.get('/edit-category/:id', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        Category.findById({ "_id": ObjectId(req.params.id) }, function (err, category) {
            res.render('admin/edit-category', { category: category })
        })

    }
})




module.exports = router