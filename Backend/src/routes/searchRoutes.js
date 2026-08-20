const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

router.get("/", searchController.globalSearch);

module.exports = router;
