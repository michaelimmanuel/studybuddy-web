"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		
		if (!name || !email || !password || !repeatPassword) {
			setError("Please fill out all fields.");
			return;
		}

		if (password !== repeatPassword) {
			setError("Passwords do not match.");
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
				router.push('/login');
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
		<div className="max-w-md mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Register</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" type="text" required className="w-full p-2 border rounded" />
				<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full p-2 border rounded" />
						<input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required className="w-full p-2 border rounded" />
						<input value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} placeholder="Repeat password" type="password" required className="w-full p-2 border rounded" />
						<button disabled={busy || password !== repeatPassword} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50">
					{busy ? "Registering…" : "Register"}
				</button>
				{error && <div className="text-red-600 mt-2">{error}</div>}
			</form>
		</div>
	);
}

