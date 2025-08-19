import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  Camera,
  Shield,
  Bell,
  Globe,
  Key
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { cn } from '@/utils';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().optional(),
  location: z.string().optional(),
  project_interests: z.array(z.string()).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      project_interests: user?.project_interests || [],
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement profile update
      console.log('Profile update:', data);
      toast.success('Profile updated successfully!');
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.',
      });
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const projectInterests = [
    'Tree Planting',
    'Community Gardens',
    'Renewable Energy',
    'Water Conservation',
    'Waste Reduction',
    'Education',
    'Biodiversity',
    'Soil Regeneration',
  ];

  const stats = [
    {
      label: 'Total Impact Score',
      value: user?.total_impact_score || 0,
      icon: '🌱',
    },
    {
      label: 'Activities Logged',
      value: user?.total_activities || 0,
      icon: '📊',
    },
    {
      label: 'Days Active',
      value: 45,
      icon: '📅',
    },
    {
      label: 'Community Rank',
      value: '#123',
      icon: '🏆',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Manage your account settings and profile information.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-primary-600 hover:text-primary-500"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        className="absolute -bottom-1 -right-1 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {user?.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('name')}
                        type="text"
                        disabled={!isEditing}
                        className={cn(
                          'input-field pl-10',
                          !isEditing && 'bg-gray-50 dark:bg-forest-800 cursor-not-allowed',
                          errors.name && 'border-red-500 focus:ring-red-500'
                        )}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="input-field pl-10 bg-gray-50 dark:bg-forest-800 cursor-not-allowed"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('location')}
                        type="text"
                        disabled={!isEditing}
                        placeholder="Enter your location"
                        className={cn(
                          'input-field pl-10',
                          !isEditing && 'bg-gray-50 dark:bg-forest-800 cursor-not-allowed'
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      {...register('bio')}
                      rows={3}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself and your regenerative interests"
                      className={cn(
                        'input-field resize-none',
                        !isEditing && 'bg-gray-50 dark:bg-forest-800 cursor-not-allowed'
                      )}
                    />
                  </div>
                </div>

                {/* Project Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Project Interests
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {projectInterests.map((interest) => (
                      <label
                        key={interest}
                        className={cn(
                          'flex items-center p-3 rounded-lg border cursor-pointer transition-colors',
                          !isEditing && 'cursor-not-allowed opacity-60',
                          isEditing
                            ? 'hover:bg-gray-50 dark:hover:bg-forest-700'
                            : 'bg-gray-50 dark:bg-forest-800'
                        )}
                      >
                        <input
                          type="checkbox"
                          value={interest}
                          disabled={!isEditing}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-3"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {interest}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-forest-700">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn-secondary"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Impact
            </h3>
            <div className="space-y-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-forest-700 rounded-lg transition-colors">
                <Shield className="h-5 w-5 mr-3 text-gray-400" />
                Privacy Settings
              </button>
              <button className="w-full flex items-center p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-forest-700 rounded-lg transition-colors">
                <Bell className="h-5 w-5 mr-3 text-gray-400" />
                Notification Preferences
              </button>
              <button className="w-full flex items-center p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-forest-700 rounded-lg transition-colors">
                <Globe className="h-5 w-5 mr-3 text-gray-400" />
                Language & Region
              </button>
              <button className="w-full flex items-center p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-forest-700 rounded-lg transition-colors">
                <Key className="h-5 w-5 mr-3 text-gray-400" />
                Security Settings
              </button>
            </div>
          </div>

          {/* Account Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Account Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Email Verified
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Account Status
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Member Since
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}