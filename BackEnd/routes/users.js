const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const {
  loginValidations,
  registerValidations,
  changePasswordValidation,
} = require("../config/validation");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

//Login
router.get("/login", (req, res) =>
  res.render("login", { message: req.flash("loginMessage") })
);
//Register
router.get("/register", (req, res) =>
  res.render("register", { message: req.flash("signupMessage") })
);
// router.get("/passwordchange", ensureAuthenticated, (req, res) =>
//   res.render("passwordChange", { message: req.flash("forgotpassMessage") })
// );
router.get("/passwordChange", ensureAuthenticated, (req, res) =>
  res.render("passwordChange", {
    user: req.user,
    message: req.flash("forgotpassMessage"),
  })
);

//2 factor authenticator

router.get("/setup-2fa", (req, res) => res.render("setup-2fa"));

//Register with passport
router.post("/register", function (req, res, next) {
  passport.authenticate("register", function (err, user, info) {
    if (err) {
      req.flash("signupMessage", err);
    }
    const { error } = registerValidations(req.body);
    if (error) {
      req.flash("signupMessage", error.details[0].message);
      // return res.redirect("/users/register");
      return res.status(400).json(error.details[0].message);
    }
    if (info) {
      // res.status(401);
      req.flash("signupMessage", info.message);
      // return res.redirect("/users/register");
      return res.status(401).json(info.message);
    }
    if (user) {
      req.flash("loginMessage", "User created succesfully you can now login"),
        console.log(user);
      // return res.redirect("/users/login");
    }
  })(req, res, next);
});

//Login with Passport

router.post("/login", function (req, res, next) {
  passport.authenticate("login", function (err, user, info) {
    console.log(req.body);
    if (err) {
      return res.json(err);
    }
    const { error } = loginValidations(req.body);
    if (error) {
      req.flash("loginMessage", error.details[0].message);
      // return res.json(error.details[0].message);
      return res.redirect("/users/login");
    }
    if (info) {
      // res.status(401);
      req.flash("loginMessage", info.message);
      // return res.json(info);
      return res.redirect("/users/login");
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      // return res.json(user);
      return res.redirect("../dashboard");
    });
  })(req, res, next);
});

//Delete user

router.get("/delete", ensureAuthenticated, (req, res) =>
  res.render("delete", {
    user: req.user,
  })
);

//Change password

router.put("/passwordChange", ensureAuthenticated, async (req, res) => {
  const id = req.user._id;
  try {
    const user = await User.findById({ _id: id });
    if (!user) {
      req.flash("forgotpassMessage", "user not authorized");
      return res.status(403).json({ msg: "user not authorized" });
    }
    const newDetails = {
      newPassword: req.body.newPassword,
      currentPassword: req.body.currentPassword,
    };
    const { error } = changePasswordValidation(newDetails);
    if (error) {
      req.flash("forgotpassMessage", error.details[0].message);
      return res.redirect("/users/passwordChange");
      // return res.json(error.details[0].message);
    }
    const validate = await user.matchPassword(newDetails.currentPassword);
    console.log(validate);
    if (!validate) {
      req.flash("forgotpassMessage", "password does not match record");
      return res.redirect("/users/passwordChange");
      // return res.json({ msg: "password does not match record" });
    }
    user.password = req.body.newPassword;
    const newUser = await user.save();
    req.flash("dashboardMessage", "password changed successfully");
    return res.redirect("../dashboard");
    // return res.json(newUser);
  } catch (error) {
    res.status(500).json({ msg: "server error" });
    console.log(error);
  }
});

//Change password page
router.get("/passwordChange", ensureAuthenticated, (req, res) =>
  res.render("passwordChange", {
    user: req.user,
  })
);

//Change password with passport

//Logout

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});
module.exports = router;
