const db = require("../configs/db");
var jwt = require("../services/jwt");

const {
  verifyPassword,
  createUpdate,
  hashPassword,
  generatePassword,
  transporter,
  insertQueryBuilder,
} = require("../helper/utils");

/* endpoint */
async function login(req, res) {
  if (!req.body.username || !req.body.password) {
    res.status(400).json({ mensaje: "Usuario o contraseña no ingresados." });
  } else {
    try {
      const data = await db.oneOrNone(
        "SELECT * FROM usuarios WHERE username = $1",
        req.body.username
      );
      if (data) {
        let passwordCorrect = await verifyPassword(
          req.body.password,
          data.password
        );

        if (!passwordCorrect && data.reset_password) {
          passwordCorrect = await verifyPassword(
            req.body.password,
            data.reset_password
          );

          if (passwordCorrect) {
            await db.none(
              `UPDATE usuarios SET password = '${data.reset_password}', reset_password = NULL WHERE username = '${req.body.username}'`
            );
          }
        }

        if (passwordCorrect) {
          let userData = {
            id: data.id,
            username: data.username,
            email: data.email,
          };

          let token = jwt.createToken(userData);
          res.json({
            response: { ...userData, token },
          });
          return;
        }
        res
          .status(400)
          .json({ mensaje: "La contraseña ingresada es incorrecta" });
      } else {
        res.status(400).json({ mensaje: "El username ingresado no existe" });
      }
    } catch (error) {
      console.log("ERROR", error);
      res.status(400).json({ response: error });
    }
  }
}

async function getUsuario(req, res) {
  try {
    const idUsuario = req.params.id;
    const data = await db.oneOrNone(
      "SELECT id, username, email FROM usuarios WHERE id = $1",
      idUsuario
    );
    res.json({ response: data });
  } catch (error) {
    console.log("ERROR", error);
    res.status(400).json({ response: error });
  }
}

async function getUsuarios(req, res) {
  try {
    const data = await db.any("SELECT * FROM usuarios");

    res.json({ response: data });
  } catch (error) {
    console.log("ERROR", error);

    res.status(400).json({ response: error });
  }
}

async function postUsuario(req, res) {
  try {
    const body = req.body;
    const data = await db.oneOrNone(
      `SELECT * FROM usuarios WHERE email = '${body.email}' OR username = '${body.usuario}'`
    );
    if (data) {
      res.status(400).json({
        mensaje: "Ya existe un usuario con ese email o username de usuario",
      });
    } else {
      var hash = await hashPassword(req.body.password);
      const newAdmin = { ...req.body, password: hash };
      console.log(newAdmin);
      const data = await db.one(
        "INSERT INTO usuarios (email, username, password) VALUES (${email}, ${username}, ${password}) RETURNING id, email, username",
        newAdmin
      );
      res.json({ response: data });
    }
  } catch (error) {
    console.log("ERROR", error);
    res.status(400).json({ response: error });
  }
}

async function putUsuario(req, res) {}

async function putUsuarioPassword(req, res) {
  try {
    const userData = req.decoded;
    const { newPassword, oldPassword } = req.body;
    const data = await db.oneOrNone(
      "SELECT * FROM usuarios WHERE id = $1",
      userData.id
    );
    if (data) {
      const passwordCorrect = await verifyPassword(oldPassword, data.password);
      if (passwordCorrect) {
        const hash = await hashPassword(newPassword);
        await db.none(
          `UPDATE usuarios SET password='${hash}' WHERE id = ${userData.id}`
        );
        res.status(200).send();
      } else {
        res
          .status(400)
          .json({ mensaje: "La contraseña ingresada es incorrecta" });
      }
    } else {
      res.status(400).json({ mensaje: "El usuario no existe" });
    }
  } catch (error) {
    console.log("ERROR", error);
    res.status(400).json({ response: error });
  }
}

async function deleteUsuario(req, res) {}

async function postForgotPassword(req, res) {
  try {
    const body = req.body;
    const data = await db.oneOrNone(
      "SELECT * FROM usuarios WHERE email = $1",
      body.email
    );
    if (data) {
      const newPassword = generatePassword();

      const hash = await hashPassword(newPassword);
      await db.none(
        `UPDATE usuarios SET reset_password='${hash}' WHERE email = '${body.email}'`
      );
      const mailData = {
        from: "algodonera.mm@gmail.com", // sender address
        to: body.email, // list of receivers
        subject: "LaCorona - Recuperar Contraseña",
        text: `Su contraseña nueva contraseña es ${newPassword}`,
        html: `<h1>LaCorona - Recuperar constraseña </h1>
                   <h2>Su contraseña nueva contraseña es ${newPassword}<h2/>`,
      };
      transporter.sendMail(mailData, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
      });
      res.status(200).send();
    } else {
      res
        .status(400)
        .json({ mensaje: "No existe un usuario con ese correo electrónico" });
    }
  } catch (error) {
    console.log("ERROR", error);
    res.status(400).json({ response: error });
  }
}

module.exports = {
  login: login,
  getUsuario: getUsuario,
  getUsuarios: getUsuarios,
  postUsuario: postUsuario,
  putUsuario: putUsuario,
  putUsuarioPassword: putUsuarioPassword,
  deleteUsuario: deleteUsuario,
  postForgotPassword: postForgotPassword,
};
