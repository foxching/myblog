const express = require('express')
const mongoose = require('mongoose');
const passport = require('passport');
const { format } = require('date-fns');
const flash = require('connect-flash');
const session = require('express-session')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)


// Passport Config
require('./config/passport')(passport);


//view engine and static file
app.use('/static', express.static(__dirname + '/static'))
app.set('view engine', 'ejs');

//body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//Page Model
const Page = require('./models/page');

//pages variables
Page.find({}).exec((err, pages) => {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

//Category Model
var Category = require('./models/category');

Category.find((err, categories) => {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});

//Setting Model
var Setting = require('./models/setting');

Setting.findOne({}, (err, setting) => {
    if (err) {
        console.log(err);
    } else {
        app.locals.setting = setting;
    }
});


//express session
app.use(
    session({
        key: "admin",
        secret: "any string",
        resave: true,
        saveUninitialized: true
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.userLogin = req.user || null;
    next();
});

app.use((req, res, next) => {
    res.locals.format = format;
    next();
});


const pages = require('./routes/pages')
const admin = require('./routes/admin')
const posts = require('./routes/posts')
const admin_posts = require('./routes/admin_posts')
const admin_pages = require('./routes/admin_pages')
const admin_categories = require('./routes/admin_categories')
const admin_settings = require('./routes/admin_settings')
const admin_users = require('./routes/admin_users')


app.use('/admin/posts', admin_posts)
app.use('/admin/pages', admin_pages)
app.use('/admin/categories', admin_categories)
app.use('/admin/users', admin_users)
app.use('/admin/settings', admin_settings)
app.use('/admin', admin)
app.use('/posts', posts)
app.use('/', pages)

//mongodb connection
mongoose.connect('mongodb://localhost/myblog', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
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