module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/admin');
    },
    forwardAuthenticated: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/admin/dashboard');
    },
    ensureRights: function (req, res, next) {
        if (req.user.role == 'administrator' || req.user.role == 'editor') {
            return next();
        }
        res.redirect('/admin/error');
    },
    ensureAdministrator: function (req, res, next) {
        if (req.user.role == 'administrator') {
            return next();
        }
        res.redirect('/admin/error');
    },
    ensureOwnProfile: function (req, res, next) {
        if (req.user.id == req.params.id) {
            return next();
        }
        res.redirect('/admin/error');
    },
};