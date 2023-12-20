const db = require('../models/database.js')

async function tournamentsList (req, res) {
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
        ORDER BY bar.id, tournament.date
    `)
    if (tournaments.length === 0) {
        return res.status(404).json({
            'error': 'No entity for this id'
        })
    }
    res.render("tournaments.ejs", {
        bar:bars[0],
        tournament:tournaments[0]
    })
}

async function tournamentDetails (req, res) {
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
        SELECT * FROM tournament
        WHERE id = ?
        LIMIT 2
`, [tournamentId])
    /*
    const tournaments = await db.query(`
        SELECT *, bar.name FROM tournament
        JOIN bar ON bar.id = tournament.id_bar
        WHERE id_bar = ?
        LIMIT 2
    `, [tournamentId])
    */
    console.log(tournaments)
    if (tournaments.length == 0) {
        return res.status(404).json({
            'error': 'No entity for this id'
        })
    }
    const rankings = await db.query(`
        SELECT ranking.score, user.pseudo FROM ranking
        JOIN user ON user.id = ranking.id_user
        JOIN tournament ON tournament.id = ranking.id_tournament
        JOIN bar ON bar.id = tournament.id_bar
        WHERE bar.id = ?
        ORDER BY ranking.score DESC
        LIMIT 14
    `, [barId])
    if (rankings.length === 0) {
        return res.status(404).json({
            'error': 'No entity for this id'
        })
    }
    res.render("tournaments.ejs", {
        bar:bars[0], 
        tournament:tournaments[0], 
        ranking:rankings[0]
    })
}

async function updateSlot (req, res) {
    const tournamentId = req.params.id
    const updatedTournaments = await db.query(`
        UPDATE tournament
        SET nb_places_disponibles = nb_places_disponibles - 1
        WHERE tournament.id = ?
    `, [tournamentId])
    res.redirect('/tournaments')
}

module.exports.tournamentsList = tournamentsList
module.exports.tournamentDetails = tournamentDetails
module.exports.updateSlot = updateSlot