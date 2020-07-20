const express = require('express');
const router = express.Router();
const Category = require('../models/category')


router.get('/', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    }
    res.send('All Category')
})


router.get('/add-category', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    }
    res.render('admin/add-category', { newCategory: new Category() })
})



module.exports = router