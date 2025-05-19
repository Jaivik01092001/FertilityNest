import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';
import GeminiApiSettings from './GeminiApiSettings';
import { Container, Row, Col, Card, Nav } from 'react-bootstrap';

const Settings = () => {
  return (
    <Layout>
      <Container className="py-4">
        <h3 className="mb-4">Settings</h3>

        <Row className="g-4">
          {/* Sidebar */}
          <Col md={4} lg={3}>
            <Card className="shadow">
              <Card.Header>
                <h5 className="mb-0">Settings Menu</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Nav className="flex-column">
                  <Nav.Link
                    as={Link}
                    to="/profile"
                    className="border-bottom"
                  >
                    Profile Settings
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/change-password"
                    className="border-bottom"
                  >
                    Change Password
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/emergency-contacts"
                    className="border-bottom"
                  >
                    Emergency Contacts
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/settings"
                    active
                    className="border-bottom"
                  >
                    AI Settings
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/partner/connect"
                  >
                    Partner Connection
                  </Nav.Link>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* Main content */}
          <Col md={8} lg={9}>
            <GeminiApiSettings />

            {/* Additional settings sections can be added here */}
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default Settings;
