const db = require('../models/database.js')
const bcrypt = require('bcrypt')

async function userRegister (req, res) {
    const email = req.body.email
    const password = req.body.password
    const pseudo = req.body.pseudo
    // Hash password 
    const saltRounds = 10
    try {
        const passwordHash = await bcrypt.hash(password, saltRounds)
        await db.query(`
            INSERT INTO user (email, password, pseudo)
            VALUES (?, ?, ?)
        `, [email, passwordHash, pseudo])
    } catch (err) {
        return res.json({success: false, message: err.toString()})
    }
    res.json({success: true, message: err.toString()})
    return res.redirect("/login")

}

async function userLogin (req, res) {
    const pseudo = req.body.pseudo
    const password = req.body.password
    const [users] = await db.query(`
        SELECT * 
        FROM user
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
    res.render("register.ejs")
}
async function login (req, res) {
    res.render('login.ejs', {
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