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

// ===== Page Visibility Settings =====

export interface PageSection {
  id: string;
  name: string;
  enabled: boolean;
}

export interface PageVisibility {
  sections: PageSection[];
}

const DEFAULT_PAGE_VISIBILITY: PageVisibility = {
  sections: [
    { id: 'about', name: '关于论坛', enabled: true },
    { id: 'speakers', name: '演讲嘉宾', enabled: true },
    { id: 'schedule', name: '会议日程', enabled: true },
    { id: 'sponsors', name: '赞助商', enabled: true },
    { id: 'tickets', name: '票务注册', enabled: true },
    { id: 'cta', name: '报名引导', enabled: true },
  ]
};

export function getPageVisibility(): PageVisibility {
  const db = getDatabase();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('page_visibility') as { value: string } | undefined;

  if (row) {
    try {
      return JSON.parse(row.value);
    } catch {
      return DEFAULT_PAGE_VISIBILITY;
    }
  }

  // Initialize with default settings
  db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
    .run('page_visibility', JSON.stringify(DEFAULT_PAGE_VISIBILITY));

  return DEFAULT_PAGE_VISIBILITY;
}

export function updatePageVisibility(settings: PageVisibility): PageVisibility {
  const db = getDatabase();
  db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
    .run('page_visibility', JSON.stringify(settings));
  return settings;
}

// ===== Homepage Content Settings =====

export interface HomepageContent {
  stats: Array<{ value: string; label_zh: string; label_en: string }>;
  speakers: Array<{
    name_zh: string; name_en: string;
    title_zh: string; title_en: string;
    org_zh: string; org_en: string;
    field_zh: string; field_en: string;
  }>;
  schedule: {
    day1: Array<{ time: string; title_zh: string; title_en: string; desc_zh: string; desc_en: string }>;
    day2: Array<{ time: string; title_zh: string; title_en: string; desc_zh: string; desc_en: string }>;
  };
  footer: {
    organizers: Array<{ name_zh: string; name_en: string }>;
    contact: { email: string; phone: string; address: string };
  };
  hero: {
    title_zh: string; title_en: string;
    subtitle_zh: string; subtitle_en: string;
    date_zh: string; date_en: string;
    venue_zh: string; venue_en: string;
    description_zh: string; description_en: string;
  };
  about: {
    label_zh: string; label_en: string;
    title_zh: string; title_en: string;
    description1_zh: string; description1_en: string;
    description2_zh: string; description2_en: string;
    features: Array<{
      title_zh: string; title_en: string;
      desc_zh: string; desc_en: string;
    }>;
  };
  sectionTitles: {
    speakers: { label_zh: string; label_en: string; title_zh: string; title_en: string; description_zh: string; description_en: string };
    schedule: { label_zh: string; label_en: string; title_zh: string; title_en: string; day1_zh: string; day1_en: string; day2_zh: string; day2_en: string };
    sponsors: { label_zh: string; label_en: string; title_zh: string; title_en: string; description_zh: string; description_en: string };
    tickets: { label_zh: string; label_en: string; title_zh: string; title_en: string; description_zh: string; description_en: string };
  };
  cta: {
    title_zh: string; title_en: string;
    description_zh: string; description_en: string;
    button_zh: string; button_en: string;
  };
  footerText: {
    forumName_zh: string; forumName_en: string;
    slogan_zh: string; slogan_en: string;
    copyright_zh: string; copyright_en: string;
  };
}

