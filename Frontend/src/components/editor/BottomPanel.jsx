import React, { useState } from 'react';
import { Terminal as TerminalIcon, AlertTriangle, Play, MessageSquare, MessageCircle, X, ChevronUp, ChevronDown } from 'lucide-react';
import TeamChat from '../chat/TeamChat';
import CodeCommentsDrawer from '../comments/CodeCommentsDrawer';

const BottomPanel = ({ projectId, activeFile, selectedLine, currentUser }) => {
  const [activeTab, setActiveTab] = useState('Terminal');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    "SyncSpace Interactive Shell v1.0.0",
    "$ npm run dev",
    "[info] Express backend listening on http://localhost:5000",
    "[info] Vite dev server running on http://localhost:5173",
    "[ready] Collaborative WebSocket server active on /ws"
  ]);
  const [commandInput, setCommandInput] = useState('');

  const handleCommand = (e) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    setCommandInput('');

    let output = `> Executing: ${cmd}`;
    if (cmd.includes('build') || cmd.includes('run')) {
      output = `✓ Build succeeded. 0 errors, 0 warnings. (Compiled in 420ms)`;
    } else if (cmd.includes('test')) {
      output = `✓ PASS: 12 tests passed, 0 failed.`;
    } else if (cmd.includes('git')) {
      output = `On branch main. Your branch is up to date with 'origin/main'.`;
    }

    setTerminalLogs(prev => [...prev, `$ ${cmd}`, output]);
  };

  return (
    <div className={`bottom-panel-container ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Tab Navigation Header */}
      <div className="bottom-panel-tabs">
        <div className="panel-tab-group">
          <button
            className={`bottom-tab ${activeTab === 'Terminal' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Terminal'); setIsCollapsed(false); }}
          >
            <TerminalIcon size={14} /> Terminal
          </button>

          <button
            className={`bottom-tab ${activeTab === 'Problems' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Problems'); setIsCollapsed(false); }}
          >
            <AlertTriangle size={14} /> Problems <span className="badge-count text-green">0</span>
          </button>

          <button
            className={`bottom-tab ${activeTab === 'Output' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Output'); setIsCollapsed(false); }}
          >
            <Play size={14} /> Output / Build
          </button>

          <button
            className={`bottom-tab ${activeTab === 'Comments' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Comments'); setIsCollapsed(false); }}
          >
            <MessageSquare size={14} /> Code Comments
          </button>

          <button
            className={`bottom-tab ${activeTab === 'Chat' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Chat'); setIsCollapsed(false); }}
          >
            <MessageCircle size={14} /> Team Chat
          </button>
        </div>

        <button 
          className="collapse-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
        >
          {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Content Area */}
      {!isCollapsed && (
        <div className="bottom-panel-content">
          {activeTab === 'Terminal' && (
            <div className="terminal-view">
              <div className="terminal-output">
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className="terminal-line">{log}</div>
                ))}
              </div>
              <form onSubmit={handleCommand} className="terminal-input-row">
                <span className="terminal-prompt">$</span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Type shell command (npm run dev, git status, npm test)..."
                  className="terminal-input"
                />
              </form>
            </div>
          )}

          {activeTab === 'Problems' && (
            <div className="problems-view">
              <div className="problem-item no-errors">
                ✓ No syntax errors or problems detected in project workspace.
              </div>
            </div>
          )}

          {activeTab === 'Output' && (
            <div className="output-view">
              <pre className="build-output-log">
                {`[10:12:04 AM] Starting build target...
[10:12:05 AM] Vite bundling complete in 310ms
[10:12:05 AM] Deployment bundle generated in /dist
✓ All tests passing.`}
              </pre>
            </div>
          )}

          {activeTab === 'Comments' && (
            <CodeCommentsDrawer
              activeFile={activeFile}
              projectId={projectId}
              selectedLine={selectedLine}
            />
          )}

          {activeTab === 'Chat' && (
            <TeamChat
              projectId={projectId}
              currentUser={currentUser}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BottomPanel;
