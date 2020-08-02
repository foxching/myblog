const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID
const Category = require('../models/category')
const { ensureAuthenticated, ensureRights } = require('../config/auth');


/* 
* GET categories
*/
router.get('/', ensureAuthenticated, ensureRights, (req, res) => {

    Category.find({}).populate('author').exec(function (err, categories) {
        if (err) return console.log(err)
        res.render('admin/categories', { categories: categories })
    })
})

/* 
* GET new category
*/
router.get('/add-category', ensureAuthenticated, ensureRights, (req, res) => {
    res.render('admin/add-category', { newCategory: new Category() })
})

/* 
* POST new category
*/
router.post('/add-category', (req, res) => {
    let newCategory = new Category({
        title: req.body.title,
        slug: req.body.title.replace(/\s+/g, '-').toLowerCase(),
    });
    Category.findOne({ slug: newCategory.slug }, function (err, category) {
        if (category) {
            res.send({ status: "error", msg: "Category title already exists" })
        } else {
            newCategory.save(function (err) {
                if (err) {
                    console.log(err);
                }
                Category.find(function (err, categories) {
                    if (err) {
                        console.log(err);
                    } else {
                        req.app.locals.categories = categories;
                    }
                });
                res.send({ status: "success", msg: "Category added successfuly" })
            })
        }
    })
})

/* 
* GET edit category
*/
router.get('/edit-category/:id', ensureAuthenticated, ensureRights, (req, res) => {
    Category.findById({ "_id": ObjectId(req.params.id) }, function (err, category) {
        res.render('admin/edit-category', { category: category })
    })
})

/* 
* POST edit category
*/
router.post('/edit-category', (req, res) => {
    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let id = req.body._id;
    Category.findOne({ slug: slug, _id: { $ne: id } }, function (err, category) {
        if (category) {
            res.send({ status: "error", msg: "Category title already exists" })
        } else {
            Category.findById(id, function (err, category) {
                if (err) return console.log(err)
                category.title = title;
                category.slug = slug;
                category.updatedAt = new Date()
                category.save(function (err) {
                    if (err) return console.log(err)
                    Category.find(function (err, categories) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.categories = categories;
                        }
                    });
                    res.send({ status: "success", msg: "Category updated successfuly" })
                })
            })
        }

    })

})

/* 
* POST delete category
*/
router.post('/delete-category', (req, res) => {
    Category.findByIdAndRemove({ "_id": ObjectId(req.body._id) }, function (err) {
        Category.find(function (err, categories) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.categories = categories;
            }
        });
        res.send({ status: "success", msg: "Category removed successfuly" })
    })
})



module.exports = router