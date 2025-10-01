'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import api from '@/lib/api';
import { cookieDebugger } from '@/lib/cookie-debugger';
import { railwayCookieFix } from '@/lib/railway-cookie-fix';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setBusy(true);

        try {
            // Debug cookies before login
            if (process.env.NODE_ENV === 'development') {
                console.log('[Login] Cookies before login:');
                cookieDebugger.logAllCookies();
            }
            
            const result = await authClient.signIn.email({
                email: email.trim().toLowerCase(),
                password: password,
            });
            
            console.log('Login result:', result);
            
            if (result.error) {
                setError(result.error.message || 'Login failed');
            } else {
                // Debug cookies after successful login
                if (process.env.NODE_ENV === 'development') {
                    console.log('[Login] Cookies after login:');
                    cookieDebugger.checkAuthCookies();
                    
                    // Run complete Railway diagnostic
                    await railwayCookieFix.runCompleteDiagnostic();
                    
                    // Test cookie transmission
                    await cookieDebugger.testCookieTransmission();
                }
                
                // Check user role and redirect accordingly
                try {
                    const isAdminResponse = await api.get<any>("/api/users/is-admin");
                    console.log("Admin check response:", isAdminResponse);
                    
                    if (isAdminResponse.isAdmin === true) {
                        // Redirect admin users to admin dashboard
                        router.push('/admin/dashboard');
                    } else {
                        // Redirect regular users to user dashboard
                        router.push('/dashboard');
                    }
                } catch (roleCheckError) {
                    console.error('Role check failed:', roleCheckError);
                    // Default to user dashboard if role check fails
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            
            if (err.status === 401) {
                setError('Invalid email or password.');
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full p-2 border rounded" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required className="w-full p-2 border rounded" />
            <button disabled={busy} type="submit" className="w-full bg-green hover:bg-green-600 text-white py-2 rounded disabled:opacity-50">
            {busy ? 'Signing in…' : 'Sign in'}
            </button>
            {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
        </div>
    );
}