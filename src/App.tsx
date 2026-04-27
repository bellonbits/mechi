import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SplashScreen } from './pages/Splash';
import { OnboardingPage } from './pages/Onboarding';
import { AuthPage } from './pages/Auth';
import { ProfileSetupPage } from './pages/ProfileSetup';
import { ExplorePage } from './pages/Explore';
import { SwipePage } from './pages/Swipe';
import { LikesPage } from './pages/Likes';
import { ChatPage } from './pages/Chat';
import { ChatRoomPage } from './pages/ChatRoom';
import { ProfilePage } from './pages/Profile';
import { VideoCallPage } from './pages/VideoCall';
import { SubscriptionPage } from './pages/Subscription';
import { HowItWorksPage } from './pages/legal/HowItWorks';
import { TermsPage } from './pages/legal/Terms';
import { PrivacyPage } from './pages/legal/Privacy';
import { DataCollectionPage } from './pages/legal/DataCollection';
import { SettingsPage } from './pages/Settings';
import { SupportPage } from './pages/Support';
import { NotificationsPage } from './pages/Notifications';
import { PublicProfilePage } from './pages/PublicProfile';
import { AdminPage } from './pages/Admin';
import { BestiePage } from './pages/Bestie';

import { Navbar } from './components/layout/Navbar';
import { CookieConsent } from './components/CookieConsent';
import { supabase } from './utils/supabase';
import { useAuthStore } from './store/useAuthStore';
import { ScrollToTop } from './components/ScrollToTop';
import { MatchListener } from './components/MatchListener';
import { CallListener } from './components/CallListener';
import { ToastListener } from './components/ToastListener';
import { AuthGuard } from './components/AuthGuard';

const queryClient = new QueryClient();

const NO_NAV = ['/splash', '/onboarding', '/auth', '/setup', '/subscription', '/video-call', '/notifications', '/settings', '/help-support', '/public-profile'];

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  // Also hide nav for /chat/:id (room) but keep it for /chat (list)
  const showNav = !NO_NAV.includes(location.pathname) && !location.pathname.match(/^\/chat\/.+/);
  return (
    <>
      <main>{children}</main>
      {showNav && <Navbar />}
      <CookieConsent />
    </>
  );
};

function App() {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id).finally(() => setLoading(false));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <LayoutWrapper>
          <MatchListener />
          <CallListener />
          <ToastListener />
          <AuthGuard>
            <Routes>
              {/* Entry flow */}
              <Route path="/" element={<Navigate to="/splash" replace />} />
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/setup" element={<ProfileSetupPage />} />

              {/* Main app */}
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/swipe" element={<SwipePage />} />
              <Route path="/likes" element={<LikesPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:id" element={<ChatRoomPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help-support" element={<SupportPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/bestie" element={<BestiePage />} />
              <Route path="/public-profile" element={<PublicProfilePage />} />
              <Route path="/video-call" element={<VideoCallPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />

              {/* Legal */}
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/data-collection" element={<DataCollectionPage />} />

              <Route path="*" element={<Navigate to="/splash" replace />} />
            </Routes>
          </AuthGuard>
        </LayoutWrapper>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
