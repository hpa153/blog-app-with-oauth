const express = require("express");
const router = express.Router();

const { ensureAuth, ensureGuest } = require("../middleware/auth");
const Story = require("../models/Story");

// GET /
router.get("/", ensureGuest, (req, res) => {
  res.render("login.hbs", {
    layout: "login"
  });
});

// GET /dashboard
router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id}).lean();

    res.render("dashboard.hbs", {
      name: req.user.firstName,
      stories
    });
  } catch (error) {
    console.error(error);
    res.render("errors/500.hbs");
  }
});

module.exports = router;
