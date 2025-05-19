import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createCommunity } from '../../store/slices/communitySlice';
import useApi from '../../hooks/useApi';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import Layout from '../layout/Layout';

const CreateCommunity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General Support',
    rules: '',
    isPrivate: false,
    requireApproval: false
  });

  const { execute, loading, error } = useApi({
    asyncAction: createCommunity,
    feature: 'community',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.name.length < 3) {
      toast.error('Community name must be at least 3 characters');
      return;
    }

    if (formData.description.length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    const result = await execute(formData);

    if (result.success) {
      toast.success('Community created successfully');
      navigate(`/community/${result.data.community._id}`);
    } else {
      toast.error('Failed to create community');
    }
  };

  return (
    <Layout>
      <Card className="shadow mx-auto" style={{ maxWidth: '800px' }}>
        <Card.Header>
          <h4 className="mb-1">Create a New Community</h4>
          <p className="text-muted small mb-0">
            Start a supportive space for people on similar fertility journeys
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
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Community Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="E.g., IVF Warriors"
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="IVF">IVF</option>
                    <option value="IUI">IUI</option>
                    <option value="PCOS">PCOS</option>
                    <option value="Endometriosis">Endometriosis</option>
                    <option value="Pregnancy">Pregnancy</option>
                    <option value="LGBTQ+">LGBTQ+</option>
                    <option value="Single Parents">Single Parents</option>
                    <option value="General Support">General Support</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    id="description"
                    name="description"
                    rows="3"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what this community is about and who it's for..."
                  />
                  <Form.Text className="text-muted">
                    Brief description for your community. This will be displayed on the community list.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Community Rules</Form.Label>
                  <Form.Control
                    as="textarea"
                    id="rules"
                    name="rules"
                    rows="4"
                    value={formData.rules}
                    onChange={handleChange}
                    placeholder="List any specific rules or guidelines for your community..."
                  />
                  <Form.Text className="text-muted">
                    Optional. Set clear expectations for community members.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="isPrivate"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleChange}
                    label={
                      <div>
                        <span className="fw-medium">Private Community</span>
                        <p className="text-muted small mb-0">
                          If enabled, this community will not be visible in public listings and can only be joined via invitation.
                        </p>
                      </div>
                    }
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="requireApproval"
                    name="requireApproval"
                    checked={formData.requireApproval}
                    onChange={handleChange}
                    label={
                      <div>
                        <span className="fw-medium">Require Approval</span>
                        <p className="text-muted small mb-0">
                          If enabled, new members will need to be approved by a moderator before joining.
                        </p>
                      </div>
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/community')}
                className="me-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="purple"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Community'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Layout>
  );
};

export default CreateCommunity;
