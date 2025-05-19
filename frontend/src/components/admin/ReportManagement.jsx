import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner } from 'react-bootstrap';
import api from '../../services/api';

const ReportManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card>
      <Card.Header>
        <h3>Report Management</h3>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading reports...</p>
          </div>
        ) : (
          <Alert variant="info">
            <h4>Coming Soon</h4>
            <p>The report management interface is under development and will be available soon.</p>
            <p>This section will allow administrators to:</p>
            <ul>
              <li>Review reported content from community posts</li>
              <li>Approve or reject reported content</li>
              <li>Take moderation actions on inappropriate content</li>
              <li>Send notifications to users about moderation decisions</li>
              <li>View a history of moderation actions</li>
            </ul>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default ReportManagement;
