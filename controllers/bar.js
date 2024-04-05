const db = require('../models/database.js')

async function barsList (req, res) {
    const bars = await db.query(
        'SELECT * FROM bar'
    );
    // S'il n'existe pas d'occurence de bars
    if (bars.length === 0) {
        return res.status(404).json({
            'error': 'No entity for this id'
        })
    }
    const tournaments = await db.query(`
        SELECT * FROM tournament
        JOIN bar ON tournament.id_bar = bar.id
    `)
    if (tournaments.length === 0) {
        return res.status(404).json({
            'error': 'No entity for this id'
        })
    }
    // RENDU SUR HOME.EJS
    res.render("home.ejs", {
        bar:bars[0],
        tournament:tournaments[0]
    })
}

async function barDetails (req, res) {
    const barId = req.params.id
    const bars = await db.query(`
        SELECT * FROM bar
        WHERE id = ?
    `, [barId])

    if (bars.length == 0) {
        return res.status(404).json({
            'error': 'No entity for this id'
        })
    }
    const tournamentId = req.params.id
    const tournaments = await db.query(`
        SELECT *, bar.name FROM tournament
        JOIN bar ON bar.id = tournament.id_bar
        WHERE id_bar = ?
        LIMIT 2
    `, [tournamentId])

    if (tournaments.length == 0) {
        return res.status(404).json({
            'error': 'No entity for this id'
        })
    }
    const rankings = await db.query(`
        SELECT SUM(ranking.score) AS user_score
        FROM ranking
        JOIN user ON user.id = ranking.id_user
        WHERE id_bar = ?
        GROUP BY ranking.score
        ORDER BY ranking.score DESC
        LIMIT 14
    `, [barId])
    if (rankings.length === 0) {
        return res.status(404).json({
            'error': 'No entity for this id'
        })
    }
    res.render("bar.ejs", {
        bar:bars[0], 
        tournament:tournaments[0], 
        ranking:rankings[0]
    })
}

async function rules (req, res) {
    const bars = await db.query(
        'SELECT * FROM bar'
    );
    // S'il n'existe pas d'occurence de bars
    if (bars.length === 0) {
        return res.status(404).json({
            'error': 'No entity for this id'
        })
    }
    res.render("rules.ejs", {
        bar:bars[0]
    })
}

module.exports.barsList = barsList
module.exports.barDetails = barDetails
module.exports.rules = rules