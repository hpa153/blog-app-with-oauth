const express = require("express");
const router = express.Router();

const { ensureAuth } = require("../middleware/auth");
const Story = require("../models/Story");

// GET /stories/add
router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add.hbs");
});

// GET /stories/edit/:id
router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id }).lean();

    if (!story) {
      return res.render("error/404.hbs");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      res.render("stories/edit.hbs", { story });
    }
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

// PUT /stories/:id
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.render("error/404.hbs");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect("/dashboard");
    }
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

// DELETE /stories/edit/:id
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    await Story.remove({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

// GET /stories/:id
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate("user")
      .lean();

    res.render("stories/show.hbs", { story })
  } catch (error) {
    console.log(error);
    res.render("error/404.hbs");
  }
});

// GET /stories/user/:userId
router.get("/user/:userId", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.params.userId, status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();

    res.render("stories/index.hbs", { stories })
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

// GET /stories
router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();

    res.render("stories/index.hbs", { stories })
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

// POST /stories
router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;

    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

module.exports = router;
