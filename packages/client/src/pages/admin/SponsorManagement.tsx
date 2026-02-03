import { useState, useEffect } from 'react';
import { getAllSponsors, createSponsor, updateSponsor, deleteSponsor, Sponsor, CreateSponsorParams } from '../../api/sponsors';

const CATEGORIES = [
  { value: 'organizer', label: '主办单位' },
  { value: 'diamond', label: '钻石赞助' },
  { value: 'gold', label: '金牌赞助' },
  { value: 'silver', label: '银牌赞助' },
  { value: 'media', label: '支持媒体' },
];

export function SponsorManagement() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState<CreateSponsorParams>({
    name_zh: '',
    name_en: '',
    abbr: '',
    category: 'gold',
    logo_url: '',
    website: '',
    sort_order: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      const data = await getAllSponsors();
      setSponsors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_zh || !formData.name_en || !formData.category) {
      setError('请填写必填项');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (editingSponsor) {
        await updateSponsor(editingSponsor.id, formData);
      } else {
        await createSponsor(formData);
      }
      await loadSponsors();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name_zh: sponsor.name_zh,
      name_en: sponsor.name_en,
      abbr: sponsor.abbr || '',
      category: sponsor.category,
      logo_url: sponsor.logo_url || '',
      website: sponsor.website || '',
      sort_order: sponsor.sort_order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此赞助商吗？')) return;

    try {
      await deleteSponsor(id);
      await loadSponsors();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleToggleActive = async (sponsor: Sponsor) => {
    try {
      await updateSponsor(sponsor.id, { is_active: sponsor.is_active ? 0 : 1 });
      await loadSponsors();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSponsor(null);
    setFormData({
      name_zh: '',
      name_en: '',
      abbr: '',
      category: 'gold',
      logo_url: '',
      website: '',
      sort_order: 0,
    });
    setError('');
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">赞助商管理</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          添加赞助商
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingSponsor ? '编辑赞助商' : '添加赞助商'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    中文名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name_zh}
                    onChange={(e) => setFormData({ ...formData, name_zh: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    英文名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    简称/缩写
                  </label>
                  <input
                    type="text"
                    value={formData.abbr}
                    onChange={(e) => setFormData({ ...formData, abbr: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="如：PKU, MIT"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    类别 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  网站链接
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  排序 <span className="text-gray-400">(数字越小越靠前)</span>
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {submitting ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sponsors Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-gray-600">中文名称</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">英文名称</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">简称</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">类别</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">排序</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">状态</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {sponsors.map((sponsor) => (
              <tr key={sponsor.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{sponsor.name_zh}</td>
                <td className="py-3 px-4 text-gray-600">{sponsor.name_en}</td>
                <td className="py-3 px-4 text-gray-500">{sponsor.abbr || '-'}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                    {getCategoryLabel(sponsor.category)}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500">{sponsor.sort_order}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleToggleActive(sponsor)}
                    className={`px-2 py-1 text-xs rounded ${
                      sponsor.is_active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {sponsor.is_active ? '启用' : '禁用'}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(sponsor)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(sponsor.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sponsors.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          暂无赞助商数据
        </div>
      )}
    </div>
  );
}
