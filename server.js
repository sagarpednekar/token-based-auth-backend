const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const authorize = require("./authenticate");
const tokenList = {};
require("dotenv").config();

const PORT = process.env.PORT || 4000;

// add middleware

app.use(bodyParser.json());

app.use(cors());

// root path

app.get("/", (req, res) => {
   res.send("APP is up and running");
});

app.post("/login", (req, res) => {
   const requestBody = req.body;
   /**
    * Database authentication goes here
    */
   const user = {
      email: requestBody.email,
      password: requestBody.password
   };

   // generate token

   /**
    *
    * {payload } - payload object
    * { secret } - secret key to generate token
    * { expiresIn} - expiration time
    *
    */

   const token = jwt.sign(user, process.env.tokenSecret, {
      expiresIn: "10s"
   });
   const refreshToken = jwt.sign(user, process.env.refreshTokenSecret, {
      expiresIn: "20s"
   });

   tokenList[refreshToken] = { token, refreshToken };
   res.status(200).json({
      status: "Logged In",
      token,
      refreshToken
   });
});

app.post("/token", (req, res) => {
   const reqBody = req.body;
   if (reqBody.refreshToken && reqBody.refreshToken in tokenList) {
      const user = {
         email: reqBody.email,
         password: reqBody.password
      };

      const token = jwt.sign(user, process.env.tokenSecret, {
         expiresIn: "10s"
      });

      // update the token in list
      tokenList[reqBody.refreshToken].token = token;
      res.status(200).send({
         token
      });
   } else {
      // missing refreshToken
      res.status(404).send("Unauthorized user");
   }
});

app.get("/secure", authorize, (req, res) => {
   res.send({
      Msg: "Now I can access the secure API"
   });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
