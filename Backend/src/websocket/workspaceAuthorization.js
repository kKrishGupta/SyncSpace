const mongoose =
  require("mongoose");

const workspaceMemberRepository =
  require("../repositories/workspaceMemberRepository");


/*
|--------------------------------------------------------------------------
| Validate MongoDB ObjectId
|--------------------------------------------------------------------------
*/

const isValidObjectId =
  (value) => {

    return mongoose.Types.ObjectId
      .isValid(
        value
      );

  };


/*
|--------------------------------------------------------------------------
| Workspace membership
|--------------------------------------------------------------------------
*/

const getWorkspaceMembership =
  async (
    workspaceId,
    userId
  ) => {

    /*
     * Workspace ID must be valid.
     */

    if (
      !isValidObjectId(
        workspaceId
      )
    ) {

      const error =
        new Error(
          "Invalid workspace ID"
        );

      error.statusCode = 400;

      throw error;

    }


    /*
     * User ID must also be a
     * valid MongoDB ObjectId.
     */

    if (
      !isValidObjectId(
        userId
      )
    ) {

      const error =
        new Error(
          "Invalid user ID"
        );

      error.statusCode = 401;

      throw error;

    }


    /*
     * THE SECURITY CHECK
     *
     * WorkspaceMember
     *       ↓
     * workspaceId + userId
     *       ↓
     * ACTIVE membership
     */

    const membership =
      await workspaceMemberRepository
        .findMembership(
          workspaceId,
          userId
        );


    if (!membership) {

      const error =
        new Error(
          "You are not a member of this workspace"
        );

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

const assertWorkspaceAccess =
  async ({
    userId,
    workspaceId
  }) => {

    const membership =
      await getWorkspaceMembership(
        String(workspaceId),
        String(userId)
      );


    return membership;

  };


module.exports = {
  isValidObjectId,
  getWorkspaceMembership,
  assertWorkspaceAccess

};