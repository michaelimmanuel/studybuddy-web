'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

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
            
            const result = await authClient.signIn.email({
                email: email.trim().toLowerCase(),
                password: password,
            });
            
            console.log('Login result:', result);
            
            if (result.error) {
                setError(result.error.message || 'Login failed');
            } else {

                router.push('/dashboard');
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