import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createMedication } from '../../store/slices/medicationSlice';
import useApi from '../../hooks/useApi';
import Layout from '../layout/Layout';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { PlusCircle, XCircle } from 'react-bootstrap-icons';

const AddMedication = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    unit: 'mg',
    frequency: 'daily',
    customFrequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    timeOfDay: ['morning'],
    customTimes: [''],
    daysOfWeek: [],
    instructions: '',
    purpose: '',
    category: 'other',
    reminders: {
      enabled: true,
      reminderTime: 15,
      notificationMethod: 'push'
    },
    refillInfo: {
      refillDate: '',
      quantity: '',
      pharmacy: '',
      prescriber: '',
      reminder: {
        enabled: false,
        daysBeforeRefill: 7
      }
    }
  });

  const { execute, loading, error } = useApi({
    asyncAction: createMedication,
    feature: 'medications',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      // Handle nested properties (e.g., reminders.enabled)
      const parts = name.split('.');
      setFormData((prev) => {
        const newData = { ...prev };
        let current = newData;

        // Navigate to the nested property
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }

        // Set the value
        current[parts[parts.length - 1]] = type === 'checkbox' ? checked : value;

        return newData;
      });
    } else if (name === 'timeOfDay' || name === 'daysOfWeek') {
      // Handle multi-select arrays
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData((prev) => ({
        ...prev,
        [name]: selectedOptions
      }));
    } else {
      // Handle top-level properties
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCustomTimeChange = (index, value) => {
    setFormData((prev) => {
      const newCustomTimes = [...prev.customTimes];
      newCustomTimes[index] = value;
      return {
        ...prev,
        customTimes: newCustomTimes
      };
    });
  };

  const addCustomTime = () => {
    setFormData((prev) => ({
      ...prev,
      customTimes: [...prev.customTimes, '']
    }));
  };

  const removeCustomTime = (index) => {
    setFormData((prev) => {
      const newCustomTimes = [...prev.customTimes];
      newCustomTimes.splice(index, 1);
      return {
        ...prev,
        customTimes: newCustomTimes
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data for submission
    const medicationData = { ...formData };

    // Remove empty fields
    if (!medicationData.endDate) delete medicationData.endDate;
    if (!medicationData.customFrequency) delete medicationData.customFrequency;
    if (!medicationData.refillInfo.refillDate) delete medicationData.refillInfo.refillDate;

    // Handle custom times
    if (!medicationData.timeOfDay.includes('custom')) {
      delete medicationData.customTimes;
    }

    const result = await execute(medicationData);

    if (result.success) {
      toast.success('Medication added successfully');
      navigate('/medications');
    } else {
      toast.error('Failed to add medication');
    }
  };

  return (
    <Layout>
      <Card className="shadow mx-auto" style={{ maxWidth: '800px' }}>
        <Card.Header>
          <h4 className="mb-1">Add New Medication</h4>
          <p className="text-muted small mb-0">
            Enter details about your medication or supplement
          </p>
        </Card.Header>

        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              {/* Basic Information */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Medication Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter medication name"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="fertility">Fertility</option>
                    <option value="hormone">Hormone</option>
                    <option value="vitamin">Vitamin</option>
                    <option value="supplement">Supplement</option>
                    <option value="pain relief">Pain Relief</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Dosage <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="dosage"
                    id="dosage"
                    required
                    value={formData.dosage}
                    onChange={handleChange}
                    placeholder="Enter dosage amount"
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Control
                    type="text"
                    name="unit"
                    id="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="mg, ml, etc."
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Frequency <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    id="frequency"
                    name="frequency"
                    required
                    value={formData.frequency}
                    onChange={handleChange}
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="twice daily">Twice Daily</option>
                    <option value="three times daily">Three Times Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as needed">As Needed</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {formData.frequency === 'other' && (
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Custom Frequency</Form.Label>
                    <Form.Control
                      type="text"
                      name="customFrequency"
                      id="customFrequency"
                      value={formData.customFrequency}
                      onChange={handleChange}
                      placeholder="E.g., Every other day"
                    />
                  </Form.Group>
                </Col>
              )}

              {/* Schedule */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    id="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Leave blank if ongoing
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Time of Day <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    id="timeOfDay"
                    name="timeOfDay"
                    required
                    multiple
                    value={formData.timeOfDay}
                    onChange={handleChange}
                    style={{ height: '150px' }}
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                    <option value="custom">Custom Times</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Hold Ctrl/Cmd to select multiple
                  </Form.Text>
                </Form.Group>
              </Col>

              {formData.timeOfDay.includes('custom') && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Custom Times</Form.Label>
                    <div className="d-flex flex-column gap-2">
                      {formData.customTimes.map((time, index) => (
                        <div key={index} className="d-flex align-items-center">
                          <Form.Control
                            type="time"
                            value={time}
                            onChange={(e) => handleCustomTimeChange(index, e.target.value)}
                          />
                          {index > 0 && (
                            <Button
                              variant="link"
                              className="text-danger ms-2 p-0"
                              onClick={() => removeCustomTime(index)}
                            >
                              <XCircle size={20} />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline-purple"
                        size="sm"
                        className="mt-2 d-inline-flex align-items-center"
                        onClick={addCustomTime}
                      >
                        <PlusCircle className="me-1" size={16} /> Add Time
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              )}

              {(formData.frequency === 'weekly' || formData.frequency === 'other') && (
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Days of Week</Form.Label>
                    <Form.Select
                      id="daysOfWeek"
                      name="daysOfWeek"
                      multiple
                      value={formData.daysOfWeek}
                      onChange={handleChange}
                      style={{ height: '200px' }}
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Hold Ctrl/Cmd to select multiple
                    </Form.Text>
                  </Form.Group>
                </Col>
              )}

              {/* Additional Information */}
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Purpose</Form.Label>
                  <Form.Control
                    type="text"
                    name="purpose"
                    id="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    placeholder="E.g., For fertility support"
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Instructions</Form.Label>
                  <Form.Control
                    as="textarea"
                    id="instructions"
                    name="instructions"
                    rows="3"
                    value={formData.instructions}
                    onChange={handleChange}
                    placeholder="E.g., Take with food"
                  />
                </Form.Group>
              </Col>

              {/* Reminders */}
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="reminders.enabled"
                    name="reminders.enabled"
                    checked={formData.reminders.enabled}
                    onChange={handleChange}
                    label={
                      <div>
                        <span className="fw-medium">Enable Reminders</span>
                        <p className="text-muted small mb-0">Receive reminders to take this medication</p>
                      </div>
                    }
                  />
                </Form.Group>
              </Col>

              {formData.reminders.enabled && (
                <>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reminder Time (minutes before)</Form.Label>
                      <Form.Control
                        type="number"
                        name="reminders.reminderTime"
                        id="reminders.reminderTime"
                        min="0"
                        max="60"
                        value={formData.reminders.reminderTime}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Notification Method</Form.Label>
                      <Form.Select
                        id="reminders.notificationMethod"
                        name="reminders.notificationMethod"
                        value={formData.reminders.notificationMethod}
                        onChange={handleChange}
                      >
                        <option value="push">Push Notification</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="all">All Methods</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </>
              )}
            </Row>
            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/medications')}
                className="me-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                variant="purple"
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Layout>
  );
};

export default AddMedication;
