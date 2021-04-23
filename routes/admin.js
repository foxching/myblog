const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const ObjectId = require("mongodb").ObjectID;
const Setting = require("../models/setting");
const { check, validationResult } = require("express-validator");

const User = require("../models/user");

const {
  ensureAuthenticated,
  forwardAuthenticated,
  ensureAdministrator,
  ensureRights,
  ensureOwnProfile
} = require("../config/auth");

/*
 * GET admin login form
 */
router.get("/", forwardAuthenticated, (req, res) => {
  res.render("admin/login", { headerTitle: "Login" });
});

/*
 * POST admin login form
 */
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/admin/dashboard",
    failureRedirect: "/admin",
    failureFlash: true
  })(req, res, next);
});

/*
 * GET admin register form
 */
router.get("/register", forwardAuthenticated, (req, res) => {
  res.render("admin/register", { headerTitle: "Register", user: new User() });
});

/*
 * POST admin register form
 */
router.post(
  "/register",
  [
    check("email", "Email required")
      .not()
      .isEmpty()
      .isEmail()
      .withMessage("Email is invalid"),
    check("username", "Username required")
      .not()
      .isEmpty()
      .isLength({ min: 5 })
      .withMessage("Username must be at least 5 chars long"),
    check("password", "Password is required")
      .not()
      .isEmpty()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 chars long"),
    check("password2").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      // Indicates the success of this synchronous custom validator
      return true;
    })
  ],
  async (req, res) => {
    let newUser = new User(req.body);

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("admin/register", {
        headerTitle: "Register",
        errors: errors.array(),
        user: newUser
      });
    }

    try {
      const setting = await Setting.findOne({});
      const userFound = await User.findOne({ email: newUser.email });
      if (userFound) {
        req.flash("error_msg", "Email is taken");
        res.render("admin/register", {
          headerTitle: "Register",
          error: req.flash("error_msg"),
          user: newUser
        });
      } else {
        newUser.role = "admin";
        await newUser.save();
        req.flash("success_msg", "You are now registered and can log in");
        res.redirect("/admin");
      }
    } catch (error) {
      console.log(error);
    }
  }
);

/*
 * GET forgot password
 */

router.get("/forgot-password", (req, res) => {
  res.render("admin/password", { headerTitle: "Forgot Password" });
});

/*
 * GET edit profile
 */
router.get(
  "/profile/edit/:id",
  ensureAuthenticated,
  ensureOwnProfile,
  async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id });
      res.render("admin/profile", { headerTitle: "Profile", user: user });
    } catch (error) {
      console.log(error);
    }
  }
);

/*
 * POST edit profile
 */

router.post("/profile/edit/", ensureAuthenticated, async (req, res) => {
  let email = req.body.email;
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let bio = req.body.bio;
  let userId = req.body._id;

  try {
    const user = await User.findOne({ email: email, _id: { $ne: userId } });
    if (user) {
      res.send({ status: "error", msg: "Email Add already exists" });
    } else {
      await User.updateOne(
        { _id: ObjectId(userId) },
        {
          $set: {
            email: email,
            firstname: firstname,
            lastname: lastname,
            bio: bio
          }
        }
      );
      res.send({ status: "success", msg: "Your profile updated successfully" });
    }
  } catch (error) {
    console.log(error);
  }
});

/*
 * POST update password
 */
router.post("/profile/update-pass", async (req, res) => {
  let oldPass = req.body.oldPassword;
  let newPass = req.body.newPassword;
  let confirmPass = req.body.confirmPassword;
  let userId = req.body._id;

  if (newPass != confirmPass) {
    return res.send({ status: "error", msg: "Passwords dont match" });
  }

  if (newPass.length < 6) {
    return res.send({
      status: "error",
      msg: "Password must be at least six characters"
    });
  }

  try {
    const user = await User.findOne({ _id: ObjectId(userId) });
    if (!user) {
      res.send({ status: "error", msg: "User not found" });
    }
    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) {
      res.send({ status: "error", msg: "Old Password is incorrect" });
    } else {
      user.password = newPass;
      await user.save();
      res.send({ status: "success", msg: "Password updated successfully" });
    }
  } catch (error) {
    console.log(error);
  }
});

/*
 * GET admin dashboard
 */
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("admin/dashboard", { headerTitle: "Dashboard" });
});

/*
 * GET admin error routes
 */
router.get("/error", ensureAuthenticated, (req, res) => {
  res.render("error/401");
});

/*
 * GET admin redirect logout
 */
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/admin");
});

/*
 * GET user redirect logout
 */
router.get("/user-logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
