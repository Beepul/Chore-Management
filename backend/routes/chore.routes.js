const express = require("express");
const router = express.Router();
const { getMainChores, createChore } = require("../controllers/choreController");
const { protect } = require("../middleware/authMiddleware");

router.get("/main", protect, getMainChores);
router.post("/create", protect, createChore);

module.exports = router;