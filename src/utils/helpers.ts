/**
 * Utility helper functions
 */

export const formatResponse = <T>(data: T, message?: string) => {
  return {
    success: true,
    message: message || 'Operation successful',
    data,
  };
};

export const formatError = (message: string, statusCode?: number) => {
  return {
    success: false,
    message,
    statusCode: statusCode || 400,
  };
};

