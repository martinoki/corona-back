const db = require("../configs/db");

async function getHistorial(req, res) {
  try {
    const id_grupo = req.params.id;
    const userData = req.decoded;
    const usuario_grupo = await db.oneOrNone(
      "SELECT * FROM usuarios_grupos WHERE id = ${id_grupo} AND id_usuario = ${id_usuario}",
      { id_grupo, id_usuario: userData.id }
    );

    if (usuario_grupo) {
      const data = await db.any(
        "SELECT * FROM historial WHERE id_usuarios_grupos IN (SELECT id FROM usuarios_grupos WHERE id_grupo = ${id_grupo})",
        { id_grupo }
      );
      res.json({ response: data });
    } else{
      throw new Error("Este usuario no pertenece a este grupo.")
    }
  } catch (error) {
    res.status(400).json({ response: error });
  }
}

async function postHistorial(req, res) {
  try {
    const userData = req.decoded;
    const id_usuario = userData.id;
    const gastado = parseFloat(req.body.total)
    const parasitos = req.body.parasitos;
    const cantidad_parasitos = parasitos.length;
    const parte = gastado / cantidad_parasitos;
    const insertData = {
      id_usuario,
      gasto: gastado,
      fecha: new Date(),
      descripcion: req.body.descripcion
    }
    console.log("AAA")
    await db.query(
      "INSERT INTO historial(id_usuario, gasto, fecha, descripcion) VALUES (${id_usuario}, ${gasto}, ${fecha}, ${descripcion})",
      insertData
    );
    console.log("BBB")
    await db.query(
      `UPDATE corona SET total = total + ${gastado} WHERE id = ${idCorona} RETURNING *`
      );
      console.log("CCC")
    await db.query(
        `UPDATE corona SET total = total - ${parte} WHERE id IN (${parasitos.join(",")}) RETURNING *`
      );
    const historial = await db.any("SELECT * FROM corona");
    res.json({ response: historial });
  } catch (error) {
      console.log(error)
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
