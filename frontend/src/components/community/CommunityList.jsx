import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getCommunities, joinCommunity } from '../../store/slices/communitySlice';
import useApi from '../../hooks/useApi';
import { Card, Button, Form, Spinner, Alert, Badge, ListGroup, Pagination, Row, Col } from 'react-bootstrap';
import { PlusLg, People } from 'react-bootstrap-icons';

const CommunityList = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('');

  const { communities, userCommunities, totalCommunities } = useSelector((state) => state.community);
  const { execute: fetchCommunities, loading: loadingCommunities, error: communitiesError } = useApi({
    asyncAction: getCommunities,
    feature: 'community',
  });

  const { execute: join, loading: joiningCommunity, error: joinError } = useApi({
    asyncAction: joinCommunity,
    feature: 'community',
  });

  useEffect(() => {
    loadCommunities();
  }, [page, limit, categoryFilter]);

  const loadCommunities = async () => {
    await fetchCommunities({
      page,
      limit,
      category: categoryFilter || undefined
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  const handleJoinCommunity = async (communityId) => {
    const result = await join(communityId);

    if (result.success) {
      toast.success('Successfully joined community');
    } else {
      toast.error('Failed to join community');
    }
  };

  const isUserInCommunity = (communityId) => {
    return userCommunities.some(community => community._id === communityId);
  };

  if (loadingCommunities && communities.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '250px' }}>
        <Spinner animation="border" variant="purple" />
      </div>
    );
  }

  if (communitiesError && communities.length === 0) {
    return (
      <div className="text-center py-5">
        <Alert variant="danger">{communitiesError}</Alert>
        <Button
          variant="purple"
          onClick={loadCommunities}
          className="mt-3"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <Card className="shadow">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1">Community Circles</h4>
          <p className="text-muted small mb-0">
            Connect with others on similar fertility journeys
          </p>
        </div>
        <Button
          as={Link}
          to="/community/create"
          variant="purple"
          className="d-flex align-items-center"
        >
          <PlusLg className="me-1" /> Create Community
        </Button>
      </Card.Header>

      {joinError && (
        <Alert variant="danger" className="m-3">
          {joinError}
        </Alert>
      )}

      {/* Filters */}
      <Card.Body className="bg-light border-bottom py-3">
        <Row className="align-items-center">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Select
                id="category"
                name="category"
                value={categoryFilter}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
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
          <Col md={6} className="d-flex justify-content-md-end mt-3 mt-md-0">
            <Button
              as={Link}
              to="/community/my-communities"
              variant="outline-secondary"
            >
              My Communities
            </Button>
          </Col>
        </Row>
      </Card.Body>

      {communities.length === 0 ? (
        <Card.Body className="text-center py-5">
          <People className="text-muted mb-3" size={48} />
          <h5>No communities found</h5>
          <p className="text-muted">
            {categoryFilter
              ? `No communities found in the ${categoryFilter} category.`
              : 'Get started by creating a new community.'}
          </p>
          <Button
            as={Link}
            to="/community/create"
            variant="purple"
            className="mt-3 d-inline-flex align-items-center"
          >
            <PlusLg className="me-2" />
            Create Community
          </Button>
        </Card.Body>
      ) : (
        <ListGroup variant="flush">
          {communities.map((community) => (
            <ListGroup.Item key={community._id} className="border-start-0 border-end-0 py-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5>
                    <Link
                      to={`/community/${community._id}`}
                      className="text-decoration-none text-purple"
                    >
                      {community.name}
                    </Link>
                  </h5>
                  <p className="text-muted mb-2">
                    {community.description}
                  </p>
                  <div className="d-flex align-items-center">
                    <Badge bg="purple" pill className="me-2">
                      {community.category}
                    </Badge>
                    <small className="text-muted">
                      {community.memberCount || 0} members
                    </small>
                  </div>
                </div>
                <div>
                  {isUserInCommunity(community._id) ? (
                    <Button
                      as={Link}
                      to={`/community/${community._id}`}
                      variant="purple"
                      size="sm"
                    >
                      View
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleJoinCommunity(community._id)}
                      disabled={joiningCommunity}
                      variant="success"
                      size="sm"
                    >
                      {joiningCommunity ? 'Joining...' : 'Join'}
                    </Button>
                  )}
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Pagination */}
      {totalCommunities > limit && (
        <Card.Footer className="d-flex justify-content-between">
          <Pagination className="m-0">
            <Pagination.Prev
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            />
            <Pagination.Item active>{page}</Pagination.Item>
            <Pagination.Next
              onClick={() => handlePageChange(page + 1)}
              disabled={page * limit >= totalCommunities}
            />
          </Pagination>
        </Card.Footer>
      )}
    </Card>
  );
};

export default CommunityList;
