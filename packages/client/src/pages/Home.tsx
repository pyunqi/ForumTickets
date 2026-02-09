import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketCard } from '../components/TicketCard';
import { getTickets } from '../api/tickets';
import { getSponsors, SponsorsGrouped, Sponsor } from '../api/sponsors';
import { getPageVisibility, PageVisibility, getHomepageContent, HomepageContent } from '../api/settings';
import { useLanguage } from '../i18n';
import type { TicketType } from '../types';

export function Home() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [sponsors, setSponsors] = useState<SponsorsGrouped | null>(null);
  const [pageVisibility, setPageVisibility] = useState<PageVisibility | null>(null);
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    async function loadData() {
      try {
        const [ticketsData, sponsorsData, visibilityData, contentData] = await Promise.all([
          getTickets(),
          getSponsors(),
          getPageVisibility(),
          getHomepageContent()
        ]);
        setTickets(ticketsData);
        setSponsors(sponsorsData);
        setPageVisibility(visibilityData);
        setHomepageContent(contentData);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelect = (ticket: TicketType) => {
    navigate('/order', { state: { ticket } });
  };

  const scrollToTickets = () => {
    document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getSponsorName = (sponsor: Sponsor) => {
    return language === 'en' ? sponsor.name_en : sponsor.name_zh;
  };

  const renderSponsorCategory = (
    categorySponsors: Sponsor[] | undefined,
    categoryKey: keyof typeof t.sponsors.categories,
    size: 'large' | 'medium' | 'small' | 'tiny'
  ) => {
    if (!categorySponsors || categorySponsors.length === 0) return null;

    const sizeClasses = {
      large: 'w-40 h-24',
      medium: 'w-36 h-20 border-2 border-[#c9a227]/30',
      small: 'w-28 h-16',
      tiny: 'px-4 py-2',
    };

    const titleColors = {
      large: 'text-[#7b2c3a]',
      medium: 'text-[#c9a227]',
      small: 'text-gray-500',
      tiny: 'text-gray-400',
    };

    return (
      <div className="mb-12">
        <h3 className={`text-center text-sm font-medium ${titleColors[size]} uppercase tracking-wider mb-8`}>
          {t.sponsors.categories[categoryKey]}
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-6">
          {categorySponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className={`${sizeClasses[size]} bg-white rounded shadow-md flex items-center justify-center border border-gray-100 hover:shadow-lg transition-shadow`}
            >
              {size === 'large' || size === 'medium' ? (
                <div className="text-center px-2">
                  {sponsor.abbr && (
                    <div className={`${size === 'large' ? 'text-2xl' : 'text-lg'} font-serif font-bold text-[#1a365d]`}>
                      {sponsor.abbr}
                    </div>
                  )}
                  <div className={`${sponsor.abbr ? 'text-xs text-gray-500 mt-1' : 'text-sm font-medium text-[#1a365d]'} truncate`}>
                    {getSponsorName(sponsor)}
                  </div>
                </div>
              ) : size === 'small' ? (
                <span className="text-sm font-medium text-[#1a365d] px-2 text-center">
                  {getSponsorName(sponsor)}
                </span>
              ) : (
                <span className="text-xs text-gray-600">{getSponsorName(sponsor)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const l = (zh: string, en: string) => language === 'en' ? en : zh;
  const hc = homepageContent;

  const isSectionVisible = (sectionId: string): boolean => {
    if (!pageVisibility) return true;
    const section = pageVisibility.sections.find(s => s.id === sectionId);
    return section ? section.enabled : true;
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a365d]/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-lg md:text-xl font-serif font-bold text-[#c9a227]">{hc ? l(hc.footerText.forumName_zh, hc.footerText.forumName_en) : t.footer.forumName}</span>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isSectionVisible('about') && <a href="#about" className="text-gray-200 hover:text-[#c9a227] text-sm transition-colors">{t.nav.about}</a>}
            {isSectionVisible('speakers') && <a href="#speakers" className="text-gray-200 hover:text-[#c9a227] text-sm transition-colors">{t.nav.speakers}</a>}
            {isSectionVisible('schedule') && <a href="#schedule" className="text-gray-200 hover:text-[#c9a227] text-sm transition-colors">{t.nav.schedule}</a>}
            {isSectionVisible('sponsors') && <a href="#sponsors" className="text-gray-200 hover:text-[#c9a227] text-sm transition-colors">{t.nav.sponsors}</a>}
            {isSectionVisible('tickets') && <a href="#tickets" className="text-gray-200 hover:text-[#c9a227] text-sm transition-colors">{t.nav.tickets}</a>}
            <button
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="px-3 py-1 border border-[#c9a227]/50 text-[#c9a227] text-xs rounded hover:bg-[#c9a227]/10 transition-colors"
            >
              {language === 'zh' ? 'EN' : '中文'}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="px-2 py-1 border border-[#c9a227]/50 text-[#c9a227] text-xs rounded"
            >
              {language === 'zh' ? 'EN' : '中文'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-[#1a365d] border-t border-white/10 px-4 py-4 space-y-3">
            {isSectionVisible('about') && <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 hover:text-[#c9a227] py-2">{t.nav.about}</a>}
            {isSectionVisible('speakers') && <a href="#speakers" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 hover:text-[#c9a227] py-2">{t.nav.speakers}</a>}
            {isSectionVisible('schedule') && <a href="#schedule" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 hover:text-[#c9a227] py-2">{t.nav.schedule}</a>}
            {isSectionVisible('sponsors') && <a href="#sponsors" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 hover:text-[#c9a227] py-2">{t.nav.sponsors}</a>}
            {isSectionVisible('tickets') && <a href="#tickets" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 hover:text-[#c9a227] py-2">{t.nav.tickets}</a>}
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#1a365d] overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Gold border decorations */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c9a227] to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c9a227] to-transparent"></div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Academic Crest/Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 border-2 border-[#c9a227] rounded-full mb-4">
              <svg className="w-12 h-12 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          <div className="mb-6">
            <span className="inline-block px-6 py-2 border border-[#c9a227]/50 text-[#c9a227] text-sm font-medium tracking-wider">
              {hc ? l(hc.hero.date_zh, hc.hero.date_en) : t.hero.date} · {hc ? l(hc.hero.venue_zh, hc.hero.venue_en) : t.hero.venue}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 leading-tight tracking-wide">
            {hc ? l(hc.hero.title_zh, hc.hero.title_en) : t.hero.title}
          </h1>
          <h2 className="text-2xl md:text-3xl font-serif text-[#c9a227] mb-8">
            {hc ? l(hc.hero.subtitle_zh, hc.hero.subtitle_en) : t.hero.subtitle}
          </h2>
          <p className="text-lg text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            {hc ? l(hc.hero.description_zh, hc.hero.description_en) : t.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {isSectionVisible('tickets') && (
              <button
                onClick={scrollToTickets}
                className="px-10 py-4 bg-[#c9a227] text-[#1a365d] font-semibold rounded hover:bg-[#d4af37] transition-all shadow-lg"
              >
                {t.hero.register}
              </button>
            )}
            {isSectionVisible('about') && (
              <a
                href="#about"
                className="px-10 py-4 border border-white/30 text-white font-semibold rounded hover:bg-white/10 transition-all"
              >
                {t.hero.learnMore}
              </a>
            )}
          </div>

          {/* Stats */}
          {homepageContent && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto pt-8 border-t border-white/10">
            {homepageContent.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-serif font-bold text-[#c9a227]">{stat.value}</div>
                <div className="text-gray-400 text-xs md:text-sm mt-1">{language === 'en' ? stat.label_en : stat.label_zh}</div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-[#c9a227]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* About Section */}
      {isSectionVisible('about') && <section id="about" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#7b2c3a] font-medium text-sm uppercase tracking-widest">{hc ? l(hc.about.label_zh, hc.about.label_en) : t.about.label}</span>
              <h2 className="text-3xl font-serif font-bold text-[#1a365d] mt-3 mb-6 whitespace-pre-line">
                {hc ? l(hc.about.title_zh, hc.about.title_en) : t.about.title}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {hc ? l(hc.about.description1_zh, hc.about.description1_en) : t.about.description1}
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                {hc ? l(hc.about.description2_zh, hc.about.description2_en) : t.about.description2}
              </p>
              <div className="space-y-4">
                {hc ? hc.about.features.map((feature, index) => {
                  const icons = [
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
                  ];
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#1a365d]/10 rounded flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-[#1a365d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {icons[index % icons.length]}
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#1a365d]">{l(feature.title_zh, feature.title_en)}</h4>
                        <p className="text-gray-500 text-sm">{l(feature.desc_zh, feature.desc_en)}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#1a365d]/10 rounded flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-[#1a365d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#1a365d]">{t.about.features.research.title}</h4>
                        <p className="text-gray-500 text-sm">{t.about.features.research.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#1a365d]/10 rounded flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-[#1a365d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#1a365d]">{t.about.features.network.title}</h4>
                        <p className="text-gray-500 text-sm">{t.about.features.network.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#1a365d]/10 rounded flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-[#1a365d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#1a365d]">{t.about.features.publish.title}</h4>
                        <p className="text-gray-500 text-sm">{t.about.features.publish.desc}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded overflow-hidden shadow-2xl bg-[#1a365d] flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <div className="w-32 h-32 mx-auto mb-6 border-2 border-[#c9a227] rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-xl font-serif">{hc ? l(hc.hero.venue_zh, hc.hero.venue_en) : t.hero.venue}</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-[#c9a227] rounded -z-10"></div>
            </div>
          </div>
        </div>
      </section>}

      {/* Speakers Section */}
      {isSectionVisible('speakers') && <section id="speakers" className="py-24 bg-[#faf8f5] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#7b2c3a] font-medium text-sm uppercase tracking-widest">{hc ? l(hc.sectionTitles.speakers.label_zh, hc.sectionTitles.speakers.label_en) : t.speakers.label}</span>
            <h2 className="text-3xl font-serif font-bold text-[#1a365d] mt-3">{hc ? l(hc.sectionTitles.speakers.title_zh, hc.sectionTitles.speakers.title_en) : t.speakers.title}</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              {hc ? l(hc.sectionTitles.speakers.description_zh, hc.sectionTitles.speakers.description_en) : t.speakers.description}
            </p>
          </div>

          {homepageContent && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {homepageContent.speakers.map((speaker, index) => (
              <div key={index} className="bg-white rounded p-8 shadow-md hover:shadow-lg transition-shadow text-center border-t-4 border-[#1a365d]">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#1a365d] flex items-center justify-center text-[#c9a227] text-2xl font-serif font-bold mb-4">
                  {(language === 'en' ? speaker.name_en : speaker.name_zh)[0]}
                </div>
                <h3 className="text-lg font-serif font-semibold text-[#1a365d]">
                  {language === 'en' ? speaker.name_en : speaker.name_zh}
                </h3>
                <p className="text-[#7b2c3a] text-sm mt-1">
                  {language === 'en' ? speaker.title_en : speaker.title_zh}
                </p>
                <p className="text-gray-500 text-sm">
                  {language === 'en' ? speaker.org_en : speaker.org_zh}
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="inline-block px-3 py-1 bg-[#1a365d]/5 text-[#1a365d] text-xs rounded-full">
                    {language === 'en' ? speaker.field_en : speaker.field_zh}
                  </span>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>}

      {/* Schedule Section */}
      {isSectionVisible('schedule') && <section id="schedule" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#7b2c3a] font-medium text-sm uppercase tracking-widest">{hc ? l(hc.sectionTitles.schedule.label_zh, hc.sectionTitles.schedule.label_en) : t.schedule.label}</span>
            <h2 className="text-3xl font-serif font-bold text-[#1a365d] mt-3">{hc ? l(hc.sectionTitles.schedule.title_zh, hc.sectionTitles.schedule.title_en) : t.schedule.title}</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {homepageContent && (<>
            {/* Day 1 */}
            <div className="mb-12">
              <h3 className="text-xl font-serif font-semibold text-[#1a365d] mb-6 pb-2 border-b-2 border-[#c9a227]">
                {hc ? l(hc.sectionTitles.schedule.day1_zh, hc.sectionTitles.schedule.day1_en) : t.schedule.day1}
              </h3>
              <div className="space-y-4">
                {homepageContent.schedule.day1.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                    <div className="sm:w-36 shrink-0 sm:text-right">
                      <span className="text-[#7b2c3a] font-mono text-xs sm:text-sm">{item.time}</span>
                    </div>
                    <div className="relative pl-4 sm:pl-6 border-l-2 border-[#1a365d]/20 pb-4">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 bg-[#c9a227] rounded-full"></div>
                      <h4 className="font-medium text-[#1a365d] text-sm sm:text-base">{language === 'en' ? item.title_en : item.title_zh}</h4>
                      <p className="text-gray-500 text-xs sm:text-sm">{language === 'en' ? item.desc_en : item.desc_zh}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Day 2 */}
            <div>
              <h3 className="text-xl font-serif font-semibold text-[#1a365d] mb-6 pb-2 border-b-2 border-[#c9a227]">
                {hc ? l(hc.sectionTitles.schedule.day2_zh, hc.sectionTitles.schedule.day2_en) : t.schedule.day2}
              </h3>
              <div className="space-y-4">
                {homepageContent.schedule.day2.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                    <div className="sm:w-36 shrink-0 sm:text-right">
                      <span className="text-[#7b2c3a] font-mono text-xs sm:text-sm">{item.time}</span>
                    </div>
                    <div className="relative pl-4 sm:pl-6 border-l-2 border-[#1a365d]/20 pb-4">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 bg-[#c9a227] rounded-full"></div>
                      <h4 className="font-medium text-[#1a365d] text-sm sm:text-base">{language === 'en' ? item.title_en : item.title_zh}</h4>
                      <p className="text-gray-500 text-xs sm:text-sm">{language === 'en' ? item.desc_en : item.desc_zh}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </>)}
          </div>
        </div>
      </section>}

      {/* Sponsors Section */}
      {isSectionVisible('sponsors') && <section id="sponsors" className="py-24 bg-[#faf8f5] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#7b2c3a] font-medium text-sm uppercase tracking-widest">{hc ? l(hc.sectionTitles.sponsors.label_zh, hc.sectionTitles.sponsors.label_en) : t.sponsors.label}</span>
            <h2 className="text-3xl font-serif font-bold text-[#1a365d] mt-3">{hc ? l(hc.sectionTitles.sponsors.title_zh, hc.sectionTitles.sponsors.title_en) : t.sponsors.title}</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              {hc ? l(hc.sectionTitles.sponsors.description_zh, hc.sectionTitles.sponsors.description_en) : t.sponsors.description}
            </p>
          </div>

          {sponsors && (
            <>
              {renderSponsorCategory(sponsors.organizer, 'organizer', 'large')}
              {renderSponsorCategory(sponsors.diamond, 'diamond', 'medium')}
              {renderSponsorCategory(sponsors.gold, 'gold', 'small')}
              {renderSponsorCategory(sponsors.silver, 'silver', 'small')}
              {renderSponsorCategory(sponsors.media, 'media', 'tiny')}
            </>
          )}
        </div>
      </section>}

      {/* Tickets Section */}
      {isSectionVisible('tickets') && <section id="tickets" className="py-24 bg-[#1a365d] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#c9a227] font-medium text-sm uppercase tracking-widest">{hc ? l(hc.sectionTitles.tickets.label_zh, hc.sectionTitles.tickets.label_en) : t.tickets.label}</span>
            <h2 className="text-3xl font-serif font-bold text-white mt-3">{hc ? l(hc.sectionTitles.tickets.title_zh, hc.sectionTitles.tickets.title_en) : t.tickets.title}</h2>
            <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
              {hc ? l(hc.sectionTitles.tickets.description_zh, hc.sectionTitles.tickets.description_en) : t.tickets.description}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-300">{t.common.loading}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} onSelect={handleSelect} />
              ))}
            </div>
          )}
        </div>
      </section>}

      {/* CTA Section */}
      {isSectionVisible('cta') && <section className="py-24 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-[#1a365d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#1a365d] mb-6">
            {hc ? l(hc.cta.title_zh, hc.cta.title_en) : t.cta.title}
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            {hc ? l(hc.cta.description_zh, hc.cta.description_en) : t.cta.description}
          </p>
          <button
            onClick={scrollToTickets}
            className="px-12 py-4 bg-[#1a365d] text-white font-semibold rounded hover:bg-[#234876] transition-all shadow-lg"
          >
            {hc ? l(hc.cta.button_zh, hc.cta.button_en) : t.cta.button}
          </button>
        </div>
      </section>}

      {/* Footer */}
      <footer className="bg-[#1a365d] text-gray-300 py-12 border-t border-[#c9a227]/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-[#c9a227] font-serif font-bold text-lg mb-4">{hc ? l(hc.footerText.forumName_zh, hc.footerText.forumName_en) : t.footer.forumName}</h3>
              <p className="text-sm text-gray-400">{hc ? l(hc.footerText.slogan_zh, hc.footerText.slogan_en) : t.footer.slogan}</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">{t.footer.info}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#about" className="hover:text-[#c9a227] transition-colors">{t.nav.about}</a></li>
                <li><a href="#speakers" className="hover:text-[#c9a227] transition-colors">{t.nav.speakers}</a></li>
                <li><a href="#schedule" className="hover:text-[#c9a227] transition-colors">{t.nav.schedule}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">{t.footer.organizers}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {homepageContent ? homepageContent.footer.organizers.map((org, index) => (
                  <li key={index}>{language === 'en' ? org.name_en : org.name_zh}</li>
                )) : (
                  <>
                    <li>{language === 'en' ? 'NZ Education Centre' : '新西兰教科文中心'}</li>
                    <li>{language === 'en' ? 'University of Auckland' : '奥克兰大学'}</li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">{t.footer.contact}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>{t.footer.email}: {homepageContent?.footer.contact.email ?? 'forum2026@nzec.org'}</li>
                <li>{t.footer.phone}: {homepageContent?.footer.contact.phone ?? '+64 9 123 4567'}</li>
                <li>{t.footer.address}: {homepageContent?.footer.contact.address ?? 'Auckland, New Zealand'}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 {hc ? l(hc.footerText.copyright_zh, hc.footerText.copyright_en) : (language === 'en' ? '12th International Academic Forum' : '第十二届国际学术论坛')}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
