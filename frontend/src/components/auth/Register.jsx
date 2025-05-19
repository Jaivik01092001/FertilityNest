import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import useApi from '../../hooks/useApi';
import { Button, Input, Card, Select } from '../ui/UIComponents';
import { Form, Row, Col } from 'react-bootstrap';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    fertilityStage: 'Other',
    journeyType: 'Natural',
    dateOfBirth: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { execute, loading, error } = useApi({
    asyncAction: register,
    feature: 'auth',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter and one number';
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registrationData } = formData;

    await execute(registrationData);
  };

  // Fertility stage options
  const fertilityStageOptions = [
    { value: 'Trying to Conceive', label: 'Trying to Conceive' },
    { value: 'IVF', label: 'IVF' },
    { value: 'IUI', label: 'IUI' },
    { value: 'PCOS Management', label: 'PCOS Management' },
    { value: 'Pregnancy', label: 'Pregnancy' },
    { value: 'Postpartum', label: 'Postpartum' },
    { value: 'Other', label: 'Other' }
  ];

  // Journey type options
  const journeyTypeOptions = [
    { value: 'Natural', label: 'Natural' },
    { value: 'IVF', label: 'IVF' },
    { value: 'IUI', label: 'IUI' },
    { value: 'PCOS', label: 'PCOS' },
    { value: 'Other', label: 'Other' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-lg w-full p-8 space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-neutral-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Or{' '}
            <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-100">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Registration failed
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-neutral-800">Account Information</h4>

            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              label="Full Name"
              error={errors.name}
            />

            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              label="Email address"
              error={errors.email}
            />

            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              label="Password"
              error={errors.password}
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              label="Confirm Password"
              error={errors.confirmPassword}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium text-neutral-800">Personal Information</h4>

            <Row>
              <Col md={6}>
                <Select
                  id="fertilityStage"
                  name="fertilityStage"
                  value={formData.fertilityStage}
                  onChange={handleChange}
                  options={fertilityStageOptions}
                  label="Fertility Stage"
                />
              </Col>

              <Col md={6}>
                <Select
                  id="journeyType"
                  name="journeyType"
                  value={formData.journeyType}
                  onChange={handleChange}
                  options={journeyTypeOptions}
                  label="Journey Type"
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  label="Date of Birth"
                />
              </Col>

              <Col md={6}>
                <Input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  label="Phone Number"
                />
              </Col>
            </Row>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              fullWidth
              size="lg"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>

          <div className="text-sm text-center text-neutral-600">
            By creating an account, you agree to our{' '}
            <a href="#" className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
              Privacy Policy
            </a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
