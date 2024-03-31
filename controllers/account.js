const db = require('../models/database.js')

async function userAccount (req, res) {
    const userAccount = req.session.user
    res.render("account.ejs", {
        userAccount,
    })
}

async function renderAccount(req, res) {   
    const userAccount = req.session.user   
    const userId = req.session.user.id
    const email = req.body.email
    const city = req.body.city

    let cityRegex = /^[a-zA-Z\u0080-\u024F\s\/\-\)\(\`\.\"\']+$/;
    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    try {
        if (!cityRegex.test(city)) {
            return res.send('Nom de ville invalide.')
        } else if (!emailRegex.test(email)) {
            return res.send('Email invalide. Veuillez entrer un email valide.');
        } else {
            await db.query(`
                UPDATE user
                SET city = ?, email = ?
                WHERE id = ?
            `, [city, email, userId])
            req.session.user.city = city;
            req.session.user.email = email;
            req.session.message = 'Vos informations ont été mises à jour avec succès.';
        } 
    } catch (err) {
        return res.json({success: false, message: err.toString()})
    }
    res.render("account.ejs", { 
        userAccount,
        message: req.session.message
    })
}

module.exports.userAccount = userAccount
module.exports.renderAccount = renderAccount