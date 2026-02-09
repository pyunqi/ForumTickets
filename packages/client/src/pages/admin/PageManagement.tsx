import { useState, useEffect } from 'react';
import { getPageVisibility, updatePageVisibility, PageVisibility } from '../../api/settings';

const SECTION_DESCRIPTIONS: Record<string, string> = {
  about: '首页「关于论坛」介绍区块',
  speakers: '首页「演讲嘉宾」展示区块',
  schedule: '首页「会议日程」展示区块',
  sponsors: '首页「赞助商」展示区块',
  tickets: '首页「票务注册」购票区块',
  cta: '首页底部「报名引导」按钮区块',
};

export function PageManagement() {
  const [settings, setSettings] = useState<PageVisibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getPageVisibility();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (sectionId: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      sections: settings.sections.map(s =>
        s.id === sectionId ? { ...s, enabled: !s.enabled } : s
      )
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updatePageVisibility(settings);
      setSuccess('保存成功');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!settings) {
    return <div className="text-center py-12 text-red-500">{error || '加载设置失败'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">首页区块管理</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {settings.sections.map((section) => (
          <div key={section.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={() => handleToggle(section.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <div>
                  <span className={`font-medium ${section.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                    {section.name}
                  </span>
                  <p className="text-xs text-gray-500">
                    {SECTION_DESCRIPTIONS[section.id] || section.id}
                  </p>
                </div>
                {section.enabled && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">已启用</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="text-sm font-medium text-amber-800 mb-2">说明</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• 关闭的区块将不在首页显示，对应的导航链接也会隐藏</li>
          <li>• Hero 横幅和页脚始终显示，不受开关影响</li>
          <li>• 关闭「票务注册」后，Hero 区域的「立即报名」按钮也会隐藏</li>
        </ul>
      </div>
    </div>
  );
}
