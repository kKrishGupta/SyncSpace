import apiClient from "./apiClient";

export const getCommentsByTask = async (taskId) => {
  const response = await apiClient(
    `/tasks/${taskId}/comments`,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response;
};

export const createComment = async (
  taskId,
  content
) => {
  const response = await apiClient(
    `/tasks/${taskId}/comments`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response;
};

export const updateComment = async (
  commentId,
  content
) => {
  const response = await apiClient(
    `/comments/${commentId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ content }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response;
};

export const deleteComment = async (commentId) => {
  const response = await apiClient(
    `/comments/${commentId}`,
    {
      method: "DELETE",
    }
  );

  return response;
};