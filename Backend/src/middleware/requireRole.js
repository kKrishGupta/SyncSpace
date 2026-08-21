const { assertWorkspacePermission } = require('../websocket/workspaceAuthorization');
const logger = require('../utils/logger');

const requireRole = (permission) => {
  return async (req, res, next) => {
    try {
      // Extract workspaceId from common locations in the request
      let workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;
      
      // If the route is /workspaces/:id or /workspaces/:id/members etc, the param is :id
      if (!workspaceId && req.originalUrl.includes('workspaces') && req.params.id) {
        workspaceId = req.params.id;
      }

      // If missing, let downstream controllers handle or throw error if strictly required.
      // We will throw 400 if we absolutely need it and it's missing.
      if (!workspaceId) {
        // Fallback check for projects / tasks where we might have projectId or taskId instead
        // In those cases, this middleware might need to lookup the entity first. 
        // For now, require it or fail.
        logger.warn({ userId: req.user?.id, url: req.url }, "Workspace ID missing for permission validation");
        return res.status(400).json({ status: 'error', message: 'Workspace ID is required for permission validation' });
      }

      const membership = await assertWorkspacePermission({
        userId: req.user.id,
        workspaceId: workspaceId,
        permission: permission
      });

      // Attach membership to request for downstream use
      req.workspaceMembership = membership;
      next();
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ status: 'error', message: error.message });
      }
      logger.error(error, "Error in requireRole middleware");
      next(error);
    }
  };
};

module.exports = requireRole;
