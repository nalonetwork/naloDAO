import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  User, 
  Activity, 
  Vote, 
  Coins, 
  Map, 
  Settings,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { cn } from '@/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Activities', href: '/activities', icon: Activity },
  { name: 'Governance', href: '/governance', icon: Vote },
  { name: 'Tokens', href: '/tokens', icon: Coins },
  { name: 'Impact Map', href: '/map', icon: Map },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme, setSidebarOpen: setUISidebarOpen } = useUIStore();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-forest-900">
      {/* Mobile sidebar */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', { hidden: !sidebarOpen })}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-forest-800"
        >
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-primary-600">NaloDAO</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    {
                      'bg-primary-100 text-primary-900 dark:bg-primary-900/20 dark:text-primary-100':
                        isActive,
                      'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-forest-700 dark:hover:text-white':
                        !isActive,
                    }
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      {
                        'text-primary-500': isActive,
                        'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300':
                          !isActive,
                      }
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="border-t border-gray-200 dark:border-forest-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-forest-800 border-r border-gray-200 dark:border-forest-700">
          <div className="flex h-16 items-center px-4">
            <Link to="/dashboard" className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-white">N</span>
              </div>
              <h1 className="text-xl font-bold text-primary-600">NaloDAO</h1>
            </Link>
          </div>
          
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    {
                      'bg-primary-100 text-primary-900 dark:bg-primary-900/20 dark:text-primary-100':
                        isActive,
                      'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-forest-700 dark:hover:text-white':
                        !isActive,
                    }
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      {
                        'text-primary-500': isActive,
                        'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300':
                          !isActive,
                      }
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="border-t border-gray-200 dark:border-forest-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {theme.mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-forest-700 bg-white dark:bg-forest-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors lg:hidden"
              >
                {theme.mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}