import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Vote, 
  Map, 
  Activity, 
  Coins, 
  TrendingUp, 
  Users,
  Tree,
  Globe
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { cn } from '@/utils';
import { formatNumber, formatCurrency, formatRelativeTime } from '@/utils';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const stats = [
    {
      label: 'Total Impact Score',
      value: formatNumber(user?.total_impact_score || 0),
      change: '+12%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Activities Logged',
      value: formatNumber(user?.total_activities || 0),
      change: '+3',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: 'Community Members',
      value: '1,234',
      change: '+5%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      label: 'Global Impact',
      value: '5,678',
      change: '+8%',
      changeType: 'positive' as const,
      icon: Globe,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  const quickActions = [
    {
      title: 'Log Activity',
      description: 'Record your regenerative activities',
      icon: Plus,
      href: '/activities/new',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Create Proposal',
      description: 'Submit a new governance proposal',
      icon: Vote,
      href: '/governance/new',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'View Map',
      description: 'Explore global impact visualization',
      icon: Map,
      href: '/map',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      title: 'Tree Planting Initiative',
      type: 'tree_planting',
      impact: 150,
      location: 'Central Park, NYC',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'verified' as const,
    },
    {
      id: '2',
      title: 'Community Garden Setup',
      type: 'community_garden',
      impact: 75,
      location: 'Local Community Center',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: 'pending' as const,
    },
    {
      id: '3',
      title: 'Composting Workshop',
      type: 'composting',
      impact: 50,
      location: 'Urban Farm',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'verified' as const,
    },
  ];

  const tokenBalances = [
    {
      symbol: 'NALO',
      name: 'NaloDAO Token',
      balance: 1250.5,
      chain: 'solana' as const,
      change: '+5.2%',
      changeType: 'positive' as const,
    },
    {
      symbol: 'APT',
      name: 'Aptos',
      balance: 45.8,
      chain: 'aptos' as const,
      change: '+2.1%',
      changeType: 'positive' as const,
    },
    {
      symbol: 'SUI',
      name: 'Sui',
      balance: 89.3,
      chain: 'sui' as const,
      change: '-1.5%',
      changeType: 'negative' as const,
    },
  ];

  const activeProposals = [
    {
      id: '1',
      title: 'Community Solar Panel Installation',
      description: 'Proposal to install solar panels in the community center',
      votes: 234,
      quorum: 500,
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active' as const,
    },
    {
      id: '2',
      title: 'Urban Farming Expansion',
      description: 'Expand urban farming initiatives across the city',
      votes: 156,
      quorum: 300,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active' as const,
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}! 🌱
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Ready to make an impact today? Here's what's happening in your regenerative community.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className={cn(
                  'text-sm font-medium',
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.change}
                </p>
              </div>
              <div className={cn('p-3 rounded-full', stat.bgColor)}>
                <stat.icon className={cn('h-6 w-6', stat.color)} />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map((action, index) => (
            <Link
              key={action.title}
              to={action.href}
              className="card hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className={cn('p-3 rounded-full', action.bgColor)}>
                  <action.icon className={cn('h-6 w-6', action.color)} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Activities
              </h2>
              <Link
                to="/activities"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-forest-700 rounded-lg">
                  <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/20">
                    <Tree className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.location} • {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      +{activity.impact}
                    </p>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      activity.status === 'verified' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                    )}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Token Balances */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Token Balances
              </h2>
              <Link
                to="/tokens"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {tokenBalances.map((token) => (
                <div key={token.symbol} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-forest-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/20">
                      <Coins className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {token.symbol}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {token.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {token.balance.toLocaleString()}
                    </p>
                    <p className={cn(
                      'text-sm',
                      token.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {token.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Active Proposals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Active Proposals
            </h2>
            <Link
              to="/governance"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {activeProposals.map((proposal) => (
              <div key={proposal.id} className="p-4 bg-gray-50 dark:bg-forest-700 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {proposal.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {proposal.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{proposal.votes} votes</span>
                      <span>•</span>
                      <span>Quorum: {proposal.quorum}</span>
                      <span>•</span>
                      <span>Ends {formatRelativeTime(proposal.endDate)}</span>
                    </div>
                  </div>
                  <Link
                    to={`/governance/${proposal.id}`}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Vote
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}