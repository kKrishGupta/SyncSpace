const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

// Code Reviews
router.get("/projects/:projectId/reviews", reviewController.getProjectReviews);
router.post("/projects/:projectId/reviews", reviewController.createCodeReview);
router.patch("/reviews/:reviewId/status", reviewController.updateReviewStatus);

// Blockers
router.get("/projects/:projectId/blockers", reviewController.getProjectBlockers);
router.post("/projects/:projectId/blockers", reviewController.createBlocker);
router.patch("/blockers/:blockerId/resolve", reviewController.resolveBlocker);

// Decisions (ADR)
router.get("/projects/:projectId/decisions", reviewController.getProjectDecisions);
router.post("/projects/:projectId/decisions", reviewController.createDecision);

// Code Comments
router.get("/files/:fileId/code-comments", reviewController.getFileCodeComments);
router.post("/code-comments", reviewController.createCodeComment);
router.patch("/code-comments/:commentId/status", reviewController.toggleCodeCommentStatus);

// Team Chat
router.get("/projects/:projectId/chat", reviewController.getProjectChatMessages);
router.post("/projects/:projectId/chat", reviewController.sendChatMessage);

module.exports = router;
