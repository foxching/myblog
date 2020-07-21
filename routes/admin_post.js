const express = require('express');
const router = express.Router();
const fs = require('fs')
const ObjectId = require('mongodb').ObjectID
const formidable = require('formidable')
const Post = require('../models/post')
const Category = require('../models/category')


router.get('/', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        Post.find({}, function (err, posts) {
            if (err) return console.log(err)
            res.render('admin/posts', { posts: posts })
        })
    }

})


router.get('/add-post', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        Category.find({}, function (err, categories) {
            res.render('admin/add-post', { newPost: new Post(), categories: categories })
        })
    }
})

router.post('/do-post', (req, res) => {
    let post = new Post(req.body)
    post.save(function (err, post) {
        if (err) {
            console.log(err)
        } else {
            res.send({
                text: "Posted Successfully",
                _id: post._id,
                createdAt: post.createdAt
            })
        }
    })
})

router.get('/edit-post/:id', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    } else {
        Category.find(function (err, categories) {
            if (err) return console.log(err)
            Post.findById({ "_id": ObjectId(req.params.id) }, function (err, post) {
                if (err) return console.log(err)
                res.render('admin/edit-post', { post: post, categories: categories, category: post.category.replace(/\s+/g, '=').toLowerCase(), })
            })
        })
    }

})

router.post('/edit-post', (req, res) => {
    Post.updateOne({ "_id": ObjectId(req.body._id) }, { $set: { "title": req.body.title, "content": req.body.content, "category": req.body.category, "image": req.body.image } }, function (err, post) {
        res.send('Post Updated Successfully')
    })
})

router.post('/upload-image', function (req, res) {
    const formData = new formidable.IncomingForm()
    formData.uploadDir = 'static/images/';
    formData.parse(req, (err, fields, files) => {
        let oldPath = files.file.path
        let newPath = "static/images/" + files.file.name
        fs.rename(oldPath, newPath, function (err) {
            res.send("/" + newPath)
        })
    });
})

router.post('/update-image', function (req, res) {
    const formData = new formidable.IncomingForm()
    formData.uploadDir = 'static/images/';
    formData.parse(req, (err, fields, files) => {
        fs.unlink(fields.image.replace("/", ""), function (err) {
            let oldPath = files.file.path
            let newPath = "static/images/" + files.file.name
            fs.rename(oldPath, newPath, function (err) {
                res.send("/" + newPath)
            })
        })

    });
})

router.post('/delete-post', function (req, res) {
    fs.unlink(req.body.image.replace("/", ""), function (err) {
        Post.remove({ "_id": ObjectId(req.body._id) }, function (err) {
            res.send('Post Removed')
        })
    })
})


module.exports = router