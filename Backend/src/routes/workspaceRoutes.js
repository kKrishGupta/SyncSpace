const express = require("express");

const workspaceController =
  require("../controllers/workspaceController");
const requireRole = require("../middleware/requireRole");

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
  requireRole('workspace.update'),
  workspaceController.updateWorkspace
);

router.post(
  "/workspaces/:id/members/invite",
  requireRole('member.invite'),
  workspaceController.inviteMember
);

router.get(
  "/workspaces/:id/members",
  workspaceController.getMembers
);

router.patch(
  "/workspaces/:id/members/:userId",
  requireRole('member.updateRole'),
  workspaceController.updateMemberRole
);

router.delete(
  "/workspaces/:id/members/:userId",
  requireRole('member.remove'),
  workspaceController.removeMember
);

module.exports = router;