const WorkspaceMember = require("../models/WorkspaceMember");

const createWorkspaceMember = async (
  memberData,
  session = null
) => {
  if (session) {
    const result = await WorkspaceMember.create(
      [memberData],
      { session }
    );

    return result[0];
  }

  return await WorkspaceMember.create(memberData);
};

const findMembershipsByUser = async (userId) => {
  return await WorkspaceMember.find({
    userId,
    status: "ACTIVE"
  }).select("workspaceId role");
};

const findMembership = async (workspaceId, userId) => {
  return await WorkspaceMember.findOne({
    workspaceId,
    userId,
    status: "ACTIVE"
  });
};

module.exports = {
  createWorkspaceMember,
  findMembershipsByUser,
  findMembership
};