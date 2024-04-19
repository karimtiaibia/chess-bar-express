const db = require('../models/database.js')

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

    const tournamentId = req.params.id
    const tournaments = await db.query(`
        SELECT *, bar.name, tournament.id FROM tournament
        JOIN bar ON bar.id = tournament.id_bar
        WHERE id_bar = ?
        LIMIT 2
    `, [tournamentId])

    const userId = req.params.id
    const [users] = await db.query(`
        SELECT * FROM user
        WHERE user.id = ?
    `, [userId])

    const rankings = await db.query(`
        SELECT user.pseudo AS pseudo, SUM(ranking.score) AS score, id_bar, id_user FROM ranking
        JOIN user ON user.id = ranking.id_user
        JOIN bar ON bar.id = ranking.id_bar
        WHERE bar.id = ?
        GROUP BY pseudo
        ORDER BY score DESC
        LIMIT 14
    `, [barId])

    res.render("bar.ejs", {
        bar:bars[0], 
        tournament:tournaments[0], 
        ranking:rankings[0],
        user:users[0]
    })
}

async function updateSlot (req, res) {
    const barId = req.originalUrl.split("/")[2]
    console.log(barId)
    const [tournaments] = await db.query(`
        SELECT *, bar.name, tournament.id FROM tournament
        JOIN bar ON bar.id = tournament.id_bar
        WHERE id_bar = ?
        LIMIT 2
    `, [barId])
    
    try {
        const tournamentId = req.originalUrl.split("/")[3]
        const userId = req.originalUrl.split("/")[4]
        console.log(tournamentId)
        console.log(userId)
        await db.query(`
            UPDATE tournament
            SET nb_places_disponibles = nb_places_disponibles - 1
            WHERE tournament.id = ?
        `, [tournamentId])
        await db.query(`
            INSERT INTO tournament(registered_players)
            (
                SELECT user.pseudo FROM user
                JOIN tournament ON tournament.id_user = user.id
                WHERE user.id = ?
            )
        `, [userId])

        const [city] = await db.query(`
            SELECT DISTINCT city FROM bar
            ORDER BY city
        `);

        const [bars] = await db.query(`
            SELECT * FROM bar
            WHERE id = ?
    `, [barId])

        const rankings = await db.query(`
            SELECT user.pseudo AS pseudo, SUM(ranking.score) AS score, id_bar, id_user FROM ranking
            JOIN user ON user.id = ranking.id_user
            JOIN bar ON bar.id = ranking.id_bar
            WHERE bar.id = ?
            GROUP BY pseudo
            ORDER BY score DESC
            LIMIT 14
    `, [barId])

        res.render("bar.ejs", {
            city: city,
            tournament: tournaments,
            bar: bars,
            ranking: rankings[0]
        })
        console.log(barId)
    } catch (err) {
        req.session.message = 'Une erreur est survenue lors de la mise à jour.'
        console.error(err)
    }
}

module.exports.rules = rules
module.exports.barsList = barsList
module.exports.barDetails = barDetails
module.exports.updateSlot = updateSlot