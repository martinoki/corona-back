const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

function createUpdate(table, data, where = "") {
  if (!table || typeof table !== "string") {
    throw new TypeError("Parameter 'table' must be a non-empty string.");
  }
  if (!data || typeof data !== "object") {
    throw new TypeError("Parameter 'data' must be an object.");
  }
  var keys = Object.keys(data).filter(function (k) {
    return data[k] !== undefined && k !== "id";
  });
  var names = keys
    .map(function (k, index) {
      return k + " = $" + (index + 1);
    })
    .join(", ");
  var values = keys.map(function (k) {
    return data[k];
  });
  return {
    query: "UPDATE " + table + " SET " + names + " " + where + " RETURNING *",
    values: values,
  };
}

function insertQueryBuilder(table, data) {
  if (!table || typeof table !== "string") {
    throw new TypeError("Parameter 'table' must be a non-empty string.");
  }
  if (!data || typeof data !== "object") {
    throw new TypeError("Parameter 'data' must be an object.");
  }
  var keys = Object.keys(data).filter(function (k) {
    return data[k] !== undefined && k !== "id";
  });
  var columns = keys.map(function (k) {
    return k;
  });
  var values = keys.map(function (k) {
    return data[k];
  });
  return {
    query: `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns
      .map((_, i) => "$" + (i + 1))
      .join(", ")}) RETURNING *`,
    values: values,
  };
}

async function hashPassword(password) {
  const salt = parseInt(process.env.SALTROUNDS);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function generatePassword() {
  return Math.random().toString(36).slice(-8);
}

const transporter = nodemailer.createTransport({
  port: 465, // true for 465, false for other ports
  host: "smtp.gmail.com",
  auth: {
    user: "algodonera.mm@gmail.com",
    pass: "admin123!",
  },
  secure: true,
});

module.exports = {
  createUpdate,
  hashPassword,
  verifyPassword,
  insertQueryBuilder,
  generatePassword,
  transporter,
};
