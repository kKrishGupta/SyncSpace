const express =
  require("express");

const router =
  express.Router();

const commentController =
  require("../controllers/commentController");


/*
 * Task comments
 */

router.post(
  "/tasks/:id/comments",
  commentController.createComment
);


router.get(
  "/tasks/:id/comments",
  commentController.getCommentsByTask
);


/*
 * Individual comments
 */

router.patch(
  "/comments/:id",
  commentController.updateComment
);


router.delete(
  "/comments/:id",
  commentController.deleteComment
);


module.exports = router;