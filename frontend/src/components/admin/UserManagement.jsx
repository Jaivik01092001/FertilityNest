import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Pagination, Badge, Spinner, Modal, Alert } from 'react-bootstrap';
import { Search, PersonFillSlash, PersonFillCheck, PencilSquare, Eye } from 'react-bootstrap-icons';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: '',
    fertilityStage: '',
    journeyType: '',
    isVerified: false
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 10,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined
      };
      
      const response = await api.get('/admin/users', { params });
      
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleViewUser = async (userId) => {
    try {
      setActionLoading(true);
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data);
      setShowUserModal(true);
    } catch (err) {
      setActionError('Failed to load user details');
      console.error('Error fetching user details:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (userId) => {
    try {
      setActionLoading(true);
      const response = await api.get(`/admin/users/${userId}`);
      const user = response.data.user;
      
      setUserFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        fertilityStage: user.fertilityStage,
        journeyType: user.journeyType,
        isVerified: user.isVerified
      });
      
      setSelectedUser(response.data);
      setShowUserModal(true);
    } catch (err) {
      setActionError('Failed to load user details');
      console.error('Error fetching user details:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      setActionLoading(true);
      await api.put(`/admin/users/${selectedUser.user._id}`, userFormData);
      setShowUserModal(false);
      fetchUsers();
    } catch (err) {
      setActionError('Failed to update user');
      console.error('Error updating user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusAction = (userId, action) => {
    setSelectedUser(users.find(user => user._id === userId));
    setStatusAction(action);
    setStatusReason('');
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    try {
      setActionLoading(true);
      await api.put(`/admin/users/${selectedUser._id}/status`, {
        status: statusAction,
        reason: statusReason
      });
      setShowStatusModal(false);
      fetchUsers();
    } catch (err) {
      setActionError('Failed to update user status');
      console.error('Error updating user status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const renderPagination = () => {
    const items = [];
    
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        />
        {items}
        <Pagination.Next 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge bg="danger">Admin</Badge>;
      case 'moderator':
        return <Badge bg="warning">Moderator</Badge>;
      case 'partner':
        return <Badge bg="info">Partner</Badge>;
      default:
        return <Badge bg="secondary">User</Badge>;
    }
  };

  return (
    <>
      <Card>
        <Card.Header>
          <h3>User Management</h3>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between mb-4">
            <Form onSubmit={handleSearch} className="d-flex">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button type="submit" variant="primary">
                  <Search />
                </Button>
              </InputGroup>
            </Form>
            
            <div className="d-flex">
              <Form.Select 
                className="me-2" 
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Roles</option>
                <option value="user">Users</option>
                <option value="partner">Partners</option>
                <option value="moderator">Moderators</option>
                <option value="admin">Admins</option>
              </Form.Select>
              
              <Form.Select 
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </div>
          </div>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading users...</p>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Journey Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">No users found</td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>
                          {user.isActive ? (
                            <Badge bg="success">Active</Badge>
                          ) : (
                            <Badge bg="danger">Inactive</Badge>
                          )}
                        </td>
                        <td>{user.journeyType}</td>
                        <td>
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleViewUser(user._id)}
                          >
                            <Eye />
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleEditUser(user._id)}
                          >
                            <PencilSquare />
                          </Button>
                          {user.isActive ? (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleStatusAction(user._id, 'suspended')}
                            >
                              <PersonFillSlash />
                            </Button>
                          ) : (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleStatusAction(user._id, 'active')}
                            >
                              <PersonFillCheck />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
              
              {renderPagination()}
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* User Edit Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser?.user?.name || 'User Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionError && <Alert variant="danger">{actionError}</Alert>}
          
          {actionLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading user details...</p>
            </div>
          ) : selectedUser && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control 
                  type="text" 
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select 
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="partner">Partner</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Fertility Stage</Form.Label>
                <Form.Select 
                  value={userFormData.fertilityStage}
                  onChange={(e) => setUserFormData({...userFormData, fertilityStage: e.target.value})}
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
              
              <Form.Group className="mb-3">
                <Form.Label>Journey Type</Form.Label>
                <Form.Select 
                  value={userFormData.journeyType}
                  onChange={(e) => setUserFormData({...userFormData, journeyType: e.target.value})}
                >
                  <option value="Natural">Natural</option>
                  <option value="IVF">IVF</option>
                  <option value="IUI">IUI</option>
                  <option value="PCOS">PCOS</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox" 
                  label="Verified User" 
                  checked={userFormData.isVerified}
                  onChange={(e) => setUserFormData({...userFormData, isVerified: e.target.checked})}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateUser}
            disabled={actionLoading}
          >
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {statusAction === 'active' ? 'Activate User' : 
             statusAction === 'suspended' ? 'Suspend User' : 'Ban User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionError && <Alert variant="danger">{actionError}</Alert>}
          
          <p>
            {statusAction === 'active' 
              ? `Are you sure you want to reactivate ${selectedUser?.name}'s account?` 
              : `Are you sure you want to ${statusAction} ${selectedUser?.name}'s account?`}
          </p>
          
          {statusAction !== 'active' && (
            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Provide a reason for this action"
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={statusAction === 'active' ? 'success' : 'danger'} 
            onClick={handleUpdateStatus}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Confirm'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserManagement;
