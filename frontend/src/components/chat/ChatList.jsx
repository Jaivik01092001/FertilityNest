import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getChatSessions, createChatSession } from '../../store/slices/chatSlice';
import useApi from '../../hooks/useApi';
import { Card, Button, Form, Spinner, Badge, ListGroup, Pagination, Alert } from 'react-bootstrap';
import { PlusLg, Calendar, ChatLeftText } from 'react-bootstrap-icons';

const ChatList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');

  const { chatSessions, totalSessions } = useSelector((state) => state.chat);
  const { execute: fetchSessions, loading: loadingSessions, error: sessionsError } = useApi({
    asyncAction: getChatSessions,
    feature: 'chat',
  });

  const { execute: startSession, loading: creatingSession, error: createError } = useApi({
    asyncAction: createChatSession,
    feature: 'chat',
  });

  useEffect(() => {
    loadSessions();
  }, [page, limit]);

  const loadSessions = async () => {
    await fetchSessions({ page, limit });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();

    const result = await startSession({ title: sessionTitle || undefined });

    if (result.success) {
      toast.success('Chat session created successfully');
      setIsCreating(false);
      setSessionTitle('');

      // Navigate to the new chat session
      if (result.data && result.data.chatSession) {
        navigate(`/chat/${result.data.chatSession._id}`);
      }
    } else {
      toast.error('Failed to create chat session');
    }
  };

  if (loadingSessions && chatSessions.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '250px' }}>
        <Spinner animation="border" variant="purple" />
      </div>
    );
  }

  if (sessionsError && chatSessions.length === 0) {
    return (
      <div className="text-center py-5">
        <Alert variant="danger">{sessionsError}</Alert>
        <Button
          variant="purple"
          onClick={loadSessions}
          className="mt-3"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <Card className="shadow">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h3 className="fs-4 mb-1">Chat with Anaira</h3>
          <p className="text-muted small mb-0">
            Your AI companion for fertility support
          </p>
        </div>
        <Button
          variant="purple"
          onClick={() => setIsCreating(true)}
          className="d-flex align-items-center"
        >
          <PlusLg className="me-1" /> New Chat
        </Button>
      </Card.Header>

      {isCreating && (
        <Card.Body className="border-bottom">
          <h5 className="mb-3">Start a New Chat</h5>
          <Form onSubmit={handleCreateSession}>
            <Form.Group className="mb-3">
              <Form.Label>Chat Title (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="sessionTitle"
                id="sessionTitle"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="E.g., Questions about IVF"
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button
                variant="purple"
                type="submit"
                disabled={creatingSession}
              >
                {creatingSession ? 'Creating...' : 'Start Chat'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      )}

      {createError && (
        <Alert variant="danger" className="m-3">
          {createError}
        </Alert>
      )}

      {chatSessions.length === 0 ? (
        <Card.Body className="text-center py-5">
          <ChatLeftText className="text-muted mb-3" size={48} />
          <h5>No chat sessions</h5>
          <p className="text-muted">
            Get started by creating a new chat with Anaira.
          </p>
          <Button
            variant="purple"
            onClick={() => setIsCreating(true)}
            className="mt-3 d-inline-flex align-items-center"
          >
            <PlusLg className="me-2" />
            New Chat
          </Button>
        </Card.Body>
      ) : (
        <ListGroup variant="flush">
          {chatSessions.map((session) => (
            <ListGroup.Item
              key={session._id}
              action
              as={Link}
              to={`/chat/${session._id}`}
              className="border-start-0 border-end-0"
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="mb-1 text-purple fw-medium text-truncate">
                    {session.title}
                  </h6>
                  <div className="d-flex align-items-center text-muted small">
                    {session.context?.fertilityStage && (
                      <span className="me-3">{session.context.fertilityStage}</span>
                    )}
                    <div className="d-flex align-items-center">
                      <Calendar size={14} className="me-1" />
                      <time dateTime={new Date(session.createdAt).toISOString()}>
                        {new Date(session.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                </div>
                <Badge bg="success" pill>
                  {session.messages?.length || 0} messages
                </Badge>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Pagination */}
      {totalSessions > limit && (
        <Card.Footer className="d-flex justify-content-between">
          <Pagination className="m-0">
            <Pagination.Prev
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            />
            <Pagination.Item active>{page}</Pagination.Item>
            <Pagination.Next
              onClick={() => handlePageChange(page + 1)}
              disabled={page * limit >= totalSessions}
            />
          </Pagination>
        </Card.Footer>
      )}
    </Card>
  );
};

export default ChatList;
