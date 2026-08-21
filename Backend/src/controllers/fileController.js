const File = require("../models/File");
const Project = require("../models/Project");
const Task = require("../models/Task");
const WorkspaceMember = require("../models/WorkspaceMember");
const CodeComment = require("../models/CodeComment");

// Helper to infer language from file name
const detectLanguage = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js': case 'jsx': return 'javascript';
    case 'ts': case 'tsx': return 'typescript';
    case 'json': return 'json';
    case 'css': return 'css';
    case 'html': return 'html';
    case 'md': return 'markdown';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'cpp': case 'c': case 'h': return 'cpp';
    case 'sql': return 'sql';
    case 'yaml': case 'yml': return 'yaml';
    default: return 'plaintext';
  }
};

// Seed default files if project has no files
const seedDefaultProjectFiles = async (projectId, workspaceId, userId) => {
  const count = await File.countDocuments({ projectId });
  if (count > 0) return;

  const defaultFiles = [
    { name: 'src', path: 'src', type: 'FOLDER', content: '', language: 'folder' },
    {
      name: 'App.jsx',
      path: 'src/App.jsx',
      type: 'FILE',
      language: 'javascript',
      content: `import React, { useState } from 'react';\nimport { api } from './api';\n\nexport default function App() {\n  const [status, setStatus] = useState('Ready');\n\n  const handleRun = async () => {\n    setStatus('Running...');\n    const res = await api.get('/status');\n    setStatus(res.data.status);\n  };\n\n  return (\n    <div className="container">\n      <h1>SyncSpace Collaborative App</h1>\n      <p>Status: {status}</p>\n      <button onClick={handleRun}>Run Health Check</button>\n    </div>\n  );\n}\n`
    },
    {
      name: 'api.js',
      path: 'src/api.js',
      type: 'FILE',
      language: 'javascript',
      content: `// SyncSpace API Client Layer\nconst API_BASE = 'http://localhost:5000/api/v1';\n\nexport const api = {\n  get: async (endpoint) => {\n    const res = await fetch(\`\${API_BASE}\${endpoint}\`);\n    return res.json();\n  },\n  post: async (endpoint, data) => {\n    const res = await fetch(\`\${API_BASE}\${endpoint}\`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(data)\n    });\n    return res.json();\n  }\n};\n`
    },
    { name: 'backend', path: 'backend', type: 'FOLDER', content: '', language: 'folder' },
    {
      name: 'server.js',
      path: 'backend/server.js',
      type: 'FILE',
      language: 'javascript',
      content: `const express = require('express');\nconst app = express();\n\napp.use(express.json());\n\napp.get('/api/v1/status', (req, res) => {\n  res.json({ status: 'Operational', timestamp: new Date() });\n});\n\napp.listen(5000, () => {\n  console.log('Backend listening on port 5000');\n});\n`
    },
    {
      name: 'package.json',
      path: 'package.json',
      type: 'FILE',
      language: 'json',
      content: `{\n  "name": "syncspace-collaborative-project",\n  "version": "1.0.0",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}\n`
    },
    {
      name: 'README.md',
      path: 'README.md',
      type: 'FILE',
      language: 'markdown',
      content: `# SyncSpace Collaborative Project\n\nWelcome to SyncSpace. Edit files simultaneously with team members in real-time!\n`
    }
  ];

  for (const item of defaultFiles) {
    await File.create({
      ...item,
      projectId,
      workspaceId,
      createdBy: userId
    });
  }
};

exports.getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    await seedDefaultProjectFiles(projectId, project.workspaceId, req.user._id);

    const files = await File.find({ projectId }).sort({ type: -1, path: 1 });
    res.status(200).json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, path: filePath, type, content } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const language = type === 'FOLDER' ? 'folder' : detectLanguage(name || filePath);

    const file = await File.create({
      name,
      path: filePath || name,
      type: type || 'FILE',
      language,
      content: content || '',
      projectId,
      workspaceId: project.workspaceId,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFileById = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    res.status(200).json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFileContent = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { content } = req.body;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    file.content = content !== undefined ? content : file.content;
    file.version = (file.version || 1) + 1;
    file.updatedBy = req.user._id;
    await file.save();

    res.status(200).json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    await File.findByIdAndDelete(fileId);
    res.status(200).json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCodeRoomData = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate('workspaceId', 'name slug');
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    await seedDefaultProjectFiles(projectId, project.workspaceId._id || project.workspaceId, req.user._id);

    const [files, members, tasks] = await Promise.all([
      File.find({ projectId }).sort({ type: -1, path: 1 }),
      WorkspaceMember.find({ workspaceId: project.workspaceId._id || project.workspaceId, status: 'ACTIVE' })
        .populate('userId', 'name email avatar status')
        .lean(),
      Task.find({ projectId }).populate('assigneeId', 'name avatar').sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      data: {
        project,
        files,
        members,
        tasks
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { workspaceId, projectId, taskId } = req.body;

    const file = await File.create({
      name: req.file.originalname,
      path: `uploads/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      storageKey: `/uploads/${req.file.filename}`,
      createdBy: req.user._id,
      workspaceId,
      projectId,
      taskId
    });

    res.status(201).json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const { taskId, projectId, workspaceId } = req.query;

    let query = {};
    if (taskId) query.taskId = taskId;
    else if (projectId) query.projectId = projectId;
    else if (workspaceId) query.workspaceId = workspaceId;
    else return res.status(400).json({ success: false, message: "Provide taskId, projectId, or workspaceId" });

    const files = await File.find(query).populate('createdBy', 'name avatar').sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
