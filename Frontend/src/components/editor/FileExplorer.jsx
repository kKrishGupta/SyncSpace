import React, { useState } from 'react';
import { File, Folder, Plus, Trash2, ChevronDown, ChevronRight, Code } from 'lucide-react';

const FileExplorer = ({ files, activeFile, onSelectFile, onCreateFile, onDeleteFile }) => {
  const [expandedFolders, setExpandedFolders] = useState({ src: true, backend: true });
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [creatingType, setCreatingType] = useState('FILE');

  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    onCreateFile({ name: newFileName.trim(), type: creatingType });
    setNewFileName('');
    setIsCreating(false);
  };

  // Group files into folder tree
  const folders = files.filter(f => f.type === 'FOLDER');
  const rootFiles = files.filter(f => f.type === 'FILE' && !f.path.includes('/'));

  const getFolderFiles = (folderPath) => {
    return files.filter(f => f.type === 'FILE' && f.path.startsWith(folderPath + '/'));
  };

  return (
    <div className="file-explorer-panel">
      <div className="file-explorer-header">
        <span>EXPLORER</span>
        <div className="file-explorer-actions">
          <button 
            title="New File" 
            onClick={() => { setCreatingType('FILE'); setIsCreating(true); }}
            className="icon-button"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="create-file-form">
          <input
            type="text"
            placeholder={creatingType === 'FILE' ? "filename.js" : "foldername"}
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            autoFocus
            className="create-file-input"
          />
          <div className="create-file-btns">
            <button type="submit" className="mini-btn primary">Add</button>
            <button type="button" onClick={() => setIsCreating(false)} className="mini-btn">Cancel</button>
          </div>
        </form>
      )}

      <div className="file-tree">
        {/* Folders */}
        {folders.map(folder => {
          const isExpanded = expandedFolders[folder.path];
          const folderFiles = getFolderFiles(folder.path);

          return (
            <div key={folder._id || folder.path} className="tree-folder-group">
              <div 
                className="tree-item folder-item"
                onClick={() => toggleFolder(folder.path)}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Folder size={15} className="folder-icon" />
                <span className="file-name">{folder.name}</span>
              </div>

              {isExpanded && (
                <div className="folder-contents">
                  {folderFiles.map(file => (
                    <div
                      key={file._id}
                      className={`tree-item file-item ${activeFile?._id === file._id ? 'active' : ''}`}
                      onClick={() => onSelectFile(file)}
                    >
                      <Code size={14} className="file-icon" />
                      <span className="file-name">{file.name}</span>
                      <button 
                        className="delete-file-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete ${file.name}?`)) onDeleteFile(file._id);
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Root Files */}
        {rootFiles.map(file => (
          <div
            key={file._id}
            className={`tree-item file-item ${activeFile?._id === file._id ? 'active' : ''}`}
            onClick={() => onSelectFile(file)}
          >
            <Code size={14} className="file-icon" />
            <span className="file-name">{file.name}</span>
            <button 
              className="delete-file-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete ${file.name}?`)) onDeleteFile(file._id);
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
