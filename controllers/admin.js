const db = require('../models/database.js')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')

async function home (req, res) {
    let [tournaments, fields] = await db.query(`
        SELECT * FROM tournament
        JOIN bar ON tournament.id_bar = bar.id 
        ORDER BY date DESC 
    `)
    console.log(tournaments)
    res.render('admin_home.ejs', {
        tournaments: tournaments,
        
    })
}

async function tournamentAdd (req, res) {
    res.render('admin_tournament_add.ejs')
}

async function tournamentEdit (req, res) {
    const tournamentId = req.params.id
    
    let [tournaments, fields] = await db.query(`
        SELECT * 
        FROM tournament 
        WHERE id = ?
    `, [tournamentId])
    
    // Si on a pas de tournoi pour cet ID, on retourne la page 404
    if (tournaments.length == 0) {
        res.redirect('/admin')
        return
    }
    
    res.render('admin_tournament_edit.ejs', {
        tournament: tournaments[0],
    })
}

module.exports.home = home
module.exports.tournamentAdd = tournamentAdd
module.exports.tournamentEdit = tournamentEdit