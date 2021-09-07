var express = require("express");
var router = express.Router();
const verifyToken = require('../middleware/authenticate');

const usuarios = require("../api/usuarios");
const grupos = require("../api/grupos");
const gastos = require("../api/gastos");

/* GET home page. */
router.get("/", function (req, res, next) {
  try {
    res.send({ title: "Express" });
  } catch (error) {
    console.log(error);
  }
});

/*LOGIN*/
router.post("/login", usuarios.login);

/*USUARIOS*/
router.get("/usuarios", verifyToken, usuarios.getUsuarios);
router.get("/usuarios/:id", verifyToken, usuarios.getUsuario);
router.post("/usuarios", verifyToken, usuarios.postUsuario);
router.put("/usuarios/:id", verifyToken, usuarios.putUsuario);
router.post("/usuarios/forgot-password", usuarios.postForgotPassword);

/*GRUPOS*/
router.get("/grupos", verifyToken, grupos.getGrupos);
router.get("/grupos/:id", verifyToken, grupos.getGrupo);
router.post("/grupos", verifyToken, grupos.postGrupo);
// router.post("/grupos/join", verifyToken, grupos.postJoinGrupo);
router.put("/grupos/:id", verifyToken, grupos.putGrupo);
router.delete("/grupos/:id", verifyToken, grupos.deleteGrupo);

/*USUARIOS*/
router.get("/usuarios", verifyToken, usuarios.getUsuarios);
router.get("/usuarios/:id", verifyToken, usuarios.getUsuario);
router.post("/usuarios", verifyToken, usuarios.postUsuario);
router.put("/usuarios/:id", verifyToken, usuarios.putUsuario);
router.post("/usuarios/forgot-password", usuarios.postForgotPassword);



module.exports = router;
