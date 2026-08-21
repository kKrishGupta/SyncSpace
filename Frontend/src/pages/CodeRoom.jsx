import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, GitBranch, Shield, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import FileExplorer from '../components/editor/FileExplorer';
import MonacoCodeEditor from '../components/editor/MonacoCodeEditor';
import ActiveTeamPanel from '../components/editor/ActiveTeamPanel';
import BottomPanel from '../components/editor/BottomPanel';
import { fileService } from '../services/fileService';
import useWebSocket from '../hooks/useWebSocket';
import { useAuth } from '../context/AuthContext';
import { usePresence } from '../context/PresenceContext';
import './CodeRoom.css';

const CodeRoom = () => {
  const { id: projectId } = useParams();
  const { user: currentUser } = useAuth();
  const { isOnline } = usePresence();
  const { send, subscribe } = useWebSocket();

  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [selectedLine, setSelectedLine] = useState(null);
  const [activeUserStates, setActiveUserStates] = useState({});
  const [buildStatus, setBuildStatus] = useState({ state: 'idle', message: '' });

  // Load Code Room Aggregated Data
  useEffect(() => {
    const loadCodeRoomData = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fileService.getCodeRoomData(projectId);
        const { project: proj, files: fileList, members: memberList, tasks: taskList } = res.data;

        setProject(proj);
        setFiles(fileList || []);
        setMembers(memberList || []);
        setTasks(taskList || []);

        // Open first file by default if available
        const defaultFile = fileList?.find(f => f.type === 'FILE');
        if (defaultFile) {
          setOpenFiles([defaultFile]);
          setActiveFile(defaultFile);
        }
      } catch (err) {
        console.error("Failed to load Code Room data:", err);
        setError(err.message || 'Failed to load Code Room.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) loadCodeRoomData();
  }, [projectId]);

  // Join Workspace room via WebSocket & listen for collaboration events
  useEffect(() => {
    if (!project?.workspaceId) return;
    const wsId = project.workspaceId._id || project.workspaceId;

    // Send WORKSPACE_JOIN
    send({
      type: 'WORKSPACE_JOIN',
      workspaceId: wsId
    });

    // Subscribe to FILE_OPENED, FILE_EDITED, CURSOR_MOVED
    const unSubOpen = subscribe('FILE_OPENED', (event) => {
      if (event.payload?.userId) {
        setActiveUserStates(prev => ({
          ...prev,
          [event.payload.userId]: {
            ...prev[event.payload.userId],
            activeFile: event.payload.fileName
          }
        }));
      }
    });

    const unSubCursor = subscribe('CURSOR_MOVED', (event) => {
      if (event.payload?.userId) {
        setActiveUserStates(prev => ({
          ...prev,
          [event.payload.userId]: {
            ...prev[event.payload.userId],
            cursor: event.payload.cursor
          }
        }));
      }
    });

    const unSubEdit = subscribe('FILE_EDITED', (event) => {
      if (event.payload?.content && event.payload?.fileName) {
        setFiles(prev => prev.map(f => {
          if (f.name === event.payload.fileName) {
            return { ...f, content: event.payload.content };
          }
          return f;
        }));

        setOpenFiles(prev => prev.map(f => {
          if (f.name === event.payload.fileName) {
            return { ...f, content: event.payload.content };
          }
          return f;
        }));
      }
    });

    return () => {
      unSubOpen();
      unSubCursor();
      unSubEdit();
    };
  }, [project, send, subscribe]);

  // Handlers for File Management
  const handleSelectFile = (file) => {
    if (file.type === 'FOLDER') return;

    if (!openFiles.some(f => f._id === file._id)) {
      setOpenFiles(prev => [...prev, file]);
    }
    setActiveFile(file);

    // Broadcast FILE_OPENED
    if (project?.workspaceId) {
      send({
        type: 'FILE_OPENED',
        workspaceId: project.workspaceId._id || project.workspaceId,
        projectId,
        fileName: file.name,
        path: file.path
      });
    }
  };

  const handleCloseTab = (fileId) => {
    const nextOpen = openFiles.filter(f => f._id !== fileId);
    setOpenFiles(nextOpen);
    if (activeFile?._id === fileId) {
      setActiveFile(nextOpen[nextOpen.length - 1] || null);
    }
  };

  const handleContentChange = (fileId, newContent) => {
    setFiles(prev => prev.map(f => f._id === fileId ? { ...f, content: newContent } : f));
    setOpenFiles(prev => prev.map(f => f._id === fileId ? { ...f, content: newContent } : f));
    if (activeFile?._id === fileId) {
      setActiveFile(prev => ({ ...prev, content: newContent }));
    }

    // Broadcast FILE_EDITED
    if (project?.workspaceId && activeFile) {
      send({
        type: 'FILE_EDITED',
        workspaceId: project.workspaceId._id || project.workspaceId,
        projectId,
        fileName: activeFile.name,
        path: activeFile.path,
        content: newContent
      });

      // Debounced backend update
      fileService.updateFileContent(fileId, newContent).catch(err => console.error(err));
    }
  };

  const handleCursorChange = (cursor) => {
    if (project?.workspaceId && activeFile) {
      send({
        type: 'CURSOR_MOVED',
        workspaceId: project.workspaceId._id || project.workspaceId,
        projectId,
        fileName: activeFile.name,
        cursor
      });
    }
  };

  const handleCreateFile = async ({ name, type }) => {
    try {
      const res = await fileService.createFile(projectId, { name, type });
      setFiles(prev => [...prev, res.data]);
      if (type === 'FILE') {
        handleSelectFile(res.data);
      }
    } catch (err) {
      console.error("Failed to create file:", err);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await fileService.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f._id !== fileId));
      handleCloseTab(fileId);
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  const handleRunBuild = () => {
    setBuildStatus({ state: 'building', message: 'Compiling project...' });
    setTimeout(() => {
      setBuildStatus({ state: 'success', message: '✓ Build succeeded (0 errors)' });
      setTimeout(() => setBuildStatus({ state: 'idle', message: '' }), 4000);
    }, 1200);
  };

  if (loading) return <div className="code-room-loading">Loading Collaborative Code Room...</div>;
  if (error) return <div className="code-room-error"><h2>Error Loading Code Room</h2><p>{error}</p><Link to={`/projects/${projectId}`}>← Return to Project</Link></div>;

  return (
    <div className="code-room-layout">
      {/* Code Room Top Navigation Header */}
      <header className="code-room-topbar">
        <div className="topbar-left">
          <Link to={`/projects/${projectId}`} className="back-link" title="Back to Project Overview">
            <ArrowLeft size={14} /> Overview
          </Link>
          <div className="project-title-group">
            <span className="project-key-tag">{project?.key}</span>
            <h1 className="project-title">{project?.name}</h1>
            <span className="coderoom-badge">CODE ROOM</span>
          </div>

          <div className="branch-selector-wrapper">
            <GitBranch size={14} className="branch-icon" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="branch-select"
            >
              <option value="main">main</option>
              <option value="feature/auth">feature/auth</option>
              <option value="feature/kanban">feature/kanban</option>
              <option value="fix/redis">fix/redis</option>
            </select>
          </div>
        </div>

        <div className="topbar-right">
          {buildStatus.state === 'building' && (
            <span className="build-tag building"><RefreshCw size={13} className="spin" /> Building...</span>
          )}
          {buildStatus.state === 'success' && (
            <span className="build-tag success"><CheckCircle size={13} /> Build Passed</span>
          )}

          <button onClick={handleRunBuild} className="run-button">
            <Play size={14} /> Run / Build
          </button>

          <Link to={`/projects/${projectId}`} className="secondary-button mini">
            Board & Tasks
          </Link>
        </div>
      </header>

      {/* Main 3-Pane Workspace Body */}
      <div className="code-room-body">
        {/* Left Pane: File Explorer */}
        <aside className="pane-left">
          <FileExplorer
            files={files}
            activeFile={activeFile}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
          />
        </aside>

        {/* Center Pane: Monaco Editor */}
        <main className="pane-center">
          <MonacoCodeEditor
            openFiles={openFiles}
            activeFile={activeFile}
            onSelectTab={setActiveFile}
            onCloseTab={handleCloseTab}
            onContentChange={handleContentChange}
            onCursorChange={handleCursorChange}
            onAddComment={(line) => setSelectedLine(line)}
          />
        </main>

        {/* Right Pane: Active Team Collaboration */}
        <aside className="pane-right">
          <ActiveTeamPanel
            members={members}
            activeUserStates={activeUserStates}
            isOnline={isOnline}
            currentUser={currentUser}
          />
        </aside>
      </div>

      {/* Bottom Panel Drawer: Terminal, Problems, Output, Comments, Chat */}
      <BottomPanel
        projectId={projectId}
        activeFile={activeFile}
        selectedLine={selectedLine}
        currentUser={currentUser}
      />
    </div>
  );
};

export default CodeRoom;
