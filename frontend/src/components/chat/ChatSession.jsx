import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getChatSession, sendMessage, setTypingStatus } from '../../store/slices/chatSlice';
import useApi from '../../hooks/useApi';
import { getSocket, initSocket } from '../../services/socketService';
import DistressButton from '../common/DistressButton';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { SendFill, ArrowLeft } from 'react-bootstrap-icons';

const ChatSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { currentSession } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { execute: fetchSession, loading: loadingSession, error: sessionError } = useApi({
    asyncAction: getChatSession,
    feature: 'chat',
  });

  const { execute: sendMsg, loading: sendingMessage, error: sendError } = useApi({
    asyncAction: sendMessage,
    feature: 'chat',
  });

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [sessionId]);

  // Initialize socket connection
  useEffect(() => {
    if (user && user._id) {
      // Initialize socket connection
      const socket = initSocket(user._id);

      // Clean up on unmount
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    setMessage('');
    e.preventDefault();

    if (!message.trim()) return;

    // Set typing status to true immediately when user sends a message
    // This will be updated by the socket event when the AI response is ready
    dispatch(setTypingStatus({ sessionId, isTyping: true }));
    fetchSession(sessionId);
    const result = await sendMsg({ sessionId, content: message });

    if (result.success) {
      setMessage('');
      fetchSession(sessionId);

      // If there was no AI response (error case), make sure typing status is reset
      if (!result.data.aiResponse) {
        dispatch(setTypingStatus({ sessionId, isTyping: false }));
      }
    } else {
      toast.error('Failed to send message');
      dispatch(setTypingStatus({ sessionId, isTyping: false }));
    }
  };

  if (loadingSession && !currentSession) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '250px' }}>
        <Spinner animation="border" variant="purple" />
      </div>
    );
  }

  if (sessionError && !currentSession) {
    return (
      <div className="text-center py-5">
        <Alert variant="danger">{sessionError}</Alert>
        <Button
          variant="purple"
          onClick={() => fetchSession(sessionId)}
          className="mt-3"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">Chat session not found</p>
        <Button
          as={Link}
          to="/chat"
          variant="purple"
          className="mt-3"
        >
          <ArrowLeft className="me-1" /> Back to Chat List
        </Button>
      </div>
    );
  }

  return (
    <Card className="shadow d-flex flex-column" style={{ height: 'calc(100vh - 8rem)' }}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1">{currentSession.title || 'Chat with Anaira'}</h4>
          <p className="text-muted small mb-0">
            {new Date(currentSession.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="d-flex gap-2">
          <DistressButton size="sm" />
          <Button
            as={Link}
            to="/chat"
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center"
          >
            <ArrowLeft className="me-1" /> Back
          </Button>
        </div>
      </Card.Header>

      {sendError && (
        <Alert variant="danger" className="m-3">
          {sendError}
        </Alert>
      )}

      <Card.Body className="flex-grow-1 overflow-auto p-3">
        <div className="d-flex flex-column gap-3">
          {currentSession.messages && currentSession.messages.length > 0 ? (
            <>
              {currentSession.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div
                    className={`p-3 rounded-3 ${msg.sender === 'user'
                      ? 'bg-purple bg-opacity-10 text-dark'
                      : 'bg-light text-dark'
                      }`}
                    style={{ maxWidth: '75%' }}
                  >
                    <div>
                      {msg.content.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < msg.content.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="mt-2 text-end small text-muted">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {currentSession.isTyping && (
                <div className="d-flex justify-content-start">
                  <div className="p-3 rounded-3 bg-light" style={{ maxWidth: '75%' }}>
                    <div className="d-flex gap-1">
                      <div className="typing-dot bg-secondary"></div>
                      <div className="typing-dot bg-secondary animation-delay-200"></div>
                      <div className="typing-dot bg-secondary animation-delay-400"></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No messages yet. Start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card.Body>

      <Card.Footer className="border-top p-3">
        <Form onSubmit={handleSendMessage}>
          <div className="d-flex gap-2">
            <Form.Group className="flex-grow-1 mb-0">
              <Form.Control
                as="textarea"
                id="message"
                name="message"
                rows="2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sendingMessage}
              />
            </Form.Group>
            <div>
              <Button
                type="submit"
                variant="purple"
                disabled={sendingMessage || !message.trim()}
                className="d-flex align-items-center h-100"
              >
                {sendingMessage ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <SendFill className="me-2" />
                )}
                Send
              </Button>
            </div>
          </div>
        </Form>
      </Card.Footer>
    </Card>
  );
};

export default ChatSession;
