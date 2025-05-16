import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';

/**
 * Custom hook for API operations using Redux
 * @param {Object} options - Hook options
 * @param {Function} options.asyncAction - Redux async thunk action
 * @param {string} options.feature - Feature name for loading/error state (e.g., 'auth', 'cycles')
 * @returns {Object} - API operation utilities
 */
export const useApi = ({ asyncAction, feature }) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.ui.loading[feature]);
  const error = useSelector((state) => state.ui.errors[feature]);

  /**
   * Execute the API operation
   * @param {any} params - Parameters to pass to the async action
   * @returns {Promise} - Promise that resolves with the action result
   */
  const execute = useCallback(
    async (params) => {
      try {
        const resultAction = await dispatch(asyncAction(params));
        
        if (resultAction.error) {
          return { success: false, error: resultAction.payload };
        }
        
        return { success: true, data: resultAction.payload };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [dispatch, asyncAction]
  );

  return {
    execute,
    loading,
    error,
  };
};

export default useApi;
