const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if using HTTPS
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const pagesRoutes = require('./routes/pages');
const adminRoutes = require('./routes/admin');
const apiMembers = require('./routes/api/members');
const apiMember = require('./routes/api/member');
const apiProjects = require('./routes/api/projects');

app.use('/', pagesRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiMembers);
app.use('/api', apiMember);
app.use('/api', apiProjects);

// 404 handler
app.use((req, res) => {
    res.status(404).render('404'); // optional: create a 404.ejs view
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});