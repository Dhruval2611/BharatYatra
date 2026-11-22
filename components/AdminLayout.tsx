import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  name: string;
  path: string;
  // FIX: Replaced `JSX.Element` with `React.ReactElement` to resolve the "Cannot find namespace 'JSX'" error.
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { name: 'Add Package', path: '/admin/add-package', icon: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { name: 'Packages', path: '/admin/manage-packages', icon: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
  { name: 'Users', path: '/admin/manage-users', icon: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
  { name: 'Bookings', path: '/admin/manage-bookings', icon: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out from the Admin Panel?")) {
      sessionStorage.removeItem('isAdminAuthenticated');
      sessionStorage.removeItem('loggedInUser'); // Ensure user session is also cleared
      navigate('/');
    }
  };

  // Find the current page name
  const currentPage = navItems.find(item => location.pathname.startsWith(item.path))?.name || 'Admin';

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-black p-6 flex-col justify-between border-r border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500 mb-8 px-4">Admin Panel</h1>
          <nav className="space-y-2">
            {navItems.map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 ${isActive ? 'bg-teal-500/20 text-teal-400 font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`
                }
              >
                {item.icon({ className: "h-5 w-5" })}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-left transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 pb-24 lg:pb-10 overflow-auto">
        <h1 className="lg:hidden text-2xl font-bold text-white mb-4">{currentPage}</h1>
        <Outlet />
      </main>

      {/* Bottom Navigation - Mobile only */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-black/80 backdrop-blur-md border-t border-gray-700 flex justify-around">
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-xs py-2 px-1 w-full transition-colors duration-200 ${isActive ? 'text-teal-400' : 'text-gray-400 hover:text-white'}`
            }
          >
            {item.icon({ className: "h-6 w-6 mb-1" })}
            <span>{item.name}</span>
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center text-xs py-2 px-1 w-full transition-colors duration-200 text-red-400 hover:text-red-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;