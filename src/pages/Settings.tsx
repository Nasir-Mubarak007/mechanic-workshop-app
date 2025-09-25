import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Settings as SettingsIcon, Users, Edit, Plus, Power, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { fetchUsers, addUser, updateUser, toggleUserStatus, deleteUser } from '../api/users';
import { User } from '../types';
import Spinner from '../components/common/Spinner';

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'staff']),
});

const Settings: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);


  if (!isAuthenticated) return <Navigate to="/login" />;
// if (!user?.isAdmin) return <Navigate to="/dashboard" />;

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'staff' as 'admin' | 'staff',
  });

  if (!user) return <Spinner />

  useEffect(() => {
    // if (user?.isAdmin) {
    //   loadUsers();
    // }
    if (user) {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const res = await fetchUsers();
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users');
    }
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'staff', // Default to staff
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user:User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      password: user.password || '', // Keep password empty for editing
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser=(user:User)=>{
    setUserToDelete(user);
    setModalOpen(true);
  }

  const handleDelete = async (id: string) => {
  try {
    await deleteUser(id);
    setModalOpen(false);
    setUserToDelete(null);
    loadUsers();
    toast.success('User deleted successfully');
  } catch {
    toast.error('Failed to delete user');
  }
};
  


  

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleUserStatus(id);
      loadUsers();
      toast.success('User status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = userSchema.parse(formData);

      if (editingUser) {
        await updateUser(editingUser._id, {
          ...validated,
          password: validated.password || undefined,
        });
        toast.success('User updated');
      } else {
        if (!validated.password) throw new Error('Password required');
        await addUser({ ...validated, password: validated.password as string, isActive: true });
        toast.success('User added');
      }

      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        err.errors.forEach(e => toast.error(e.message));
      } else {
        toast.error(err.message || 'Save failed');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isAuthenticated) return <Navigate to="/login" />;
  // if (!user?.isAdmin) return <Navigate to="/dashboard" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card
          title="Staff Management"
          icon={Users}
          footer={<Button variant="primary" size="sm" icon={Plus} onClick={handleAddNew}>Add New Staff</Button>}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className={!user.isActive ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" icon={Edit} onClick={() => handleEdit(user)}>Edit</Button>
                        <Button variant={user.isActive ? 'warning' : 'success'} size="sm" icon={Power} onClick={() => handleToggleStatus(user._id)}>
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant={'danger'} size="sm" icon={Trash2} onClick={() => handleDeleteUser(user)}>
                          DELETE
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="About" icon={SettingsIcon}>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Vicky Auto Service</h3>
              <p className="text-sm text-gray-500 mt-1">Version 1.0.0</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">System Information</h4>
              <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 text-sm">
                <div className="sm:col-span-1"><dt className="text-gray-500">App Type</dt><dd className="text-gray-900">React SPA</dd></div>
                <div className="sm:col-span-1"><dt className="text-gray-500">Storage</dt><dd className="text-gray-900">Backend API</dd></div>
                <div className="sm:col-span-1"><dt className="text-gray-500">UI Framework</dt><dd className="text-gray-900">Tailwind CSS</dd></div>
                <div className="sm:col-span-1"><dt className="text-gray-500">Charts</dt><dd className="text-gray-900">Chart.js</dd></div>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">{editingUser ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                      <input name="username" value={formData.username} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                    </div>
                    {!editingUser && (
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                      </div>
                    )}
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                      <select name="role" value={formData.role} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:gap-2 sm:flex sm:flex-row-reverse sm:px-6">
                  <Button type="submit" variant="primary">{editingUser ? 'Update Staff Member' : 'Add Staff Member'}</Button>
                  <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="mt-3 sm:mt-0">Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-2xl font-b leading-6 text-gray-900">Are You sure You Want to delete {userToDelete?.name}'s account? </h3>
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-gray-500">This action cannot be undone.</p>
                    <div className="flex justify-end space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
                      <Button variant="danger" size="sm" onClick={() => user && handleDelete(userToDelete?._id as string)}>Delete</Button>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
    );
}

export default Settings;



