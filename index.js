const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sqlite = require('sqlite');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const cookieParser = require('cookie-parser')

app.set('view engine', 'twig');
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.disable('view cache');
const saltRounds = 10;
const dbPromise = sqlite.open('data0.db');


dbPromise.then(async (db) => {
    await db.run('CREATE TABLE IF NOT EXISTS messages ( id INTEGER PRIMARY KEY, author STRING, message STRING );');
    await db.run('CREATE TABLE IF NOT EXISTS users ( id INTEGER PRIMARY KEY, email STRING, passwordHash STRING );');
    await db.run('CREATE TABLE IF NOT EXISTS sessions ( id INTEGER PRIMARY KEY, userid INTEGER, sessionToken STRING );');
    await db.run('CREATE TABLE IF NOT EXISTS text (id INTEGER PRIMARY KEY, eventName STRING, eventDescription STRING,  eventCost STRING, eventLocation STRING);');
});

const authorize = async (req, res, next) => {
    // const { sessionToken } = req.cookies;
    const db = await dbPromise;
    const sessionToken = req.cookies.sessionToken;
    if(!sessionToken) {
        next();
        return;
    };
    const allsessions = await db.all('SELECT * FROM sessions');
    const user = await db.get('SELECT users.email, users.id as id FROM sessions LEFT JOIN users ON sessions.userid = users.id WHERE sessionToken=?', sessionToken);
    if(!user) {
        next();
        return;
    };
    console.log('logged in', user.email);
    req.user = user;
    next();
    return;
};

const requireAuth = (req, res, next) => {
    if (!req.user) {
        res.status(401).send('please log in');
        return;
    }
    next();
};

app.use(authorize);




app.get('/', async (req, res) => {
    const db = await dbPromise;
    const messages = await db.all('SELECT * FROM messages;');
    const user = req.user; 
    res.render('first', { messages, user });

});

app.get('/login', async (req, res) => {
    if (req.user) {
        res.redirect('/');
        return;
    }
    res.render('login');
});

app.get('/register', async (req, res) => {
    if (req.user) {
        res.redirect('/');
        return;
    }
    res.render('register');
});

app.get('/first', async (req, res) => {
    if (req.user) {
        res.redirect('/');
        return;
    }
    res.render('first');
});

app.get('/index', async (req, res) => {
    res.render('index');
});

app.get('/feed', async (req, res) => {
    const db = await dbPromise;
    if(!req.user) {
        res.redirect('/');
        return;
    }
    const text = await db.all('SELECT * FROM text');
    res.render('feed', { text });
});

app.get('/profile', async (req, res) => {
    res.render('profile');
});

app.get('/projectplan', async (req, res) => {
    res.render('projectplan');
});

app.get('/welcome', async (req, res) => {
    if (req.user) {
        res.redirect('/');
        return;
    }
    res.render('welcome');
});

app.get('/form', async (req, res) => {
    if (!req.user) {
        res.redirect('/');
        return;
    }
    res.render('form');
});

app.get('/page3', async (req, res) => {
    if (!req.user) {
        res.redirect('/');
        return;
    }
    res.render('page3');
});

app.post('/message', requireAuth, async (req, res) => {
    const db = await dbPromise;
    await db.run('INSERT INTO messages (author, message) VALUES (?, ?)', req.user.email.split('@')[0], req.body.message);
    res.redirect('/');
});

app.post('/register', async (req, res) => {
    const db = await dbPromise;
    console.log(req.body);
    const user = await db.get('SELECT * FROM users WHERE email=?', req.body.email);
    if (user) {
        res.status(400).render('register', { registerError: 'account already exists' });
        return;
    }
    const passwordHash = await bcrypt.hash(req.body.password, saltRounds);
    await db.run(
        'INSERT INTO users (email, passwordHash)  VALUES (?, ?);',
        req.body.email,
        passwordHash
    );
    const newUser = await db.get('SELECT id, email FROM users WHERE email=?', req.body.email);
    const sessionToken = uuidv4();
    console.log('newUser', newUser);
    await db.run(
        'INSERT INTO sessions (userid, sessionToken) VALUES (?, ?);',
        newUser.id,
        sessionToken
    );
    res.cookie('sessionToken', sessionToken);
    res.redirect('/');
});

app.post('/login', async(req, res) => {
    const db = await dbPromise;
    const user = await db.get('SELECT * FROM users WHERE email=?', req.body.email);
    if (!user) {
        res.status(401).render('login', { loginError: 'email or password is incorrect' });
        return;
    }
    const passwordMatches = await bcrypt.compare(req.body.password, user.passwordHash);
    if (passwordMatches) {
        const sessionToken = uuidv4();
        try {
            await db.run('INSERT INTO sessions (userid, sessionToken) VALUES (?, ?);', user.id, sessionToken);
            res.cookie('sessionToken', sessionToken);
            res.redirect('/');
        } catch (e) {
            res.send(e);
            return;
        }

    } else {
        res.status(401).render('login', { loginError: 'email or password is incorrect' });
    }
});

app.post('/text', async (req, res) => {
    console.log(req.body);
    const db = await dbPromise;
    try {
        await db.run('INSERT INTO text(eventName, eventDescription, eventCost, eventLocation) VALUES(?,?,?,?)', req.body.eventName,req.body.eventDescription,req.body.eventCost,req.body.eventLocation);
        const events = await db.all('SELECT * FROM text');
        console.log(events);
        res.redirect('/feed');
    } catch (e) {
        res.send(e);
    }
})

app.get('/logout', async (req, res) => {
    const db = await dbPromise;
    res.cookie('sessionToken', '', { maxAge: 0 });
    await db.run('DELETE FROM sessions WHERE sessionToken=?', req.cookies.sessionToken);
    res.redirect('/');
})

app.get('/databasedump', async (req, res) => {
    const db = await dbPromise;
    const tables = await db.all('SELECT name FROM sqlite_master WHERE type="table"');
    const users = await db.all('SELECT * FROM users');
    const messages = await db.all('SELECT * FROM messages');
    const sessions = await db.all('SELECT * FROM sessions');
    const text = await db.all('SELECT * FROM text');
    res.json({
        tables,
        users,
        messages,
        sessions,
        text
    })
})

app.use((req, res) => {
    res.status(404).send('file not found');
})

app.listen(3000);
console.log('listening on port 3000');

