const express = require('express')
const router = express.Router();
const ObjectId = require('mongodb').ObjectId


const Post = require('./models/post')


//post comment
router.post('/do-comment', (req, res) => {

    Post.findById(req.body.post_id, function (err, post) {
        if (err) {
            console.log(err)
        }
        console.log(post)
    })


    // console.log(req.body.post_id)
    // // 5f06788a386c3b0720f6ad17 

    // Post.update(
    //     { _id: new ObjectId(req.body.post_id) },
    //     { $push: { comments: { username: req.body.username, comment: req.body.comment } } },
    //     function (err, result) {
    //         if (err) {
    //             res.send(err);
    //         } else {
    //             res.send(result);
    //         }
    //     }
    // );
})


module.exports = router;

