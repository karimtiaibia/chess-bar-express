const express = require("express")
const homeController = require('../controllers/home.js')
const barController = require('../controllers/bar.js')
const tournamentController = require('../controllers/tournament.js')
const userController = require('../controllers/user.js')
const adminController = require('../controllers/admin.js')
const router = express.Router()
const accountController = require('../controllers/account.js')

// Middleware pour bloquer l'accès aux pages connectées 
function isAuthenticated(req, res, next) {
    if (req.session && req.session.connected) {
        return next(); // L'utilisateur est authentifié, on peut afficher la page
    } else {
        return res.status(401).send('401 Unauthorized'); // L'utilisateur n'est pas authentifié, on retourne une erreur 401
    }
}

// Middleware pour bloquer l'accès aux pages admin 
function isAdmin(req, res, next) {
    if (req.session && req.session.connected && req.session.user && req.session.user.admin) {
        return next(); // L'utilisateur est authentifié ET admin, on peut afficher la page
    } else {
        return res.status(401).send('401 Unauthorized'); // L'utilisateur n'est pas authentifié, on retourne une erreur 401
    }
}
//router.get('/', homeController.home)
router.get('/', homeController.barsList)

router.get('/bars', barController.barsList)
router.get('/bars/:id', barController.barDetails)

router.get('/tournaments', tournamentController.tournamentsList)
router.get('/tournaments/:id', tournamentController.tournamentDetails)

router.get('/rules', barController.rules)

router.get('/account', isAuthenticated, accountController.renderAccount)

router.get('/account', isAuthenticated, accountController.renderAccount)
router.get('/account/update', isAuthenticated, accountController.userAccount)
router.post('/account/update', isAuthenticated, accountController.renderAccount)

router.get('/login', userController.login)
router.post('/login', userController.userLogin)
router.get('/logout', userController.logout)

router.get('/register', userController.renderRegister)
router.post('/register', userController.userRegister)

// Toutes les routes de l'admin
router.get('/admin', isAdmin, adminController.home)
router.get('/admin/tournament/add', isAdmin, adminController.tournamentAdd)
router.get('/admin/tournament/:id/edit', isAdmin, adminController.tournamentEdit)
// router.post('/admin/tournament/:id/edit', isAdmin, adminController.tournamentEditSubmit)


module.exports.router = router