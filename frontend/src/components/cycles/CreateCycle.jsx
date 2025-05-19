import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCycle } from '../../store/slices/cycleSlice';
import useApi from '../../hooks/useApi';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';

const CreateCycle = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    cycleLength: '',
    periodLength: '',
  });

  const { execute, loading, error } = useApi({
    asyncAction: createCycle,
    feature: 'cycles',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert string values to appropriate types
    const cycleData = {
      ...formData,
      cycleLength: formData.cycleLength ? parseInt(formData.cycleLength) : undefined,
      periodLength: formData.periodLength ? parseInt(formData.periodLength) : undefined,
    };

    const result = await execute(cycleData);

    if (result.success) {
      navigate('/cycles');
    }
  };

  return (
    <Card className="shadow">
      <Card.Header>
        <h4 className="mb-1">Track New Cycle</h4>
        <p className="text-muted small mb-0">
          Enter the details of your new cycle
        </p>
      </Card.Header>

      <Card.Body>
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="startDate">
                <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="endDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  Leave blank if your period is still ongoing
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="cycleLength">
                <Form.Label>Cycle Length (days)</Form.Label>
                <Form.Control
                  type="number"
                  name="cycleLength"
                  min="20"
                  max="45"
                  value={formData.cycleLength}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  Typical cycle length is between 21-35 days
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="periodLength">
                <Form.Label>Period Length (days)</Form.Label>
                <Form.Control
                  type="number"
                  name="periodLength"
                  min="1"
                  max="10"
                  value={formData.periodLength}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  Typical period length is between 3-7 days
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/cycles')}
              className="me-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="purple"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CreateCycle;
