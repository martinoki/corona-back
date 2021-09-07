var jwt = require("jsonwebtoken");
// var moment = require("moment"); // fecha de creacion y expiracion tokens

exports.createToken = function (payload) {
  return jwt.sign(payload, process.env.SECRET_KEY); //secret --> genera clave secreta para el gethash
};
