import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { generatePartnerCode, connectWithPartner } from '../../store/slices/partnerSlice';
import useApi from '../../hooks/useApi';
import Layout from '../layout/Layout';
import { Card, Button, Form, Nav, Alert, InputGroup } from 'react-bootstrap';
import { PersonPlusFill, Link45deg, Clipboard } from 'react-bootstrap-icons';

const PartnerConnect = () => {
  const navigate = useNavigate();
  const [partnerCode, setPartnerCode] = useState('');
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'connect'

  const { partnerInfo, partnerCode: generatedCode } = useSelector((state) => state.partner);

  const { execute: generateCode, loading: generatingCode, error: generateError } = useApi({
    asyncAction: generatePartnerCode,
    feature: 'partner',
  });

  const { execute: connect, loading: connecting, error: connectError } = useApi({
    asyncAction: connectWithPartner,
    feature: 'partner',
  });

  useEffect(() => {
    // If already connected to a partner, redirect to partner dashboard
    if (partnerInfo) {
      navigate('/partner');
    }
  }, [partnerInfo, navigate]);

  const handleGenerateCode = async () => {
    const result = await generateCode();

    if (result.success) {
      toast.success('Partner code generated successfully');
    } else {
      toast.error('Failed to generate partner code');
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();

    if (!partnerCode.trim()) {
      toast.error('Please enter a partner code');
      return;
    }

    const result = await connect(partnerCode);

    if (result.success) {
      toast.success('Connected with partner successfully');
      navigate('/partner');
    } else {
      toast.error('Failed to connect with partner');
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode)
        .then(() => {
          toast.success('Partner code copied to clipboard');
        })
        .catch(() => {
          toast.error('Failed to copy code');
        });
    }
  };

  return (
    <Layout>
      <Card className="shadow mx-auto" style={{ maxWidth: '800px' }}>
        <Card.Header>
          <h4 className="mb-1">Partner Connection</h4>
          <p className="text-muted small mb-0">
            Connect with your partner to share your fertility journey
          </p>
        </Card.Header>

        <Card.Body>
          {(generateError || connectError) && (
            <Alert variant="danger" className="mb-4">
              {generateError || connectError}
            </Alert>
          )}

          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'generate'}
                onClick={() => setActiveTab('generate')}
                className={activeTab === 'generate' ? 'text-purple border-purple' : ''}
              >
                Generate Code
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'connect'}
                onClick={() => setActiveTab('connect')}
                className={activeTab === 'connect' ? 'text-purple border-purple' : ''}
              >
                Connect with Code
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {activeTab === 'generate' ? (
            <div className="text-center">
              <PersonPlusFill className="text-muted mb-3" size={48} />
              <h5>Generate a Partner Code</h5>
              <p className="text-muted">
                Generate a unique code to share with your partner so they can connect with you.
              </p>

              {generatedCode ? (
                <div className="mt-4">
                  <div className="bg-light p-4 rounded">
                    <p className="fw-medium mb-2">Your Partner Code:</p>
                    <InputGroup className="mx-auto" style={{ maxWidth: '300px' }}>
                      <Form.Control
                        type="text"
                        readOnly
                        value={generatedCode}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={copyToClipboard}
                      >
                        <Clipboard />
                      </Button>
                    </InputGroup>
                  </div>
                  <p className="text-muted mt-3 small">
                    Share this code with your partner. They will need to enter it in the "Connect with Code" tab.
                  </p>
                  <p className="text-muted small">
                    This code will expire in 24 hours.
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  <Button
                    variant="purple"
                    onClick={handleGenerateCode}
                    disabled={generatingCode}
                    className="d-inline-flex align-items-center"
                  >
                    <Link45deg className="me-2" />
                    {generatingCode ? 'Generating...' : 'Generate Partner Code'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <Link45deg className="text-muted mb-3" size={48} />
              <h5>Connect with a Partner Code</h5>
              <p className="text-muted">
                Enter the code shared by your partner to connect with them.
              </p>

              <Form onSubmit={handleConnect} className="mt-4">
                <div className="mx-auto" style={{ maxWidth: '300px' }}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      name="partnerCode"
                      id="partnerCode"
                      required
                      value={partnerCode}
                      onChange={(e) => setPartnerCode(e.target.value)}
                      placeholder="Enter partner code"
                    />
                  </Form.Group>
                  <Button
                    type="submit"
                    variant="purple"
                    disabled={connecting || !partnerCode.trim()}
                    className="d-inline-flex align-items-center"
                  >
                    <PersonPlusFill className="me-2" />
                    {connecting ? 'Connecting...' : 'Connect with Partner'}
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </Card.Body>
      </Card>
    </Layout>
  );
};

export default PartnerConnect;
