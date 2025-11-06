import React, { useState } from 'react';
import { Leaf, ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useReservations } from '../hooks/useReservations';
import AuthModal from './AuthModal';

interface NavbarProps {
  currentPage?: 'home' | 'cart';
  onNavigate?: (page: 'home' | 'cart') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage = 'home', onNavigate }) => {
  const { user, signOut } = useAuth();
  const { reservations } = useReservations();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowMenu(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Leaf className="w-8 h-8 text-green-700" />
              <span className="text-xl font-bold text-gray-900">Harpreet Regreens</span>
            </div>

            <div className="flex items-center gap-4">
              <button
              onClick={() => onNavigate?.('cart')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                currentPage === 'cart'
                  ? 'bg-green-700 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-medium">{reservations.length}/2</span>
            </button>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <User className="w-5 h-5" />
                  {user ? <span className="text-sm">{user.email?.split('@')[0]}</span> : <span>Account</span>}
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setShowAuthModal(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-center text-sm font-medium text-white bg-green-700 hover:bg-green-800 transition"
                      >
                        Sign In / Register
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};

export default Navbar;
