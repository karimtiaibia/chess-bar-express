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
    console.log(bars)
    res.render("home.ejs", {
        bar:bars[0],
    })
}

module.exports.barsList = barsList