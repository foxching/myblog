const express = require('express');
const router = express.Router();
const fs = require('fs')
const ObjectId = require('mongodb').ObjectID
const formidable = require('formidable')
const Post = require('../models/post')
const Category = require('../models/category')
const { ensureAuthenticated, ensureRights } = require('../config/auth');


/* 
* GET posts
*/
router.get('/', ensureAuthenticated, ensureRights, async (req, res) => {

    try {
        const posts = await Post.find({}).populate('author').exec()
        res.render('admin/posts', { headerTitle: "Posts", posts: posts })
    } catch (error) {
        console.log(error)
    }

})


/* 
* GET new post
*/
router.get('/add-post', ensureAuthenticated, ensureRights, async (req, res) => {
    try {
        const categories = await Category.find({})
        res.render('admin/add-post', { headerTitle: "New Post", newPost: new Post(), categories: categories })
    } catch (error) {
        console.log(error)
    }
})


/* 
* POST new post
*/
router.post('/add-post', async (req, res) => {
    let newPost = new Post({
        title: req.body.title,
        slug: req.body.title.replace(/\s+/g, '-').toLowerCase(),
        category: req.body.category,
        content: req.body.content,
        image: req.body.image,
        author: req.user.id
    })

    try {
        const post = await Post.findOne({ slug: newPost.slug })
        if (post) {
            res.send({ status: "error", msg: "Post title already exists" })
        } else {
            const post = await newPost.save()
            res.send({
                status: "success",
                msg: "Post added Successfully",
                _id: post._id,
                createdAt: post.createdAt,
                author: req.user.username,
                slug: post.slug
            })
        }
    } catch (error) {
        console.log(error)
    }

})

/* 
* GET edit post
*/
router.get('/edit-post/:id', ensureAuthenticated, ensureRights, async (req, res) => {
    const id = req.params.id
    try {
        const categories = await Category.find({})
        const post = await Post.findById({ "_id": ObjectId(id) })
        res.render('admin/edit-post', { headerTitle: "Edit Post", post: post, categories: categories, category: post.category.replace(/\s+/g, '-').toLowerCase(), })
    } catch (error) {
        console.log(error)
    }

})

/* 
* POST edit post
*/
router.post('/edit-post', async (req, res) => {
    let title = req.body.title;
    let slug = req.body.title.replace(/\s+/g, '-').toLowerCase();
    let category = req.body.category
    let content = req.body.content
    let image = req.body.image
    let id = req.body._id;

    try {
        const post = await Post.findOne({ slug: slug, _id: { $ne: id } })
        if (post) {
            res.send({ status: "error", msg: "Post title already exists" })
        } else {
            await Post.updateOne({ "_id": ObjectId(id) }, {
                $set: {
                    "title": title, "slug": slug, "content": content, "category": category, "image": image, "updatedAt": new Date(),
                    "updatedBy": req.user.id
                }
            })
            res.send({ status: "success", msg: "Post updated successfully" })

        }
    } catch (error) {
        console.log(error)
    }


})


/* 
* POST upload image
*/
router.post('/upload-image', (req, res) => {
    const formData = new formidable.IncomingForm()
    formData.uploadDir = 'static/images/';
    formData.parse(req, (err, fields, files) => {
        let oldPath = files.file.path
        let newPath = "static/images/" + files.file.name
        fs.rename(oldPath, newPath, err => {
            res.send("/" + newPath)
        })
    });
})


/* 
* POST update image
*/
router.post('/update-image', (req, res) => {
    const formData = new formidable.IncomingForm()
    formData.uploadDir = 'static/images/';
    formData.parse(req, (err, fields, files) => {
        fs.unlink(fields.image.replace("/", ""), err => {
            let oldPath = files.file.path
            let newPath = "static/images/" + files.file.name
            fs.rename(oldPath, newPath, err => {
                res.send("/" + newPath)
            })
        })

    });
})


/* 
* POST delete post
*/
router.post('/delete-post', (req, res) => {
    const id = req.body._id
    fs.unlink(req.body.image.replace("/", ""), err => {
        Post.findByIdAndRemove({ "_id": ObjectId(id) }, err => {
            res.send({ status: "success", msg: "Post removed successfully" })
        })
    })
})


module.exports = router