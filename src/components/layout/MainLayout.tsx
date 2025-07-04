import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavItemProps {
  to: string;
  children: React.ReactNode;
  isMobile?: boolean;
}

// Create a UI component for the navigation item
const NavItem: React.FC<NavItemProps> = ({ to, children, isMobile = false }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      isActive 
        ? isMobile ? "text-primary" : "text-primary font-medium" 
        : isMobile ? "text-gray-600" : "text-gray-600 hover:text-primary"
    }
  >
    {children}
  </NavLink>
);

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary">SkillWorld</h1>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <NavItem to="/">Discover</NavItem>
            <NavItem to="/create">Create</NavItem>
            <NavItem to="/messages">Messages</NavItem>
            <NavItem to="/notifications">Notifications</NavItem>
          </nav>
          
          <div className="flex items-center space-x-4">
            <NavItem to="/profile">Profile</NavItem>
            <button 
              onClick={logout}
              className="text-gray-600 hover:text-primary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-top border-t border-gray-200">
        <div className="flex justify-around py-3">
          <NavItem to="/" isMobile>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </NavItem>
          <NavItem to="/create" isMobile>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </NavItem>
          <NavItem to="/messages" isMobile>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </NavItem>
          <NavItem to="/notifications" isMobile>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </NavItem>
          <NavItem to="/profile" isMobile>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </NavItem>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
