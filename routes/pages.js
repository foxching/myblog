const express = require('express');
const router = express.Router();
const Page = require('../models/page')



/* GET page slug. */
router.get('/:slug', async (req, res, next) => {
    const slug = req.params.slug
    try {
        const page = await Page.findOne({ slug: slug })
        if (!page) return res.redirect('/')
        res.render('index', { title: page.title, content: page.content, searchOptions: req.query })
    } catch (error) {
        console.log(error)
    }
});

/* GET home page. */
router.get('/', async (req, res, next) => {
    try {
        const page = await Page.findOne({ slug: 'home' })
        res.render('index', { title: "Home", content: page.content, searchOptions: req.query })
    } catch (error) {
        console.log(error)
    }

});



module.exports = router