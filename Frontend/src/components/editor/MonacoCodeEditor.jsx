import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { X, MessageSquarePlus } from 'lucide-react';

const MonacoCodeEditor = ({
  openFiles,
  activeFile,
  onSelectTab,
  onCloseTab,
  onContentChange,
  onCursorChange,
  onAddComment,
  remoteCursors = []
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track cursor movement
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange({
          lineNumber: e.position.lineNumber,
          column: e.position.column
        });
      }
    });

    // Add context menu action for Code Comments
    editor.addAction({
      id: 'add-code-comment',
      label: '💬 Add Code Comment',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM],
      contextMenuGroupId: 'navigation',
      run: (ed) => {
        const position = ed.getPosition();
        if (position && onAddComment) {
          onAddComment(position.lineNumber);
        }
      }
    });
  };

  return (
    <div className="monaco-editor-wrapper">
      {/* Editor Tabs Bar */}
      <div className="editor-tabs-bar">
        {openFiles.map(file => (
          <div
            key={file._id}
            className={`editor-tab ${activeFile?._id === file._id ? 'active' : ''}`}
            onClick={() => onSelectTab(file)}
          >
            <span className="tab-name">{file.name}</span>
            <button
              className="tab-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(file._id);
              }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {openFiles.length === 0 && (
          <div className="empty-tabs-placeholder">
            Select a file from the explorer to open in the editor
          </div>
        )}
      </div>

      {/* Editor Main */}
      {activeFile ? (
        <div className="editor-container">
          <Editor
            height="100%"
            theme="vs-dark"
            path={activeFile.path || activeFile.name}
            language={activeFile.language || 'javascript'}
            value={activeFile.content || ''}
            onChange={(val) => onContentChange(activeFile._id, val || '')}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              lineNumbers: 'on'
            }}
          />
        </div>
      ) : (
        <div className="no-file-selected">
          <div className="no-file-card">
            <h3>No File Selected</h3>
            <p>Click on any source file in the left explorer pane to start coding collaboratively.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonacoCodeEditor;
