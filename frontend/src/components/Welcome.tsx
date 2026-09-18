interface WelcomeProps {
  onLogin?: () => void;
}

export default function Welcome(_props: WelcomeProps) {
  const handleDiscordLogin = () => {
    window.location.href = 'http://localhost:3000/auth/discord';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md text-center">
        <div className="w-16 h-16 bg-[#5865F2] rounded-2xl mx-auto flex items-center justify-center mb-2 rotate-3 hover:rotate-0 transition-transform">
          <span className="text-white text-3xl font-extrabold">D</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Dołącz do platformy
        </h1>

        <p className="text-gray-500 text-sm">
          Zaloguj się za pomocą swojego konta Discord, aby dołączać do zespołów
          i zarządzać projektami na hackathonie.
        </p>

        <button
          onClick={handleDiscordLogin}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5865F2] hover:bg-[#4752C4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5865F2] transition-colors"
        >
          Zaloguj przez Discord
        </button>
      </div>
    </div>
  );
}
