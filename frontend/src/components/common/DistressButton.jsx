import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Modal, ListGroup, Button, Form } from 'react-bootstrap';
import { ExclamationTriangleFill, SendFill } from 'react-bootstrap-icons';

// Support resources to display when no partner is connected
const SUPPORT_RESOURCES = [
  {
    name: 'National Suicide Prevention Lifeline',
    contact: '1-800-273-8255',
    message: 'Available 24/7 for emotional support during crisis situations.'
  },
  {
    name: 'Crisis Text Line',
    contact: 'Text HOME to 741741',
    message: 'Free 24/7 support from trained crisis counselors.'
  },
  {
    name: 'SAMHSA National Helpline',
    contact: '1-800-662-4357',
    message: 'Treatment referral and information service for individuals facing mental health or substance use disorders.'
  },
  {
    name: 'Postpartum Support International',
    contact: '1-800-944-4773',
    message: 'Support for individuals experiencing postpartum depression, anxiety, or other mood disorders.'
  }
];

/**
 * Distress Button Component
 *
 * A button that when pressed:
 * 1. Checks if a connected partner is set
 * 2. If yes: triggers an alert to notify the partner
 * 3. If no: shows a modal with local support resources
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant (default: 'error')
 * @param {string} props.size - Button size (default: 'md')
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
const DistressButton = ({
  variant = 'error',
  size = 'md',
  className = '',
  ...props
}) => {
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { partnerInfo } = useSelector((state) => state.partner);

  // State for distress message
  const [distressMessage, setDistressMessage] = useState('');
  const [showDistressModal, setShowDistressModal] = useState(false);

  // Handle distress button click
  const handleDistressClick = () => {
    // If user has a partner, show distress message modal
    if (user?.partnerId) {
      setShowDistressModal(true);
    } else {
      // If no partner, show support resources modal
      setShowModal(true);
    }
  };

  // Handle sending distress signal
  const handleSendDistressSignal = async () => {
    if (!user?.partnerId) {
      setShowModal(true);
      return;
    }

    try {
      setSending(true);
      const response = await api.post('/partners/distress', {
        message: distressMessage || 'I need support right now. Please reach out to me.',
        location: 'App distress button',
        urgency: 'high'
      });

      if (response.data.success) {
        toast.success('Your partner has been notified.');
        setShowDistressModal(false);
        setDistressMessage('');
      } else {
        toast.error('Failed to send notification. Please try again.');
        console.error('Distress signal error:', response.data);
      }
    } catch (error) {
      toast.error('Failed to send notification. Please try again.');
      console.error('Distress signal error:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        variant="danger"
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : null}
        className={`fw-bold ${className}`}
        onClick={handleDistressClick}
        disabled={sending}
        {...props}
      >
        {sending ? 'Sending...' : 'Distress Signal'}
      </Button>

      {/* Support Resources Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="d-flex align-items-center">
              <div className="me-3 bg-danger bg-opacity-10 rounded-circle p-2">
                <ExclamationTriangleFill className="text-danger" size={24} />
              </div>
              Support Resources
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">
            We understand you may be going through a difficult time. Here are some resources that can provide immediate support:
          </p>

          <ListGroup className="mt-3">
            {SUPPORT_RESOURCES.map((resource, index) => (
              <ListGroup.Item key={index} className="border-start-0 border-end-0">
                <p className="fw-medium mb-1">{resource.name}</p>
                <p className="fw-bold text-purple mb-1">{resource.contact}</p>
                <p className="text-muted small mb-0">{resource.message}</p>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="purple"
            onClick={() => setShowModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Distress Message Modal */}
      <Modal show={showDistressModal} onHide={() => setShowDistressModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="d-flex align-items-center">
              <div className="me-3 bg-danger bg-opacity-10 rounded-circle p-2">
                <ExclamationTriangleFill className="text-danger" size={24} />
              </div>
              Send Distress Signal
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This will send an urgent notification to your partner{partnerInfo ? ` (${partnerInfo.name})` : ''}.
          </p>

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Message (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={distressMessage}
                onChange={(e) => setDistressMessage(e.target.value)}
                placeholder="Add a personal message to your partner..."
              />
              <Form.Text className="text-muted">
                If left empty, a default message will be sent.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDistressModal(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleSendDistressSignal}
            disabled={sending}
            className="d-flex align-items-center"
          >
            {sending ? (
              <>Sending...</>
            ) : (
              <>
                <SendFill className="me-2" /> Send Signal
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DistressButton;
