const express = require("express");
const router = express.Router();
const { getMainChores, createChore, getAllChores, getSingleChore, deleteChore, updateChore } = require("../controllers/choreController");
const { protect } = require("../middleware/authMiddleware");

router.get("/main", protect, getMainChores);
router.get("/", protect, getAllChores);
router.get("/:id", protect, getSingleChore);
router.post("/create", protect, createChore);
router.delete("/:id", protect, deleteChore);
router.put("/:id", protect, updateChore);

module.exports = router;