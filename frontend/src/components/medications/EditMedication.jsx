import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMedication, updateMedication } from '../../store/slices/medicationSlice';
import useApi from '../../hooks/useApi';
import Layout from '../layout/Layout';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { PlusCircle, XCircle } from 'react-bootstrap-icons';

const EditMedication = () => {
  const { medicationId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    unit: 'mg',
    frequency: 'daily',
    customFrequency: '',
    startDate: '',
    endDate: '',
    timeOfDay: ['morning'],
    customTimes: [''],
    daysOfWeek: [],
    instructions: '',
    purpose: '',
    category: 'other',
    isActive: true,
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

  const { execute: fetchMedication, loading: loadingMedication, error: medicationError } = useApi({
    asyncAction: getMedication,
    feature: 'medications',
  });

  const { execute: updateMed, loading: updatingMedication, error: updateError } = useApi({
    asyncAction: updateMedication,
    feature: 'medications',
  });

  useEffect(() => {
    if (medicationId) {
      loadMedication();
    }
  }, [medicationId]);

  const loadMedication = async () => {
    const result = await fetchMedication(medicationId);

    if (result.success && result.data.medication) {
      const medication = result.data.medication;

      // Format dates for form inputs
      const startDate = medication.startDate ? new Date(medication.startDate).toISOString().split('T')[0] : '';
      const endDate = medication.endDate ? new Date(medication.endDate).toISOString().split('T')[0] : '';
      const refillDate = medication.refillInfo?.refillDate ? new Date(medication.refillInfo.refillDate).toISOString().split('T')[0] : '';

      setFormData({
        ...medication,
        startDate,
        endDate,
        refillInfo: {
          ...medication.refillInfo,
          refillDate
        },
        // Ensure arrays are properly initialized
        timeOfDay: medication.timeOfDay || ['morning'],
        customTimes: medication.customTimes || [''],
        daysOfWeek: medication.daysOfWeek || []
      });
    }
  };

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

    const result = await updateMed({
      id: medicationId,
      medicationData
    });

    if (result.success) {
      toast.success('Medication updated successfully');
      navigate(`/medications/${medicationId}`);
    } else {
      toast.error('Failed to update medication');
    }
  };

  if (loadingMedication && !formData.name) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '250px' }}>
          <Spinner animation="border" variant="purple" />
        </div>
      </Layout>
    );
  }

  if (medicationError && !formData.name) {
    return (
      <Layout>
        <div className="text-center py-5">
          <Alert variant="danger">{medicationError}</Alert>
          <Button
            variant="purple"
            onClick={loadMedication}
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
      <Card className="shadow mx-auto" style={{ maxWidth: '800px' }}>
        <Card.Header>
          <h4 className="mb-1">Edit Medication</h4>
          <p className="text-muted small mb-0">
            Update details for {formData.name}
          </p>
        </Card.Header>

        <Card.Body>
          {(medicationError || updateError) && (
            <Alert variant="danger" className="mb-4">
              {medicationError || updateError}
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
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Custom Frequency</Form.Label>
                    <Form.Control
                      type="text"
                      name="customFrequency"
                      id="customFrequency"
                      value={formData.customFrequency || ''}
                      onChange={handleChange}
                      placeholder="E.g., Every other day"
                    />
                  </Form.Group>
                </Col>
              )}

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    label={
                      <div>
                        <span className="fw-medium">Active</span>
                        <p className="text-muted small mb-0">Medication is currently being taken</p>
                      </div>
                    }
                  />
                </Form.Group>
              </Col>

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
                    value={formData.endDate || ''}
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
                    size="5"
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
                    <div className="mb-2">
                      {formData.customTimes.map((time, index) => (
                        <div key={index} className="d-flex align-items-center mb-2">
                          <Form.Control
                            type="time"
                            value={time}
                            onChange={(e) => handleCustomTimeChange(index, e.target.value)}
                            className="me-2"
                          />
                          {index > 0 && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeCustomTime(index)}
                            >
                              <XCircle size={16} />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={addCustomTime}
                        className="d-flex align-items-center"
                      >
                        <PlusCircle size={16} className="me-1" /> Add Time
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              )}

              {(formData.frequency === 'weekly' || formData.frequency === 'other') && (
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Days of Week</Form.Label>
                    <Form.Select
                      id="daysOfWeek"
                      name="daysOfWeek"
                      multiple
                      value={formData.daysOfWeek}
                      onChange={handleChange}
                      size="7"
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
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Purpose</Form.Label>
                  <Form.Control
                    type="text"
                    name="purpose"
                    id="purpose"
                    value={formData.purpose || ''}
                    onChange={handleChange}
                    placeholder="E.g., For fertility support"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Instructions</Form.Label>
                  <Form.Control
                    as="textarea"
                    id="instructions"
                    name="instructions"
                    rows={3}
                    value={formData.instructions || ''}
                    onChange={handleChange}
                    placeholder="E.g., Take with food"
                  />
                </Form.Group>
              </Col>

              {/* Reminders */}
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="reminders.enabled"
                    name="reminders.enabled"
                    checked={formData.reminders?.enabled}
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

              {formData.reminders?.enabled && (
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
                        value={formData.reminders?.reminderTime || 15}
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
                        value={formData.reminders?.notificationMethod || 'push'}
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
                onClick={() => navigate(`/medications/${medicationId}`)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatingMedication}
                variant="purple"
              >
                {updatingMedication ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Layout>
  );
};

export default EditMedication;
