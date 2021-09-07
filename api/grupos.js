const db = require("../configs/db");

async function getGrupo(req, res) {
  try {
    const id_grupo = req.params.id;
    const userData = req.decoded;

    console.log("SELECT * FROM usuarios_grupos WHERE id_grupo = ${id_grupo} AND id_usuario = ${id_usuario}",
    { id_grupo, id_usuario: userData.id })

    const usuario_grupo = await db.oneOrNone(
      "SELECT * FROM usuarios_grupos WHERE id_grupo = ${id_grupo} AND id_usuario = ${id_usuario}",
      { id_grupo, id_usuario: userData.id }
    );
    
    if (usuario_grupo) {
      res.json({ response: usuario_grupo });
    } else {
      throw new Error("Este usuario no pertenece a este grupo o el grupo no existe");
    }
  } catch (error) {
    console.log(error)
    res.status(400).json({ response: error });
  }
}

async function getGrupos(req, res) {
  try {
    const userData = req.decoded;
    const data = await db.any(
      "SELECT * FROM grupos WHERE ${id_usuario} IN (SELECT id_usuario FROM usuarios_grupos)",
      { id_usuario: userData.id }
    );
    res.json({ response: data });
  } catch (error) {
    console.log("ERROR", error);
    res.status(400).json({ response: error });
  }
}

async function postGrupo(req, res) {
  try {
    const body = req.body;
    const fecha_actual = new Date().toISOString();
    const userData = req.decoded;
    body["fecha_creacion"] = fecha_actual;
    body["creador"] = userData.id;

    await db.tx(async (t) => {
      // automatic BEGIN

      const grupo = await t.one(
        "INSERT INTO grupos (nombre, total, creador, fecha_creacion, descripcion) VALUES (${nombre}, 0, ${creador}, ${fecha_creacion}, ${descripcion}) RETURNING *",
        body
      );

      await t.none(
        "INSERT INTO usuarios_grupos (id_usuario, id_grupo, fecha_creacion) VALUES (${id_usuario}, ${id_grupo}, ${fecha_creacion})",
        {
          id_usuario: userData.id,
          id_grupo: grupo.id,
          fecha_creacion: fecha_actual,
        }
      );
    });
    await getGrupos(req, res);
  } catch (error) {
    console.log("ERROR", error);
    res.status(400).json({ response: error });
  }
}

async function postJoinGrupo(req, res) {
  try {
    const body = req.body;
    const fecha_actual = new Date().toISOString();
    const userData = req.decoded;
    body["id_usuario"] = userData.id;

    await db.tx(async (t) => {
      // automatic BEGIN

      const usuario_grupo = await t.oneOrNone(
        "SELECT * FROM usuarios_grupos WHERE id_grupo = ${id_grupo} AND id_usuario = ${id_usuario}",
        body
      );

      if (!usuario_grupo) {
        await t.none(
          "INSERT INTO usuarios_grupos (id_usuario, id_grupo, fecha_creacion) VALUES (${id_usuario}, ${id_grupo}, ${fecha_creacion})",
          {
            id_usuario: userData.id,
            id_grupo: grupo.id,
            fecha_creacion: fecha_actual,
          }
        );
      } else {
        throw new Error("Este usuario ya pertenece a este grupo.");
      }
    });
    await getGrupo(req, res);
  } catch (error) {
    console.log("ERROR", error);
    res.status(400).json({ response: error });
  }
}

async function putGrupo(req, res) {}

async function deleteGrupo(req, res) {}

module.exports = {
  getGrupo: getGrupo,
  getGrupos: getGrupos,
  postGrupo: postGrupo,
  putGrupo: putGrupo,
  deleteGrupo: deleteGrupo,
};
