const express = require('express');
const router = express.Router();
const Page = require('../models/page')



/* GET page slug. */
router.get('/:slug', function (req, res, next) {
    const slug = req.params.slug
    Page.findOne({ slug: slug }, function (err, page) {
        if (err) return console.log(err)
        if (!page) {
            res.redirect('/')
        } else {
            res.render('user/index', { title: page.title, content: page.content })
        }
    })
});

/* GET home page. */
router.get('/', function (req, res, next) {
    Page.findOne({ slug: 'home' }, function (err, page) {
        if (err) {
            console.log(err)
        }
        res.render('user/index', { title: "Home", content: page.content })

    })
    //res.send('ok')

});





module.exports = router