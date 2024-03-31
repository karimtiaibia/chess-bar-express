const express = require('express')
const routes = require('./routes/routes.js')
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const db = require('./models/database.js')
const app = express()

// Ajout support session
app.use(session({
    store: new FileStore({}),
    secret: 'dfghjkzknzejomiefzfnjfifhueruheBZOebfOIEBFoieHNf', // Remplacez par une valeure aléatoire sécurisée
    resave: false,
    saveUninitialized: true,
}));

app.use(async(req, res, next) => {
    let [getBar] = await db.query(`
        SELECT * FROM bar
        ORDER BY city
    `)
    res.locals.barData = getBar
    next()
});

// Rend la session accessible aux templates
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
})

app.use(express.static('public'))
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use('/', routes.router)

app.listen(3000, () => {
    console.log('Start server on port 3000')
})