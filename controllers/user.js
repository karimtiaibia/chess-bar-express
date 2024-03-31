const db = require('../models/database.js')
const bcrypt = require('bcrypt')

async function userRegister (req, res) {
    const email = req.body.email
    const password = req.body.password
    const pseudo = req.body.pseudo
    // Hash password 
    const saltRounds = 10
    // Pseudo : Lettres, chiffres et underscores autorisés. Longueur entre 3 et 16.
    let pseudoRegex = /^[a-zA-Z0-9_]{3,16}$/;
    // Email : Format standard d'email.
    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Mot de passe : Au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial. Longueur entre 8 et 32.
    let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;
    try {
        if (!pseudoRegex.test(pseudo)) {
            return res.send('Pseudo invalide. Il doit contenir entre 3 et 16 caractères alphanumériques ou des underscores.');
        } else if (!emailRegex.test(email)) {
            return res.send('Email invalide. Veuillez entrer un email valide.');
        } else if (!passwordRegex.test(password)) {
            return res.send('Mot de passe invalide. Il doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre, un caractère spécial et avoir une longueur entre 8 et 32.');
        } else {
            const passwordHash = await bcrypt.hash(password, saltRounds)
            await db.query(`
                INSERT INTO user (email, password, pseudo)
                VALUES (?, ?, ?)
            `, [email, passwordHash, pseudo])
        }
    } catch (err) {
        return res.json({success: false, message: err.toString()})
    }
    return res.redirect("/login")
}


async function userLogin (req, res) {
    const pseudo = req.body.pseudo
    const password = req.body.password
    const [users] = await db.query(`
        SELECT * FROM user
        WHERE pseudo = ?
    `, [pseudo])
    if (users.length === 0) {
        req.session.error = "Identifiants invalides !"
        return res.redirect('/login')
    }
    for (let user of users) {
        const match = await bcrypt.compare(password, user.password)
        if (match) {
            req.session.connected = true
            req.session.user = user
            if (user.admin) {
                return res.redirect('/admin')
            }
            return res.redirect('/')
        }
    }
    req.session.error = "Identifiants invalides !"
    return res.redirect('/login')
}

async function renderRegister (req, res) {
    return res.render("register.ejs")
}
async function login (req, res) {
    return res.render('login.ejs', {
    })
}
async function logout (req, res) {
    req.session.destroy((err) => {
        return res.redirect('/')
    })
}

module.exports.userRegister = userRegister
module.exports.userLogin = userLogin
module.exports.renderRegister = renderRegister
module.exports.login = login
module.exports.logout = logout