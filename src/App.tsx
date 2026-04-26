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

import { Navbar } from './components/layout/Navbar';
import { CookieConsent } from './components/CookieConsent';
import { supabase } from './utils/supabase';
import { useAuthStore } from './store/useAuthStore';
import { ScrollToTop } from './components/ScrollToTop';

const queryClient = new QueryClient();

const NO_NAV = ['/splash', '/onboarding', '/auth', '/setup', '/subscription', '/video-call'];

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const showNav = !NO_NAV.includes(location.pathname);
  return (
    <>
      <main>{children}</main>
      {showNav && <Navbar />}
      <CookieConsent />
    </>
  );
};

function App() {
  const { setUser, setProfile } = useAuthStore();

  useEffect(() => {
    // Restore session on mount (works even after app restart)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Only clear state when the user explicitly signs out
        setUser(null);
        setProfile(null);
      } else if (session?.user) {
        // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED — keep/restore the session
        setUser(session.user);
        fetchProfile(session.user.id);
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
            <Route path="/video-call" element={<VideoCallPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />

            {/* Legal */}
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/data-collection" element={<DataCollectionPage />} />

            <Route path="*" element={<Navigate to="/splash" replace />} />
          </Routes>
        </LayoutWrapper>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
