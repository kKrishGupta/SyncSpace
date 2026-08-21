const mongoose = require("mongoose");
const workspaceMemberRepository = require("../repositories/workspaceMemberRepository");

/*
|--------------------------------------------------------------------------
| Validate MongoDB ObjectId
|--------------------------------------------------------------------------
*/
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

/*
|--------------------------------------------------------------------------
| Role Permissions Map
|--------------------------------------------------------------------------
*/
const PERMISSIONS = {
  OWNER: [
    "workspace.read", "workspace.update", "workspace.delete",
    "member.read", "member.invite", "member.updateRole", "member.remove",
    "project.read", "project.create", "project.update", "project.delete",
    "task.read", "task.create", "task.update", "task.delete", "task.assign", "task.move",
    "comment.read", "comment.create", "comment.update", "comment.delete",
    "notification.read"
  ],
  ADMIN: [
    "workspace.read", "workspace.update",
    "member.read", "member.invite", "member.updateRole", "member.remove",
    "project.read", "project.create", "project.update", "project.delete",
    "task.read", "task.create", "task.update", "task.delete", "task.assign", "task.move",
    "comment.read", "comment.create", "comment.update", "comment.delete",
    "notification.read"
  ],
  MANAGER: [
    "workspace.read",
    "member.read", "member.invite",
    "project.read", "project.create", "project.update",
    "task.read", "task.create", "task.update", "task.delete", "task.assign", "task.move",
    "comment.read", "comment.create", "comment.update", "comment.delete",
    "notification.read"
  ],
  MEMBER: [
    "workspace.read",
    "member.read",
    "project.read",
    "task.read", "task.create", "task.update", "task.assign", "task.move",
    "comment.read", "comment.create", "comment.update",
    "notification.read"
  ],
  VIEWER: [
    "workspace.read",
    "member.read",
    "project.read",
    "task.read",
    "comment.read",
    "notification.read"
  ]
};

const hasPermission = (role, permission) => {
  const permissions = PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

/*
|--------------------------------------------------------------------------
| Workspace membership
|--------------------------------------------------------------------------
*/
const getWorkspaceMembership = async (workspaceId, userId) => {
  if (!isValidObjectId(workspaceId)) {
    const error = new Error("Invalid workspace ID");
    error.statusCode = 400;
    throw error;
  }

  if (!isValidObjectId(userId)) {
    const error = new Error("Invalid user ID");
    error.statusCode = 401;
    throw error;
  }

  const membership = await workspaceMemberRepository.findMembership(workspaceId, userId);

  if (!membership) {
    const error = new Error("You are not a member of this workspace");
    error.statusCode = 403;
    throw error;
  }

  return membership;
};

/*
|--------------------------------------------------------------------------
| Assert workspace access
|--------------------------------------------------------------------------
*/
const assertWorkspaceAccess = async ({ userId, workspaceId }) => {
  const membership = await getWorkspaceMembership(String(workspaceId), String(userId));
  return membership;
};

const assertWorkspacePermission = async ({ userId, workspaceId, permission }) => {
  const membership = await assertWorkspaceAccess({ userId, workspaceId });
  if (!hasPermission(membership.role, permission)) {
    const error = new Error(`You do not have permission to ${permission}`);
    error.statusCode = 403;
    throw error;
  }
  return membership;
};

module.exports = {
  isValidObjectId,
  getWorkspaceMembership,
  assertWorkspaceAccess,
  assertWorkspacePermission,
  hasPermission,
  PERMISSIONS
};