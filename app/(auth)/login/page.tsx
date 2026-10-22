'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGate from '../../../components/legacy-src/components/shell/AuthGate.jsx';
import { useAuth } from '../../../components/legacy-src/features/auth/useAuth.js';

export default function LoginPage() {
	const auth = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!auth.loading && auth.user) router.replace('/');
	}, [auth.loading, auth.user, router]);

	if (auth.loading || auth.user) return null;

	return (
		<AuthGate
			authMode={auth.authMode}
			setAuthMode={auth.setAuthMode}
			authenticate={auth.authenticate}
			loginWithGoogle={auth.loginWithGoogle}
			error={auth.error}
			setError={auth.setError}
			isAuthenticated={Boolean(auth.user)}
			isOpen
			onClose={() => router.push('/')}
		/>
	);
}
