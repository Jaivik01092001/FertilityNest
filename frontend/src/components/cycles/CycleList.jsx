import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getCycles } from '../../store/slices/cycleSlice';
import useApi from '../../hooks/useApi';
import Layout from '../layout/Layout';
import { Card, Button, Spinner, Alert, ListGroup, Badge, Pagination } from 'react-bootstrap';
import { PlusLg, Calendar } from 'react-bootstrap-icons';

const CycleList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { cycles, totalCycles } = useSelector((state) => state.cycle);
  const { execute, loading, error } = useApi({
    asyncAction: getCycles,
    feature: 'cycles',
  });

  useEffect(() => {
    loadCycles();
  }, [page, limit]);

  const loadCycles = async () => {
    await execute({ page, limit });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleViewCycle = (cycleId) => {
    navigate(`/cycles/${cycleId}`);
  };

  if (loading && cycles.length === 0) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '250px' }}>
          <Spinner animation="border" variant="purple" />
        </div>
      </Layout>
    );
  }

  if (error && cycles.length === 0) {
    return (
      <Layout>
        <div className="text-center py-5">
          <Alert variant="danger">{error}</Alert>
          <Button
            variant="purple"
            onClick={loadCycles}
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      </Layout>
    );
  }

  if (cycles.length === 0) {
    return (
      <Layout>
        <Card className="shadow">
          <Card.Body className="text-center py-5">
            <Calendar className="text-muted mb-3" size={48} />
            <h5>No cycles found</h5>
            <p className="text-muted">
              Start tracking your menstrual and fertility cycles.
            </p>
            <Button
              as={Link}
              to="/cycles/new"
              variant="purple"
              className="mt-3 d-inline-flex align-items-center"
            >
              <PlusLg className="me-2" />
              Track New Cycle
            </Button>
          </Card.Body>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card className="shadow">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1">Your Cycles</h4>
            <p className="text-muted small mb-0">
              Track and manage your menstrual and fertility cycles
            </p>
          </div>
          <Button
            as={Link}
            to="/cycles/new"
            variant="purple"
            className="d-flex align-items-center"
          >
            <PlusLg className="me-1" /> New Cycle
          </Button>
        </Card.Header>

        <ListGroup variant="flush">
          {cycles.map((cycle) => (
            <ListGroup.Item
              key={cycle._id}
              className="border-start-0 border-end-0 py-3"
              action
              onClick={() => handleViewCycle(cycle._id)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1 text-purple fw-medium">
                    {new Date(cycle.startDate).toLocaleDateString()} -
                    {cycle.endDate
                      ? new Date(cycle.endDate).toLocaleDateString()
                      : 'Ongoing'}
                  </h6>
                  <div className="d-flex align-items-center text-muted small">
                    <Badge bg={cycle.endDate ? "secondary" : "success"} pill className="me-2">
                      {cycle.endDate ? "Completed" : "Active"}
                    </Badge>
                    <span>{cycle.cycleLength ? `${cycle.cycleLength} days` : 'Length not set'}</span>
                  </div>
                </div>
                <Button
                  variant="outline-purple"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewCycle(cycle._id);
                  }}
                >
                  View Details
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>

        {/* Pagination */}
        {totalCycles > limit && (
          <Card.Footer className="d-flex justify-content-between">
            <Pagination className="m-0">
              <Pagination.Prev
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              />
              <Pagination.Item active>{page}</Pagination.Item>
              <Pagination.Next
                onClick={() => handlePageChange(page + 1)}
                disabled={page * limit >= totalCycles}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>
    </Layout>
  );
};

export default CycleList;
