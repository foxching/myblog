const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID
const Category = require('../models/category')


/* 
* GET categories
*/
router.get('/', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        Category.find({}, function (err, categories) {
            res.render('admin/categories', { categories: categories })
        })
    }

})

/* 
* GET new category
*/
router.get('/add-category', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        res.render('admin/add-category', { newCategory: new Category() })
    }

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
            res.send('Category title already exists')
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
                res.send('Category added successfuly')
            })
        }
    })
})

/* 
* GET edit category
*/
router.get('/edit-category/:id', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        Category.findById({ "_id": ObjectId(req.params.id) }, function (err, category) {
            res.render('admin/edit-category', { category: category })
        })

    }
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
            res.send("Category Title Exists")
        } else {
            Category.findById(id, function (err, category) {
                if (err) return console.log(err)
                category.title = title;
                category.slug = slug;
                category.save(function (err) {
                    if (err) return console.log(err)
                    Category.find(function (err, categories) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.categories = categories;
                        }
                    });
                    res.send("Category Updated Successfully")
                })
            })
        }

    })

})

/* 
* POST delete category
*/
router.post('/delete-category', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        Category.findByIdAndRemove({ "_id": ObjectId(req.body._id) }, function (err) {
            Category.find(function (err, categories) {
                if (err) {
                    console.log(err);
                } else {
                    req.app.locals.categories = categories;
                }
            });
            res.send('Category Removed')
        })
    }
})



module.exports = router