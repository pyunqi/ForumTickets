import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../api/admin';
import type { Admin } from '../../types';

export function AdminManagement() {
  const { admin: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'admin' as 'admin' | 'super_admin',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const data = await getAdmins();
      setAdmins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAdmin(null);
    setFormData({ username: '', password: '', email: '', role: 'admin' });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      password: '',
      email: admin.email || '',
      role: admin.role,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingAdmin) {
        await updateAdmin(editingAdmin.id, {
          username: formData.username,
          password: formData.password || undefined,
          email: formData.email || undefined,
          role: formData.role,
        });
      } else {
        if (!formData.password) {
          setError('请输入密码');
          setSubmitting(false);
          return;
        }
        await createAdmin(formData);
      }
      await loadAdmins();
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (admin: Admin) => {
    if (!confirm(`确定要删除管理员 "${admin.username}" 吗？`)) return;

    try {
      await deleteAdmin(admin.id);
      await loadAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleToggleActive = async (admin: Admin) => {
    try {
      await updateAdmin(admin.id, { is_active: admin.is_active ? 0 : 1 });
      await loadAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">管理员列表</h2>
        {isSuperAdmin && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            添加管理员
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          只有超级管理员可以管理其他管理员
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">邮箱</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
              {isSuperAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {admin.username}
                  {admin.id === currentAdmin?.id && (
                    <span className="ml-2 text-xs text-blue-600">(当前用户)</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    admin.role === 'super_admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {admin.role === 'super_admin' ? '超级管理员' : '管理员'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    admin.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {admin.is_active ? '启用' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(admin.created_at).toLocaleString('zh-CN')}
                </td>
                {isSuperAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => openEditModal(admin)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleToggleActive(admin)}
                      className={admin.is_active ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                    >
                      {admin.is_active ? '禁用' : '启用'}
                    </button>
                    {admin.id !== currentAdmin?.id && (
                      <button
                        onClick={() => handleDelete(admin)}
                        className="text-red-600 hover:text-red-800"
                      >
                        删除
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingAdmin ? '编辑管理员' : '添加管理员'}
            </h3>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码 {editingAdmin && <span className="text-gray-400">(留空则不修改)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!editingAdmin}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'super_admin' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="admin">管理员</option>
                  <option value="super_admin">超级管理员</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {submitting ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
