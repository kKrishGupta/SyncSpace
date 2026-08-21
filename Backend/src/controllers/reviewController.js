const CodeReview = require("../models/CodeReview");
const Blocker = require("../models/Blocker");
const Decision = require("../models/Decision");
const CodeComment = require("../models/CodeComment");
const ChatMessage = require("../models/ChatMessage");
const Project = require("../models/Project");
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");

// =========================================================
// CODE REVIEWS
// =========================================================
exports.getProjectReviews = async (req, res) => {
  try {
    const { projectId } = req.params;
    const reviews = await CodeReview.find({ projectId })
      .populate('authorId', 'name email avatar')
      .populate('reviewerId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCodeReview = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, reviewerId, changedFiles, additions, deletions, taskId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const count = await CodeReview.countDocuments({ projectId });
    const reviewNumber = count + 1;

    const review = await CodeReview.create({
      projectId,
      workspaceId: project.workspaceId,
      reviewNumber,
      title,
      description,
      authorId: req.user._id,
      reviewerId,
      changedFiles: changedFiles || [],
      additions: additions || 0,
      deletions: deletions || 0,
      taskId: taskId || null
    });

    await Activity.create({
      workspaceId: project.workspaceId,
      projectId,
      actorId: req.user._id,
      action: "CREATED",
      entityType: "Project",
      entityId: review._id,
      metadata: { reviewNumber, title }
    });

    if (reviewerId) {
      await Notification.create({
        recipientId: reviewerId,
        actorId: req.user._id,
        type: "PROJECT_INVITE",
        entityId: review._id,
        entityType: "Project",
        message: `requested your review on PR #${reviewNumber}: ${title}`
      });
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body; // OPEN, CHANGES_REQUESTED, APPROVED, MERGED, CLOSED

    const review = await CodeReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.status = status;
    await review.save();

    await Activity.create({
      workspaceId: review.workspaceId,
      projectId: review.projectId,
      actorId: req.user._id,
      action: "UPDATED",
      entityType: "Project",
      entityId: review._id,
      metadata: { reviewNumber: review.reviewNumber, status }
    });

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// BLOCKERS
// =========================================================
exports.getProjectBlockers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const blockers = await Blocker.find({ projectId })
      .populate('ownerId', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: blockers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBlocker = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, severity, taskId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const blocker = await Blocker.create({
      projectId,
      workspaceId: project.workspaceId,
      title,
      description,
      severity: severity || "HIGH",
      ownerId: req.user._id,
      taskId: taskId || null
    });

    res.status(201).json({ success: true, data: blocker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resolveBlocker = async (req, res) => {
  try {
    const { blockerId } = req.params;
    const blocker = await Blocker.findById(blockerId);
    if (!blocker) {
      return res.status(404).json({ success: false, message: "Blocker not found" });
    }
    blocker.status = "RESOLVED";
    await blocker.save();
    res.status(200).json({ success: true, data: blocker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// DECISIONS (ADR)
// =========================================================
exports.getProjectDecisions = async (req, res) => {
  try {
    const { projectId } = req.params;
    const decisions = await Decision.find({ projectId })
      .populate('authorId', 'name avatar')
      .populate('participants', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: decisions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDecision = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, rationale, participants } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const decision = await Decision.create({
      projectId,
      workspaceId: project.workspaceId,
      title,
      rationale,
      authorId: req.user._id,
      participants: participants || [req.user._id]
    });

    res.status(201).json({ success: true, data: decision });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// CODE COMMENTS
// =========================================================
exports.getFileCodeComments = async (req, res) => {
  try {
    const { fileId } = req.params;
    const comments = await CodeComment.find({ fileId })
      .populate('authorId', 'name avatar')
      .sort({ line: 1, createdAt: 1 });

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCodeComment = async (req, res) => {
  try {
    const { projectId, fileId, line, lineEnd, content, parentCommentId } = req.body;

    const comment = await CodeComment.create({
      projectId,
      fileId,
      line,
      lineEnd: lineEnd || line,
      content,
      authorId: req.user._id,
      parentCommentId: parentCommentId || null
    });

    const populated = await CodeComment.findById(comment._id).populate('authorId', 'name avatar');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleCodeCommentStatus = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await CodeComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }
    comment.status = comment.status === "OPEN" ? "RESOLVED" : "OPEN";
    await comment.save();
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// TEAM CHAT
// =========================================================
exports.getProjectChatMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const messages = await ChatMessage.find({ projectId })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(100);

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendChatMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message, mentions } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const chatMsg = await ChatMessage.create({
      projectId,
      workspaceId: project.workspaceId,
      senderId: req.user._id,
      message,
      mentions: mentions || []
    });

    const populated = await ChatMessage.findById(chatMsg._id).populate('senderId', 'name avatar');

    // Broadcast over WebSocket if pubSub available
    const { publishApplicationEvent } = require('../websocket/eventPublisher');
    const EVENT_TYPES = require('../websocket/eventTypes');
    const { createEvent } = require('../websocket/eventFactory');

    const event = createEvent({
      type: EVENT_TYPES.CHAT_MESSAGE_CREATED,
      workspaceId: project.workspaceId,
      projectId,
      actorId: req.user._id,
      payload: populated
    });
    try { await publishApplicationEvent(event); } catch (e) {}

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
