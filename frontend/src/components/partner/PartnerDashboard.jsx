import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Container, Row, Col, Card, Button, Spinner, Badge, ListGroup } from 'react-bootstrap';
import { PeopleFill, Calendar3, Capsule } from 'react-bootstrap-icons';
import { getPartnerInfo, getPartnerCycles, getPartnerMedications } from '../../store/slices/partnerSlice';
import useApi from '../../hooks/useApi';
import Layout from '../layout/Layout';

const PartnerDashboard = () => {
  const { partnerInfo, partnerCycles, partnerMedications } = useSelector((state) => state.partner);

  const { execute: fetchInfo, loading: loadingInfo, error: infoError } = useApi({
    asyncAction: getPartnerInfo,
    feature: 'partner',
  });

  const { execute: fetchCycles, loading: loadingCycles, error: cyclesError } = useApi({
    asyncAction: getPartnerCycles,
    feature: 'partner',
  });

  const { execute: fetchMedications, loading: loadingMedications, error: medicationsError } = useApi({
    asyncAction: getPartnerMedications,
    feature: 'partner',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchInfo();
    await fetchCycles();
    await fetchMedications();
  };

  if (loadingInfo && !partnerInfo) {
    return (
      <Layout>
        <Container className="py-4">
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading partner information...</p>
          </div>
        </Container>
      </Layout>
    );
  }

  if (infoError && !partnerInfo) {
    return (
      <Layout>
        <Container className="py-4">
          <div className="text-center py-4">
            <p className="text-danger">{infoError}</p>
            <Button
              variant="primary"
              onClick={loadData}
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        </Container>
      </Layout>
    );
  }

  if (!partnerInfo) {
    return (
      <Layout>
        <Container className="py-4">
          <Card>
            <Card.Header>
              <h3>Partner Connection</h3>
              <p className="text-muted mb-0">
                Connect with your partner to share your fertility journey
              </p>
            </Card.Header>
            <Card.Body className="text-center py-5">
              <PeopleFill size={48} className="text-secondary mb-3" />
              <h4>No partner connected</h4>
              <p className="text-muted">
                You haven't connected with a partner yet.
              </p>
              <Button
                as={Link}
                to="/partner/connect"
                variant="primary"
                className="mt-3"
              >
                Connect with Partner
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="py-4">
        <h1 className="mb-4">Partner Dashboard</h1>
        <p className="text-muted mb-4">Connected with {partnerInfo.name}</p>

        {(infoError || cyclesError || medicationsError) && (
          <div className="alert alert-danger">
            {infoError || cyclesError || medicationsError}
          </div>
        )}

        <Row className="g-4">
          {/* Partner Information */}
          <Col md={6}>
            <Card className="h-100">
              <Card.Header className="d-flex align-items-center">
                <PeopleFill className="me-2" />
                <h5 className="mb-0">Partner Information</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col sm={6} className="mb-3">
                    <h6 className="text-muted">Name</h6>
                    <p>{partnerInfo.name}</p>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <h6 className="text-muted">Email</h6>
                    <p>{partnerInfo.email}</p>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <h6 className="text-muted">Fertility Stage</h6>
                    <p>{partnerInfo.fertilityStage || 'Not specified'}</p>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <h6 className="text-muted">Journey Type</h6>
                    <p>{partnerInfo.journeyType || 'Not specified'}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Cycle Information */}
          <Col md={6}>
            <Card className="h-100">
              <Card.Header className="d-flex align-items-center">
                <Calendar3 className="me-2" />
                <h5 className="mb-0">Current Cycle</h5>
              </Card.Header>
              <Card.Body>
                {loadingCycles ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : partnerCycles && partnerCycles.length > 0 ? (
                  <>
                    <Row className="mb-3">
                      <Col sm={6}>
                        <h6 className="text-muted">Current Cycle</h6>
                        <p className="fs-5 fw-bold">
                          Day {partnerCycles[0].currentDay || '?'} of {partnerCycles[0].cycleLength || '?'}
                        </p>
                      </Col>
                      <Col sm={6}>
                        <h6 className="text-muted">Started On</h6>
                        <p className="fs-5 fw-bold">
                          {new Date(partnerCycles[0].startDate).toLocaleDateString()}
                        </p>
                      </Col>
                    </Row>

                    {partnerCycles[0].fertileWindow && (
                      <div className="mb-3">
                        <h6 className="text-muted">Fertile Window</h6>
                        <p className="fs-5 fw-bold text-primary">
                          {new Date(partnerCycles[0].fertileWindow.start).toLocaleDateString()} - {new Date(partnerCycles[0].fertileWindow.end).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="mt-3">
                      <Button
                        as={Link}
                        to="/partner/cycles"
                        variant="outline-primary"
                        size="sm"
                      >
                        View all cycles
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-muted">No active cycle found.</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Today's Medications */}
          <Col md={12}>
            <Card>
              <Card.Header className="d-flex align-items-center">
                <Capsule className="me-2" />
                <h5 className="mb-0">Today's Medications</h5>
              </Card.Header>
              <Card.Body>
                {loadingMedications ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : partnerMedications && partnerMedications.length > 0 ? (
                  <>
                    <ListGroup>
                      {partnerMedications.map((medication) => (
                        <ListGroup.Item key={medication._id} className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6>{medication.name}</h6>
                            <p className="text-muted mb-0">
                              {medication.dosage} {medication.unit} - {medication.frequency}
                            </p>
                          </div>
                          <div>
                            {medication.logs && medication.logs.some(log =>
                              new Date(log.date).toDateString() === new Date().toDateString() && log.taken
                            ) ? (
                              <Badge bg="success">Taken</Badge>
                            ) : medication.logs && medication.logs.some(log =>
                              new Date(log.date).toDateString() === new Date().toDateString() && !log.taken
                            ) ? (
                              <Badge bg="warning">Skipped</Badge>
                            ) : (
                              <Badge bg="secondary">Pending</Badge>
                            )}
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>

                    <div className="mt-3">
                      <Button
                        as={Link}
                        to="/partner/medications"
                        variant="outline-primary"
                        size="sm"
                      >
                        View all medications
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-muted">No medications scheduled for today.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default PartnerDashboard;
