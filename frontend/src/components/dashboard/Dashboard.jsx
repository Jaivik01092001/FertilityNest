import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentCycle } from '../../store/slices/cycleSlice';
import { getTodayMedications } from '../../store/slices/medicationSlice';
import useApi from '../../hooks/useApi';
import Layout from '../layout/Layout';
import DistressButton from '../common/DistressButton';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentCycle } = useSelector((state) => state.cycle);
  const { todayMedications } = useSelector((state) => state.medication);

  const cycleApi = useApi({
    asyncAction: getCurrentCycle,
    feature: 'cycles',
  });

  const medicationApi = useApi({
    asyncAction: getTodayMedications,
    feature: 'medications',
  });

  useEffect(() => {
    // Load current cycle and today's medications
    cycleApi.execute();
    medicationApi.execute();
  }, []);

  return (
    <Layout>
      <Container>
        <div className="py-4">
          <h1 className="fw-semibold">
            Welcome, {user?.name || 'User'}
          </h1>
          <p className="text-muted small">
            Here's an overview of your fertility journey
          </p>
        </div>

        <Row className="g-4">
          {/* Cycle Information */}
          <Col lg={6}>
            <Card>
              <Card.Body>
                <Card.Title>Cycle Information</Card.Title>

                {cycleApi.loading ? (
                  <div className="text-center mt-4">
                    <Spinner animation="border" variant="purple" />
                  </div>
                ) : cycleApi.error ? (
                  <div className="text-danger mt-3 small">
                    {cycleApi.error}
                  </div>
                ) : currentCycle ? (
                  <div className="mt-3">
                    <div className="d-flex justify-content-between">
                      <div>
                        <p className="text-muted small mb-1">Current Cycle</p>
                        <p className="fw-semibold">
                          Day {currentCycle.currentDay || '?'} of {currentCycle.cycleLength || '?'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted small mb-1">Started On</p>
                        <p className="fw-semibold">
                          {new Date(currentCycle.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {currentCycle.fertileWindow && (
                      <div className="mt-3">
                        <p className="text-muted small mb-1">Fertile Window</p>
                        <p className="fw-semibold text-purple">
                          {new Date(currentCycle.fertileWindow.start).toLocaleDateString()} - {new Date(currentCycle.fertileWindow.end).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="mt-4">
                      <Link
                        to="/cycles"
                        className="text-decoration-none text-purple"
                      >
                        View all cycles
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="text-muted small">No active cycle found.</p>
                    <div className="mt-3">
                      <Button
                        as={Link}
                        to="/cycles/new"
                        variant="purple"
                        size="sm"
                      >
                        Track New Cycle
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Today's Medications */}
          <Col lg={6}>
            <Card>
              <Card.Body>
                <Card.Title>Today's Medications</Card.Title>

                {medicationApi.loading ? (
                  <div className="text-center mt-4">
                    <Spinner animation="border" variant="purple" />
                  </div>
                ) : medicationApi.error ? (
                  <div className="text-danger mt-3 small">
                    {medicationApi.error}
                  </div>
                ) : todayMedications && todayMedications.length > 0 ? (
                  <div className="mt-3">
                    <ul className="list-unstyled">
                      {todayMedications.map((medication) => (
                        <li key={medication._id} className="py-2 border-bottom">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <p className="mb-0 fw-medium">{medication.name}</p>
                              <p className="text-muted small mb-0">
                                {medication.dosage} {medication.unit} - {medication.frequency}
                              </p>
                            </div>
                            <div>
                              {medication.logs && medication.logs.some(log =>
                                new Date(log.date).toDateString() === new Date().toDateString() && log.taken
                              ) ? (
                                <Badge bg="success" pill>
                                  Taken
                                </Badge>
                              ) : (
                                <Button
                                  variant="outline-purple"
                                  size="sm"
                                  onClick={() => {/* Log medication */ }}
                                >
                                  Log
                                </Button>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4">
                      <Link
                        to="/medications"
                        className="text-decoration-none text-purple"
                      >
                        View all medications
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="text-muted small">No medications scheduled for today.</p>
                    <div className="mt-3">
                      <Button
                        as={Link}
                        to="/medications/new"
                        variant="purple"
                        size="sm"
                      >
                        Add Medication
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col lg={6}>
            <Card>
              <Card.Body>
                <Card.Title>Quick Actions</Card.Title>
                <div className="mt-3">
                  <Row className="g-2">
                    <Col xs={6}>
                      <Button
                        as={Link}
                        to="/chat"
                        variant="purple"
                        className="w-100"
                      >
                        Chat with Anaira
                      </Button>
                    </Col>
                    <Col xs={6}>
                      <Button
                        as={Link}
                        to="/cycles/new"
                        variant="purple"
                        className="w-100"
                      >
                        Track New Cycle
                      </Button>
                    </Col>
                    <Col xs={6}>
                      <Button
                        as={Link}
                        to="/medications/new"
                        variant="purple"
                        className="w-100"
                      >
                        Add Medication
                      </Button>
                    </Col>
                    <Col xs={6}>
                      <Button
                        as={Link}
                        to="/community"
                        variant="purple"
                        className="w-100"
                      >
                        Join Community
                      </Button>
                    </Col>
                    <Col xs={12} className="mt-2">
                      <DistressButton fullWidth={true} />
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Partner Information */}
          <Col lg={6}>
            <Card>
              <Card.Body>
                <Card.Title>Partner Connection</Card.Title>

                {user?.partnerId ? (
                  <div className="mt-3">
                    <p className="text-muted small">You are connected with a partner.</p>
                    <div className="mt-3">
                      <Button
                        as={Link}
                        to="/partner"
                        variant="purple"
                        size="sm"
                      >
                        View Partner Portal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="text-muted small">You are not connected with a partner yet.</p>
                    <div className="mt-3">
                      <Button
                        as={Link}
                        to="/partner/connect"
                        variant="purple"
                        size="sm"
                      >
                        Connect with Partner
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default Dashboard;
