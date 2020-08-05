const express = require('express');
const router = express.Router();
const Page = require('../models/page')



/* GET page slug. */
router.get('/:slug', function (req, res, next) {
    const searchOptions = {};
    if (req.query.name != null && req.query.name != '') {
        searchOptions.name = new RegExp(req.query.name, 'i');
    }
    const slug = req.params.slug
    Page.findOne({ slug: slug }, function (err, page) {
        if (err) return console.log(err)
        if (!page) {
            res.redirect('/')
        } else {
            res.render('user/index', { title: page.title, content: page.content, searchOptions: req.query })
        }
    })
});

/* GET home page. */
router.get('/', function (req, res, next) {
    const searchOptions = {};
    if (req.query.name != null && req.query.name != '') {
        searchOptions.name = new RegExp(req.query.name, 'i');
    }
    Page.findOne({ slug: 'home' }, function (err, page) {
        if (err) {
            console.log(err)
        }
        res.render('user/index', { title: "Home", content: page.content, searchOptions: req.query })

    })
    //res.send('ok')

});





module.exports = router