'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NewButton from '@/components/ui/newButton';
import {
  Menu,
  X,
  User,
  Gamepad2,
  LogOut,
  Settings,
  Trophy,
  Users as UsersIcon,
  Crown,
  Shield,
  ChevronDown
} from 'lucide-react';

const publicNavLinks = [
  { name: 'Home', href: '/', icon: <Gamepad2 size={16} /> },
  { name: 'Inhouses', href: '/inhouses', icon: <UsersIcon size={16} /> },
  { name: 'Duo', href: '/duo', icon: <UsersIcon size={16} /> },
  { name: 'Tournaments', href: '/tournaments', icon: <Trophy size={16} /> },
  { name: 'Coaching', href: '/coaching', icon: <User size={16} /> },
];

const authenticatedNavLinks = [
  { name: 'Inhouses', href: '/inhouses', icon: <UsersIcon size={16} /> },
  { name: 'Duo', href: '/duo', icon: <UsersIcon size={16} /> },
  { name: 'Tournaments', href: '/tournaments', icon: <Trophy size={16} /> },
  { name: 'Coaching', href: '/coaching', icon: <User size={16} /> },
];

export default function ResponsiveNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/'); // Przekierowanie na stronę główną po wylogowaniu
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getDisplayName = () => {
    if (!user) return '';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  const navLinks = isAuthenticated ? authenticatedNavLinks : publicNavLinks;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#1e1e27] py-3' : 'bg-[#0e0e11] py-4'}`}
      style={{ height: scrolled ? '70px' : '80px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img
                src="/images/pairly_logo.png"
                alt="Pairly Logo"
                className="w-24 h-24 mr-2" // Adjust the size as needed
              />
              <span className="text-2xl font-montserrat-medium font-semibold bg-gradient-to-r from-[#e6915b] to-[#d4a574] bg-clip-text text-transparent">
                Pairly
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${pathname === link.href ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]/50'} font-montserrat-medium`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:block">
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#e6915b]"></div>
            ) : isAuthenticated && user ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 bg-[#1a1a1a] rounded-lg px-4 py-2 hover:bg-[#2a2a2a] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#e6915b] font-bold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-white text-sm font-medium">{getDisplayName()}</span>
                    {user.verified && <Shield className="text-[#e6915b]" size={14} />}
                    {user.isPro && <Crown className="text-yellow-400" size={14} />}
                    <ChevronDown className="text-[#e6915b]" size={16} />
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] shadow-lg py-2">
                    <div className="px-4 py-3 border-b border-[#2a2a2a]">
                      <p className="text-white font-medium">{getDisplayName()}</p>
                      <p className="text-[#e6915b] text-sm">@{user.username}</p>
                      <p className="text-[#e6915b]/70 text-xs">{user.email}</p>
                    </div>

                    {(user.role === 'teammate' || user.role === 'administrator') && (
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-[#e6915b] hover:text-white hover:bg-[#2a2a2a] transition-colors"
                      >
                        <Gamepad2 size={16} className="mr-3" />
                        Dashboard
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-[#e6915b] hover:text-white hover:bg-[#2a2a2a] transition-colors"
                    >
                      <User size={16} className="mr-3" />
                      Profile
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-[#e6915b] hover:text-white hover:bg-[#2a2a2a] transition-colors"
                    >
                      <Settings size={16} className="mr-3" />
                      Settings
                    </Link>

                    {(user.role === 'teammate' || user.role === 'administrator') && (
                      <Link
                        href="/dashboard/teammate"
                        className="flex items-center px-4 py-2 text-[#e6915b] hover:text-white hover:bg-[#2a2a2a] transition-colors"
                      >
                        <Crown size={16} className="mr-3" />
                        Mentor Dashboard
                      </Link>
                    )}

                    {user.role === 'administrator' && (
                      <Link
                        href="/profile/administrator"
                        className="flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-[#2a2a2a] transition-colors"
                      >
                        <Shield size={16} className="mr-3" />
                        Admin Dashboard
                      </Link>
                    )}

                    {!user.isPro && (
                      <Link
                        href="/become-teammate"
                        className="flex items-center px-4 py-2 text-[#e6915b] hover:text-white hover:bg-[#2a2a2a] transition-colors"
                      >
                        <Shield size={16} className="mr-3" />
                        Become Mentor
                      </Link>
                    )}

                    <div className="border-t border-[#2a2a2a] mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-[#2a2a2a] transition-colors w-full"
                      >
                        <LogOut size={16} className="mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-4 flex items-center md:ml-6 space-x-3">
                <NewButton
                  className="font-semibold rounded font-montserrat-medium uppercase tracking-wide flex items-center gap-2"
                  variant="secondary"
                >
                  <Link href="/login" className="flex items-center">
                    <User size={16} className="mr-2" />
                    Sign In
                  </Link>
                </NewButton>

                <NewButton
                  className="font-semibold rounded font-montserrat-medium uppercase tracking-wide flex items-center gap-2"
                  variant="primary_2"
                >
                  <Link href="/register" className="flex items-center">
                    <User size={16} className="mr-2" />
                    Sign Up
                  </Link>
                </NewButton>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#e6915b] hover:text-white focus:outline-none p-2 rounded-lg bg-[#1a1a1a]"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0d0d0d] border-t border-[#2a2a2a]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${pathname === link.href ? 'bg-[#1a1a1a] text-white' : 'text-[#e6915b] hover:text-white hover:bg-[#1a1a1a]/50'}`}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
