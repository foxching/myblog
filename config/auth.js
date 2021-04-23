module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "Please log in to view that resource");
    res.redirect("/admin");
  },
  forwardAuthenticated: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/admin/dashboard");
  },
  ensureRights: (req, res, next) => {
    if (req.user.role == "administrator" || req.user.role == "editor") {
      return next();
    }
    res.redirect("/admin/error");
  },
  ensureAdministrator: (req, res, next) => {
    if (req.user.role == "administrator") {
      return next();
    }
    res.redirect("/admin/error");
  },
  ensureOwnProfile: (req, res, next) => {
    if (req.user.id == req.params.id) {
      return next();
    }
    res.redirect("/admin/error");
  }
};
