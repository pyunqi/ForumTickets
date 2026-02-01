import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TicketCard } from '../components/TicketCard';
import { getTickets } from '../api/tickets';
import type { TicketType } from '../types';

export function Home() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTickets() {
      try {
        const data = await getTickets();
        setTickets(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  const handleSelect = (ticket: TicketType) => {
    navigate('/order', { state: { ticket } });
  };

  const scrollToTickets = () => {
    document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600">Forum 2024</span>
          <nav className="flex items-center space-x-6">
            <a href="#about" className="text-gray-600 hover:text-gray-900 text-sm">关于活动</a>
            <a href="#speakers" className="text-gray-600 hover:text-gray-900 text-sm">嘉宾阵容</a>
            <a href="#schedule" className="text-gray-600 hover:text-gray-900 text-sm">活动日程</a>
            <a href="#tickets" className="text-gray-600 hover:text-gray-900 text-sm">门票</a>
            <Link to="/admin/login" className="text-gray-400 hover:text-gray-600 text-sm">管理</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-200 text-sm font-medium">
              2024年12月15日 · 北京国家会议中心
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Forum 2024
            <span className="block text-blue-300">年度技术峰会</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            汇聚全球顶尖技术专家，探索人工智能、云计算、区块链等前沿领域，
            <br className="hidden md:block" />
            共同定义科技的未来
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToTickets}
              className="px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
            >
              立即购票
            </button>
            <a
              href="#about"
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
            >
              了解更多
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">50+</div>
              <div className="text-blue-200 text-sm mt-1">演讲嘉宾</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">2000+</div>
              <div className="text-blue-200 text-sm mt-1">参会人数</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">30+</div>
              <div className="text-blue-200 text-sm mt-1">主题演讲</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">关于活动</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">
                探索技术前沿，<br />连接行业精英
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Forum 2024 是一场汇聚全球科技精英的年度盛会。我们邀请了来自世界顶级科技公司的技术领袖、
                创新企业家和学术研究者，共同探讨人工智能、云原生、Web3.0 等前沿技术的发展趋势和应用实践。
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                无论您是技术开发者、产品经理、创业者还是技术爱好者，都能在这里找到志同道合的伙伴，
                获取最新的行业洞察，拓展您的职业网络。
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">前沿技术分享</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">高端人脉资源</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-gray-700">商业合作机会</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <svg className="w-24 h-24 mx-auto mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-xl font-medium">Forum 2024</p>
                  <p className="text-blue-200">年度技术峰会</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-400 rounded-2xl -z-10"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-200 rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      <section id="speakers" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">嘉宾阵容</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">行业顶尖专家</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              我们邀请了来自全球知名科技公司和研究机构的技术领袖，为您带来最前沿的技术洞察
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: '张明远', title: 'AI 研究院院长', company: '领先科技', color: 'from-blue-400 to-blue-600' },
              { name: '李思琪', title: '首席架构师', company: '云原生公司', color: 'from-purple-400 to-purple-600' },
              { name: '王浩然', title: '技术副总裁', company: '未来数据', color: 'from-green-400 to-green-600' },
              { name: '陈雨婷', title: '产品总监', company: '创新实验室', color: 'from-orange-400 to-orange-600' },
            ].map((speaker, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${speaker.color} flex items-center justify-center text-white text-3xl font-bold mb-4`}>
                  {speaker.name[0]}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{speaker.name}</h3>
                <p className="text-blue-600 text-sm">{speaker.title}</p>
                <p className="text-gray-500 text-sm">{speaker.company}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">活动日程</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">精彩内容安排</h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {[
              { time: '08:30 - 09:00', title: '签到入场', desc: '领取参会资料和精美礼品' },
              { time: '09:00 - 09:30', title: '开幕致辞', desc: '大会主席发表开幕演讲' },
              { time: '09:30 - 12:00', title: '主题演讲', desc: 'AI 时代的技术创新与产业变革' },
              { time: '12:00 - 14:00', title: '午餐 & 交流', desc: 'VIP 专属午宴，拓展人脉' },
              { time: '14:00 - 17:00', title: '分论坛', desc: '云原生 / Web3 / 大模型应用' },
              { time: '17:00 - 18:00', title: '圆桌讨论', desc: '技术领袖对话，畅想未来' },
              { time: '18:00 - 21:00', title: '晚宴 & 颁奖', desc: '年度技术创新奖颁奖典礼' },
            ].map((item, index) => (
              <div key={index} className="flex gap-6 mb-6 last:mb-0">
                <div className="w-36 shrink-0 text-right">
                  <span className="text-blue-600 font-mono font-medium">{item.time}</span>
                </div>
                <div className="relative pl-6 border-l-2 border-blue-200 pb-6 last:pb-0">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tickets Section */}
      <section id="tickets" className="py-24 bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">门票</span>
            <h2 className="text-4xl font-bold text-white mt-2">选择您的票种</h2>
            <p className="text-blue-200 mt-4 max-w-2xl mx-auto">
              多种票种满足不同需求，早鸟优惠限时抢购中
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-blue-200">加载中...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} onSelect={handleSelect} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            准备好加入我们了吗？
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            名额有限，立即报名，与 2000+ 技术精英共襄盛举
          </p>
          <button
            onClick={scrollToTickets}
            className="px-10 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            立即购票
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Forum 2024</h3>
              <p className="text-sm">探索技术前沿，连接行业精英。</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">活动信息</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white">关于活动</a></li>
                <li><a href="#speakers" className="hover:text-white">嘉宾阵容</a></li>
                <li><a href="#schedule" className="hover:text-white">活动日程</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-sm">
                <li>邮箱：contact@forum2024.com</li>
                <li>电话：400-888-8888</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">关注我们</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Forum. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
