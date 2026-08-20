const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

router.get("/workspace/:workspaceId", activityController.getWorkspaceActivity);
router.get("/project/:projectId", activityController.getProjectActivity);

module.exports = router;
