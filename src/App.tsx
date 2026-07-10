import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import LandingHomePage from './components/LandingHomePage';

type AppView = 'landing' | 'login' | 'dashboard';

function App() {
  const [role, setRole] = useState<'admin' | 'viewer' | null>(() => {
    return (localStorage.getItem('role') as 'admin' | 'viewer' | null) || null;
  });
  const [email, setEmail] = useState<string>(() => {
    return localStorage.getItem('email') || '';
  });
  const [name, setName] = useState<string>(() => {
    return localStorage.getItem('name') || '';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  // If already authenticated, skip landing; otherwise show landing page first
  const [view, setView] = useState<AppView>(() =>
    localStorage.getItem('role') ? 'dashboard' : 'landing'
  );

  // Load theme state from localStorage on mount (defaults to light mode)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    } else {
      // Default to light mode as requested by user
      setTheme('light');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  const handleLogin = (selectedRole: 'admin' | 'viewer', userEmail: string, userName: string) => {
    setRole(selectedRole);
    setEmail(userEmail);
    setName(userName);
    localStorage.setItem('role', selectedRole);
    localStorage.setItem('email', userEmail);
    localStorage.setItem('name', userName);
    setView('dashboard');
  };

  const handleLogout = () => {
    setRole(null);
    setEmail('');
    setName('');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    setView('landing');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  // Landing page needs its own scrollable root — Login & Dashboard need h-screen overflow-hidden
  if (view === 'landing') {
    return (
      <div className="w-full min-h-screen font-sans selection:bg-indigo-500/30">
        <LandingHomePage
          onNavigateToLogin={() => setView('login')}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden font-sans selection:bg-indigo-500/30 transition-all duration-300">
      {view === 'login' && (
        <Login onLogin={handleLogin} onBack={() => setView('landing')} theme={theme} toggleTheme={toggleTheme} />
      )}
      {view === 'dashboard' && role !== null && (
        <Dashboard
          role={role}
          email={email}
          name={name}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}

export default App;
