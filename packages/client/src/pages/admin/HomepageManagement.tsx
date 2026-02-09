import { useState, useEffect } from 'react';
import { getHomepageContent, updateHomepageContent, HomepageContent } from '../../api/settings';

type SubTab = 'hero' | 'about' | 'sectionTitles' | 'cta' | 'footerText' | 'stats' | 'speakers' | 'schedule' | 'footer';

export function HomepageManagement() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subTab, setSubTab] = useState<SubTab>('hero');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const data = await getHomepageContent();
      setContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await updateHomepageContent(content);
      setContent(updated);
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

  if (!content) {
    return <div className="text-center py-12 text-red-500">{error || '加载失败'}</div>;
  }

  const subTabs: { key: SubTab; label: string }[] = [
    { key: 'hero', label: 'Hero横幅' },
    { key: 'about', label: '关于论坛' },
    { key: 'sectionTitles', label: '区块标题' },
    { key: 'cta', label: 'CTA引导' },
    { key: 'footerText', label: '页脚文案' },
    { key: 'stats', label: '统计数据' },
    { key: 'speakers', label: '演讲嘉宾' },
    { key: 'schedule', label: '会议日程' },
    { key: 'footer', label: '页脚信息' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">首页内容管理</h2>
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

      {/* Sub tabs */}
      <div className="border-b overflow-x-auto">
        <nav className="flex -mb-px space-x-4 min-w-max">
          {subTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSubTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                subTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {subTab === 'hero' && <HeroEditor content={content} onChange={setContent} />}
      {subTab === 'about' && <AboutEditor content={content} onChange={setContent} />}
      {subTab === 'sectionTitles' && <SectionTitlesEditor content={content} onChange={setContent} />}
      {subTab === 'cta' && <CtaEditor content={content} onChange={setContent} />}
      {subTab === 'footerText' && <FooterTextEditor content={content} onChange={setContent} />}
      {subTab === 'stats' && <StatsEditor content={content} onChange={setContent} />}
      {subTab === 'speakers' && <SpeakersEditor content={content} onChange={setContent} />}
      {subTab === 'schedule' && <ScheduleEditor content={content} onChange={setContent} />}
      {subTab === 'footer' && <FooterEditor content={content} onChange={setContent} />}
    </div>
  );
}

// ===== Bilingual Input Helper =====
function BilingualInput({ label, valueZh, valueEn, onChangeZh, onChangeEn, multiline }: {
  label: string; valueZh: string; valueEn: string;
  onChangeZh: (v: string) => void; onChangeEn: (v: string) => void;
  multiline?: boolean;
}) {
  const InputComponent = multiline ? 'textarea' : 'input';
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1">{label}（中文）</label>
        <InputComponent
          value={valueZh}
          onChange={(e) => onChangeZh(e.target.value)}
          className={`w-full px-3 py-2 border rounded text-sm ${multiline ? 'h-24 resize-y' : ''}`}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">{label}（English）</label>
        <InputComponent
          value={valueEn}
          onChange={(e) => onChangeEn(e.target.value)}
          className={`w-full px-3 py-2 border rounded text-sm ${multiline ? 'h-24 resize-y' : ''}`}
        />
      </div>
    </div>
  );
}

// ===== Hero Editor =====
function HeroEditor({ content, onChange }: { content: HomepageContent; onChange: (c: HomepageContent) => void }) {
  const update = (field: string, value: string) => {
    onChange({ ...content, hero: { ...content.hero, [field]: value } });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">首页 Hero 横幅区域的标题、副标题、日期、地点、描述</p>
      <div className="border rounded-lg p-4 space-y-4">
        <BilingualInput label="主标题" valueZh={content.hero.title_zh} valueEn={content.hero.title_en}
          onChangeZh={(v) => update('title_zh', v)} onChangeEn={(v) => update('title_en', v)} />
        <BilingualInput label="副标题" valueZh={content.hero.subtitle_zh} valueEn={content.hero.subtitle_en}
          onChangeZh={(v) => update('subtitle_zh', v)} onChangeEn={(v) => update('subtitle_en', v)} />
        <BilingualInput label="日期" valueZh={content.hero.date_zh} valueEn={content.hero.date_en}
          onChangeZh={(v) => update('date_zh', v)} onChangeEn={(v) => update('date_en', v)} />
        <BilingualInput label="地点" valueZh={content.hero.venue_zh} valueEn={content.hero.venue_en}
          onChangeZh={(v) => update('venue_zh', v)} onChangeEn={(v) => update('venue_en', v)} />
        <BilingualInput label="描述" valueZh={content.hero.description_zh} valueEn={content.hero.description_en}
          onChangeZh={(v) => update('description_zh', v)} onChangeEn={(v) => update('description_en', v)} multiline />
      </div>
    </div>
  );
}

