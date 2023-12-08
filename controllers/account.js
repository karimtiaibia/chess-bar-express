const db = require('../models/database.js')

async function userAccount (req, res) {
    const userId = req.params.id
    const [users] = await db.query(`
        SELECT * 
        FROM user
        WHERE pseudo = ?
    `, [userId])
    
    req.session.error = "Identifiants invalides !"
    if (req.session.error) { 
        res.redirect('/login')
    }
    res.render("account.ejs", {
        user:users[0],
    })
}

async function renderAccount(req, res) {   
    const userAccount = req.session.user   
    const userId = req.session.user.id
    const zipcode = req.body.zipcode
    const city = req.body.city
    const [data] = await db.query(`
        UPDATE user
        SET zipcode = ?, city = ?
        WHERE id = ?
    `, [zipcode, city, userId])
    
    res.render("account.ejs", { 
        userAccount,
        data,
    }); 
}

module.exports.userAccount = userAccount
module.exports.renderAccount = renderAccount