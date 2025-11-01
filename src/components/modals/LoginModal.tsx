'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import api from '@/lib/api';
import { cookieDebugger } from '@/lib/cookie-debugger';
import { railwayCookieFix } from '@/lib/railway-cookie-fix';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({ open, onOpenChange, onSwitchToRegister }: LoginModalProps) {
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
          const isAdminResponse = await api.get<any>('/api/users/is-admin');
          console.log('Admin check response:', isAdminResponse);

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

        // Close modal after successful login
        onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#002644]">Masuk</DialogTitle>
          <DialogDescription>
            Masukkan email dan password Anda untuk melanjutkan
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-[#002644] hover:bg-[#003d66] text-white font-semibold"
          >
            {busy ? 'Masuk...' : 'Masuk'}
          </Button>
        </form>
        <div className="text-center text-sm text-gray-600 mt-4">
          Belum punya akun?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#002644] font-semibold hover:underline"
          >
            Daftar sekarang
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
