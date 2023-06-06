const express = require("express");
const user = require("../models/user");
const route = express.Router();
const bcrypt = require("bcryptjs");

route.post("/user/addUser", (req, res) => {
  user
    .findOne({ email: req.body.email })
    .then((userf) => {
      if (userf) {
        console.log("L'utilisateur déja exsite!");
        res.send({resp: "L'utilisateur déja exsite!"});
      } else {
        let salt = bcrypt.genSaltSync(10);
        let password_crypt = bcrypt.hashSync(req.body.password, salt);
        console.log(password_crypt);
        const Userv = new user({
          email: req.body.email,
          lastName: req.body.lastName,
          firstName: req.body.firstName,
          password: password_crypt,
        });
        Userv.save()
          .then((params) => {
            console.log("Enregistrement Succées!");
          })
          .catch((error) => {
            console.log(error);
          });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

route.get("/user/allUsers", (req, res) => {
  user
    .find()
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      console.log(error);
    });
});

// La vérification de la connexion(Email et le mot de passe)

route.post("/user/verifyUser", (req, res) => {
  username = req.body.username;
  password = req.body.password;
  
  user
    .findOne({ email: username })
    .then((userv) => {
      if (userv) {
        if (bcrypt.compareSync(password, userv.password)) {
          
          res.send([{ userv }, { rep: true }]);
        } else if (!bcrypt.compareSync(password, userv.password)) {
          res.send([
            { data: "Votre mot de passe est incorrect!" },
            { rep: false },
          ]);
        }
      } else {
        res.send([
          { data: "Utilisateur n exsite pas !" },
          { rep: false },
        ]);
      }
    })
    .catch((error) => {
      console.log(error);
      
    });
});

module.exports = route;
