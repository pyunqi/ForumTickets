import { getDatabase } from '../database/connection';

export interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  bankInfo?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    note: string;
  };
}

export interface PaymentSettings {
  methods: PaymentMethod[];
}

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  methods: [
    {
      id: 'transfer',
      name: '银行转账',
      enabled: true,
      bankInfo: {
        bankName: '中国工商银行北京海淀支行',
        accountName: '北京大学教育基金会',
        accountNumber: '0200 0045 0908 9131 391',
        note: '请在转账时务必备注注册编号'
      }
    },
    {
      id: 'alipay',
      name: '支付宝',
      enabled: true
    },
    {
      id: 'wechat',
      name: '微信支付',
      enabled: true
    }
  ]
};

export function getPaymentSettings(): PaymentSettings {
  const db = getDatabase();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('payment_methods') as { value: string } | undefined;

  if (row) {
    try {
      return JSON.parse(row.value);
    } catch {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  }

  // Initialize with default settings
  db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
    .run('payment_methods', JSON.stringify(DEFAULT_PAYMENT_SETTINGS));

  return DEFAULT_PAYMENT_SETTINGS;
}

export function updatePaymentSettings(settings: PaymentSettings): PaymentSettings {
  const db = getDatabase();
  db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
    .run('payment_methods', JSON.stringify(settings));
  return settings;
}

export function getEnabledPaymentMethods(): PaymentMethod[] {
  const settings = getPaymentSettings();
  return settings.methods.filter(m => m.enabled);
}
