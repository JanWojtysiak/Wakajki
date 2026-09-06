import { useState } from 'react';

export default function Welcome({ onLogin }: { onLogin: () => void }) {
  const [nick, setNick] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const initRes = await fetch('http://localhost:3000/', {
        method: 'GET',
        credentials: 'include',
      });

      if (!initRes.ok) throw new Error('Nie udało się zainicjować sesji');
      const patchRes = await fetch('http://localhost:3000/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discordNick: nick }),
        credentials: 'include',
      });

      if (!patchRes.ok)
        throw new Error('Błąd logowania (nieudany zapis nicku)');

      onLogin();
    } catch (err) {
      setError('Nie udało się połączyć z serwerem. Czy backend jest włączony?');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Dołącz do platformy
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Twój nick z Discorda
            </label>
            <input
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="np. Użytkownik#1234"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Wejdź
          </button>
        </form>
      </div>
    </div>
  );
}
