'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
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

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterModal({ open, onOpenChange, onSwitchToLogin }: RegisterModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password || !repeatPassword) {
      setError('Please fill out all fields.');
      return;
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      });

      console.log('Registration result:', result);

      if (result.error) {
        setError(result.error.message || 'Registration failed');
      } else {
        console.log('Registration successful:', result);
        // Close modal and switch to login
        onOpenChange(false);
        if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);

      if (err.status === 422) {
        setError('Validation error. Please check your input and try again.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#002644]">Daftar</DialogTitle>
          <DialogDescription>
            Buat akun baru untuk mulai belajar bersama StudyBuddy
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              type="text"
              placeholder="Nama lengkap Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full"
            />
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="repeatPassword">Ulangi Password</Label>
            <Input
              id="repeatPassword"
              type="password"
              placeholder="••••••••"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button
            type="submit"
            disabled={busy || password !== repeatPassword}
            className="w-full bg-[#002644] hover:bg-[#003d66] text-white font-semibold"
          >
            {busy ? 'Mendaftar...' : 'Daftar'}
          </Button>
        </form>
        <div className="text-center text-sm text-gray-600 mt-4">
          Sudah punya akun?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#002644] font-semibold hover:underline"
          >
            Masuk sekarang
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
