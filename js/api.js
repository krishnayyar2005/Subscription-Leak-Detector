// Base URL for our backend Express API
const API_URL = "http://localhost:8080/api"

// Helper function to get the stored JWT token from localStorage
function getToken() {
  return localStorage.getItem("essara_token")
}

// Helper function to remove saved token and session info
function clearAuth() {
  localStorage.removeItem("essara_token")
  localStorage.removeItem("essara_session")
}

// Async helper to make API requests using fetch
async function apiRequest(path, method = "GET", body = null) {
  // Set default JSON headers
  const headers = {
    "Content-Type": "application/json"
  }

  // If a JWT token exists, attach it to Authorization header
  const token = getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  // Build the fetch options
  const options = {
    method: method,
    headers: headers
  }

  // Only attach body if one is provided
  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_URL}${path}`, options)

    // Try parsing the JSON response body
    let data = {}
    try {
      data = await response.json()
    } catch (parseError) {
      data = {}
    }

    // If the server returns 401 Unauthorized, we had sent a token, and the request is not login or signup,
    // it means our token is expired or invalid. We clear the session and redirect back to login.
    if (response.status === 401 && token && !path.startsWith("/auth/login") && !path.startsWith("/auth/register")) {
      clearAuth()
      window.location.href = "../login/login.html"
    }

    return {
      ok: response.ok,
      status: response.status,
      data: data
    }
  } catch (err) {
    // If fetch throws an error (e.g. backend server is not running or network is down)
    return {
      ok: false,
      status: 0,
      data: {
        message: "Cannot reach server. Is the backend running?"
      }
    }
  }
}
