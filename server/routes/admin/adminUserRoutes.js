const express = require("express");
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser } = require("../../controllers/admin/adminUserController");
const { protect, admin } = require("../../middleware/authMiddleware");

router.get("/", protect, admin, getAllUsers);
router.put("/:id/role", protect, admin, updateUserRole);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
