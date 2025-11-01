'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LoginModal from '@/components/modals/LoginModal';
import RegisterModal from '@/components/modals/RegisterModal';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      // Check if user is authenticated
      await api.get('/api/users/me');
      setIsLoggedIn(true);

      // Check if user is admin
      try {
        const adminResponse = await api.get<any>('/api/users/is-admin');
        setIsAdmin(adminResponse.isAdmin === true);
      } catch {
        setIsAdmin(false);
      }
    } catch {
      setIsLoggedIn(false);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const navbarHeight = 64; // h-16 = 64px
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#002644]/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">
                StudyBuddy
              </span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#about" 
              onClick={(e) => handleSmoothScroll(e, 'about')}
              className="text-white/80 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              About Us
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => handleSmoothScroll(e, 'pricing')}
              className="text-white/80 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Paket
            </a>
            <a 
              href="#review" 
              onClick={(e) => handleSmoothScroll(e, 'review')}
              className="text-white/80 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Testimoni
            </a>
            <a 
              href="#faq" 
              onClick={(e) => handleSmoothScroll(e, 'faq')}
              className="text-white/80 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              FAQ
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleSmoothScroll(e, 'contact')}
              className="text-white/80 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Kontak
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-32 h-10 bg-white/10 rounded animate-pulse"></div>
            ) : isLoggedIn ? (
              <Button 
                className="bg-white text-[#002644] hover:bg-white/90 font-semibold"
                onClick={() => router.push(isAdmin ? '/admin/dashboard' : '/dashboard')}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setLoginOpen(true)}
                >
                  Login
                </Button>
                <Button 
                  className="bg-white text-[#002644] hover:bg-white/90 font-semibold"
                  onClick={() => setRegisterOpen(true)}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal 
        open={loginOpen} 
        onOpenChange={(open) => {
          setLoginOpen(open);
          if (!open) {
            // Re-check auth status after modal closes (in case user logged in)
            checkAuthStatus();
          }
        }}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />
      <RegisterModal 
        open={registerOpen} 
        onOpenChange={(open) => {
          setRegisterOpen(open);
          if (!open) {
            // Re-check auth status after modal closes
            checkAuthStatus();
          }
        }}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
    </nav>
  );
};

export default Navbar;
