import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Cart from './pages/Cart';
import { useAuth } from './contexts/AuthContext';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'cart' | 'admin'>('home');
  const { user } = useAuth();

  useEffect(() => {
    const isAdmin = user?.email?.endsWith('@harpreetregreens.com');
    if (!isAdmin && currentPage === 'admin') {
      setCurrentPage('home');
    }
  }, [user]);

  const handleNavigate = (page: 'home' | 'cart' | 'admin') => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar currentPage={currentPage as 'home' | 'cart'} onNavigate={handleNavigate} />
      {currentPage === 'home' && <Home />}
      {currentPage === 'cart' && <Cart onBackClick={() => handleNavigate('home')} />}
      {currentPage === 'admin' && <Admin />}

      {user?.email?.endsWith('@harpreetregreens.com') && (
        <button
          onClick={() => handleNavigate(currentPage === 'admin' ? 'home' : 'admin')}
          className="fixed bottom-6 right-6 px-4 py-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-black transition"
        >
          {currentPage === 'admin' ? 'Shop' : 'Admin'}
        </button>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
