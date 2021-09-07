const initOptions = {
    // global event notification;
    schema: process.env.DATABASE_SCHEMA,
    error: (error, e) => {
        if (e.cn) {
            // A connection-related error;
            //
            // Connections are reported back with the password hashed,
            // for safe errors logging, without exposing passwords.
            console.log('CN:', e.cn);
            console.log('EVENT:', error.message || error);
        }
    }
};

const pgp = require('pg-promise')(initOptions);
var pgssl = require('pg');

pgssl.defaults.ssl = true;
pgp.pg.defaults.ssl = {
    rejectUnauthorized: false
}
const db = pgp(process.env.DATABASE_URL);
console.log("VOY A CONECTAR")
try {
    db.connect()
    .then(obj => {
        console.log("CONEXION OK")
        obj.done(); // success, release the connection;

    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });
} catch (error) {
    console.log("ERROR", error)
}


module.exports = db;