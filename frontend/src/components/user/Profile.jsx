import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { updateProfile } from '../../store/slices/authSlice';
import useApi from '../../hooks/useApi';
import Layout from '../layout/Layout';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    fertilityStage: '',
    journeyType: '',
    dateOfBirth: '',
    phone: '',
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      privacy: {
        shareWithPartner: true,
        anonymousInCommunity: false,
      },
      theme: 'auto',
    },
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const { execute, loading, error } = useApi({
    asyncAction: updateProfile,
    feature: 'auth',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        fertilityStage: user.fertilityStage || 'Other',
        journeyType: user.journeyType || 'Natural',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        phone: user.phone || '',
        preferences: {
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            push: user.preferences?.notifications?.push ?? true,
            sms: user.preferences?.notifications?.sms ?? false,
          },
          privacy: {
            shareWithPartner: user.preferences?.privacy?.shareWithPartner ?? true,
            anonymousInCommunity: user.preferences?.privacy?.anonymousInCommunity ?? false,
          },
          theme: user.preferences?.theme || 'auto',
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      // Handle nested properties (e.g., preferences.notifications.email)
      const parts = name.split('.');
      setFormData((prev) => {
        const newData = { ...prev };
        let current = newData;

        // Navigate to the nested property
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }

        // Set the value
        current[parts[parts.length - 1]] = type === 'checkbox' ? checked : value;

        return newData;
      });
    } else {
      // Handle top-level properties
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear success message when form is changed
    if (updateSuccess) {
      setUpdateSuccess(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await execute(formData);

    if (result.success) {
      setUpdateSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '250px' }}>
          <Spinner animation="border" variant="purple" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4">
        <Card className="shadow">
          <Card.Header>
            <h4 className="mb-1">Profile Information</h4>
            <p className="text-muted small mb-0">
              Update your personal details and preferences
            </p>
          </Card.Header>

          <Card.Body>

            {error && (
              <Alert variant="danger" className="mb-4">
                <Alert.Heading as="h5">Error</Alert.Heading>
                <p className="mb-0">{error}</p>
              </Alert>
            )}

            {updateSuccess && (
              <Alert variant="success" className="mb-4">
                <Alert.Heading as="h5">Profile Updated</Alert.Heading>
                <p className="mb-0">Your profile has been updated successfully.</p>
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-light"
                    />
                    <Form.Text className="text-muted">
                      Email cannot be changed
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fertility Stage</Form.Label>
                    <Form.Select
                      id="fertilityStage"
                      name="fertilityStage"
                      value={formData.fertilityStage}
                      onChange={handleChange}
                    >
                      <option value="Trying to Conceive">Trying to Conceive</option>
                      <option value="IVF">IVF</option>
                      <option value="IUI">IUI</option>
                      <option value="PCOS Management">PCOS Management</option>
                      <option value="Pregnancy">Pregnancy</option>
                      <option value="Postpartum">Postpartum</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Journey Type</Form.Label>
                    <Form.Select
                      id="journeyType"
                      name="journeyType"
                      value={formData.journeyType}
                      onChange={handleChange}
                    >
                      <option value="Natural">Natural</option>
                      <option value="IVF">IVF</option>
                      <option value="IUI">IUI</option>
                      <option value="PCOS">PCOS</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Card className="mt-4 mb-4">
                <Card.Header>
                  <h5 className="mb-0">Notification Preferences</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="preferences.notifications.email"
                      name="preferences.notifications.email"
                      checked={formData.preferences.notifications.email}
                      onChange={handleChange}
                      label={
                        <div>
                          <span className="fw-medium">Email Notifications</span>
                          <p className="text-muted small mb-0">Receive updates and reminders via email</p>
                        </div>
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="preferences.notifications.push"
                      name="preferences.notifications.push"
                      checked={formData.preferences.notifications.push}
                      onChange={handleChange}
                      label={
                        <div>
                          <span className="fw-medium">Push Notifications</span>
                          <p className="text-muted small mb-0">Receive push notifications in your browser</p>
                        </div>
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="preferences.notifications.sms"
                      name="preferences.notifications.sms"
                      checked={formData.preferences.notifications.sms}
                      onChange={handleChange}
                      label={
                        <div>
                          <span className="fw-medium">SMS Notifications</span>
                          <p className="text-muted small mb-0">Receive text message reminders (may incur charges)</p>
                        </div>
                      }
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Privacy Preferences</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="preferences.privacy.shareWithPartner"
                      name="preferences.privacy.shareWithPartner"
                      checked={formData.preferences.privacy.shareWithPartner}
                      onChange={handleChange}
                      label={
                        <div>
                          <span className="fw-medium">Share with Partner</span>
                          <p className="text-muted small mb-0">Allow your partner to view your cycle and medication data</p>
                        </div>
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="preferences.privacy.anonymousInCommunity"
                      name="preferences.privacy.anonymousInCommunity"
                      checked={formData.preferences.privacy.anonymousInCommunity}
                      onChange={handleChange}
                      label={
                        <div>
                          <span className="fw-medium">Anonymous in Community</span>
                          <p className="text-muted small mb-0">Hide your real name in community posts and comments</p>
                        </div>
                      }
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Theme Preference</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Select
                      id="preferences.theme"
                      name="preferences.theme"
                      value={formData.preferences.theme}
                      onChange={handleChange}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System Default)</option>
                    </Form.Select>
                  </Form.Group>
                </Card.Body>
              </Card>

              <div className="d-flex justify-content-end mt-3">
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
      </div>
    </Layout>
  );
};

export default Profile;
