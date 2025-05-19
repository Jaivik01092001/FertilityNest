import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { toast } from 'react-toastify';
import DistressButton from '../DistressButton';
import api from '../../../services/api';

// Mock dependencies
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('../../../services/api', () => ({
  post: jest.fn()
}));

const mockStore = configureStore([]);

describe('DistressButton Component', () => {
  let store;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock store with initial state
    store = mockStore({
      auth: {
        user: {
          _id: 'user123',
          name: 'Test User'
        }
      },
      partner: {
        partnerInfo: null
      }
    });
  });

  test('renders distress button correctly', () => {
    render(
      <Provider store={store}>
        <DistressButton />
      </Provider>
    );

    expect(screen.getByText('Distress Signal')).toBeInTheDocument();
  });

  test('shows support resources modal when no partner is connected', async () => {
    render(
      <Provider store={store}>
        <DistressButton />
      </Provider>
    );

    // Click the distress button
    fireEvent.click(screen.getByText('Distress Signal'));

    // Check if modal appears
    expect(screen.getByText('Support Resources')).toBeInTheDocument();
    expect(screen.getByText('National Suicide Prevention Lifeline')).toBeInTheDocument();
    expect(screen.getByText('Crisis Text Line')).toBeInTheDocument();
  });

  test('sends distress signal when partner is connected', async () => {
    // Update store with connected partner
    store = mockStore({
      auth: {
        user: {
          _id: 'user123',
          name: 'Test User',
          partnerId: 'partner456'
        }
      },
      partner: {
        partnerInfo: {
          _id: 'partner456',
          name: 'Partner User'
        }
      }
    });

    // Mock successful API response
    api.post.mockResolvedValueOnce({
      data: {
        success: true
      }
    });

    render(
      <Provider store={store}>
        <DistressButton />
      </Provider>
    );

    // Click the distress button
    fireEvent.click(screen.getByText('Distress Signal'));

    // Check if API was called correctly
    expect(api.post).toHaveBeenCalledWith('/partners/distress', {
      message: 'I need support right now. Please reach out to me.',
      location: 'App distress button'
    });

    // Wait for toast to be called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Your partner has been notified.');
    });
  });

  test('shows error toast when API call fails', async () => {
    // Update store with connected partner
    store = mockStore({
      auth: {
        user: {
          _id: 'user123',
          name: 'Test User',
          partnerId: 'partner456'
        }
      },
      partner: {
        partnerInfo: {
          _id: 'partner456',
          name: 'Partner User'
        }
      }
    });

    // Mock failed API response
    api.post.mockRejectedValueOnce(new Error('API error'));

    render(
      <Provider store={store}>
        <DistressButton />
      </Provider>
    );

    // Click the distress button
    fireEvent.click(screen.getByText('Distress Signal'));

    // Wait for toast to be called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to send notification. Please try again.');
    });
  });
});
