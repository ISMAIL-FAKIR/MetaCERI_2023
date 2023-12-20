const express = require("express");
const https = require("https");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const bodyParser = require("body-parser");
const MongoDBStore = require("connect-mongodb-session")(session);
const pgClient = require("pg");
const sha1 = require("crypto-js/sha1");
const MongoClient = require("mongodb").MongoClient;
const { v4: uuidv4 } = require("uuid");

//Initialisation de l'app
const app = express();

// Route ng build :
app.use(
  express.static(path.join(__dirname, "../frontend/MetaCARI/dist/meta-cari"))
);
const router = express.Router();
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

// parser les données du formulaire par bodyParser
app.use(bodyParser.urlencoded({ extended: true }));

//fonction Middleware pour gérer les sessions avec MongoDB
app.use(
  session({
    secret: "My name is Liamsi Rikaf",
    saveUninitialized: false,
    resave: false,
    store: new MongoDBStore({
      uri: "mongodb://127.0.0.1:27017/db-CERI",
      collection: "mySession3155",
      touchAfter: 24 * 3600,
    }),
    cookie: {
      maxAge: 24 * 3600 * 1000,
    },
  })
);

//Configuration d'un serveur HTTPS avec SSL
const sslServer = https
  .createServer(
    {
      key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
    },
    app
  )
  .listen(3155, () => {
    console.log("HTTPS => listening on 3155");
  });

// Configuration de Socket.IO
const io = require("socket.io")(sslServer);

app.use(express.static(__dirname));

// Middleware pour le body parser en JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//  Route de gestion de la connexion utilisateur
app.post("/login", (req, res) => {
  // Recuperer les données du formulaire
  const username = req.body.username;
  const password = req.body.password;

  // Requête SQL pour récupérer les informations de l'utilisateur depuis PostgreSQL
  const sql =
    "SELECT * FROM fredouil.users where identifiant='" + username + "';";

  // Configuration de la connexion à la base de données PostgreSQL
  const connectionObj = new pgClient.Pool({
    user: "uapv2100315",
    host: "127.0.0.1",
    database: "etd",
    password: "RH9fvS",
    port: 5432,
  });

  // Initialisation de la session utilisateur
  req.session.isConnected = true;
  req.session.username = username;

  // Connexion à la base de données et exécution de la requête SQL
  connectionObj.connect((err, client, done) => {
    if (err) {
      console.log("Erreur de connexion au serveur pg" + err.stack);
      res.status(500).json({});
    } else {
      console.log("Connexion établie avec le serveur pg db");
      client.query(sql, (err, result) => {
        if (err) {
          console.log("Erreur d'exécution de la requête");
          res.status(500).json({});
        } else if (
          result.rows[0] != null &&
          result.rows[0].motpasse == sha1(password).toString()
        ) {
          // Authentification réussie
          res.statusMsg =
            "Connection successful !  Welcome " + result.rows[0].prenom;
          res.status(200).json({
            username: username,
            statusMsg: res.statusMsg,
          });
        } else {
          // Échec de l'authentification
          res.status(500).json({
            statusMsg: "Login fails: incorrect login information",
          });
        }
      });
      client.release();
    }
  });
});

