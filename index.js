const express = require('express')
const mongoose = require('mongoose');
const { format } = require('date-fns');

const session = require('express-session')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)


//view engine and static file
app.use('/static', express.static(__dirname + '/static'))
app.set('view engine', 'ejs');

//body parser
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


const indexRoutes = require('./routes/index')
const adminRoutes = require('./routes/admin')
const admin_posts = require('./routes/admin_post')
const admin_pages = require('./routes/admin_page')
const admin_categories = require('./routes/admin_category')


app.use('/admin/posts', admin_posts)
app.use('/admin/pages', admin_pages)
app.use('/admin/categories', admin_categories)
app.use('/admin', adminRoutes)
app.use('/', indexRoutes)

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

    // socket.on("delete_post", (id) => {
    //     socket.broadcast.emit("delete_post", id)
    // })

})

http.listen(3000, () => {
    console.log('Server is running at port')
})