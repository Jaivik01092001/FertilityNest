import React from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { PeopleFill, PersonFillGear, ChatDots, Calendar3, Capsule, Collection } from 'react-bootstrap-icons';

const SystemStats = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading system statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert variant="info">
        No statistics available.
      </Alert>
    );
  }

  const { users, communities, cycles, medications, chat } = stats;

  return (
    <>
      <h2 className="mb-4">System Statistics</h2>
      
      <Row>
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <PeopleFill size={24} className="text-primary" />
                </div>
                <h5 className="card-title mb-0">Users</h5>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Users:</span>
                <span className="fw-bold">{users.total}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Active Users:</span>
                <span className="fw-bold">{users.active}</span>
              </div>
              <div className="mt-3">
                <h6>Users by Role:</h6>
                <div className="d-flex justify-content-between mb-1">
                  <span>Users:</span>
                  <span className="fw-bold">{users.byRole.user || 0}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Partners:</span>
                  <span className="fw-bold">{users.byRole.partner || 0}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Admins:</span>
                  <span className="fw-bold">{users.byRole.admin || 0}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Moderators:</span>
                  <span className="fw-bold">{users.byRole.moderator || 0}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                  <Collection size={24} className="text-success" />
                </div>
                <h5 className="card-title mb-0">Communities</h5>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Communities:</span>
                <span className="fw-bold">{communities.total}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Active Communities:</span>
                <span className="fw-bold">{communities.active}</span>
              </div>
              <div className="mt-3">
                <h6>Communities by Category:</h6>
                {Object.entries(communities.byCategory || {}).map(([category, count]) => (
                  <div key={category} className="d-flex justify-content-between mb-1">
                    <span>{category}:</span>
                    <span className="fw-bold">{count}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                  <ChatDots size={24} className="text-info" />
                </div>
                <h5 className="card-title mb-0">Chat</h5>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Chat Sessions:</span>
                <span className="fw-bold">{chat.total}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Distress Detected:</span>
                <span className="fw-bold">{chat.distressDetected}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Distress Rate:</span>
                <span className="fw-bold">
                  {chat.total > 0 ? ((chat.distressDetected / chat.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                  <Calendar3 size={24} className="text-warning" />
                </div>
                <h5 className="card-title mb-0">Cycles</h5>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Cycles:</span>
                <span className="fw-bold">{cycles.total}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Average Cycles per User:</span>
                <span className="fw-bold">
                  {users.total > 0 ? (cycles.total / users.total).toFixed(1) : 0}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                  <Capsule size={24} className="text-danger" />
                </div>
                <h5 className="card-title mb-0">Medications</h5>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Medications:</span>
                <span className="fw-bold">{medications.total}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Active Medications:</span>
                <span className="fw-bold">{medications.active}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Average Medications per User:</span>
                <span className="fw-bold">
                  {users.total > 0 ? (medications.total / users.total).toFixed(1) : 0}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default SystemStats;
