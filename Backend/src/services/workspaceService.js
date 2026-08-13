const mongoose = require("mongoose");

const workspaceRepository = require("../repositories/workspaceRepository");
const workspaceMemberRepository = require("../repositories/workspaceMemberRepository");
const slugify = require("../utils/slugify");

const createWorkspace = async ({
  name,
  description,
  userId
}) => {
  if (!name || !name.trim()) {
    throw new Error("Workspace name is required");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  const slug = slugify(name);

  if (!slug) {
    throw new Error("Invalid workspace name");
  }

  const session = await mongoose.startSession();

  try {
    let workspace;

    await session.withTransaction(async () => {
      // Create workspace
      workspace = await workspaceRepository.createWorkspace(
        {
          name: name.trim(),
          slug,
          description: description?.trim() || "",
          ownerId: userId
        },
        session
      );

      // Create owner membership
      await workspaceMemberRepository.createWorkspaceMember(
        {
          workspaceId: workspace._id,
          userId,
          role: "OWNER",
          status: "ACTIVE"
        },
        session
      );
    });

    return workspace;
  } finally {
    await session.endSession();
  }
};

const getWorkspacesForUser = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const memberships =
    await workspaceMemberRepository.findMembershipsByUser(userId);

  const workspaceIds = memberships.map(
    (membership) => membership.workspaceId
  );

  if (workspaceIds.length === 0) {
    return [];
  }

  const workspaces = await Promise.all(
    workspaceIds.map((id) =>
      workspaceRepository.findWorkspaceById(id)
    )
  );

  return workspaces.filter(Boolean);
};

const getWorkspaceById = async (workspaceId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw new Error("Invalid workspace ID");
  }

  const membership =
    await workspaceMemberRepository.findMembership(
      workspaceId,
      userId
    );

  if (!membership) {
    const error = new Error(
      "You do not have access to this workspace"
    );

    error.statusCode = 403;
    throw error;
  }

  const workspace =
    await workspaceRepository.findWorkspaceById(workspaceId);

  if (!workspace) {
    const error = new Error("Workspace not found");

    error.statusCode = 404;
    throw error;
  }

  return workspace;
};

const updateWorkspace = async (
  workspaceId,
  userId,
  updateData
) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    const error = new Error("Invalid workspace ID");
    error.statusCode = 400;
    throw error;
  }

  const membership =
    await workspaceMemberRepository.findMembership(
      workspaceId,
      userId
    );

  if (!membership) {
    const error = new Error(
      "You do not have access to this workspace"
    );

    error.statusCode = 403;
    throw error;
  }

  if (!["OWNER", "ADMIN", "MANAGER"].includes(membership.role)) {
    const error = new Error(
      "You do not have permission to update this workspace"
    );

    error.statusCode = 403;
    throw error;
  }

  const allowedUpdates = {};

  if (updateData.name !== undefined) {
    if (!updateData.name.trim()) {
      const error = new Error(
        "Workspace name cannot be empty"
      );

      error.statusCode = 400;
      throw error;
    }

    allowedUpdates.name = updateData.name.trim();
    allowedUpdates.slug = slugify(updateData.name);
  }

  if (updateData.description !== undefined) {
    allowedUpdates.description =
      updateData.description.trim();
  }

  return await workspaceRepository.updateWorkspace(
    workspaceId,
    allowedUpdates
  );
};

module.exports = {
  createWorkspace,
  getWorkspacesForUser,
  getWorkspaceById,
  updateWorkspace
};