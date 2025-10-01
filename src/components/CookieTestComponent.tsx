'use client';

import { useState } from 'react';
import { cookieDebugger } from '@/lib/cookie-debugger';
import api from '@/lib/api';

export default function CookieTestComponent() {
  const [testResults, setTestResults] = useState<any>(null);

  const runCookieTests = async () => {
    console.log('=== Cookie Debugging Session ===');
    
    // Test 1: Check API configuration
    console.log('1. Checking API configuration:');
    cookieDebugger.debugApiConfiguration();
    
    // Test 2: Check all cookies
    console.log('2. Checking all cookies:');
    cookieDebugger.logAllCookies();
    
    // Test 3: Check auth-specific cookies
    console.log('3. Checking auth cookies:');
    const authStatus = cookieDebugger.checkAuthCookies();
    
    // Test 4: Test direct Railway connection
    console.log('4. Testing direct Railway connection:');
    const railwayTest = await cookieDebugger.testRailwayConnection();
    
    // Test 5: Test API requests with cookies
    console.log('5. Testing API requests:');
    try {
      const response = await api.get('/api/users/me');
      console.log('API request successful:', response);
      setTestResults({
        cookiesFound: authStatus,
        apiRequestSuccess: true,
        railwayTest,
        userData: response
      });
    } catch (error) {
      console.error('API request failed:', error);
      setTestResults({
        cookiesFound: authStatus,
        apiRequestSuccess: false,
        railwayTest,
        error: error
      });
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50">
      <h3 className="text-sm font-bold mb-2">Cookie Debug Tools</h3>
      <button
        onClick={runCookieTests}
        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
      >
        Test Cookies
      </button>
      {testResults && (
        <div className="mt-2 text-xs">
          <p>Session Cookie: {testResults.cookiesFound?.hasSessionCookie ? '✅' : '❌'}</p>
          <p>API Request: {testResults.apiRequestSuccess ? '✅' : '❌'}</p>
          <p>Railway Test: {testResults.railwayTest?.success ? '✅' : '❌'}</p>
        </div>
      )}
    </div>
  );
}