/**
 * Cookie debugging utilities for development
 */

export const cookieDebugger = {
  /**
   * Log all cookies in the browser
   */
  logAllCookies: () => {
    if (typeof document === 'undefined') return;
    
    console.log('[Cookie Debug] All cookies:', document.cookie);
    
    // Parse and display cookies in a readable format
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name) acc[name] = value || '';
      return acc;
    }, {} as Record<string, string>);
    
    console.table(cookies);
    return cookies;
  },

  /**
   * Check for specific Better Auth session cookies
   */
  checkAuthCookies: () => {
    if (typeof document === 'undefined') return;
    
    const authCookies = {
      'better-auth.session_token': '',
      'better-auth.csrf_token': '',
    };
    
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && name in authCookies) {
        authCookies[name as keyof typeof authCookies] = value || '';
      }
    });
    
    console.log('[Cookie Debug] Auth cookies:', authCookies);
    
    const hasSessionCookie = !!authCookies['better-auth.session_token'];
    const hasCsrfCookie = !!authCookies['better-auth.csrf_token'];
    
    console.log('[Cookie Debug] Auth status:', {
      hasSessionCookie,
      hasCsrfCookie,
      isAuthenticated: hasSessionCookie && hasCsrfCookie
    });
    
    return { hasSessionCookie, hasCsrfCookie, authCookies };
  },

  /**
   * Debug API configuration and URLs
   */
  debugApiConfiguration: () => {
    console.log('[Cookie Debug] API Configuration:', {
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      currentDomain: typeof window !== 'undefined' ? window.location.origin : 'server',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    });
  },

  /**
   * Test if cookies are being sent with API requests
   */
  testCookieTransmission: async () => {
    try {
      // Import the API client
      const { default: api } = await import('./api');
      
      console.log('[Cookie Debug] Testing cookie transmission...');
      
      // Debug current configuration
      cookieDebugger.debugApiConfiguration();
      
      // Check cookies before request
      const cookiesBefore = cookieDebugger.checkAuthCookies();
      
      // Make a test request to see if cookies are sent
      const response = await api.get('/api/users/me');
      console.log('[Cookie Debug] Test request successful:', response);
      
      return { success: true, response, cookiesBefore };
    } catch (error) {
      console.error('[Cookie Debug] Test request failed:', error);
      
      // Additional debugging for failed requests
      const cookiesPresent = cookieDebugger.checkAuthCookies();
      console.log('[Cookie Debug] Cookies present during failure:', cookiesPresent);
      
      return { success: false, error, cookiesPresent };
    }
  },

  /**
   * Test specific Railway URLs
   */
  testRailwayConnection: async () => {
    try {
      const railwayUrl = 'https://studybuddy-server-production.up.railway.app';
      
      console.log('[Cookie Debug] Testing Railway connection...');
      console.log('[Cookie Debug] Target URL:', railwayUrl);
      
      // Check current cookies
      const cookies = cookieDebugger.logAllCookies();
      
      // Test with manual fetch to see headers
      const response = await fetch(`${railwayUrl}/api/users/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('[Cookie Debug] Railway response status:', response.status);
      console.log('[Cookie Debug] Railway response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Cookie Debug] Railway response data:', data);
        return { success: true, data };
      } else {
        const errorText = await response.text();
        console.log('[Cookie Debug] Railway error response:', errorText);
        return { success: false, status: response.status, error: errorText };
      }
    } catch (error) {
      console.error('[Cookie Debug] Railway connection failed:', error);
      return { success: false, error };
    }
  }
};

// Export for global access in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).cookieDebugger = cookieDebugger;
}