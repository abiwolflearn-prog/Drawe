import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { AdminSidebar } from './AdminSidebar.js';
import { Header } from '../layout/Header.js';
import { Card } from '../ui/Card.js';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090B0E] flex items-center justify-center text-slate-400 text-sm font-mono">
        Verifying authorization...
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center space-y-4 bg-[#141824] border-rose-500/30">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">Access Restricted</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              You must be logged in as an Administrator or Super Admin to access the Admin Control Center.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl"
              >
                Log In as Admin
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
