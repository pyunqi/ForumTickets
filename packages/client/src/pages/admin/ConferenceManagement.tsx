import { useState, useEffect } from 'react';
import {
  getAllConferences,
  createConference,
  updateConference,
  deleteConference,
  activateConference,
  Conference,
  CreateConferenceParams,
} from '../../api/conferences';

export function ConferenceManagement() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConference, setEditingConference] = useState<Conference | null>(null);
  const [formData, setFormData] = useState<CreateConferenceParams>({
    name_zh: '',
    name_en: '',
    subtitle_zh: '',
    subtitle_en: '',
    date_start: '',
    date_end: '',
    checkin_time: '',
    venue_zh: '',
    venue_en: '',
    contact_email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConferences();
  }, []);

  const loadConferences = async () => {
    try {
      const data = await getAllConferences();
      setConferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_zh || !formData.name_en || !formData.date_start || !formData.date_end || !formData.venue_zh || !formData.venue_en) {
      setError('请填写必填项');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (editingConference) {
        await updateConference(editingConference.id, formData);
      } else {
        await createConference(formData);
      }
      await loadConferences();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (conference: Conference) => {
    setEditingConference(conference);
    setFormData({
      name_zh: conference.name_zh,
      name_en: conference.name_en,
      subtitle_zh: conference.subtitle_zh || '',
      subtitle_en: conference.subtitle_en || '',
      date_start: conference.date_start,
      date_end: conference.date_end,
      checkin_time: conference.checkin_time || '',
      venue_zh: conference.venue_zh,
      venue_en: conference.venue_en,
      contact_email: conference.contact_email || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此会议吗？')) return;

    try {
      await deleteConference(id);
      await loadConferences();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await activateConference(id);
      await loadConferences();
    } catch (err) {
      setError(err instanceof Error ? err.message : '激活失败');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingConference(null);
    setFormData({
      name_zh: '',
      name_en: '',
      subtitle_zh: '',
      subtitle_en: '',
      date_start: '',
      date_end: '',
      checkin_time: '',
      venue_zh: '',
      venue_en: '',
      contact_email: '',
    });
    setError('');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
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
        <h2 className="text-lg font-semibold text-gray-900">会议管理</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          添加会议
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8" onClick={resetForm}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingConference ? '编辑会议' : '添加会议'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    会议名称（中文） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name_zh}
                    onChange={(e) => setFormData({ ...formData, name_zh: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="第十二届国际学术论坛"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    会议名称（英文） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12th International Academic Forum"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    副标题（中文）
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle_zh}
                    onChange={(e) => setFormData({ ...formData, subtitle_zh: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="人工智能与人文社科的交叉融合"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    副标题（英文）
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle_en}
                    onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="The Intersection of AI and Humanities"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    开始日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date_start}
                    onChange={(e) => setFormData({ ...formData, date_start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    结束日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date_end}
                    onChange={(e) => setFormData({ ...formData, date_end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    签到时间
                  </label>
                  <input
                    type="text"
                    value={formData.checkin_time}
                    onChange={(e) => setFormData({ ...formData, checkin_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="08:30 - 09:00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    会议地点（中文） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.venue_zh}
                    onChange={(e) => setFormData({ ...formData, venue_zh: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="新西兰教科文中心"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    会议地点（英文） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.venue_en}
                    onChange={(e) => setFormData({ ...formData, venue_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="New Zealand UNESCO Center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  联系邮箱
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="forum@example.com"
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

      {/* Conferences List */}
      <div className="space-y-4">
        {conferences.map((conference) => (
          <div
            key={conference.id}
            className={`p-4 border rounded-lg ${
              conference.is_active ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{conference.name_zh}</h3>
                  {conference.is_active ? (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded">
                      当前激活
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-gray-600 mb-1">{conference.name_en}</p>
                {conference.subtitle_zh && (
                  <p className="text-sm text-gray-500 mb-2">{conference.subtitle_zh}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>
                    <strong>日期：</strong>
                    {formatDate(conference.date_start)} - {formatDate(conference.date_end)}
                  </span>
                  <span>
                    <strong>地点：</strong>
                    {conference.venue_zh}
                  </span>
                  {conference.checkin_time && (
                    <span>
                      <strong>签到：</strong>
                      {conference.checkin_time}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                {!conference.is_active && (
                  <button
                    onClick={() => handleActivate(conference.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    激活
                  </button>
                )}
                <button
                  onClick={() => handleEdit(conference)}
                  className="px-3 py-1 text-blue-600 border border-blue-600 text-sm rounded hover:bg-blue-50 transition-colors"
                >
                  编辑
                </button>
                {!conference.is_active && (
                  <button
                    onClick={() => handleDelete(conference.id)}
                    className="px-3 py-1 text-red-600 border border-red-600 text-sm rounded hover:bg-red-50 transition-colors"
                  >
                    删除
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {conferences.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          暂无会议数据
        </div>
      )}
    </div>
  );
}