//récupérer les postes avec pagination
app.get("/getposts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Page par défaut 1
    const pageSize = 3; // Nombre de posts par page

    // Connexion à MongoDB
    const client = await MongoClient.connect("mongodb://127.0.0.1:27017/");
    console.log("Connecté correctement au serveur");

    // Récupération de tous les posts
    const db = client.db("db-CERI");
    const col = db.collection("CERISoNet");

    const totalPosts = await col.countDocuments();
    const totalPages = Math.ceil(totalPosts / pageSize);

    const posts = await col
      .find()
      .sort()
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .map((p) => p)
      .toArray();

    // Fermeture de la connexion à MongoDB
    client.close();

    // Récupération du propriétaire du post et de l'username de la personne qui a partagé le post
    await Promise.all(
      posts.map(async (item) => {
        try {
          const pool = new pgClient.Pool({
            user: "uapv2100315",
            host: "127.0.0.1",
            database: "etd",
            password: "RH9fvS",
            port: 5432,
          });
          const client = await pool.connect();

          // Récupération du créateur du post
          const creatorResult = await pool.query(
            "select nom, prenom, avatar from fredouil.users where id= '" +
              item.createdBy +
              "';"
          );
          item.creator = creatorResult.rows[0].nom;
          item.creatorAvatar = creatorResult.rows[0].avatar;
          item.prenom = creatorResult.rows[0].prenom;

          // Récupération de l'username de la personne qui a partagé le post
          if (item.sharedBy) {
            const sharedByResult = await pool.query(
              "select identifiant from fredouil.users where id= '" +
                item.sharedBy +
                "';"
            );
            item.sharedByUsername = sharedByResult.rows[0].identifiant;
          }

          // Récupération des noms et prénoms des personnes qui ont commenté chaque commentaire
          await Promise.all(
            item.comments.map(async (comment) => {
              // Vérification avant d'utiliser la valeur dans la requête SQL
              if (comment.userId) {
                const commenterResult = await pool.query(
                  "select nom, prenom from fredouil.users where id= '" +
                    comment.userId +
                    "';"
                );
                comment.commenterNom = commenterResult.rows[0].nom;
                comment.commenterPrenom = commenterResult.rows[0].prenom;
              }
            })
          );

          client.release();
        } catch (err) {
          console.log(err);
        }
      })
    );

    res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
});

