import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner } from 'react-bootstrap';
import api from '../../services/api';

const TrackerManagement = () => {
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
        <h3>Tracker Configuration</h3>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading tracker configurations...</p>
          </div>
        ) : (
          <Alert variant="info">
            <h4>Coming Soon</h4>
            <p>The tracker configuration interface is under development and will be available soon.</p>
            <p>This section will allow administrators to:</p>
            <ul>
              <li>Create and manage tracker configurations for different journey types</li>
              <li>Customize fields and options for cycle tracking</li>
              <li>Configure medication tracking templates</li>
              <li>Set up symptom and mood tracking options</li>
              <li>Define default values and validation rules</li>
            </ul>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default TrackerManagement;
