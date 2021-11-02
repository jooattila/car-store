const mysql = require("mysql");

const connection = mysql.createConnection({
  database: "webprog",
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
});

connection.connect((err) => {
  if (err) {
    console.error(`Connection error: ${err.message}`);
    process.exit(1);
  }

  connection.query(
    `CREATE TABLE IF NOT EXISTS users (
    userID INT AUTO_INCREMENT primary key,
    username varchar(20),
    password varchar(1000),
    role varchar(20));`,
    (createErr) => {
      if (createErr) {
        console.error(`Create table error: ${createErr.message}`);
        process.exit(1);
      } else {
        console.log("Table created successfully");
      }
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS posts (
              postID varchar(20) primary key,
              username varchar(20),
              brand varchar (20),
              city varchar (20),
              price int,
              uploadDate varchar(30),
              userID int,
              FOREIGN KEY (userID) REFERENCES users(userID)
              );`,
    (createErr) => {
      if (createErr) {
        console.error(`Create table error: ${createErr}`);
        process.exit(1);
      } else {
        console.log("Table created successfully");
      }
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS images (
    imageID int AUTO_INCREMENT primary key,
    imageName varchar(50),
    postID varchar(20),
    FOREIGN KEY (postID) REFERENCES posts(postID));`,
    (createErr) => {
      if (createErr) {
        console.error(`Create table error: ${createErr.message}`);
        process.exit(1);
      } else {
        console.log("Table created successfully");
      }
    }
  );

  console.log(`Connected: ${connection.threadId}`);
});

exports.getPosts = (callback) => {
  connection.query("SELECT * FROM posts", callback);
};

exports.getPostsByBrand = (brand, callback) => {
  const query = `SELECT * FROM posts WHERE brand = "${brand}";`;
  console.log(`Executing query ${query}`);
  connection.query(query, callback);
};

exports.getPostsByCity = (city, callback) => {
  const query = `SELECT * FROM posts WHERE city = "${city}";`;
  console.log(`Executing query ${query}`);
  connection.query(query, callback);
};

exports.getPostsByLowestPrice = (price, callback) => {
  const query = `SELECT * FROM posts WHERE price >= "${price}";`;
  console.log(`Executing query ${query}`);
  connection.query(query, callback);
};

exports.getPostsByHighestPrice = (price, callback) => {
  const query = `SELECT * FROM posts WHERE price <= "${price}";`;
  console.log(`Executing query ${query}`);
  connection.query(query, callback);
};

exports.getPost = (id, callback) => {
  connection.query(`SELECT * FROM posts WHERE postID = "${id}"`, callback);
};

exports.getImages = (id, callback) => {
  connection.query(`SELECT * FROM images WHERE postID = "${id}"`, callback);
};

function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

exports.insertPost = (request, callback) => {
  const datum = new Date().toISOString().substring(0, 19).replace("T", " ");
  const query = `INSERT INTO posts (username, brand, city, price, uploadDate, postID) VALUES ("${
    request.session.username
  }","${request.body.brand}", "${request.body.city}", "${
    request.body.price
  }", "${datum}",  "${makeid(5)}");`;
  console.log(`Executing INSERT into posts query ${query}`);
  connection.query(query, callback);
};

const crypto = require("crypto");

exports.insertUser = (request, callback) => {
  const hashSize = 32,
    saltSize = 16,
    hashAlgorithm = "sha512",
    iterations = 1000;

  const { password } = request.body;

  crypto.randomBytes(saltSize, (err, salt) => {
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      hashSize,
      hashAlgorithm,
      (cryptErr, hash) => {
        const hashWithSalt = Buffer.concat([hash, salt]).toString("hex");
        const query = `INSERT INTO users (username, password, role) VALUES ("${request.body.username}", "${hashWithSalt}", "${request.body.selectRole}");`;
        console.log(`Executing INSERT into users query ${query}`);
        connection.query(query, callback);
      }
    );
  });
};

exports.createPost = (post, callback) => {
  const datum = new Date().toISOString().substring(0, 19).replace("T", " ");
  const query = `INSERT INTO posts (username, brand, city, price, uploadDate, postID) VALUES ("${
    post.username
  }","${post.brand}", "${post.city}", "${post.price}", "${datum}",  "${makeid(
    5
  )}");`;
  console.log(`Executing INSERT into posts query ${query}`);
  connection.query(query, callback);
};

exports.deletePost = (id, callback) => {
  const query = `DELETE FROM posts WHERE postID = "${id}"`;
  console.log(`Executing  query ${query}`);
  connection.query(query, callback);
};

exports.updatePost = (id, post, callback) => {
  const query = "UPDATE posts SET ? WHERE postID=?";
  const options = [post, id];

  connection.query(query, options, callback);
};

exports.checkExistingUser = (username, request, callback) => {
  const query = `SELECT password, role FROM users WHERE username ="${username}"`;
  console.log(`Executing query ${query}`);
  connection.query(query, callback);
};

exports.insertPhoto = (imageName, postID, callback) => {
  const query = `INSERT INTO images (imageName, postID) VALUES ("${imageName}", "${postID}");`;
  console.log(`Executing INSERT into posts query ${query}`);
  connection.query(query, callback);
};

exports.deleteImage = (id, callback) => {
  const query = `DELETE FROM images WHERE imageID = ${id}`;
  console.log(`Executing  query ${query}`);
  connection.query(query, callback);
};

exports.requestUser = (postID, callback) => {
  const query = `SELECT username, postID FROM posts WHERE postID = ${postID}`;
  console.log(`Executing query ${query}`);
  connection.query(query, callback);
};
