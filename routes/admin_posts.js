const express = require('express');
const router = express.Router();
const fs = require('fs')
const ObjectId = require('mongodb').ObjectID
const formidable = require('formidable')
const Post = require('../models/post')
const Category = require('../models/category')
const { ensureAuthenticated } = require('../config/auth');


/* 
* GET posts
*/
router.get('/', ensureAuthenticated, (req, res) => {

    Post.find({}).populate('author').exec(function (err, posts) {
        if (err) return console.log(err)
        res.render('admin/posts', { posts: posts })
    })

})


/* 
* GET new post
*/
router.get('/add-post', ensureAuthenticated, (req, res) => {
    Category.find({}, function (err, categories) {
        res.render('admin/add-post', { newPost: new Post(), categories: categories })
    })
})


/* 
* POST new post
*/
router.post('/add-post', (req, res) => {
    let newPost = new Post({
        title: req.body.title,
        slug: req.body.title.replace(/\s+/g, '-').toLowerCase(),
        category: req.body.category,
        content: req.body.content,
        image: req.body.image,
        author: req.user.id
    })

    Post.findOne({ slug: newPost.slug }, function (err, post) {
        if (err) return console.log(err)
        if (post) {
            res.send({ text: "Post title already exists" })
        } else {
            newPost.save(function (err, post) {
                if (err) return console.log(err)
                res.send({
                    text: "Posted Successfully",
                    _id: post._id,
                    createdAt: post.createdAt,
                    author: req.user.username,
                    slug: post.slug
                })
            })
        }
    })

})

/* 
* GET edit post
*/
router.get('/edit-post/:id', ensureAuthenticated, (req, res) => {
    Category.find(function (err, categories) {
        if (err) return console.log(err)
        Post.findById({ "_id": ObjectId(req.params.id) }, function (err, post) {
            if (err) return console.log(err)
            res.render('admin/edit-post', { post: post, categories: categories, category: post.category.replace(/\s+/g, '-').toLowerCase(), })
        })
    })

})

/* 
* POST edit post
*/
router.post('/edit-post', (req, res) => {
    let title = req.body.title;
    let slug = req.body.title.replace(/\s+/g, '-').toLowerCase();
    let category = req.body.category
    let content = req.body.content
    let image = req.body.image
    let id = req.body._id;
    Post.findOne({ slug: slug, _id: { $ne: id } }, function (err, post) {
        if (post) {
            res.send("Post Title Exists")
        } else {
            Post.updateOne({ "_id": ObjectId(id) }, {
                $set: {
                    "title": title, "slug": slug, "content": content, "category": category, "image": image, "updatedAt": new Date(),
                    "updatedBy": req.user.id
                }
            }, function (err, post) {
                res.send('Post Updated Successfully')
            })
        }
    })


})


/* 
* POST upload image
*/
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


/* 
* POST update image
*/
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


/* 
* POST delete post
*/
router.post('/delete-post', function (req, res) {
    fs.unlink(req.body.image.replace("/", ""), function (err) {
        Post.findByIdAndRemove({ "_id": ObjectId(req.body._id) }, function (err) {
            res.send('Post Removed')
        })
    })
})


module.exports = router