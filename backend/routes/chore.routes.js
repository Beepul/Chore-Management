const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const controller = require('../controllers/choreController');

router.get("/main", protect, controller.getMainChores);
router.get("/", protect, controller.getAllChores);
router.get("/:id", protect, controller.getSingleChore);
router.post("/create", protect, controller.createChore);
router.delete("/:id", protect, controller.deleteChore);
router.put("/:id", protect, controller.updateChore);
router.patch("/:id/status", protect, controller.updateChoreStatus);

module.exports = router;