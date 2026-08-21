const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const requireAuth = require("../middleware/requireAuth");
const { upload } = require("../services/storageService");

router.use(requireAuth);

// Project file explorer and Code Room
router.get("/project/:projectId", fileController.getProjectFiles);
router.post("/project/:projectId", fileController.createFile);
router.get("/coderoom/:projectId", fileController.getCodeRoomData);

// Individual file actions
router.get("/:fileId", fileController.getFileById);
router.patch("/:fileId/content", fileController.updateFileContent);
router.delete("/:fileId", fileController.deleteFile);

// Standard upload & query
router.post("/upload", upload.single('file'), fileController.uploadFile);
router.get("/", fileController.getFiles);

module.exports = router;
