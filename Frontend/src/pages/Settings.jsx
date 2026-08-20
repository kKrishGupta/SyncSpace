import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, updatePassword } from "../services/userService";
import { updateWorkspace } from "../services/workspaceService";
import { getStoredWorkspaceId } from "../utils/workspaceStorage";

const Settings = () => {
  const { user, updateUser } = useAuth(); // getting updateUser from context
  const [activeTab, setActiveTab] = useState("Profile");
  
  // Profile State
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Security State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState("");
  const [securityError, setSecurityError] = useState("");

  // Workspace State
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDesc, setWorkspaceDesc] = useState("");
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceSuccess, setWorkspaceSuccess] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");

  // Preferences State
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [notifications, setNotifications] = useState(true);

  // Set initial workspace details if available
  useEffect(() => {
    // In a real app we'd fetch the workspace details here or get them from context
    // For now we'll just leave it blank until they load it or we assume it's passed
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess("");
    setProfileError("");
    try {
      const response = await updateProfile({ name: profileName, avatar: profileAvatar });
      setProfileSuccess("Profile updated successfully");
      if (updateUser) {
        updateUser({ name: profileName, avatar: profileAvatar });
      }
    } catch (err) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setSecurityLoading(true);
    setSecuritySuccess("");
    setSecurityError("");

    if (newPassword !== confirmPassword) {
      setSecurityError("New passwords do not match");
      setSecurityLoading(false);
      return;
    }

    try {
      await updatePassword({ oldPassword, newPassword });
      setSecuritySuccess("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setSecurityError(err.message || "Failed to update password");
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleWorkspaceSubmit = async (e) => {
    e.preventDefault();
    setWorkspaceLoading(true);
    setWorkspaceSuccess("");
    setWorkspaceError("");
    
    const workspaceId = getStoredWorkspaceId();
    if (!workspaceId) {
      setWorkspaceError("No active workspace selected");
      setWorkspaceLoading(false);
      return;
    }

    try {
      await updateWorkspace(workspaceId, { name: workspaceName, description: workspaceDesc });
      setWorkspaceSuccess("Workspace updated successfully");
    } catch (err) {
      setWorkspaceError(err.message || "Failed to update workspace");
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Profile":
        return (
          <div className="panel settings-panel">
            <h2>Profile Settings</h2>
            <p>Update your personal information.</p>
            {profileSuccess && <div className="success-banner">{profileSuccess}</div>}
            {profileError && <div className="error-banner">{profileError}</div>}
            
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user?.email || ""} disabled className="input-disabled" />
                <small>Email cannot be changed directly.</small>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Avatar URL</label>
                <input 
                  type="url" 
                  value={profileAvatar} 
                  onChange={(e) => setProfileAvatar(e.target.value)} 
                  placeholder="https://example.com/avatar.png"
                />
              </div>
              <button type="submit" className="primary-button" disabled={profileLoading}>
                {profileLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        );

      case "Security":
        return (
          <div className="panel settings-panel">
            <h2>Security</h2>
            <p>Manage your password and security preferences.</p>
            {securitySuccess && <div className="success-banner">{securitySuccess}</div>}
            {securityError && <div className="error-banner">{securityError}</div>}
            
            <form onSubmit={handleSecuritySubmit} className="settings-form">
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="primary-button" disabled={securityLoading}>
                {securityLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        );

      case "Workspace":
        return (
          <div className="panel settings-panel">
            <h2>Workspace Settings</h2>
            <p>Update settings for the current active workspace.</p>
            {workspaceSuccess && <div className="success-banner">{workspaceSuccess}</div>}
            {workspaceError && <div className="error-banner">{workspaceError}</div>}
            
            <form onSubmit={handleWorkspaceSubmit} className="settings-form">
              <div className="form-group">
                <label>Workspace Name</label>
                <input 
                  type="text" 
                  value={workspaceName} 
                  onChange={(e) => setWorkspaceName(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Workspace Description</label>
                <textarea 
                  value={workspaceDesc} 
                  onChange={(e) => setWorkspaceDesc(e.target.value)} 
                  rows="3"
                ></textarea>
              </div>
              <button type="submit" className="primary-button" disabled={workspaceLoading}>
                {workspaceLoading ? "Saving..." : "Save Workspace"}
              </button>
            </form>
          </div>
        );

      case "Preferences":
        return (
          <div className="panel settings-panel">
            <h2>Preferences</h2>
            <p>Customize your SyncSpace experience.</p>
            
            <div className="settings-form">
              <div className="form-group flex-row">
                <div>
                  <label>Application Theme</label>
                  <p className="text-small text-muted">Switch between light and dark mode.</p>
                </div>
                <button type="button" className="secondary-button" onClick={toggleTheme}>
                  {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                </button>
              </div>
              
              <hr className="divider" />
              
              <div className="form-group flex-row">
                <div>
                  <label>Email Notifications</label>
                  <p className="text-small text-muted">Receive updates about tasks and mentions.</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={notifications} 
                    onChange={() => setNotifications(!notifications)} 
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page settings-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">SYSTEM</div>
          <h1>Settings</h1>
          <p>Configure your personal profile and workspace.</p>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar w-64 flex-shrink-0">
          <nav className="flex flex-col space-y-1">
            {["Profile", "Account", "Appearance", "Notifications", "Security", "Workspace", "Roles & Permissions"].map((tab) => (
              <button
                key={tab}
                className={`settings-nav-item text-left px-4 py-2 rounded-md transition-colors ${activeTab === tab ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/30 dark:text-indigo-400" : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </aside>

        <main className="settings-content flex-1">
          {renderContent()}
          {/* Render placeholder for the newly added tabs */}
          {["Account", "Appearance", "Notifications", "Roles & Permissions"].includes(activeTab) && activeTab !== "Preferences" && (
             <div className="panel settings-panel">
               <h2>{activeTab} Settings</h2>
               <p className="text-gray-500">This feature is coming soon.</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;