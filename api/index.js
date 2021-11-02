const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  authorize = require('../middleware/authorization'),
  database = require('../database/database');

const router = express.Router();
router.use(morgan('tiny'));
router.use(bodyParser.json());


router.delete('/images/:id', authorize.authorize(['admin']), (request, response) => {
  const { id } = request.params;

  database.deleteImage(id, (err) => {
    if (err) {
      response.status(404).json({
        ok: false,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
});

router.get('/posts/:id', (request, response) => {
  database.getPost(request.params.id, (err, result) => {
    const post = result[0];

    if (err) {
      console.log(err);
      response.sendStatus(500);
      return;
    }

    if (!post) {
      response.sendStatus(404);
      return;
    }

    response.status(200).json(post);
  });
});

router.get('/posts', (request, response) => {
  const { brand } = request.query;

  if (brand) {
    database.getPostsByBrand(brand, (err, posts) => {
      if (err) {
        response.sendStatus(500);
        return;
      }
      response.status(200).json(posts);
    });
  } else {
    database.getPosts((err, posts) => {
      if (err) {
        response.sendStatus(500);
        return;
      }
      response.status(200).json(posts);
    });
  }
});

router.post('/posts', (request, response) => {
  const post = {
    username: request.body.username,
    price: request.body.price,
    city: request.body.city,
    brand: request.body.brand,
  };

  database.createPost(post, (err) => {
    if (err) {
      response.sendStatus(500);
      return;
    }
    response.sendStatus(201);
  });
});

router.delete('/posts/:id', (request, response) => {
  database.deletePost(request.params.id, (err, result) => {
    if (err) {
      response.sendStatus(500);
      console.log(err);
      return;
    }

    if (result.affectedRows === 0) {
      response.sendStatus(404);
    } else {
      response.sendStatus(204);
    }
  });
});

router.patch('/posts/:id', (request, response) => {
  const post = request.body;

  database.updatePost(request.params.id, post, (err, result) => {
    if (err) {
      response.sendStatus(500);
      console.log(err);
      return;
    }

    if (result.affectedRows === 0) {
      response.sendStatus(404);
    } else {
      response.sendStatus(204);
    }
  });
});

module.exports = router;
