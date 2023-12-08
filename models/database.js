const mysql2 = require('mysql2/promise')

let pool = mysql2.createPool({
    connectionLimit: 10000,
    host: "localhost",// on rentre l'hôte, l'adresse url où se trouve la bdd
    user: "root", // identifiant BDD
    password: "root", // le password
    database: "chess_bar", // nom de la base de donnée
});

module.exports = pool