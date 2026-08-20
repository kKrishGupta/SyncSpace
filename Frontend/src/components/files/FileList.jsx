import React, { useEffect, useState } from 'react';
import { fileService } from '../../services/fileService';
import { FileIcon, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const FileList = ({ taskId, projectId, workspaceId, refreshTrigger }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const query = {};
        if (taskId) query.taskId = taskId;
        else if (projectId) query.projectId = projectId;
        else if (workspaceId) query.workspaceId = workspaceId;

        const res = await fileService.getFiles(query);
        setFiles(res.data);
      } catch (error) {
        console.error("Failed to fetch files", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (taskId || projectId || workspaceId) {
       fetchFiles();
    }
  }, [taskId, projectId, workspaceId, refreshTrigger]);

  if (loading) {
    return <div className="text-sm text-gray-500 animate-pulse py-4">Loading files...</div>;
  }

  if (files.length === 0) {
    return <div className="text-sm text-gray-500 py-4 text-center">No files attached yet.</div>;
  }

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return <FileText className="w-5 h-5 text-orange-500" />;
    return <FileIcon className="w-5 h-5 text-gray-500" />;
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3 mt-4">
      {files.map(file => (
        <div key={file._id} className="flex items-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
          <div className="flex-shrink-0 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {getFileIcon(file.mimeType)}
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {file.originalName}
            </p>
            <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
              <span>{formatSize(file.size)}</span>
              <span>&bull;</span>
              <span>{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}</span>
              <span>&bull;</span>
              <span className="truncate">{file.uploadedBy?.name}</span>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <a 
              href={`http://localhost:5000${file.storageKey}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 inline-block"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;
