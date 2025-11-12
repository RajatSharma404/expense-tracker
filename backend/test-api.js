// Simple test script to verify the API works without MongoDB
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  try {
    // Test health endpoint
    const health = await axios.get(`${API_BASE}/health`);
    console.log('Health check:', health.data);
    
    // Test registration
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Registration response:', registerResponse.data);
    
    const token = registerResponse.data.token;
    
    // Test login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login response:', loginResponse.data);
    
    // Test get user profile
    const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Profile response:', profileResponse.data);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testAPI();