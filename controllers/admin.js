const db = require('../models/database.js')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')

async function home (req, res) {
    let [tournaments] = await db.query(`
        SELECT * FROM bar
        JOIN tournament ON bar.id = tournament.id_bar
    `)
    let [bars] = await db.query(`
        SELECT * FROM bar
    `)
    res.render('admin_home.ejs', {
        tournaments: tournaments,
        bars: bars,
    })
}

// BARS
async function barAdd (req, res) {
    res.render('admin_bar_add.ejs')
}

async function barAddSubmit(req, res) {
    const form = new formidable.IncomingForm({
        allowEmptyFiles: true,
        minFileSize: 0,
    })

    const parseForm = (req) => {
        return new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err)
                else resolve({ fields, files })
            })
        })
    }
    
    try {
        ({ fields, files } = await parseForm(req))
    } catch (err) {
        console.error(err);
        res.redirect('/admin')
        return
    }

    const barName = fields.barName
    const address = fields.address
    const zipcode = fields.zipcode
    const city = fields.city
    const phoneNumber = fields.phoneNumber
    const website = fields.website
    const instagram = fields.instagram
    const facebook = fields.facebook
    
    const imageFile = files.image ? files.image[0] : null
    let imageUrl = null

    if (imageFile && imageFile.size > 0) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        imageUrl = uniqueSuffix + path.extname(imageFile.originalFilename)
        const newPath = path.join('public', 'img', imageUrl)

        try {
            fs.copyFileSync(imageFile.filepath, newPath)
            // Supprimez le fichier temporaire
            fs.unlinkSync(imageFile.filepath)
        } catch (error) {
            console.error(error)
            res.status(500).send('Une erreur est survenue lors du traitement de l\'image.')
            return
        }
    }

    const sql = `
        INSERT INTO bar (name, address, zipcode, city, phone_number, website, sm_inst, sm_fb, logo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    try {
        await db.query(sql, [
            barName,
            address,
            zipcode,
            city,
            phoneNumber,
            website,
            instagram,
            facebook,
            imageUrl
        ]);
        res.redirect('/admin')
    } catch (error) {
        console.error(error)
        res.status(500).send('Une erreur est survenue lors de l\'ajout du bar.')
    }
}

async function barEdit (req, res) {
    const barId = req.params.id
    let [bars] = await db.query(`
        SELECT * FROM bar 
        WHERE id = ?
    `, [barId])
    
    res.render('admin_bar_edit.ejs', {
        bar: bars[0],
    })
}

async function barEditSubmit (req, res) {
    const barId = req.params.id
    const barName = req.body.barName   
    const barAdress = req.body.barAdress
    const zipcode = req.body.zipcode
    const city = req.body.city
    const phoneNumber = req.body.phoneNumber
    const website = req.body.website
    const instagram = req.body.instagram
    const facebook = req.body.facebook
    const logo = req.body.imageFile
    await db.query(`
        UPDATE bar 
        SET name = ?, address = ?, zipcode = ?, city = ?, phone_number = ?, website = ?, sm_inst = ?, sm_fb = ?, logo = ?
        WHERE id = ?
    `, [barName, barAdress, zipcode, city, phoneNumber, website, instagram, facebook, logo, barId])
    res.redirect('/admin')
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

async function tournamentAdd (req, res) {
    res.render('admin_tournament_add.ejs')
}

async function tournamentAddSubmit(req, res) {
    const barId = req.body.barSelected
    const tournamentDate = req.body.tournamentDate
    const tournamentStartTime = req.body.tournamentStartTime
    const tournamentEndTime = req.body.tournamentEndTime
    const tournamentDescription = req.body.tournamentDescription

    let sql = `
        INSERT INTO tournament (id_bar, date, hours_start, hours_end, description)
        VALUES (?, ?, ?, ?, ?)
    `
    try {
        let [tournamentRows] = await db.query(sql, [
            barId,
            tournamentDate,
            tournamentStartTime,
            tournamentEndTime,
            tournamentDescription,
        ]);
        console.log(tournamentRows)
        res.redirect('/admin#tournaments-list');

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while adding the tournament.');
    }
}

async function tournamentEdit (req, res) {
    const tournamentId = req.params.id
    let [tournaments] = await db.query(`
        SELECT * FROM bar 
        JOIN tournament ON bar.id = tournament.id_bar
        WHERE tournament.id = ?
    `, [tournamentId])
    
    res.render('admin_tournament_edit.ejs', {
        tournament: tournaments[0],
    })
}

async function tournamentEditSubmit (req, res) {
    const tournamentId = req.params.id
    const tournamentDate = req.body.tournamentDate
    const tournamentStartTime = req.body.tournamentStartTime
    const tournamentEndTime = req.body.tournamentEndTime
    const tournamentDescription = req.body.tournamentDescription
    try {
        await db.query(`
            UPDATE tournament 
            SET date = ?, hours_start = ?, hours_end = ?, description = ?
            WHERE id = ?
        `, [tournamentDate, tournamentStartTime, tournamentEndTime, tournamentDescription, tournamentId])
        req.session.message = 'Le tournoi a été mis à jour avec succès.'
        
        // Récupérer les données du tournoi après la mise à jour
        let [tournaments] = await db.query(`
            SELECT * FROM tournament 
            JOIN bar ON tournament.id_bar = bar.id
            WHERE tournament.id = ?
        `, [tournamentId])
        
        res.render('admin_tournament_edit.ejs', { 
            message: req.session.message,
            tournament: tournaments[0]
        });
    } catch (err) {
        req.session.message = 'Une erreur est survenue lors de la mise à jour du tournoi.'
        console.error(err)
        res.render('admin_tournament_edit.ejs', { 
            message: req.session.message
        });
    }
}

async function tournamentDelete (req, res) {
    const tournamentId = req.params.id
    await db.query(`
        DELETE 
        FROM tournament
        WHERE id_bar = ?
    `, [tournamentId])
    res.redirect('/admin')
}

async function rankingEdit (req, res) {
    const barId = req.params.id
    let [rankings] = await db.query(`
        SELECT user.pseudo AS pseudo, SUM(ranking.score) AS score, id_bar, id_user FROM ranking
        JOIN user ON user.id = ranking.id_user
        JOIN bar ON bar.id = ranking.id_bar
        WHERE bar.id = ?
        GROUP BY pseudo
        ORDER BY score DESC
    `, [barId])
    res.render('admin_ranking_edit.ejs', {
        ranking: rankings,
    })
    console.log(rankings)
}

async function rankingEditSubmit (req, res) {
    res.render('admin_ranking_edit.ejs')
}

module.exports.home = home
// BARS
module.exports.barAdd = barAdd
module.exports.barAddSubmit = barAddSubmit
module.exports.barEdit = barEdit
module.exports.barEditSubmit = barEditSubmit
module.exports.barDelete = barDelete
// TOURNAMENTS
module.exports.tournamentAdd = tournamentAdd
module.exports.tournamentAddSubmit = tournamentAddSubmit
module.exports.tournamentEdit = tournamentEdit
module.exports.tournamentEditSubmit = tournamentEditSubmit
module.exports.tournamentDelete = tournamentDelete
// RANKING
module.exports.rankingEdit = rankingEdit
module.exports.rankingEditSubmit = rankingEditSubmit