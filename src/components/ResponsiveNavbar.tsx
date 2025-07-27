'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Menu, X, User, Gamepad2, Search, Trophy, Users2 } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '/', icon: <Gamepad2 size={16} /> },
  { name: 'Duo', href: '/duo', icon: <Users2 size={16} /> },
  { name: 'Coaching', href: '/coaching', icon: <User size={16} /> },
  { name: 'Tournaments', href: '/tournaments', icon: <Trophy size={16} /> },
  { name: 'Search', href: '/search', icon: <Search size={16} /> },
];

export default function ResponsiveNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setIsOpen(false), [pathname]);

  // Close menu on Escape key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#0d0d0d]/95 backdrop-blur-sm py-2' 
          : 'bg-transparent py-4'
      }`}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="text-2xl font-bold bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] bg-clip-text text-transparent flex items-center"
              aria-label="Pairly homepage"
            >
              <Gamepad2 size={24} className="mr-2" />
              Pairly
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
                    pathname === link.href
                      ? 'bg-[#1a1a1a] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]/50'
                  }`}
                  aria-current={pathname === link.href ? 'page' : undefined}
                >
                  <span className="mr-2" aria-hidden="true">{link.icon}</span>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <Button 
              className="bg-transparent border border-[#6b8ab0] text-[#6b8ab0] hover:bg-[#6b8ab0]/10 text-sm py-1.5 px-4"
              asChild
              variant="outline"
            >
              <Link href="/login">
                <User size={16} className="mr-2" />
                Sign In
              </Link>
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#e6915b] to-[#e6915b] hover:from-[#d18251] hover:to-[#d18251] text-sm py-1.5 px-4"
              asChild
            >
              <Link href="/register">
                Sign Up
              </Link>
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none p-2 rounded-lg bg-[#1a1a1a] focus:ring-2 focus:ring-[#6b8ab0] transition-colors"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        id="mobile-menu"
        className={`md:hidden bg-[#0d0d0d] border-t border-[#2a2a2a] transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'max-h-[100vh] opacity-100 visible' 
            : 'max-h-0 opacity-0 invisible'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              href={link.href}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${
                pathname === link.href
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]/50'
              }`}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              <span className="mr-3" aria-hidden="true">{link.icon}</span>
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#2a2a2a] px-3 space-y-3">
            <Button 
              className="w-full bg-transparent border border-[#6b8ab0] text-[#6b8ab0] hover:bg-[#6b8ab0]/10"
              asChild
              variant="outline"
            >
              <Link href="/login">
                <User size={16} className="mr-2" />
                Sign In
              </Link>
            </Button>
            <Button 
              className="w-full bg-gradient-to-r from-[#e6915b] to-[#e6915b] hover:from-[#d18251] hover:to-[#d18251]"
              asChild
            >
              <Link href="/register">
                Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}