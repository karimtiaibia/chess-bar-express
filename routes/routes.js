const express = require("express")
const router = express.Router()

const homeController = require('../controllers/home.js')
const barController = require('../controllers/bar.js')
const tournamentController = require('../controllers/tournament.js')
const userController = require('../controllers/user.js')
const adminController = require('../controllers/admin.js')
const accountController = require('../controllers/account.js')
// Middleware pour bloquer l'accès aux pages connectées 
function isAuthenticated(req, res, next) {
    if (req.session && req.session.connected) {
        return next(); // L'utilisateur est authentifié, on peut afficher la page
    } else {
        return res.status(401).send('401 Unauthorized. Vous devez être connecté pour pouvoir accéder à cette page.'); // L'utilisateur n'est pas authentifié, on retourne une erreur 401
    }
    res.redirect('/')
}

// Middleware pour bloquer l'accès aux pages admin 
function isAdmin(req, res, next) {
    if (req.session && req.session.connected && req.session.user && req.session.user.admin) {
        return next(); // L'utilisateur est authentifié ET admin, on peut afficher la page
    } else {
        return res.status(401).send('401 Unauthorized. Vous devez disposer des droits administrateurs pour accéder à cette page.'); // L'utilisateur n'est pas authentifié, on retourne une erreur 401
    }
}

// HOMEPAGE CONTROLLER
router.get('/', homeController.barsList)
// BARS CONTROLLER
router.get('/bars', barController.barsList)
router.get('/bars/:id', barController.barDetails)
// TOURNAMENTS CONTROLLER
router.get('/tournaments', tournamentController.tournamentsList)
router.get('/tournaments/:id', tournamentController.tournamentDetails)
router.post('/tournaments', tournamentController.updateSlot)
// RULES CONTROLLER
router.get('/rules', barController.rules)
// ACCOUNT CONTROLLER
router.get('/account', isAuthenticated, accountController.userAccount)
// router.get('/account/update', isAuthenticated, accountController.userAccount)
router.post('/account/update', isAuthenticated, accountController.renderAccount)
// LOGIN/OUT CONTROLLER
router.get('/login', userController.login)
router.post('/login', userController.userLogin)
router.get('/logout', userController.logout)
// REGISTER CONTROLLER
router.get('/register', userController.renderRegister)
router.post('/register', userController.userRegister)

// ADMIN //
router.get('/admin', isAdmin, adminController.home)
// Ajouts de tournois 
router.get('/admin/tournament/add', isAdmin, adminController.tournamentAdd)
router.post('/admin/tournament/add', isAdmin, adminController.tournamentAddSubmit)
// Edition de tournois
router.get('/admin/tournament/:id/edit', isAdmin, adminController.tournamentEdit)
router.post('/admin/tournament/:id/edit', isAdmin, adminController.tournamentEditSubmit)
// Suppression de tournois
router.get('/admin/tournament/:id/delete', isAdmin, adminController.tournamentDelete)

// Ajouts de bars
router.get('/admin/bar/add', isAdmin, adminController.barAdd)
router.post('/admin/bar/add', isAdmin, adminController.barAddSubmit)
// Edition de bars 
router.get('/admin/bar/:id/edit', isAdmin, adminController.barEdit)
router.post('/admin/bar/:id/edit', isAdmin, adminController.barEditSubmit)
// Suppression de bars
router.get('/admin/bar/:id/delete', isAdmin, adminController.barDelete)

// Ajout de scores
router.get('/admin/ranking/add', isAdmin, adminController.rankingAdd)
router.post('/admin/ranking/add', isAdmin, adminController.rankingAddSubmit)

module.exports.router = router