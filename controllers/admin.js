const db = require('../models/database.js')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')

async function home (req, res) {
    let [tournaments] = await db.query(`
        SELECT * FROM tournament
        JOIN bar ON tournament.id_bar = bar.id 
        ORDER BY date DESC 
    `)
    let [bars] = await db.query(`
        SELECT * FROM bar
    `)
    res.render('admin_home.ejs', {
        tournaments: tournaments,
        bars: bars,
    })
}

async function tournamentEdit (req, res) {
    const tournamentId = req.params.id
    
    let [tournaments] = await db.query(`
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

async function barEdit (req, res) {
    const barId = req.params.id
    let [bars] = await db.query(`
        SELECT * 
        FROM bar 
        WHERE id = ?
    `, [barId])
    // Si on a pas de post pour cet ID, on retourne la page 404
    if (bars.length == 0) {
        res.redirect('/admin')
        return
    }
    res.render('admin_bar_edit.ejs', {
        bar: bars[0],
    })
}

async function barAddSubmit (req, res) {
    // On parse les données du formulaire
    const form = formidable.formidable({
        allowEmptyFiles: true,
        minFileSize: 0,
    });
    let fields, files
    try {
        [fields, files] = await form.parse(req)
    } catch (err) {
        res.redirect('/admin')
        return
    }
    const barName = fields.barName
    const adress = fields.adress
    const zipcode = fields.zipcode
    const city = fields.city
    const phoneNumber = fields.phoneNumber
    
    // Redirect on add post page if content or title is empty
    if (!barName || !adress || !zipcode || !city || !phoneNumber) {
        res.redirect(`/admin`)
        return
    }
    // Traitement de l'upload d'image
    const imageFile = files.image[0] ?? false
    let imageUrl = null
    // Si on a une image qui a été upload
    if (imageFile && imageFile.size > 0) {
        imageUrl = imageFile.newFilename + path.extname(imageFile.originalFilename)
        let newPath = 'public/img/' + imageUrl
        
        fs.copyFileSync(imageFile.filepath, newPath)
    }
    let sql = `
        INSERT INTO bar (name, adress, zipcode, city, phone_number, logo, register_date)
        VALUES (?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(NOW()))
    `
    await db.query(sql, [
        barName,
        adress,
        zipcode,
        city,
        phone_number,
        logo,
    ])
    res.redirect(`/admin`)
}

async function barDelete (req, res) {
    const barId = req.params.id
    let [fields] = await db.query(`
        DELETE 
        FROM bar
        WHERE id = ?
    `, [barId])
    res.redirect('/admin')
}

async function barAdd (req, res) {
    res.render('admin_bar_add.ejs')
}

async function tournamentAdd (req, res) {
    res.render('admin_tournament_add.ejs')
}

module.exports.home = home
module.exports.tournamentAdd = tournamentAdd
module.exports.tournamentEdit = tournamentEdit

module.exports.barEdit = barEdit
// module.exports.barEditSubmit = barEditSubmit
module.exports.barAdd = barAdd
module.exports.barAddSubmit = barAddSubmit
module.exports.barDelete = barDelete