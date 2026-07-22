import React, { useState, useEffect } from 'react';
import { getSavedToken, logoutToken } from './services/tokenAuth';
import { getSavedUserProfile } from './services/supabaseClient';
import { UserProfile } from './types';
import { TokenModal } from './components/TokenModal';
import { Navbar } from './components/Navbar';
import { ProfilePage } from './components/pages/ProfilePage';
import { CheatsheetPage } from './components/pages/CheatsheetPage';
import { ChallengesPage } from './components/pages/ChallengesPage';
import { IntelPage } from './components/pages/IntelPage';
import { ChatPage } from './components/pages/ChatPage';

export function App() {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [userProfile, setUserProfile] = useState<UserProfile>(getSavedUserProfile());

  useEffect(() => {
    const saved = getSavedToken();
    if (saved) {
      setIsAuthorized(true);
    }
  }, []);

  const handleLogout = () => {
    logoutToken();
    setIsAuthorized(false);
  };

  if (!isAuthorized) {
    return <TokenModal onSuccess={() => setIsAuthorized(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cyber-bg text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        onLogout={handleLogout}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 1 && (
          <ProfilePage
            profile={userProfile}
            onUpdateProfile={(updated) => setUserProfile(updated)}
          />
        )}
        {activeTab === 2 && <CheatsheetPage />}
        {activeTab === 3 && <ChallengesPage userProfile={userProfile} />}
        {activeTab === 4 && <IntelPage userProfile={userProfile} />}
        {activeTab === 5 && <ChatPage userProfile={userProfile} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 font-mono">
        <p>SecExchange — Security Competition Information & Intelligence Hub © 2026</p>
      </footer>
    </div>
  );
}

export default App;
