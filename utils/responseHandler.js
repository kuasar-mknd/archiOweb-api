export const sendResponse = (res, statusCode, data, message = null) => {
  const response = {
    success: statusCode >= 200 && statusCode < 300,
    data
  }

  if (message) {
    response.message = message
  }

  res.status(statusCode).json(response)
}
