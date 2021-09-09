const db = require("../configs/db");

async function getHistorial(req, res) {
  try {
    const id_grupo = req.params.id_grupo;
    const userData = req.decoded;

    const pertenece = await db.oneOrNone(
      "SELECT 1 FROM usuarios_grupos WHERE id_grupo = ${id_grupo} AND id_usuario = ${id_usuario}",
      { id_grupo, id_usuario: userData.id }
    );

    if (pertenece) {
      const detalle = await db.any(
        "SELECT * FROM historial WHERE id_grupo = ${id_grupo} AND id_usuario = ${id_usuario}",
        { id_grupo, id_usuario: userData.id }
      );

      res.json({ response: detalle });
    } else {
      throw new Error("Este usuario no puede ver el historial porque no pertenece a este grupo, o el grupo no existe.");
    }
  } catch (error) {
    console.log(error)
    res.status(400).json({ response: error });
  }
}

async function postHistorial(req, res) {
  try {
    const body = req.body;
    const userData = req.decoded;
    const id_usuario = userData.id;
    const gastado = parseFloat(body.total);
    const parasitos = body.parasitos;
    const cantidad_parasitos = parasitos.length;
    const parte = gastado / cantidad_parasitos;

    const id_grupo = body.id_grupo;
    console.log(
      `SELECT 1 FROM usuarios_grupos WHERE id_grupo = '${id_grupo}' AND id_usuario IN (${parasitos
        .map((item) => "'" + item.toString() + "'")
        .join(",")})`
    );
    const usuario_grupo = await db.any(
      `SELECT 1 FROM usuarios_grupos WHERE id_grupo = '${id_grupo}' AND id_usuario IN (${parasitos
        .map((item) => "'" + item.toString() + "'")
        .join(",")})`
    );

    console;

    if (usuario_grupo.length !== parasitos.length) {
      throw new Error(
        "Usuarios incorrectos. Verifique que todos los usuarios pertenezcan al grupo"
      );
    }

    await db.tx(async (t) => {
      const insertData = {
        id_usuario,
        id_grupo,
        gasto: gastado,
        fecha_creacion: new Date(),
        descripcion: body.descripcion,
      };
      console.log("AAA");
      await t.none(
        "INSERT INTO historial(id_usuario, id_grupo, gasto, fecha_creacion, descripcion) VALUES (${id_usuario}, ${id_grupo}, ${gasto}, ${fecha_creacion}, ${descripcion})",
        insertData
      );

      console.log("BBB");
      await t.none(
        `UPDATE usuarios_grupos SET total = total + ${gastado} WHERE id_usuario = '${id_usuario}' AND id_grupo = '${id_grupo}'`
      );

      console.log("CCC");
      await t.none(
        `UPDATE usuarios_grupos SET total = total - ${parte} WHERE id_grupo = '${id_grupo}' AND id_usuario IN (${parasitos
          .map((item) => "'" + item.toString() + "'")
          .join(",")})`
      );
    });
    const historial = await db.any(
      `SELECT * FROM usuarios_grupos WHERE id_grupo = '${id_grupo}'`
    );
    res.json({ response: historial });
  } catch (error) {
    console.log(error);
    res.status(400).json({ response: error });
  }
}

async function putHistorial(req, res) {}

async function deleteHistorial(req, res) {}

module.exports = {
  getHistorial: getHistorial,
  postHistorial: postHistorial,
  putHistorial: putHistorial,
  deleteHistorial: deleteHistorial,
};
