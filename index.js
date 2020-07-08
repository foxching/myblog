const express = require('express')
const mongoose = require('mongoose');
const app = express()

app.use('/static', express.static(__dirname + '/static'))
app.set('view engine', 'ejs');

//body parse
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const Post = require('./models/post')

app.get('/', (req, res) => {
    Post.find({}).sort({ "createdAt": "asc" }).exec(function (err, posts) {
        res.render('user/home', { posts: posts })
    })
})

app.get('/admin/dashboard', (req, res) => {
    res.render('admin/dashboard')
})

app.get('/admin/post', (req, res) => {
    res.render('admin/post')
})

app.post('/do-post', (req, res) => {
    let post = new Post({
        title: req.body.title,
        content: req.body.content,
    })
    post.save(function (err) {
        if (err) {
            console.log(err)
        } else {
            res.send('Posted')
        }
    })

    // Post.save(req.body, function (err, data) {
    //     res.send('Posted Successfully')
    // })
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