//ajouter un comment
app.post("/addComment", async (req, res) => {
  try {
    const postId = req.body.postId;
    const commentText = req.body.commentText;

    // Connect to MongoDB
    const client = await MongoClient.connect("mongodb://127.0.0.1:27017/");
    const db = client.db("db-CERI");
    const col = db.collection("CERISoNet");

    // Find the post and add the comment
    const result = await col.updateOne(
      { _id: parseInt(postId) },
      { $push: { comments: { text: commentText, userId: req.session.userId } } }
    );

    // Close the MongoDB connection
    client.close();

    // Send a success response
    res.status(200).json({ success: true });
    console.log("l'ajout du commentaire réussi");
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

//ajouter Like
app.get("/addLike", async (req, res) => {
  try {
    console.log(req.query);

    // Connexion à MongoDB
    let client = await MongoClient.connect("mongodb://127.0.0.1:27017/");
    console.log("Connected correctly to server");
    const db = client.db("db-CERI");
    const col = db.collection("CERISoNet");
    let r = await col.updateOne(
      { _id: parseInt(req.query.idPost) },
      { $inc: { likes: 1 } }
    );
    let post = await col.findOne({ _id: parseInt(req.query.idPost) });

    /* remarque du prof :
    faut améliorer ça, je lance 2 requetes pour une meme chose
    pour addLike
    */

    // Envoi de l'événement via Socket.IO
    io.emit("likes", post);
    res.status(200).json({});
  } catch (error) {
    // Gestion des erreurs
    res.sendStatus(500);
  }
});

//partager
app.get("/Share", async (req, res) => {
  try {
    // Connexion à la base de données PostgreSQL
    const pool = new pgClient.Pool({
      user: "uapv2100315",
      host: "127.0.0.1",
      database: "etd",
      password: "RH9fvS",
      port: 5432,
    });
    const client = await pool.connect();

    // Connexion à la base de données MongoDB
    let clientMongo;
    clientMongo = await MongoClient.connect("mongodb://127.0.0.1:27017/");

    // Sélection de la base de données et de la collection MongoDB
    const db = clientMongo.db("db-CERI");
    const col = db.collection("CERISoNet");

    // Recherche du post partagé dans la collection MongoDB
    const existingPost = await col.findOne({
      _id: parseInt(req.query.sharedPost),
    });

    // Si le post n'existe pas, renvoyer une erreur 404
    if (!existingPost) {
      console.error("Existing post not found for ID:", req.query.sharedPost);
      res.status(404).json({ error: "Existing post not found" });
      return;
    }

    // Requête SQL pour obtenir l'ID de l'utilisateur
    const User = await pool.query(
      "select id from fredouil.users where identifiant= '" +
        req.query.username +
        "';"
    );

    // Obtention de la date actuelle et formatage
    const maDate = new Date();
    let month = maDate.getMonth() + 1;
    const dateFormat =
      maDate.getFullYear() + "-" + month + "-" + maDate.getDate();
    const Heure = maDate.getHours() + ":" + maDate.getMinutes();
    let idMax = await col
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .map(function (p) {
        return p;
      })
      .toArray();

    // Recherche du plus grand ID dans la collection MongoDB
    const postShared = {
      _id: idMax.length > 0 ? idMax[0]._id + 1 : 1,
      body: existingPost.body,
      createdBy: User.rows[0].id,
      creator: existingPost.creator,
      creatorAvatar: existingPost.creatorAvatar,
      date: dateFormat,
      hour: Heure,
      comments: [],
      likes: 0,
      shared: req.query.sharedPost,
      hashtags: existingPost.hashtags,
      images: existingPost.images,
      prenom: existingPost.prenom,
      shares: 0,
    };

    // Insertion du post partagé dans la collection MongoDB
    let r = await col.insertOne(postShared);
    res.status(200).json({}); // Réponse JSON vide avec statut 200
    console.log(r);
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // En cas d'erreur, renvoyer une erreur 500
  }
});

// filtrer par hashtags
app.get("/filterByHashtag", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Page par défaut 1
    const pageSize = 8; // Nombre de posts par page

    // Préparation du hashtag en ajoutant le caractère "#" à la requête
    let hashtagToFind = "#" + req.query.hashtag;

    // Connexion à la base de données MongoDB
    let client = await MongoClient.connect("mongodb://127.0.0.1:27017/");

    // Sélection de la base de données et de la collection
    const db = client.db("db-CERI");
    const col = db.collection("CERISoNet");

    // Requête pour récupérer les posts filtrés par hashtag avec pagination
    let filteredPosts = await col
      .find({ hashtags: hashtagToFind })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .map(async (p) => {
        // Récupération des informations du créateur du post
        const creatorResult = await getCreatorInfo(p.createdBy);
        p.creator = creatorResult.nom;
        p.creatorAvatar = creatorResult.avatar;
        p.prenom = creatorResult.prenom;

        return p;
      })
      .toArray();

    // Affichage des posts filtrés dans la console
    console.log("Filtered posts", filteredPosts);

    // Envoi des posts filtrés en tant que réponse JSON
    res.status(200).json({ posts: filteredPosts });
  } catch (error) {
    res.sendStatus(500);
  }
});

//filtrer mes posts
app.get("/filterMyPost", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Page par défaut 1
    const pageSize = 8; // Nombre de posts par page

    // la connexion à la base de données PostgreSQL
    const pool = new pgClient.Pool({
      user: "uapv2100315",
      host: "127.0.0.1",
      database: "etd",
      password: "RH9fvS",
      port: 5432,
    });

    // Connexion à la base de données PostgreSQL
    const client = await pool.connect();

    // Récupération des informations de l'utilisateur à partir de la table 'users'
    const result = await pool.query(
      "select id, nom, prenom from fredouil.users where identifiant = '" +
        req.session.username +
        "';"
    );

    // Vérification si l'utilisateur existe
    if (result.rows.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Récupération des détails de l'utilisateur
    console.log(result.rows[0]);
    let user_id = result.rows[0].id;
    let monNomPrenom = result.rows[0].nom + " " + result.rows[0].prenom;

    // Connexion à la base de données MongoDB
    let clientMongo;
    clientMongo = await MongoClient.connect("mongodb://127.0.0.1:27017/");
    console.log("filtrer mes messages reussi");
    const db = clientMongo.db("db-CERI");
    const col = db.collection("CERISoNet");

    // Requête MongoDB pour récupérer les messages créés par l'utilisateur connecté
    let r = await col
      .find({ createdBy: parseInt(user_id) })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .map(function (p) {
        return p;
      })
      .toArray();

    // Récupération de tous les utilisateurs de la table 'users"
    const resultUsers = await client.query("select * from fredouil.users;");

    // Vérification des utilisateurs
    if (resultUsers.rows.length > 0) {
      r.map((item) => {
        resultUsers.rows.map((user) => {
          if (item.createdBy === user.id) {
            item.creator = user.nom;
            item.creatorAvatar = user.avatar;
            item.prenom = user.prenom;
            return true;
          }
        });
        resultUsers.rows.map((user) => {
          if (item.comments.length > 0) {
            item.comments.map((commentaire) => {
              if (commentaire.commentedBy === user.id) {
                commentaire.commentatorLastName = user.nom;
                commentaire.commentatorAvatar = user.avatar;
                commentaire.commentatorName = user.prenom;
                return true;
              }
            });
          }
        });
      });
    }
    res.status(200).json({
      posts: r,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// trier les posts par popularité (nombre de likes)
app.get("/sortPostsByPopularity", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Page par défaut 1
    const pageSize = 8; // Nombre de posts par page

    // Connexion à la base de données MongoDB
    const client = await MongoClient.connect("mongodb://127.0.0.1:27017/");
    console.log("Connected correctly to server");

    // Sélection de la base de données et de la collection
    const db = client.db("db-CERI");
    const col = db.collection("CERISoNet");

    //récupérer les articles triés par popularité (likes) de manière décroissante
    const sortedPosts = await col
      .find()
      .sort({ likes: -1 }) // posts triés par popularité (likes) de manière décroissante
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .map(async (p) => {
        // Récupération du créateur du post
        const creatorResult = await getCreatorInfo(p.createdBy);
        p.creator = creatorResult.nom;
        p.creatorAvatar = creatorResult.avatar;
        p.prenom = creatorResult.prenom;

        return p;
      })
      .toArray();

    // Calcul du nombre total d'articles triés
    const totalSortedPosts = await col.countDocuments();
    const totalPages = Math.ceil(totalSortedPosts / pageSize);

    client.close();

    res.status(200).json({ sortedPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
});

// trier les posts par date de création (décroissante)
app.get("/sortPostsByDate", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Page par défaut 1
    const pageSize = 8; // Nombre de posts par page

    // Connecting to MongoDB server
    const client = await MongoClient.connect("mongodb://127.0.0.1:27017/");
    console.log("Connected correctly to server");

    // Accessing the database and collection
    const db = client.db("db-CERI");
    const col = db.collection("CERISoNet");

    //récupérer les articles triés par date de manière décroissante
    const sortedPosts = await col
      .find()
      .sort({ date: -1 }) // posts triés par date de manière décroissante
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .map(async (p) => {
        // Récupération du créateur du post
        const creatorResult = await getCreatorInfo(p.createdBy);
        p.creator = creatorResult.nom;
        p.creatorAvatar = creatorResult.avatar;
        p.prenom = creatorResult.prenom;

        return p;
      })
      .toArray();

    // Counting the total number of sorted posts for pagination
    const totalSortedPosts = await col.countDocuments();
    const totalPages = Math.ceil(totalSortedPosts / pageSize);

    // Closing the MongoDB connection
    client.close();

    res.status(200).json({ sortedPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
});

/* Fonction pour récupérer les informations du créateur
  pour eviter de réecrire ce code à chaque fois 
*/
async function getCreatorInfo(creatorId) {
  const pool = new pgClient.Pool({
    user: "uapv2100315",
    host: "127.0.0.1",
    database: "etd",
    password: "RH9fvS",
    port: 5432,
  });

  const client = await pool.connect();
  const creatorResult = await client.query(
    "select nom, prenom, avatar from fredouil.users where id= $1",
    [creatorId]
  );

  client.release();

  return creatorResult.rows[0];
}

//gestion de déconnexion
app.get("/logout", (req, res) => {
  //detruire la session
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.status(500).json({ statusMsg: "erreur de déconnexion" });
    } else {
      res.json({ statusMsg: "Logout successful, By By !" });
    }
  });
});
