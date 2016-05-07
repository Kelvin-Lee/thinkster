var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("EventA. router.get('/',...");
  res.render('index', { title: 'Express' });
});

router.get('/posts', function(req, res, next){ //request, response, error callbck?
  console.log("EventB. router.get('/posts',...");
  Post.find(function(err,posts){ //queries the DB for "all posts"
    if(err){return next(err);} //If error, `next` handles error
    res.json(posts); //Implicit send as JSON 'back to the client'
  });
});

router.post('/posts', function(req, res, next){
  console.log("EventC. router.post('/posts',...");
  Post.find(function(err,posts){ //queries the DB for "all posts"
    var post = new Post(req.body); //"using `mongoose` to create a new `post` object in memory before saving it to the database"
    post.save(function(err, post){
      if (err) { return next(err); }
      res.json(post);
    });
  });
});

router.get('/posts/:post', function (req, res){
  console.log("EventD. router.get('/posts/:post',...");
  req.post.populate('comments', function(err, post){ // .populate "automatically loads all the comments associated with that particular `post`
    if(err){ return next(err); }
    res.json(req.post);
  });
});

router.put('/posts/:post/upvote', function(req, res, next) {
  console.log("EventE. router.put('/posts/:post/upvote',...");
  req.post.upvote(function(err, post){
    if (err) { return next(err); }
    res.json(post);
  });
});

router.post('/posts/:post/comments', function(req, res, next){
  console.log("EventG. router.post('/posts/:post/comments...'")
  var comment = new Comment(req.body); // I guess the model is like a constructor of sorts?
  comment.post = req.post;
  comment.save(function(err, comment){
    if (err){ return next(err);}
    req.post.comments.push(comment);
    req.post.save(function(err,post){
      if(err){ return next(err);}
      res.json(comment);
    });
  });
});

router.put('/posts/:post/comments/:comment/upvote', function(req, res, next){
  console.log("EventH. 'router.put(/posts/:post/comments/:comment/upvote...'");
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }
    res.json(comment);
  });
});

router.param('post', function(req, res, next, id){ 
// "Now when we define a route URL with `:post` in it, this function will be run first. Assuming the `:post` paramater contains an ID, our function will retrieve the `post` object from the database and attach it to the `req` object after which the route handler *(router.post?)* function will be called 
  console.log("EventF. router.param('post',...");
  var query = Post.findById(id);
  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error("can't find post"));};
    req.post = post;
    return next();
  });
});

router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!comment) { return next(new Error("can't find comment")); }

    req.comment = comment;
    return next();
  });
});

module.exports = router;
