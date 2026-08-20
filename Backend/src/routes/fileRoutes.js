const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const requireAuth = require("../middleware/requireAuth");
const { upload } = require("../services/storageService");

router.use(requireAuth);

router.post("/upload", upload.single('file'), fileController.uploadFile);
router.get("/", fileController.getFiles);

module.exports = router;
