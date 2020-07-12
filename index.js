const express = require('express')
const mongoose = require('mongoose');
const { format } = require('date-fns');
const ObjectId = require('mongodb').ObjectID
const formidable = require('formidable')
const fs = require('fs')
const session = require('express-session')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use('/static', express.static(__dirname + '/static'))
app.set('view engine', 'ejs');

//body parse
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//express session
app.use(
    session({
        key: "admin",
        secret: "any string",
    })
);

app.use((req, res, next) => {
    res.locals.format = format;
    next();
});

const Post = require('./models/post')
const Admin = require('./models/user')



app.get('/admin/dashboard', (req, res) => {
    if (req.session.admin) {
        res.render('admin/dashboard')
    } else {
        res.redirect('/admin')
    }
})

app.get('/admin/post', (req, res) => {
    if (req.session.admin) {
        res.render('admin/post')
    } else {
        res.redirect('/admin')
    }
})

app.post('/do-admin-login', (req, res) => {
    Admin.findOne({ "email": req.body.email, "password": req.body.password }, function (err, admin) {
        if (admin !== "") {
            req.session.admin = admin
        }
        res.send(admin)
    })
})
app.get('/admin', (req, res) => {
    res.render('admin/login')
})

app.get('/do-logout', (req, res) => {
    req.session.destroy()
    res.redirect('/admin')
})

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

app.post('/do-post', (req, res) => {
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

io.on("connection", (socket) => {
    console.log("User Connected")

    socket.on("new_post", (formData) => {
        console.log(formData)
        socket.broadcast.emit("new_post", formData)
    })
})

http.listen(3000, () => {
    console.log('Server is running at port')
})