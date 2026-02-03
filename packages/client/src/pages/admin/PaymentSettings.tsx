import { useState, useEffect } from 'react';
import { getPaymentSettings, updatePaymentSettings, PaymentSettings } from '../../api/settings';

type BankInfoField = 'bankName' | 'accountName' | 'accountNumber' | 'note';

export function PaymentSettingsManagement() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getPaymentSettings();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (methodId: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      methods: settings.methods.map(m =>
        m.id === methodId ? { ...m, enabled: !m.enabled } : m
      )
    });
  };

  const handleBankInfoChange = (methodId: string, field: BankInfoField, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      methods: settings.methods.map(m => {
        if (m.id === methodId && m.bankInfo) {
          return {
            ...m,
            bankInfo: { ...m.bankInfo, [field]: value }
          };
        }
        return m;
      })
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updatePaymentSettings(settings);
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
        <h2 className="text-lg font-semibold text-gray-900">支付方式配置</h2>
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
        {settings.methods.map((method) => (
          <div key={method.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={method.enabled}
                    onChange={() => handleToggle(method.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className={`font-medium ${method.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                  {method.name}
                </span>
                {method.enabled && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">已启用</span>
                )}
              </div>
            </div>

            {/* Bank Transfer specific settings */}
            {method.id === 'transfer' && method.bankInfo && (
              <div className={`space-y-3 pt-4 border-t ${!method.enabled && 'opacity-50'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">收款银行</label>
                    <input
                      type="text"
                      value={method.bankInfo.bankName}
                      onChange={(e) => handleBankInfoChange(method.id, 'bankName', e.target.value)}
                      disabled={!method.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">账户名称</label>
                    <input
                      type="text"
                      value={method.bankInfo.accountName}
                      onChange={(e) => handleBankInfoChange(method.id, 'accountName', e.target.value)}
                      disabled={!method.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">银行账号</label>
                  <input
                    type="text"
                    value={method.bankInfo.accountNumber}
                    onChange={(e) => handleBankInfoChange(method.id, 'accountNumber', e.target.value)}
                    disabled={!method.enabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">转账备注说明</label>
                  <input
                    type="text"
                    value={method.bankInfo.note}
                    onChange={(e) => handleBankInfoChange(method.id, 'note', e.target.value)}
                    disabled={!method.enabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="text-sm font-medium text-amber-800 mb-2">说明</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• 启用的支付方式将在用户支付页面显示</li>
          <li>• 银行转账需要配置详细的账户信息</li>
          <li>• 支付宝和微信支付为模拟支付，点击即完成</li>
        </ul>
      </div>
    </div>
  );
}
