const express = require("express");

const workspaceController =
  require("../controllers/workspaceController");

const router = express.Router();

router.get(
  "/workspaces",
  workspaceController.getWorkspaces
);

router.post(
  "/workspaces",
  workspaceController.createWorkspace
);

router.get(
  "/workspaces/:id",
  workspaceController.getWorkspace
);

router.patch(
  "/workspaces/:id",
  workspaceController.updateWorkspace
);

router.post(
  "/workspaces/:id/members/invite",
  workspaceController.inviteMember
);

router.get(
  "/workspaces/:id/members",
  workspaceController.getMembers
);

module.exports = router;