// Middleware to check if user is logged in as admin
function auth(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    }
    res.redirect('/admin/login');
}

module.exports = auth;