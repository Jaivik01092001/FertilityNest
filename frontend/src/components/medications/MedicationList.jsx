import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getMedications, deleteMedication } from '../../store/slices/medicationSlice';
import useApi from '../../hooks/useApi';
import Layout from '../layout/Layout';
import { Card, Button, Form, Spinner, Alert, Badge, ListGroup, Pagination, Row, Col, Modal } from 'react-bootstrap';
import { PlusLg, PencilFill, TrashFill, Capsule } from 'react-bootstrap-icons';

const MedicationList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeFilter, setActiveFilter] = useState('true');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState(null);

  const { medications, totalMedications } = useSelector((state) => state.medication);
  const { execute, loading, error } = useApi({
    asyncAction: getMedications,
    feature: 'medications',
  });

  const { execute: executeDelete, loading: deleting, error: deleteError } = useApi({
    asyncAction: deleteMedication,
    feature: 'medications',
    onSuccess: () => {
      toast.success('Medication deleted successfully');
      loadMedications();
      setShowDeleteModal(false);
    },
  });

  useEffect(() => {
    loadMedications();
  }, [page, limit, activeFilter, categoryFilter]);

  const loadMedications = async () => {
    await execute({
      page,
      limit,
      active: activeFilter === 'all' ? undefined : activeFilter,
      category: categoryFilter || undefined
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleDeleteClick = (medication) => {
    setMedicationToDelete(medication);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (medicationToDelete) {
      await executeDelete({ id: medicationToDelete._id });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'active') {
      setActiveFilter(value);
    } else if (name === 'category') {
      setCategoryFilter(value);
    }
    setPage(1); // Reset to first page when filters change
  };

  if (loading && medications.length === 0) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '250px' }}>
          <Spinner animation="border" variant="purple" />
        </div>
      </Layout>
    );
  }

  if (error && medications.length === 0) {
    return (
      <Layout>
        <div className="text-center py-5">
          <Alert variant="danger">{error}</Alert>
          <Button
            variant="purple"
            onClick={loadMedications}
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card className="shadow">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1">Your Medications</h4>
            <p className="text-muted small mb-0">
              Track and manage your medications and supplements
            </p>
          </div>
          <Button
            as={Link}
            to="/medications/add"
            variant="purple"
            className="d-flex align-items-center"
          >
            <PlusLg className="me-1" /> Add Medication
          </Button>
        </Card.Header>

        {/* Filters */}
        <Card.Body className="bg-light border-bottom py-3">
          <Row className="align-items-center">
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  id="active"
                  name="active"
                  value={activeFilter}
                  onChange={handleFilterChange}
                >
                  <option value="all">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  id="category"
                  name="category"
                  value={categoryFilter}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  <option value="fertility">Fertility</option>
                  <option value="hormone">Hormone</option>
                  <option value="vitamin">Vitamin</option>
                  <option value="supplement">Supplement</option>
                  <option value="pain relief">Pain Relief</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>

        {medications.length === 0 ? (
          <Card.Body className="text-center py-5">
            <Capsule className="text-muted mb-3" size={48} />
            <h5>No medications found</h5>
            <p className="text-muted">
              Start tracking your medications and supplements.
            </p>
            <Button
              as={Link}
              to="/medications/add"
              variant="purple"
              className="mt-3 d-inline-flex align-items-center"
            >
              <PlusLg className="me-2" />
              Add Medication
            </Button>
          </Card.Body>
        ) : (
          <ListGroup variant="flush">
            {medications.map((medication) => (
              <ListGroup.Item
                key={medication._id}
                className="border-start-0 border-end-0 py-3"
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1 text-purple fw-medium">
                      {medication.name}
                    </h6>
                    <p className="text-muted small mb-2">
                      {medication.dosage} {medication.unit} - {medication.frequency}
                    </p>
                    <div className="d-flex align-items-center">
                      <Badge
                        bg={
                          medication.category === 'fertility' ? 'pink' :
                            medication.category === 'hormone' ? 'purple' :
                              medication.category === 'vitamin' ? 'success' :
                                medication.category === 'supplement' ? 'info' :
                                  medication.category === 'pain relief' ? 'danger' :
                                    'secondary'
                        }
                        pill
                        className="me-2"
                      >
                        {medication.category}
                      </Badge>
                      <Badge
                        bg={medication.isActive ? 'success' : 'secondary'}
                        pill
                      >
                        {medication.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Button
                      as={Link}
                      to={`/medications/${medication._id}`}
                      variant="purple"
                      size="sm"
                      className="me-2"
                    >
                      View
                    </Button>
                    <Button
                      as={Link}
                      to={`/medications/edit/${medication._id}`}
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                    >
                      <PencilFill size={14} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteClick(medication)}
                    >
                      <TrashFill size={14} />
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {/* Pagination */}
        {totalMedications > limit && (
          <Card.Footer className="d-flex justify-content-between">
            <Pagination className="m-0">
              <Pagination.Prev
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              />
              <Pagination.Item active>{page}</Pagination.Item>
              <Pagination.Next
                onClick={() => handlePageChange(page + 1)}
                disabled={page * limit >= totalMedications}
              />
            </Pagination>
          </Card.Footer>
        )}

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete {medicationToDelete?.name}? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>
    </Layout>
  );
};

export default MedicationList;
