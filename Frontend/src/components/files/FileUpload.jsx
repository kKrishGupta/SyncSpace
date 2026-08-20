import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { fileService } from '../../services/fileService';

const FileUpload = ({ workspaceId, projectId, taskId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const data = { workspaceId, projectId, taskId };
      const response = await fileService.uploadFile(file, data);
      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = null; // reset input
    }
  };

  return (
    <div className="mt-4">
      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            {uploading ? (
              <span className="font-semibold">Uploading...</span>
            ) : (
              <><span className="font-semibold">Click to upload</span> or drag and drop</>
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, PDF up to 10MB</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          onChange={handleFileChange} 
          disabled={uploading} 
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FileUpload;
