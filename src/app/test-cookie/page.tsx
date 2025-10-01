"use client";

import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

interface TestResults {
  cookies: string;
  sessionCookie: boolean;
  csrfCookie: boolean;
  apiSuccess: boolean;
  userInfo?: any;
  error?: string;
  timestamp: string;
  loginResponse?: {
    status: number;
    ok: boolean;
    responseBody?: any;
    headers?: Record<string, string>;
  };
  networkDetails?: {
    requestOrigin: string;
    apiBaseUrl: string;
    isCrossOrigin: boolean;
    userAgent: string;
  };
}

const CookieTestPage = () => {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getNetworkDetails = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const currentOrigin = window.location.origin;
    const apiOrigin = new URL(apiBaseUrl).origin;
    
    return {
      requestOrigin: currentOrigin,
      apiBaseUrl: apiBaseUrl,
      isCrossOrigin: currentOrigin !== apiOrigin,
      userAgent: navigator.userAgent
    };
  };

  const clearAllCookies = () => {
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
    });
    
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('🧹 All cookies and storage cleared!');
    setTestResults(null);
  };

  const testLogin = async () => {
    setIsLoading(true);
    try {
      console.log('🔐 Testing login...');
      const networkDetails = getNetworkDetails();
      console.log('Network details:', networkDetails);
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/sign-in/email`;
      console.log('Login URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: 'admin@gmail.com',
          password: 'Password12345'
        })
      });
      
      console.log('Login response status:', response.status);
      console.log('Login response ok:', response.ok);
      
      // Collect all response headers
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
        console.log(`Header ${key}: ${value}`);
      });
      
      let responseBody = null;
      try {
        const responseText = await response.text();
        responseBody = responseText ? JSON.parse(responseText) : null;
        console.log('Response body:', responseBody);
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
      
      const loginResponse = {
        status: response.status,
        ok: response.ok,
        responseBody,
        headers
      };
      
      if (response.ok) {
        console.log('✅ Login successful, waiting for cookies...');
        // Wait for cookies to be set, then test
        setTimeout(() => runDetailedTest(loginResponse, networkDetails), 2000);
      } else {
        console.error('❌ Login failed');
        setTestResults({
          cookies: document.cookie,
          sessionCookie: false,
          csrfCookie: false,
          apiSuccess: false,
          error: `Login failed: ${response.status} - ${JSON.stringify(responseBody)}`,
          timestamp: new Date().toLocaleTimeString(),
          loginResponse,
          networkDetails
        });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setTestResults({
        cookies: document.cookie,
        sessionCookie: false,
        csrfCookie: false,
        apiSuccess: false,
        error: error instanceof Error ? error.message : 'Login request failed',
        timestamp: new Date().toLocaleTimeString(),
        networkDetails: getNetworkDetails()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runDetailedTest = async (loginResponse?: any, networkDetails?: any) => {
    try {
      console.log('🧪 Starting detailed cookie test...');
      
      // Get all cookies
      const allCookies = document.cookie;
      console.log('🍪 All cookies after login:', allCookies);
      
      // Check for specific auth cookies
      const sessionCookie = allCookies.includes('better-auth.session_token');
      const csrfCookie = allCookies.includes('better-auth.csrf_token');
      
      console.log('🔍 Session cookie present:', sessionCookie);
      console.log('🔍 CSRF cookie present:', csrfCookie);
      
      // Test API request with detailed logging
      let apiSuccess = false;
      let userInfo = null;
      let error = null;
      
      try {
        console.log('📡 Making API request to /api/users/me...');
        console.log('📡 Using API client with credentials: include');
        
        const response = await api.get('/api/users/me');
        console.log('✅ API Success:', response);
        apiSuccess = true;
        userInfo = response;
      } catch (apiError: any) {
        console.error('❌ API Error:', apiError);
        error = `API Error: ${apiError.message || 'Unknown error'}`;
        
        if (apiError.response) {
          console.error('API Error Status:', apiError.response.status);
          console.error('API Error Status Text:', apiError.response.statusText);
          
          try {
            const errorBody = await apiError.response.text();
            console.error('API Error Body:', errorBody);
            error += ` - Status: ${apiError.response.status} - ${errorBody}`;
          } catch (e) {
            console.error('Could not read error response body');
          }
        }
      }
      
      const results: TestResults = {
        cookies: allCookies,
        sessionCookie,
        csrfCookie,
        apiSuccess,
        userInfo,
        error: error ?? undefined,
        timestamp: new Date().toLocaleTimeString(),
        loginResponse,
        networkDetails: networkDetails || getNetworkDetails()
      };
      
      setTestResults(results);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestResults({
        cookies: document.cookie,
        sessionCookie: false,
        csrfCookie: false,
        apiSuccess: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
        loginResponse,
        networkDetails: networkDetails || getNetworkDetails()
      });
    }
  };

  const testDirectAPI = async () => {
    setIsLoading(true);
    try {
      await runDetailedTest();
    } finally {
      setIsLoading(false);
    }
  };

  const testWithManualCookie = async () => {
    setIsLoading(true);
    try {
      // Test with manually added cookie (this won't work for HttpOnly cookies, but let's try)
      const manualCookie = prompt('Enter your session token from Postman:');
      if (!manualCookie) return;
      
      console.log('Testing with manual cookie...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `better-auth.session_token=${manualCookie}`
        },
        credentials: 'include'
      });
      
      console.log('Manual cookie test response:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Manual cookie test success:', data);
      } else {
        console.error('Manual cookie test failed:', await response.text());
      }
      
    } catch (error) {
      console.error('Manual cookie test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">🍪 Cross-Origin Cookie Debug Center</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={testLogin}
              disabled={isLoading}
              variant="default"
              className="h-12"
            >
              {isLoading ? 'Testing...' : '🔐 Test Login Flow'}
            </Button>
            
            <Button 
              onClick={testDirectAPI}
              disabled={isLoading}
              variant="outline"
              className="h-12"
            >
              📡 Test API Only
            </Button>
            
            <Button 
              onClick={testWithManualCookie}
              disabled={isLoading}
              variant="secondary"
              className="h-12"
            >
              🛠️ Test Manual Cookie
            </Button>
            
            <Button 
              onClick={clearAllCookies}
              variant="destructive"
              className="h-12"
            >
              🧹 Clear All Data
            </Button>
          </div>
        </div>

        {testResults && (
          <div className="space-y-6">
            {/* Network Details */}
            {testResults.networkDetails && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">🌐 Network Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Frontend Origin</div>
                    <div className="text-sm text-gray-600">{testResults.networkDetails.requestOrigin}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">API Base URL</div>
                    <div className="text-sm text-gray-600">{testResults.networkDetails.apiBaseUrl}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className={`p-3 rounded-lg ${testResults.networkDetails.isCrossOrigin ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                      <div className={`font-medium ${testResults.networkDetails.isCrossOrigin ? 'text-yellow-800' : 'text-green-800'}`}>
                        {testResults.networkDetails.isCrossOrigin ? '⚠️ Cross-Origin Request' : '✅ Same-Origin Request'}
                      </div>
                      {testResults.networkDetails.isCrossOrigin && (
                        <div className="text-sm text-yellow-700 mt-1">
                          This is likely causing your cookie issues. Cross-origin requests require special CORS and cookie configuration.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Test Results */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🧪 Test Results</h2>
              <div className="text-sm text-gray-600 mb-4">Last test: {testResults.timestamp}</div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${testResults.sessionCookie ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className={`font-medium ${testResults.sessionCookie ? 'text-green-800' : 'text-red-800'}`}>
                    {testResults.sessionCookie ? '✅' : '❌'} Session Cookie
                  </div>
                  <div className="text-xs text-gray-600 mt-1">better-auth.session_token</div>
                </div>
                
                <div className={`p-4 rounded-lg ${testResults.csrfCookie ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className={`font-medium ${testResults.csrfCookie ? 'text-green-800' : 'text-red-800'}`}>
                    {testResults.csrfCookie ? '✅' : '❌'} CSRF Cookie
                  </div>
                  <div className="text-xs text-gray-600 mt-1">better-auth.csrf_token</div>
                </div>
                
                <div className={`p-4 rounded-lg ${testResults.apiSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className={`font-medium ${testResults.apiSuccess ? 'text-green-800' : 'text-red-800'}`}>
                    {testResults.apiSuccess ? '✅' : '❌'} API Request
                  </div>
                  <div className="text-xs text-gray-600 mt-1">/api/users/me</div>
                </div>
              </div>

              {/* Login Response Details */}
              {testResults.loginResponse && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Login Response Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Status:</span> 
                      <span className={testResults.loginResponse.ok ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                        {testResults.loginResponse.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Success:</span> 
                      <span className="ml-2">{testResults.loginResponse.ok ? '✅' : '❌'}</span>
                    </div>
                  </div>
                  
                  {testResults.loginResponse.headers && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-blue-600 font-medium">View Response Headers</summary>
                      <div className="bg-white p-3 rounded mt-2 text-xs font-mono">
                        {Object.entries(testResults.loginResponse.headers).map(([key, value]) => (
                          <div key={key} className={key.toLowerCase() === 'set-cookie' ? 'text-green-600 font-bold' : ''}>
                            <span className="text-blue-600">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {/* Error Details */}
              {testResults.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-medium text-red-800 mb-2">Error Details</h3>
                  <div className="text-sm text-red-700 font-mono">{testResults.error}</div>
                </div>
              )}

              {/* User Info */}
              {testResults.userInfo && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">User Information</h3>
                  <pre className="text-sm bg-white p-2 rounded overflow-auto">
                    {JSON.stringify(testResults.userInfo, null, 2)}
                  </pre>
                </div>
              )}

              {/* Cookie Details */}
              <details className="mt-4">
                <summary className="cursor-pointer text-gray-600 font-medium">View Raw Cookies</summary>
                <div className="bg-gray-50 p-4 rounded mt-2 text-sm font-mono break-all">
                  {testResults.cookies || 'No cookies found'}
                </div>
              </details>
            </div>

            {/* Solutions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🔧 Potential Solutions</h2>
              <div className="space-y-4 text-sm">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">Cross-Origin Cookie Issue</h3>
                  <p className="text-yellow-700">
                    Your frontend ({testResults.networkDetails?.requestOrigin}) and backend ({testResults.networkDetails?.apiBaseUrl}) are on different domains. 
                    This requires specific server configuration:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-yellow-700">
                    <li>Server must set <code>SameSite=None; Secure</code> for cross-origin cookies</li>
                    <li>CORS must explicitly allow your frontend origin</li>
                    <li>Backend must use HTTPS for <code>Secure</code> cookies</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Required Server Configuration</h3>
                  <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto">
{`// In your auth.ts
cookies: {
  sessionToken: {
    sameSite: "none",
    secure: true,  // Required for SameSite=none
    httpOnly: true
  }
}

// In your server.ts CORS
origin: ["http://localhost:3000"], // Explicit origins
credentials: true`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieTestPage;