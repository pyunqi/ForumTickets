export type Language = 'zh' | 'en';

export const translations = {
  zh: {
    // Navigation
    nav: {
      about: '关于论坛',
      speakers: '特邀学者',
      schedule: '会议日程',
      sponsors: '合作伙伴',
      tickets: '注册报名',
    },
    // Hero
    hero: {
      title: '第十二届国际学术论坛',
      subtitle: '人工智能与人文社科的交叉融合',
      date: '2026年12月15-16日',
      venue: '新西兰教科文中心',
      description: '汇聚海内外知名学者、研究机构与高校专家，共同探讨人工智能技术在人文社会科学领域的应用前景与学术创新',
      register: '立即注册',
      learnMore: '了解详情',
      stats: {
        reports: '特邀报告',
        papers: '学术论文',
        scholars: '参会学者',
        universities: '合作高校',
      },
    },
    // About
    about: {
      label: '关于论坛',
      title: '推动学术交流\n促进知识创新',
      description1: '本届国际学术论坛由新西兰教科文中心与奥克兰大学联合主办，旨在搭建跨学科交流平台，促进人工智能与人文社科领域的深度对话与合作研究。',
      description2: '论坛将邀请来自哈佛大学、牛津大学、奥克兰大学等国内外顶尖高校的知名学者，就数字人文、计算社会科学、智能教育等前沿议题发表主旨演讲，并组织多场专题研讨会。',
      features: {
        research: { title: '学术前沿报告', desc: '聆听顶尖学者的最新研究成果' },
        network: { title: '学术社群建设', desc: '拓展学术人脉，寻找合作机会' },
        publish: { title: '论文发表机会', desc: '优秀论文推荐至核心期刊发表' },
      },
    },
    // Speakers
    speakers: {
      label: '特邀学者',
      title: '主旨报告嘉宾',
      description: '来自世界知名高校与研究机构的杰出学者',
    },
    // Schedule
    schedule: {
      label: '会议日程',
      title: '论坛议程安排',
      day1: '12月15日（第一天）',
      day2: '12月16日（第二天）',
    },
    // Sponsors
    sponsors: {
      label: '合作伙伴',
      title: '支持单位与赞助商',
      description: '感谢以下机构对本届论坛的大力支持',
      categories: {
        organizer: '主办单位',
        diamond: '钻石赞助',
        gold: '金牌赞助',
        silver: '银牌赞助',
        media: '支持媒体',
      },
    },
    // Tickets
    tickets: {
      label: '注册报名',
      title: '选择参会类型',
      description: '欢迎高校教师、研究人员、博士生及业界人士参会',
      remaining: '剩余名额',
      unlimited: '不限',
      soldOut: '名额已满',
      register: '立即报名',
      perPerson: '/人',
    },
    // CTA
    cta: {
      title: '期待您的参与',
      description: '与来自世界各地的学者一同探讨学术前沿，共创知识未来',
      button: '立即注册参会',
    },
    // Footer
    footer: {
      forumName: '学术论坛 2026',
      slogan: '推动学术交流，促进知识创新',
      info: '论坛信息',
      organizers: '主办单位',
      contact: '联系方式',
      email: '邮箱',
      phone: '电话',
      address: '地址',
    },
    // Forms
    form: {
      attendee: '参会者',
      name: '姓名',
      email: '电子邮箱',
      phone: '联系电话',
      optional: '选填',
      required: '必填',
      submit: '提交注册',
      registrationType: '注册类型',
      registrationFee: '注册费',
      total: '总计',
      person: '人',
    },
    // Common
    common: {
      loading: '加载中...',
      home: '首页',
      back: '返回',
    },
  },
  en: {
    // Navigation
    nav: {
      about: 'About',
      speakers: 'Speakers',
      schedule: 'Schedule',
      sponsors: 'Partners',
      tickets: 'Register',
    },
    // Hero
    hero: {
      title: '12th International Academic Forum',
      subtitle: 'AI and Humanities: Cross-disciplinary Integration',
      date: 'December 15-16, 2026',
      venue: 'New Zealand Education Centre',
      description: 'Bringing together renowned scholars, research institutions, and university experts from around the world to explore the application prospects and academic innovation of AI in humanities and social sciences',
      register: 'Register Now',
      learnMore: 'Learn More',
      stats: {
        reports: 'Keynote Speeches',
        papers: 'Academic Papers',
        scholars: 'Scholars',
        universities: 'Partner Universities',
      },
    },
    // About
    about: {
      label: 'About',
      title: 'Promoting Academic Exchange\nDriving Knowledge Innovation',
      description1: 'This international academic forum is jointly organized by the New Zealand Education Centre and the University of Auckland, aiming to build a cross-disciplinary exchange platform to promote in-depth dialogue and collaborative research between AI and humanities.',
      description2: 'The forum will invite renowned scholars from top universities worldwide, including Harvard University, Oxford University, and the University of Auckland, to deliver keynote speeches on cutting-edge topics such as digital humanities, computational social science, and intelligent education.',
      features: {
        research: { title: 'Cutting-edge Research', desc: 'Learn from the latest findings of top scholars' },
        network: { title: 'Academic Networking', desc: 'Expand your professional network' },
        publish: { title: 'Publication Opportunities', desc: 'Outstanding papers recommended to journals' },
      },
    },
    // Speakers
    speakers: {
      label: 'Speakers',
      title: 'Keynote Speakers',
      description: 'Distinguished scholars from world-renowned universities and research institutions',
    },
    // Schedule
    schedule: {
      label: 'Schedule',
      title: 'Forum Agenda',
      day1: 'December 15 (Day 1)',
      day2: 'December 16 (Day 2)',
    },
    // Sponsors
    sponsors: {
      label: 'Partners',
      title: 'Sponsors & Partners',
      description: 'We thank the following organizations for their generous support',
      categories: {
        organizer: 'Organizers',
        diamond: 'Diamond Sponsors',
        gold: 'Gold Sponsors',
        silver: 'Silver Sponsors',
        media: 'Media Partners',
      },
    },
    // Tickets
    tickets: {
      label: 'Register',
      title: 'Choose Registration Type',
      description: 'Open to university faculty, researchers, doctoral students, and industry professionals',
      remaining: 'Remaining',
      unlimited: 'Unlimited',
      soldOut: 'Sold Out',
      register: 'Register Now',
      perPerson: '/person',
    },
    // CTA
    cta: {
      title: 'Join Us',
      description: 'Explore academic frontiers with scholars from around the world',
      button: 'Register Now',
    },
    // Footer
    footer: {
      forumName: 'Academic Forum 2026',
      slogan: 'Promoting Academic Exchange, Driving Knowledge Innovation',
      info: 'Forum Info',
      organizers: 'Organizers',
      contact: 'Contact',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
    },
    // Forms
    form: {
      attendee: 'Attendee',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      optional: 'Optional',
      required: 'Required',
      submit: 'Submit Registration',
      registrationType: 'Registration Type',
      registrationFee: 'Registration Fee',
      total: 'Total',
      person: 'person(s)',
    },
    // Common
    common: {
      loading: 'Loading...',
      home: 'Home',
      back: 'Back',
    },
  },
};

export type TranslationKeys = typeof translations.zh;
