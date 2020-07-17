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
const nodemailer = require('nodemailer')

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
const Setting = require('./models/setting')


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


app.get('/admin/dashboard', (req, res) => {
    if (req.session.admin) {
        res.render('admin/dashboard')
    } else {
        res.redirect('/admin')
    }
})


app.get('/admin/posts', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    }
    Post.find({}, function (err, posts) {
        if (err) return console.log(err)
        res.render('admin/posts', { posts: posts })
    })
})


app.get('/do-logout', (req, res) => {
    req.session.destroy()
    res.redirect('/admin')
})


app.get('/admin/add-post', (req, res) => {
    if (req.session.admin) {
        res.render('admin/add-post')
    } else {
        res.redirect('/admin')
    }
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

app.get('/admin/settings', (req, res) => {
    if (req.session.admin) {
        Setting.findOne({}, function (err, setting) {
            res.render('admin/settings', { setting: setting.post_limit })
        })

    } else {
        res.redirect('/admin')
    }
})

app.post('/admin/settings', (req, res) => {
    Setting.updateOne({}, { "post_limit": req.body.post_limit }, { upsert: true }, function (err, document) {
        res.redirect('/admin/settings')
    })
})

app.get('/admin/posts/edit/:id', (req, res) => {
    if (!req.session.admin) {
        res.redirect('/admin')
    }
    Post.findById({ "_id": ObjectId(req.params.id) }, function (err, post) {
        if (err) return console.log(err)
        res.render('admin/edit-post', { post: post })
    })
})

app.post('/do-edit-post', (req, res) => {
    Post.updateOne({ "_id": ObjectId(req.body._id) }, { $set: { "title": req.body.title, "content": req.body.content, "image": req.body.image } }, function (err, post) {
        res.send('Post Updated Successfully')
    })
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

app.post('/do-update-image', function (req, res) {
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

app.post('/do-delete-post', function (req, res) {
    fs.unlink(req.body.image.replace("/", ""), function (err) {
        Post.remove({ "_id": ObjectId(req.body._id) }, function (err) {
            res.send('Post Removed')
        })
    })
})

app.get('/get-posts/:start/:limit', (req, res) => {
    let start = parseInt(req.params.start)
    let limit = parseInt(req.params.limit)

    Post.find({}).sort({ "_id": -1 }).skip(start).limit(limit).exec(function (err, posts) {
        res.send(posts)
    })
})
app.get('/', (req, res) => {
    Setting.findOne({}, function (err, setting) {
        let postLimit = parseInt(setting.post_limit)
        Post.find({}).sort({ "createdAt": "desc" }).limit(postLimit).exec(function (err, posts) {
            res.render('user/home', { posts: posts, postLimit: postLimit })
        })
    })

})

app.get('/posts/:id', (req, res) => {
    console.log(req.params.id)
    Post.findOne({ "_id": ObjectId(req.params.id) }, function (err, post) {
        if (err) return console.log(err)
        res.render('user/post', { post: post })
    })

})

app.post('/do-comment', function (req, res) {
    let comment_id = ObjectId()
    Post.updateOne(
        { "_id": new ObjectId(req.body.post_id) },
        { $push: { comments: { _id: comment_id, username: req.body.username, email: req.body.email, comment: req.body.comment } } },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send({
                    text: "Comment Successfully",
                    _id: result.id
                });
            }
        }
    );
})

app.post('/do-reply', (req, res) => {
    let reply_id = ObjectId()
    Post.updateOne(
        { "_id": new ObjectId(req.body.post_id), "comments._id": new ObjectId(req.body.comment_id) },
        { $push: { "comments.$.replies": { _id: reply_id, username: req.body.username, reply: req.body.reply } } },
        function (err, result) {
            if (err) {
                console.log(err)
            } else {
                let transporter = nodemailer.createTransport({
                    "service": "gmail",
                    "auth": {
                        "user": "rechielagria@gmail.com",
                        "pass": "Ruth@Ching_123"
                    }
                })

                let mailOptions = {
                    "from": "My Blog",
                    "to": req.body.comment_email,
                    "subject": "New Reply",
                    "text": req.body.username + ' has replied on your comment.  http://localhost:3000/posts/' + req.body.post_id
                }

                transporter.sendMail(mailOptions, function (err, info) {
                    res.send({
                        text: "Replied Successfully",
                        _id: reply_id
                    })
                })
            }
        })
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

//socket connection
io.on("connection", (socket) => {
    console.log("User Connected")

    socket.on("new_post", (formData) => {
        //console.log(formData)
        socket.broadcast.emit("new_post", formData)
    })

    socket.on("new_comment", (commentData) => {
        io.emit("new_comment", commentData)
    })

    socket.on("new_reply", (replyData) => {
        io.emit("new_reply", replyData)
    })

    socket.on("delete_post", (id) => {
        socket.broadcast.emit("delete_post", id)
    })

})

http.listen(3000, () => {
    console.log('Server is running at port')
})