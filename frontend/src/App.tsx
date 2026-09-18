import { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Welcome from '@/components/Welcome';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setIsLoggedIn(Boolean(data?.discordNick)))
      .catch(() => setIsLoggedIn(false))
      .finally(() => setCheckingSession(false));
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
