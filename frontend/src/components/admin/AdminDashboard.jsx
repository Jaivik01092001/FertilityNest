import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Container, Row, Col, Card, Nav, Tab, Alert } from 'react-bootstrap';
import { PieChart, BarChart, PersonFillGear, PeopleFill, ChatDots, Calendar3, Capsule } from 'react-bootstrap-icons';
import Layout from '../layout/Layout';
import UserManagement from './UserManagement';
import CommunityManagement from './CommunityManagement';
import TrackerManagement from './TrackerManagement';
import ReportManagement from './ReportManagement';
import SystemStats from './SystemStats';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/stats');
        setStats(response.data.stats);
        setError(null);
      } catch (err) {
        setError('Failed to load system statistics');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return <SystemStats stats={stats} loading={loading} error={error} />;
      case 'users':
        return <UserManagement />;
      case 'communities':
        return <CommunityManagement />;
      case 'trackers':
        return <TrackerManagement />;
      case 'reports':
        return <ReportManagement />;
      default:
        return <SystemStats stats={stats} loading={loading} error={error} />;
    }
  };

  return (
    <Layout>
      <Container fluid className="py-4">
        <h1 className="mb-4">Admin Dashboard</h1>
        
        <Row>
          <Col md={3} lg={2} className="mb-4">
            <Card>
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'stats'} 
                      onClick={() => setActiveTab('stats')}
                      className="d-flex align-items-center"
                    >
                      <PieChart className="me-2" /> Statistics
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'users'} 
                      onClick={() => setActiveTab('users')}
                      className="d-flex align-items-center"
                    >
                      <PersonFillGear className="me-2" /> User Management
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'communities'} 
                      onClick={() => setActiveTab('communities')}
                      className="d-flex align-items-center"
                    >
                      <PeopleFill className="me-2" /> Communities
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'trackers'} 
                      onClick={() => setActiveTab('trackers')}
                      className="d-flex align-items-center"
                    >
                      <Calendar3 className="me-2" /> Tracker Config
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'reports'} 
                      onClick={() => setActiveTab('reports')}
                      className="d-flex align-items-center"
                    >
                      <ChatDots className="me-2" /> Reports
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={9} lg={10}>
            {renderTabContent()}
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default AdminDashboard;
