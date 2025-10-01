/**
 * Railway Domain Cookie Fix
 * 
 * This utility helps debug and fix cookie transmission issues
 * when using Railway deployment with localhost development
 */

export const railwayCookieFix = {
  /**
   * Check if we're in a cross-domain scenario
   */
  checkDomainStatus: () => {
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const apiDomain = apiUrl.replace('https://', '').replace('http://', '').split('/')[0];
    
    const isCrossDomain = currentDomain !== apiDomain;
    
    console.log('[Railway Fix] Domain Status:', {
      currentDomain,
      apiDomain,
      isCrossDomain,
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'unknown',
      apiUrl
    });
    
    return { currentDomain, apiDomain, isCrossDomain };
  },

  /**
   * Force cookie to be visible for debugging
   */
  debugCookieVisibility: () => {
    if (typeof document === 'undefined') return;
    
    const allCookies = document.cookie;
    console.log('[Railway Fix] All cookies visible to JS:', allCookies);
    
    // Try to access the specific cookie
    const sessionCookie = document.cookie
      .split(';')
      .find(cookie => cookie.trim().startsWith('better-auth.session_token='));
    
    console.log('[Railway Fix] Session cookie found:', sessionCookie || 'NOT FOUND');
    
    return { allCookies, sessionCookie };
  },

  /**
   * Test manual cookie setting for debugging
   */
  testManualCookieSet: () => {
    if (typeof document === 'undefined') return;
    
    // Set a test cookie to see if it works
    document.cookie = 'test-cookie=test-value; Path=/; SameSite=Lax';
    
    // Check if it was set
    const testCookie = document.cookie.includes('test-cookie=test-value');
    console.log('[Railway Fix] Test cookie set successfully:', testCookie);
    
    return testCookie;
  },

  /**
   * Enhanced fetch with explicit cookie handling
   */
  makeAuthenticatedRequest: async (endpoint: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const fullUrl = `${apiUrl}${endpoint}`;
    
    console.log('[Railway Fix] Making authenticated request to:', fullUrl);
    
    // Get all cookies and try to manually include them
    const allCookies = typeof document !== 'undefined' ? document.cookie : '';
    console.log('[Railway Fix] Available cookies:', allCookies);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // Explicitly include cookies if available
          ...(allCookies ? { 'Cookie': allCookies } : {})
        }
      });
      
      console.log('[Railway Fix] Response status:', response.status);
      console.log('[Railway Fix] Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Railway Fix] Success! Data:', data);
        return { success: true, data };
      } else {
        const errorText = await response.text();
        console.log('[Railway Fix] Error response:', errorText);
        return { success: false, status: response.status, error: errorText };
      }
    } catch (error) {
      console.error('[Railway Fix] Request failed:', error);
      return { success: false, error };
    }
  },

  /**
   * Complete diagnostic
   */
  runCompleteDiagnostic: async () => {
    console.log('=== Railway Cookie Diagnostic ===');
    
    // Step 1: Check domain status
    const domainStatus = railwayCookieFix.checkDomainStatus();
    
    // Step 2: Check cookie visibility
    const cookieStatus = railwayCookieFix.debugCookieVisibility();
    
    // Step 3: Test manual cookie setting
    const testCookieWorks = railwayCookieFix.testManualCookieSet();
    
    // Step 4: Test authenticated request
    const authTest = await railwayCookieFix.makeAuthenticatedRequest('/api/users/me');
    
    const diagnostic = {
      domainStatus,
      cookieStatus,
      testCookieWorks,
      authTest,
      recommendations: [] as string[]
    };
    
    // Generate recommendations
    if (domainStatus.isCrossDomain) {
      diagnostic.recommendations.push('Cross-domain detected - cookies may not be sent automatically');
    }
    
    if (!cookieStatus?.sessionCookie) {
      diagnostic.recommendations.push('Session cookie not found - user may not be logged in');
    }
    
    if (!testCookieWorks) {
      diagnostic.recommendations.push('Cookie setting not working - browser may be blocking cookies');
    }
    
    if (!authTest.success) {
      diagnostic.recommendations.push('Authenticated request failed - check server CORS and cookie configuration');
    }
    
    console.log('[Railway Fix] Complete diagnostic:', diagnostic);
    return diagnostic;
  }
};

// Make available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).railwayCookieFix = railwayCookieFix;
}