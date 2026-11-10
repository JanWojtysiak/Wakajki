import { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Welcome from '@/components/Welcome';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('http://localhost:3000', { credentials: 'include' });
        const data = res.ok ? await res.json() : null;
        setIsLoggedIn(Boolean(data?.discordNick));
      } catch {
        setIsLoggedIn(false);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  if (checkingSession) {
    return null;
  }

  return (
    <div>
      {!isLoggedIn ? (
        <Welcome onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}

export default App;
