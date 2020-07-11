const express = require('express')
const mongoose = require('mongoose');
const { format } = require('date-fns');
var ObjectId = require('mongodb').ObjectID
const formidable = require('formidable')
const fs = require('fs')
const app = express()

app.use('/static', express.static(__dirname + '/static'))
app.set('view engine', 'ejs');

//body parse
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.locals.format = format;
    next();
});

const Post = require('./models/post')

app.get('/', (req, res) => {
    Post.find({}).sort({ "createdAt": "desc" }).exec(function (err, posts) {
        res.render('user/home', { posts: posts })
    })
})

app.get('/posts/:id', (req, res) => {
    console.log(req.params.id)
    Post.findOne({ "_id": ObjectId(req.params.id) }, function (err, post) {
        if (err) return console.log(err)
        res.render('user/post', { post: post })
    })
    console.log(ObjectId(req.params.id))
})

app.get('/admin/dashboard', (req, res) => {
    res.render('admin/dashboard')
})

app.get('/admin/post', (req, res) => {
    res.render('admin/post')
})

app.post('/do-post', (req, res) => {
    let post = new Post(req.body)
    post.save(function (err) {
        if (err) {
            console.log(err)
        } else {
            res.send('Posted')
        }
    })
})

app.post('/do-comment', function (req, res) {
    Post.updateOne(
        { "_id": new ObjectId(req.body.post_id) },
        { $push: { comments: { username: req.body.username, comment: req.body.comment } } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        }
    );
})

app.post('/do-upload-image', function (req, res) {
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


//mongodb connection
mongoose.connect('mongodb://localhost/myblog', { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;

db.once('open', function () {
    console.log('Connected to Database');
});

db.on('error', function (err) {
    console.log(err);
});

app.listen(3000, () => {
    console.log('Server is running at port')
})