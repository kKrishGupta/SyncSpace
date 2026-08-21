import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { fileService } from '../../services/fileService';
import useWebSocket from '../../hooks/useWebSocket';

const TeamChat = ({ projectId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoading(true);
        const res = await fileService.getProjectChatMessages(projectId);
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load team chat messages:", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) loadChat();
  }, [projectId]);

  // Subscribe to real-time chat messages
  useEffect(() => {
    const unsubscribe = subscribe('CHAT_MESSAGE_CREATED', (event) => {
      if (event.projectId === projectId && event.payload) {
        setMessages(prev => [...prev, event.payload]);
      }
    });

    return unsubscribe;
  }, [projectId, subscribe]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const res = await fileService.sendChatMessage(projectId, { message: textToSend });
      if (res.data) {
        setMessages(prev => [...prev, res.data]);
      }
    } catch (err) {
      console.error("Failed to send chat message:", err);
    }
  };

  return (
    <div className="team-chat-wrapper">
      <div className="chat-messages-list">
        {loading ? (
          <div className="chat-loading">Loading project chat...</div>
        ) : messages.length === 0 ? (
          <div className="empty-chat">No team messages yet. Start the conversation!</div>
        ) : (
          messages.map(msg => {
            const sender = msg.senderId || {};
            const isSelf = sender._id === currentUser?._id;

            return (
              <div key={msg._id} className={`chat-message-row ${isSelf ? 'self' : 'other'}`}>
                <div className="chat-avatar">
                  {sender.name ? sender.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="chat-bubble-container">
                  <div className="chat-sender-info">
                    <span className="sender-name">{sender.name || 'User'}</span>
                    <span className="msg-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="chat-bubble">{msg.message}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-bar">
        <input
          type="text"
          placeholder="Message team... (@Name to mention)"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="chat-input"
        />
        <button type="submit" className="chat-send-btn">
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};

export default TeamChat;
