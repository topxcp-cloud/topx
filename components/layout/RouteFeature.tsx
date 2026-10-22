'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../legacy-src/features/auth/useAuth.js';
import AppHeader from '../legacy-src/components/shell/AppHeader.jsx';
import AppFooter from '../legacy-src/components/shell/AppFooter.jsx';
import AuthGate from '../legacy-src/components/shell/AuthGate.jsx';
import StudentProfileSetup from '../legacy-src/components/shell/StudentProfileSetup.jsx';
import { hasRequiredStudentProfile } from '../legacy-src/features/profile/studentProfileOptions.js';
import LeaderboardView from '../leaderboard/Leaderboard';
import TasksView from '../legacy-src/components/views/TasksView.jsx';
import ProfileView from '../legacy-src/components/views/ProfileView.jsx';
import GuidesView from '../legacy-src/components/views/GuidesView.jsx';
import BlueprintsView from '../legacy-src/components/views/BlueprintsView.jsx';
import ProView from '../legacy-src/components/views/ProView.jsx';
import AdminView from '../legacy-src/components/views/AdminView.jsx';

const VIEW_MAP: Record<string, any> = {
  progress: TasksView,
  leaderboard: LeaderboardView,
  contests: GuidesView,
  profile: ProfileView,
  settings: ProfileView,
  tasks: TasksView,
  guides: GuidesView,
  blueprints: BlueprintsView,
  pro: ProView,
  admin: AdminView
};

export default function RouteFeature({ view, title }: { view: string; title?: string }) {
  const auth = useAuth();
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const View = VIEW_MAP[view] || TasksView;
  const isProtected = view === 'profile' || view === 'settings';

  
  useEffect(() => {
    const handleProfileUpdated = (event: Event) => {
      const updatedUser = (event as CustomEvent).detail?.user;
      if (updatedUser?.id && updatedUser.id === auth.user?.id) {
        auth.setUser(updatedUser);
      }
    };

    window.addEventListener('topx:profile-updated', handleProfileUpdated);

    return () =>
      window.removeEventListener('topx:profile-updated', handleProfileUpdated);
  }, [auth.user?.id, auth.setUser]);


  useEffect(() => {
    const handleOpenAuth = () => setAuthModalOpen(true);

    window.addEventListener('topx:open-auth', handleOpenAuth);

    return () => {
      window.removeEventListener('topx:open-auth', handleOpenAuth);
    };
  }, []);


  return (
    <div className="topx-react-app">
      {/* Show AuthGate if user is unauthenticated on a protected page or explicitly clicks Sign In */}
      <AuthGate
        authMode={auth.authMode}
        setAuthMode={auth.setAuthMode}
        authenticate={auth.authenticate}
        loginWithGoogle={auth.loginWithGoogle}
        error={auth.error}
        setError={auth.setError}
        isAuthenticated={Boolean(auth.user)}
        isOpen={(!auth.loading && !auth.user && isProtected) || authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {!auth.loading && auth.user && !hasRequiredStudentProfile(auth.user) && (
        <StudentProfileSetup
          user={auth.user}
          onSaved={(updatedUser) => {
            auth.setUser(updatedUser);
            router.push('/profile');
          }}
        />
      )}

      <AppHeader onOpenAuth={() => setAuthModalOpen(true)} />

      <main className="app-view-container">
        {auth.loading && isProtected ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--mute)' }}>
            <p>Loading your profile session...</p>
          </div>
        ) : (
          <View active={true} user={auth.user} />
        )}
      </main>

      <AppFooter />
    </div>
  );
}