const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  stats: [
    { value: '30+', label_zh: '学术报告', label_en: 'Reports' },
    { value: '50+', label_zh: '学术论文', label_en: 'Papers' },
    { value: '200+', label_zh: '参会学者', label_en: 'Scholars' },
    { value: '15', label_zh: '合作高校', label_en: 'Universities' },
  ],
  speakers: [
    { name_zh: '张明远', name_en: 'Prof. Zhang', title_zh: '教授、博士生导师', title_en: 'Professor', org_zh: '新西兰教科文中心', org_en: 'NZ Education Centre', field_zh: '数字人文', field_en: 'Digital Humanities' },
    { name_zh: '李思琪', name_en: 'Dr. Li', title_zh: '教授', title_en: 'Professor', org_zh: '奥克兰大学', org_en: 'University of Auckland', field_zh: '计算语言学', field_en: 'Computational Linguistics' },
    { name_zh: 'Prof. Smith', name_en: 'Prof. Smith', title_zh: 'Professor', title_en: 'Professor', org_zh: '哈佛大学', org_en: 'Harvard University', field_zh: 'Digital Humanities', field_en: 'Digital Humanities' },
    { name_zh: '陈雨婷', name_en: 'Dr. Chen', title_zh: '研究员', title_en: 'Researcher', org_zh: '国际研究院', org_en: 'International Research Institute', field_zh: '计算社会科学', field_en: 'Computational Social Science' },
  ],
  schedule: {
    day1: [
      { time: '08:30 - 09:00', title_zh: '注册签到', title_en: 'Registration', desc_zh: '领取会议资料、参会证件', desc_en: 'Collect conference materials and badges' },
      { time: '09:00 - 09:30', title_zh: '开幕式', title_en: 'Opening Ceremony', desc_zh: '大会主席致辞、领导讲话', desc_en: 'Welcome speeches by organizers' },
      { time: '09:30 - 12:00', title_zh: '主旨报告（上午场）', title_en: 'Keynote (Morning)', desc_zh: 'AI与人文学科的融合创新', desc_en: 'AI and Humanities Integration' },
      { time: '12:00 - 14:00', title_zh: '午餐', title_en: 'Lunch', desc_zh: '学者交流午宴', desc_en: 'Networking lunch' },
      { time: '14:00 - 17:30', title_zh: '分论坛A', title_en: 'Panel A', desc_zh: '数字人文与文化遗产保护', desc_en: 'Digital Humanities and Cultural Heritage' },
      { time: '18:00 - 20:00', title_zh: '欢迎晚宴', title_en: 'Welcome Dinner', desc_zh: '学术交流与社交活动', desc_en: 'Academic networking event' },
    ],
    day2: [
      { time: '09:00 - 12:00', title_zh: '主旨报告（下午场）', title_en: 'Keynote (Morning)', desc_zh: '计算社会科学的前沿进展', desc_en: 'Frontiers in Computational Social Science' },
      { time: '12:00 - 14:00', title_zh: '午餐', title_en: 'Lunch', desc_zh: '自由交流', desc_en: 'Free networking' },
      { time: '14:00 - 16:30', title_zh: '分论坛B', title_en: 'Panel B', desc_zh: '智能教育与学习科学', desc_en: 'AI in Education and Learning Science' },
      { time: '16:30 - 17:30', title_zh: '圆桌论坛', title_en: 'Roundtable', desc_zh: '跨学科合作的机遇与挑战', desc_en: 'Opportunities and Challenges in Interdisciplinary Collaboration' },
      { time: '17:30 - 18:00', title_zh: '闭幕式', title_en: 'Closing Ceremony', desc_zh: '优秀论文颁奖、闭幕致辞', desc_en: 'Best Paper Awards and Closing Remarks' },
    ],
  },
  footer: {
    organizers: [
      { name_zh: '新西兰教科文中心', name_en: 'NZ Education Centre' },
      { name_zh: '奥克兰大学', name_en: 'University of Auckland' },
    ],
    contact: {
      email: 'forum2026@nzec.org',
      phone: '+64 9 123 4567',
      address: 'Auckland, New Zealand',
    },
  },
  hero: {
    title_zh: '第十二届国际学术论坛',
    title_en: '12th International Academic Forum',
    subtitle_zh: '人工智能与人文社科的交叉融合',
    subtitle_en: 'AI and Humanities: Cross-disciplinary Integration',
    date_zh: '2026年12月15-16日',
    date_en: 'December 15-16, 2026',
    venue_zh: '新西兰教科文中心',
    venue_en: 'New Zealand Education Centre',
    description_zh: '汇聚海内外知名学者、研究机构与高校专家，共同探讨人工智能技术在人文社会科学领域的应用前景与学术创新',
    description_en: 'Bringing together renowned scholars, research institutions, and university experts from around the world to explore the application prospects and academic innovation of AI in humanities and social sciences',
  },
  about: {
    label_zh: '关于论坛',
    label_en: 'About',
    title_zh: '推动学术交流\n促进知识创新',
    title_en: 'Promoting Academic Exchange\nDriving Knowledge Innovation',
    description1_zh: '本届国际学术论坛由新西兰教科文中心与奥克兰大学联合主办，旨在搭建跨学科交流平台，促进人工智能与人文社科领域的深度对话与合作研究。',
    description1_en: 'This international academic forum is jointly organized by the New Zealand Education Centre and the University of Auckland, aiming to build a cross-disciplinary exchange platform to promote in-depth dialogue and collaborative research between AI and humanities.',
    description2_zh: '论坛将邀请来自哈佛大学、牛津大学、奥克兰大学等国内外顶尖高校的知名学者，就数字人文、计算社会科学、智能教育等前沿议题发表主旨演讲，并组织多场专题研讨会。',
    description2_en: 'The forum will invite renowned scholars from top universities worldwide, including Harvard University, Oxford University, and the University of Auckland, to deliver keynote speeches on cutting-edge topics such as digital humanities, computational social science, and intelligent education.',
    features: [
      { title_zh: '学术前沿报告', title_en: 'Cutting-edge Research', desc_zh: '聆听顶尖学者的最新研究成果', desc_en: 'Learn from the latest findings of top scholars' },
      { title_zh: '学术社群建设', title_en: 'Academic Networking', desc_zh: '拓展学术人脉，寻找合作机会', desc_en: 'Expand your professional network' },
      { title_zh: '论文发表机会', title_en: 'Publication Opportunities', desc_zh: '优秀论文推荐至核心期刊发表', desc_en: 'Outstanding papers recommended to journals' },
    ],
  },
  sectionTitles: {
    speakers: {
      label_zh: '特邀学者', label_en: 'Speakers',
      title_zh: '主旨报告嘉宾', title_en: 'Keynote Speakers',
      description_zh: '来自世界知名高校与研究机构的杰出学者', description_en: 'Distinguished scholars from world-renowned universities and research institutions',
    },
    schedule: {
      label_zh: '会议日程', label_en: 'Schedule',
      title_zh: '论坛议程安排', title_en: 'Forum Agenda',
      day1_zh: '12月15日（第一天）', day1_en: 'December 15 (Day 1)',
      day2_zh: '12月16日（第二天）', day2_en: 'December 16 (Day 2)',
    },
    sponsors: {
      label_zh: '合作伙伴', label_en: 'Partners',
      title_zh: '支持单位与赞助商', title_en: 'Sponsors & Partners',
      description_zh: '感谢以下机构对本届论坛的大力支持', description_en: 'We thank the following organizations for their generous support',
    },
    tickets: {
      label_zh: '注册报名', label_en: 'Register',
      title_zh: '选择参会类型', title_en: 'Choose Registration Type',
      description_zh: '欢迎高校教师、研究人员、博士生及业界人士参会', description_en: 'Open to university faculty, researchers, doctoral students, and industry professionals',
    },
  },
  cta: {
    title_zh: '期待您的参与',
    title_en: 'Join Us',
    description_zh: '与来自世界各地的学者一同探讨学术前沿，共创知识未来',
    description_en: 'Explore academic frontiers with scholars from around the world',
    button_zh: '立即注册参会',
    button_en: 'Register Now',
  },
  footerText: {
    forumName_zh: '学术论坛 2026',
    forumName_en: 'Academic Forum 2026',
    slogan_zh: '推动学术交流，促进知识创新',
    slogan_en: 'Promoting Academic Exchange, Driving Knowledge Innovation',
    copyright_zh: '第十二届国际学术论坛',
    copyright_en: '12th International Academic Forum',
  },
};

export function getHomepageContent(): HomepageContent {
  const db = getDatabase();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('homepage_content') as { value: string } | undefined;

  if (row) {
    try {
      const dbValue = JSON.parse(row.value);
      return { ...DEFAULT_HOMEPAGE_CONTENT, ...dbValue };
    } catch {
      return DEFAULT_HOMEPAGE_CONTENT;
    }
  }

  return DEFAULT_HOMEPAGE_CONTENT;
}

export function updateHomepageContent(content: HomepageContent): HomepageContent {
  const db = getDatabase();
  db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
    .run('homepage_content', JSON.stringify(content));
  return content;
}
