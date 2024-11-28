// Constants
const API_URL = 'http://localhost:3000';
const ENDPOINTS = {
   register: `${API_URL}/auth/register`,
   login: `${API_URL}/auth/login`,
   protected: `${API_URL}/protected`,
};

// DOM Elements
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const testProtectedBtn = document.getElementById('testProtected');
const responseDiv = document.getElementById('response');

// Helper Functions
const displayResponse = (data, isError = false) => {
   responseDiv.innerHTML = `
        <div class="${isError ? 'error' : 'success'}">
            ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}
        </div>
    `;
};

const makeRequest = async (url, options) => {
   try {
      const response = await fetch(url, {
         ...options,
         headers: {
            'Content-Type': 'application/json',
            ...options.headers,
         },
      });
      const data = await response.json();

      if (!response.ok) {
         throw new Error(data.message || 'Something went wrong');
      }

      return data;
   } catch (error) {
      throw error;
   }
};

// Event Handlers
registerForm.addEventListener('submit', async (e) => {
   e.preventDefault();

   const username = document.getElementById('registerUsername').value;
   const password = document.getElementById('registerPassword').value;

   try {
      const data = await makeRequest(ENDPOINTS.register, {
         method: 'POST',
         body: JSON.stringify({ username, password }),
      });

      displayResponse(data);
      registerForm.reset();
   } catch (error) {
      displayResponse(error.message, true);
   }
});

loginForm.addEventListener('submit', async (e) => {
   e.preventDefault();

   const username = document.getElementById('loginUsername').value;
   const password = document.getElementById('loginPassword').value;

   try {
      const data = await makeRequest(ENDPOINTS.login, {
         method: 'POST',
         body: JSON.stringify({ username, password }),
      });

      localStorage.setItem('jwt_token', data.token);
      displayResponse({ ...data, note: 'Token stored in localStorage' });
      loginForm.reset();
   } catch (error) {
      displayResponse(error.message, true);
   }
});

testProtectedBtn.addEventListener('click', async () => {
   const token = localStorage.getItem('jwt_token');

   if (!token) {
      displayResponse('No token found. Please login first.', true);
      return;
   }

   try {
      const data = await makeRequest(ENDPOINTS.protected, {
         method: 'GET',
         headers: {
            'Authorization': `Bearer ${token}`,
         },
      });

      displayResponse(data);
   } catch (error) {
      displayResponse(error.message, true);
      if (error.message.includes('Invalid token')) {
         localStorage.removeItem('jwt_token');
      }
   }
});

const logoutBtn = document.getElementById('logout');

logoutBtn.addEventListener('click', async () => {
   try {
      const token = localStorage.getItem('jwt_token');

      if (!token) {
         displayResponse('Already logged out.');
         return;
      }

      localStorage.removeItem('jwt_token');
      displayResponse('Successfully logged out');
   } catch (error) {
      displayResponse(error.message, true);
   }
});
