import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import api from '../../services/api';
import { Card, Form, Button, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

const GeminiApiSettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    try {
      setIsLoading(true);

      // First, validate the API key by making a test request to Gemini API
      try {
        await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
          {
            model: 'gemini-1.5-pro',
            messages: [{ role: 'user', content: 'Hello' }],
            temperature: 0.7,
            max_tokens: 10
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (validationError) {
        toast.error('Invalid API key. Please check and try again.');
        setIsLoading(false);
        return;
      }

      // If validation passes, save the API key
      const response = await api.put('/users/gemini-api-key', { geminiApiKey: apiKey });

      if (response.data.success) {
        toast.success('Gemini API key saved successfully');
        setApiKey('');
      } else {
        toast.error(response.data.message || 'Failed to save API key');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
      console.error('Error saving Gemini API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow mb-4">
      <Card.Header>
        <h5 className="mb-0">Gemini API Settings</h5>
      </Card.Header>

      <Card.Body>
        <p className="text-muted mb-4">
          FertilityNest uses Google's Gemini AI to power the chat companion. You can use your own Gemini API key for enhanced privacy and control.
        </p>

        <Alert variant="info" className="mb-4">
          <Alert.Heading as="h5">How to get a Gemini API key:</Alert.Heading>
          <ol className="mb-0 ps-3">
            <li>Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-decoration-underline">Google AI Studio</a></li>
            <li>Sign in with your Google account</li>
            <li>Create a new API key</li>
            <li>Copy the API key and paste it below</li>
          </ol>
        </Alert>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>Gemini API Key</Form.Label>
            <InputGroup>
              <Form.Control
                type={showApiKey ? "text" : "password"}
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeSlash /> : <Eye />}
              </Button>
            </InputGroup>
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button
              type="submit"
              variant="purple"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                'Save API Key'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default GeminiApiSettings;
