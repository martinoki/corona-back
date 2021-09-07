var express = require("express");
var jwt = require("jsonwebtoken");
const verifyToken = express.Router();
verifyToken.use((req, res, next) => {
  var token = req.headers["authorization"];
  if (token) {
    token = token.replace("Bearer ", "");
    try {
      jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
          return res.json({ response: "Token inválido" });
        }
        
        req.decoded = decoded;
        next();
      });
    } catch (error) {
      return res.json({ response: error });
    }
  } else {
    res.status(401).send({
      response: "missing-token",
    });
  }
});

module.exports = verifyToken;