// ===== About Editor =====
function AboutEditor({ content, onChange }: { content: HomepageContent; onChange: (c: HomepageContent) => void }) {
  const update = (field: string, value: string) => {
    onChange({ ...content, about: { ...content.about, [field]: value } });
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const features = [...content.about.features];
    features[index] = { ...features[index], [field]: value };
    onChange({ ...content, about: { ...content.about, features } });
  };

  const addFeature = () => {
    onChange({
      ...content,
      about: {
        ...content.about,
        features: [...content.about.features, { title_zh: '', title_en: '', desc_zh: '', desc_en: '' }],
      },
    });
  };

  const removeFeature = (index: number) => {
    onChange({
      ...content,
      about: {
        ...content.about,
        features: content.about.features.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">关于论坛区块的标签、标题、描述、特色</p>
      <div className="border rounded-lg p-4 space-y-4">
        <BilingualInput label="标签" valueZh={content.about.label_zh} valueEn={content.about.label_en}
          onChangeZh={(v) => update('label_zh', v)} onChangeEn={(v) => update('label_en', v)} />
        <BilingualInput label="标题" valueZh={content.about.title_zh} valueEn={content.about.title_en}
          onChangeZh={(v) => update('title_zh', v)} onChangeEn={(v) => update('title_en', v)} multiline />
        <BilingualInput label="描述段落1" valueZh={content.about.description1_zh} valueEn={content.about.description1_en}
          onChangeZh={(v) => update('description1_zh', v)} onChangeEn={(v) => update('description1_en', v)} multiline />
        <BilingualInput label="描述段落2" valueZh={content.about.description2_zh} valueEn={content.about.description2_en}
          onChangeZh={(v) => update('description2_zh', v)} onChangeEn={(v) => update('description2_en', v)} multiline />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700">特色亮点</h3>
          <button onClick={addFeature} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
            + 添加
          </button>
        </div>
        {content.about.features.map((feature, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">#{index + 1}</span>
              <button onClick={() => removeFeature(index)} className="text-red-500 hover:text-red-700 text-sm">删除</button>
            </div>
            <BilingualInput label="标题" valueZh={feature.title_zh} valueEn={feature.title_en}
              onChangeZh={(v) => updateFeature(index, 'title_zh', v)} onChangeEn={(v) => updateFeature(index, 'title_en', v)} />
            <BilingualInput label="描述" valueZh={feature.desc_zh} valueEn={feature.desc_en}
              onChangeZh={(v) => updateFeature(index, 'desc_zh', v)} onChangeEn={(v) => updateFeature(index, 'desc_en', v)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Section Titles Editor =====
function SectionTitlesEditor({ content, onChange }: { content: HomepageContent; onChange: (c: HomepageContent) => void }) {
  const updateSection = (section: keyof HomepageContent['sectionTitles'], field: string, value: string) => {
    onChange({
      ...content,
      sectionTitles: {
        ...content.sectionTitles,
        [section]: { ...content.sectionTitles[section], [field]: value },
      },
    });
  };

  const sections: { key: keyof HomepageContent['sectionTitles']; label: string; hasDescription?: boolean; hasDays?: boolean }[] = [
    { key: 'speakers', label: '演讲嘉宾', hasDescription: true },
    { key: 'schedule', label: '会议日程', hasDays: true },
    { key: 'sponsors', label: '赞助商', hasDescription: true },
    { key: 'tickets', label: '票务注册', hasDescription: true },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">各区块的标签、标题、描述文案</p>
      {sections.map((section) => (
        <div key={section.key} className="border rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">{section.label}</h3>
          <BilingualInput label="标签" valueZh={content.sectionTitles[section.key].label_zh} valueEn={content.sectionTitles[section.key].label_en}
            onChangeZh={(v) => updateSection(section.key, 'label_zh', v)} onChangeEn={(v) => updateSection(section.key, 'label_en', v)} />
          <BilingualInput label="标题" valueZh={content.sectionTitles[section.key].title_zh} valueEn={content.sectionTitles[section.key].title_en}
            onChangeZh={(v) => updateSection(section.key, 'title_zh', v)} onChangeEn={(v) => updateSection(section.key, 'title_en', v)} />
          {section.hasDescription && 'description_zh' in content.sectionTitles[section.key] && (
            <BilingualInput label="描述"
              valueZh={(content.sectionTitles[section.key] as { description_zh: string; description_en: string }).description_zh}
              valueEn={(content.sectionTitles[section.key] as { description_zh: string; description_en: string }).description_en}
              onChangeZh={(v) => updateSection(section.key, 'description_zh', v)}
              onChangeEn={(v) => updateSection(section.key, 'description_en', v)} multiline />
          )}
          {section.hasDays && (
            <>
              <BilingualInput label="第一天标签"
                valueZh={(content.sectionTitles.schedule).day1_zh}
                valueEn={(content.sectionTitles.schedule).day1_en}
                onChangeZh={(v) => updateSection('schedule', 'day1_zh', v)}
                onChangeEn={(v) => updateSection('schedule', 'day1_en', v)} />
              <BilingualInput label="第二天标签"
                valueZh={(content.sectionTitles.schedule).day2_zh}
                valueEn={(content.sectionTitles.schedule).day2_en}
                onChangeZh={(v) => updateSection('schedule', 'day2_zh', v)}
                onChangeEn={(v) => updateSection('schedule', 'day2_en', v)} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ===== CTA Editor =====
function CtaEditor({ content, onChange }: { content: HomepageContent; onChange: (c: HomepageContent) => void }) {
  const update = (field: string, value: string) => {
    onChange({ ...content, cta: { ...content.cta, [field]: value } });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">报名引导区块（CTA）的标题、描述、按钮文案</p>
      <div className="border rounded-lg p-4 space-y-4">
        <BilingualInput label="标题" valueZh={content.cta.title_zh} valueEn={content.cta.title_en}
          onChangeZh={(v) => update('title_zh', v)} onChangeEn={(v) => update('title_en', v)} />
        <BilingualInput label="描述" valueZh={content.cta.description_zh} valueEn={content.cta.description_en}
          onChangeZh={(v) => update('description_zh', v)} onChangeEn={(v) => update('description_en', v)} multiline />
        <BilingualInput label="按钮文案" valueZh={content.cta.button_zh} valueEn={content.cta.button_en}
          onChangeZh={(v) => update('button_zh', v)} onChangeEn={(v) => update('button_en', v)} />
      </div>
    </div>
  );
}

// ===== Footer Text Editor =====
function FooterTextEditor({ content, onChange }: { content: HomepageContent; onChange: (c: HomepageContent) => void }) {
  const update = (field: string, value: string) => {
    onChange({ ...content, footerText: { ...content.footerText, [field]: value } });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">页脚显示的论坛名称、口号、版权信息</p>
      <div className="border rounded-lg p-4 space-y-4">
        <BilingualInput label="论坛名称" valueZh={content.footerText.forumName_zh} valueEn={content.footerText.forumName_en}
          onChangeZh={(v) => update('forumName_zh', v)} onChangeEn={(v) => update('forumName_en', v)} />
        <BilingualInput label="口号" valueZh={content.footerText.slogan_zh} valueEn={content.footerText.slogan_en}
          onChangeZh={(v) => update('slogan_zh', v)} onChangeEn={(v) => update('slogan_en', v)} />
        <BilingualInput label="版权文字" valueZh={content.footerText.copyright_zh} valueEn={content.footerText.copyright_en}
          onChangeZh={(v) => update('copyright_zh', v)} onChangeEn={(v) => update('copyright_en', v)} />
      </div>
    </div>
  );
}

// ===== Stats Editor =====
function StatsEditor({ content, onChange }: { content: HomepageContent; onChange: (c: HomepageContent) => void }) {
  const updateStat = (index: number, field: string, value: string) => {
    const stats = [...content.stats];
    stats[index] = { ...stats[index], [field]: value };
    onChange({ ...content, stats });
  };

  const addStat = () => {
    onChange({ ...content, stats: [...content.stats, { value: '', label_zh: '', label_en: '' }] });
  };

  const removeStat = (index: number) => {
    onChange({ ...content, stats: content.stats.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Hero 区域展示的统计数据</p>
        <button onClick={addStat} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
          + 添加
        </button>
      </div>
      {content.stats.map((stat, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">#{index + 1}</span>
            <button onClick={() => removeStat(index)} className="text-red-500 hover:text-red-700 text-sm">删除</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">数值</label>
              <input
                type="text"
                value={stat.value}
                onChange={(e) => updateStat(index, 'value', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="例: 30+"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">标签（中文）</label>
              <input
                type="text"
                value={stat.label_zh}
                onChange={(e) => updateStat(index, 'label_zh', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="例: 学术报告"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">标签（英文）</label>
              <input
                type="text"
                value={stat.label_en}
                onChange={(e) => updateStat(index, 'label_en', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="e.g. Reports"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Speakers Editor =====
function SpeakersEditor({ content, onChange }: { content: HomepageContent; onChange: (c: HomepageContent) => void }) {
  const updateSpeaker = (index: number, field: string, value: string) => {
    const speakers = [...content.speakers];
    speakers[index] = { ...speakers[index], [field]: value };
    onChange({ ...content, speakers });
  };

  const addSpeaker = () => {
    onChange({
      ...content,
      speakers: [...content.speakers, {
        name_zh: '', name_en: '',
        title_zh: '', title_en: '',
        org_zh: '', org_en: '',
        field_zh: '', field_en: '',
      }],
    });
  };

  const removeSpeaker = (index: number) => {
    onChange({ ...content, speakers: content.speakers.filter((_, i) => i !== index) });
  };

  const fields: { key: string; label_zh: string; label_en: string }[] = [
    { key: 'name', label_zh: '姓名（中文）', label_en: '姓名（英文）' },
    { key: 'title', label_zh: '头衔（中文）', label_en: '头衔（英文）' },
    { key: 'org', label_zh: '机构（中文）', label_en: '机构（英文）' },
    { key: 'field', label_zh: '领域（中文）', label_en: '领域（英文）' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">主旨报告嘉宾信息</p>
        <button onClick={addSpeaker} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
          + 添加嘉宾
        </button>
      </div>
      {content.speakers.map((speaker, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">嘉宾 #{index + 1}</span>
            <button onClick={() => removeSpeaker(index)} className="text-red-500 hover:text-red-700 text-sm">删除</button>
          </div>
          {fields.map((f) => (
            <div key={f.key} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{f.label_zh}</label>
                <input
                  type="text"
                  value={(speaker as Record<string, string>)[`${f.key}_zh`]}
                  onChange={(e) => updateSpeaker(index, `${f.key}_zh`, e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{f.label_en}</label>
                <input
                  type="text"
                  value={(speaker as Record<string, string>)[`${f.key}_en`]}
                  onChange={(e) => updateSpeaker(index, `${f.key}_en`, e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ===== Schedule Editor =====
function ScheduleEditor({ content, onChange }: { content: HomepageContent; onChange: (c: HomepageContent) => void }) {
  const [activeDay, setActiveDay] = useState<'day1' | 'day2'>('day1');

  const updateItem = (day: 'day1' | 'day2', index: number, field: string, value: string) => {
    const items = [...content.schedule[day]];
    items[index] = { ...items[index], [field]: value };
    onChange({ ...content, schedule: { ...content.schedule, [day]: items } });
  };

  const addItem = (day: 'day1' | 'day2') => {
    const items = [...content.schedule[day], { time: '', title_zh: '', title_en: '', desc_zh: '', desc_en: '' }];
    onChange({ ...content, schedule: { ...content.schedule, [day]: items } });
  };

  const removeItem = (day: 'day1' | 'day2', index: number) => {
    const items = content.schedule[day].filter((_, i) => i !== index);
    onChange({ ...content, schedule: { ...content.schedule, [day]: items } });
  };

  const renderDayItems = (day: 'day1' | 'day2') => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => addItem(day)} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
          + 添加日程
        </button>
      </div>
      {content.schedule[day].map((item, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">#{index + 1}</span>
            <button onClick={() => removeItem(day, index)} className="text-red-500 hover:text-red-700 text-sm">删除</button>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">时间</label>
            <input
              type="text"
              value={item.time}
              onChange={(e) => updateItem(day, index, 'time', e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="例: 09:00 - 10:00"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">标题（中文）</label>
              <input
                type="text"
                value={item.title_zh}
                onChange={(e) => updateItem(day, index, 'title_zh', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">标题（英文）</label>
              <input
                type="text"
                value={item.title_en}
                onChange={(e) => updateItem(day, index, 'title_en', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">描述（中文）</label>
              <input
                type="text"
                value={item.desc_zh}
                onChange={(e) => updateItem(day, index, 'desc_zh', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">描述（英文）</label>
              <input
                type="text"
                value={item.desc_en}
                onChange={(e) => updateItem(day, index, 'desc_en', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">会议日程安排（第一天 / 第二天）</p>
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveDay('day1')}
          className={`px-4 py-2 text-sm rounded ${activeDay === 'day1' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          第一天
        </button>
        <button
          onClick={() => setActiveDay('day2')}
          className={`px-4 py-2 text-sm rounded ${activeDay === 'day2' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          第二天
        </button>
      </div>
      {renderDayItems(activeDay)}
    </div>
  );
}

// ===== Footer Editor =====
function FooterEditor({ content, onChange }: { content: HomepageContent; onChange: (c: HomepageContent) => void }) {
  const updateContact = (field: string, value: string) => {
    onChange({
      ...content,
      footer: {
        ...content.footer,
        contact: { ...content.footer.contact, [field]: value },
      },
    });
  };

  const updateOrganizer = (index: number, field: string, value: string) => {
    const organizers = [...content.footer.organizers];
    organizers[index] = { ...organizers[index], [field]: value };
    onChange({ ...content, footer: { ...content.footer, organizers } });
  };

  const addOrganizer = () => {
    onChange({
      ...content,
      footer: {
        ...content.footer,
        organizers: [...content.footer.organizers, { name_zh: '', name_en: '' }],
      },
    });
  };

  const removeOrganizer = (index: number) => {
    onChange({
      ...content,
      footer: {
        ...content.footer,
        organizers: content.footer.organizers.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Organizers */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700">主办方</h3>
          <button onClick={addOrganizer} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
            + 添加
          </button>
        </div>
        {content.footer.organizers.map((org, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">#{index + 1}</span>
              <button onClick={() => removeOrganizer(index)} className="text-red-500 hover:text-red-700 text-sm">删除</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">名称（中文）</label>
                <input
                  type="text"
                  value={org.name_zh}
                  onChange={(e) => updateOrganizer(index, 'name_zh', e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">名称（英文）</label>
                <input
                  type="text"
                  value={org.name_en}
                  onChange={(e) => updateOrganizer(index, 'name_en', e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">联系方式</h3>
        <div className="border rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">邮箱</label>
            <input
              type="email"
              value={content.footer.contact.email}
              onChange={(e) => updateContact('email', e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">电话</label>
            <input
              type="text"
              value={content.footer.contact.phone}
              onChange={(e) => updateContact('phone', e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">地址</label>
            <input
              type="text"
              value={content.footer.contact.address}
              onChange={(e) => updateContact('address', e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
