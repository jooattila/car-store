const express = require('express'),
  path = require('path'),
  fs = require('fs'),
  crypto = require('crypto'),
  eformidable = require('express-formidable'),
  {
    checkIntegers, checkUsername, checkLiterals, checkSearchLiterals,
  } = require('../utils/validate'),
  database = require('../database/database'),
  authorize = require('../middleware/authorization'),
  api = require('../api/index');

const router = express.Router();

router.get('/', (request, response) => {
  if (!checkSearchLiterals(request.param.search)) {
    response.status(400);
    response.render('error');
    return;
  }

  switch (request.query.select) {
    case 'brand':
      database.getPostsByBrand(request.query.search, (err, posts) => {
        if (err) {
          console.log(err);
          response.render('error');
          return;
        }

        response.render('index', { posts, username: request.session.username });
      });
      break;

    case 'city':
      database.getPostsByCity(request.query.search, (err, posts) => {
        if (err) {
          console.log(err);
          response.render('error');
          return;
        }

        response.render('index', { posts, username: request.session.username });
      });
      break;

    case 'lowestprice':
      if (!checkIntegers(request.query.search)) {
        response.status(400);
        response.render('error');
        return;
      }
      database.getPostsByLowestPrice(request.query.search, (err, posts) => {
        if (err) {
          console.log(err);
          response.render('error');
          return;
        }

        response.render('index', { posts, username: request.session.username });
      });
      break;
    case 'highestprice':
      if (!checkIntegers(request.query.search)) {
        response.status(400);
        response.render('error');
        return;
      }
      database.getPostsByHighestPrice(request.query.search, (err, posts) => {
        if (err) {
          console.log(err);
          response.render('error');
          return;
        }

        response.render('index', { posts, username: request.session.username });
      });
      break;

    default:
      database.getPosts((err, posts) => {
        if (err) {
          response.render('error');
          return;
        }

        response.render('index', { posts, username: request.session.username });
      });
      break;
  }
});


router.get('/post', (request, response) => {
  database.getPost(request.query.id, (err, post) => {
    if (err) {
      console.log(err);
      response.render('error');
      return;
    }

    database.getImages(request.query.id, (err2, images) => {
      if (err2) {
        console.log(err2);
        response.render('error');
        return;
      }

      response.render('post', { post: post[0], images, username: request.session.username });
    });
  });
});

const uploadDir = path.join(__dirname, '../images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

router.use('/image', express.static('images'));

router.post('/uploadPhoto', authorize.authorize(['admin']), eformidable({ uploadDir }), (request, response) => {
  const imageName = path.basename(request.files.photo.path);
  const postID = request.fields.id;
  database.insertPhoto(imageName, postID, (err) => {
    if (err) {
      fs.unlinkSync(request.files.photo.path);
      console.log(err);
      response.status(500).render('error');
      return;
    }

    response.redirect(`/post?id=${postID}`);
  });
});

router.post('/insertData', (request, response) => {
  if (checkLiterals(request, request.body.brand) && checkLiterals(request, request.body.city)
   && checkIntegers(request.body.price)) {
    database.insertPost(request, (err2) => {
      if (err2) {
        console.log(err2);
      }
      response.redirect('/');
    });
  } else {
    response.status(400);
    response.send('Incorrect input!');
  }
});


router.post('/insertUser', (request, response) => {
  if (checkUsername(request) && (request.body.password === request.body.passwordc)) {
    database.insertUser(request, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect('/');
    });
  } else {
    response.status(400);
    response.send('Incorrect input!');
  }
});


router.post('/checkExistingUser', (request, response) => {
  const { username, password } = request.body;
  const hashSize = 32,
    hashAlgorithm = 'sha512',
    iterations = 1000;
  console.log(request.body);

  database.checkExistingUser(username,  request, (err, row) => {
    if (err) {
      throw err;
    } else {
      const dbPass = JSON.parse(JSON.stringify(row));

      try {
        console.log(dbPass[0]);
        const hashPass = dbPass[0].password;
        const { role } = dbPass[0];
        const expectedHash = hashPass.substring(0, hashSize * 2);
        const salt = Buffer.from(hashPass.substring(hashSize * 2), 'hex');
        crypto.pbkdf2(password, salt, iterations, hashSize, hashAlgorithm, (err2, binaryHash) => {
          const actualHash = binaryHash.toString('hex');
          if (expectedHash !== actualHash) {
            response.status(401).send('Login failed! Passwords do not match');
          } else {
            request.session.username = username;
            request.session.role = role;
            response.redirect('/');
          }
        });
      } catch (error) {
        response.set(403);
        response.send('User not found!');
      }
    }
  });
});


router.post('/logoutUser', (request, response) => {
  request.session.destroy((err) => {
    if (err) {
      response.status(500).send(`Session reset error: ${err.message}`);
    } else {
      response.redirect('/');
    }
  });
});

router.get('/login', (request, response) => {
  response.render('login');
});

router.get('/register', (request, response) => {
  response.render('register');
});

router.get('/newPost', authorize.authorize(['user', 'admin']), (request, response) => {
  response.render('newPost');
});


router.use('/api', api);

module.exports = router;
