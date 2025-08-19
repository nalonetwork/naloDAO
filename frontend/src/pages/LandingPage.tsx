import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Tree, 
  Users, 
  Globe, 
  Shield, 
  Zap,
  Github,
  Play
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { cn } from '@/utils';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();

  const stats = [
    { label: 'Members', value: '1,234', icon: Users },
    { label: 'Activities Logged', value: '5,678', icon: Tree },
    { label: 'Tokens Circulating', value: '2.5M', icon: Zap },
  ];

  const features = [
    {
      title: 'Track Regenerative Activities',
      description: 'Log and verify your environmental impact with blockchain transparency.',
      icon: Tree,
      color: 'text-green-600',
    },
    {
      title: 'Community Governance',
      description: 'Participate in DAO proposals and vote on community initiatives.',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Multi-Chain Ecosystem',
      description: 'Seamlessly operate across Solana and Move-based blockchains.',
      icon: Globe,
      color: 'text-purple-600',
    },
    {
      title: 'Impact Verification',
      description: 'Transparent verification system ensures authentic impact tracking.',
      icon: Shield,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-white">N</span>
              </div>
              <span className="text-xl font-bold text-primary-600">NaloDAO</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {theme.mode === 'dark' ? '🌙' : '☀️'}
              </button>
              
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-primary"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Join the DAO
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl"
            >
              A New Economy for{' '}
              <span className="gradient-text">Earth</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300"
            >
              Track regenerative activities, govern community proposals, and manage a multi-chain token ecosystem across Solana and Move-based blockchains.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-primary text-lg px-8 py-4"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="btn-primary text-lg px-8 py-4"
                >
                  Join the DAO
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
              
              <button className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-forest-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/20">
                    <stat.icon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-forest-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Building the Future of Regenerative Finance
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Our platform combines blockchain technology with environmental impact tracking to create a new paradigm for sustainable development.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-gray-100 dark:bg-forest-700">
                    <feature.icon className={cn('h-6 w-6', feature.color)} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white dark:bg-forest-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-6">
                About NaloDAO
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                NaloDAO is a decentralized autonomous organization focused on tracking and rewarding regenerative activities that benefit our planet and communities.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Through blockchain technology, we create transparent, verifiable impact tracking that enables communities to govern their own regenerative initiatives and build a sustainable future together.
              </p>
              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com/nalodao"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  <Github className="mr-2 h-5 w-5" />
                  View on GitHub
                </a>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-video bg-gradient-to-br from-primary-500 to-ocean-500 rounded-lg shadow-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-4">🌱</div>
                    <p className="text-xl font-semibold">Impact Visualization</p>
                    <p className="text-sm opacity-80">Coming Soon</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-white sm:text-4xl mb-6"
          >
            Ready to Make an Impact?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of people already tracking their regenerative activities and participating in community governance.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center bg-white text-primary-600 hover:bg-gray-50 font-medium py-3 px-8 rounded-lg transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center bg-white text-primary-600 hover:bg-gray-50 font-medium py-3 px-8 rounded-lg transition-colors"
              >
                Join the DAO
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-white">N</span>
                </div>
                <span className="text-xl font-bold">NaloDAO</span>
              </div>
              <p className="text-gray-400">
                Building a new economy for Earth through regenerative finance and community governance.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Activities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Governance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tokens</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Impact Map</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Telegram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Forum</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NaloDAO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}