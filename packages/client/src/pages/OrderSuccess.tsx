import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { getOrder } from '../api/orders';
import { getActiveConference, Conference } from '../api/conferences';
import type { Order, AttendeeInfo } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function OrderSuccess() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [conference, setConference] = useState<Conference | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Parse attendees info from JSON string
  const getAttendees = (): AttendeeInfo[] => {
    if (!order?.attendees_info) return [];
    try {
      return JSON.parse(order.attendees_info);
    } catch {
      return [];
    }
  };

  const attendees = order ? getAttendees() : [];

  // Format date range for display
  const formatDateRange = () => {
    if (!conference) return '2026年6月15-17日';
    const start = new Date(conference.date_start);
    const end = new Date(conference.date_end);
    const startMonth = start.getMonth() + 1;
    const endMonth = end.getMonth() + 1;
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = start.getFullYear();

    if (startMonth === endMonth) {
      return `${year}年${startMonth}月${startDay}-${endDay}日`;
    }
    return `${year}年${startMonth}月${startDay}日-${endMonth}月${endDay}日`;
  };

  const formatCheckinDate = () => {
    if (!conference) return '6月15日';
    const start = new Date(conference.date_start);
    return `${start.getMonth() + 1}月${start.getDate()}日`;
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [orderData, conferenceData] = await Promise.all([
          orderNo ? getOrder(orderNo) : Promise.resolve(null),
          getActiveConference(),
        ]);
        if (orderData) setOrder(orderData);
        if (conferenceData) setConference(conferenceData);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [orderNo]);

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !order) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a5',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`学术论坛2026-参会确认函-${order.order_no}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF 生成失败，请重试');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-[#1a365d] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">订单不存在</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#1a365d]/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[#1a365d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#1a365d] mb-2">注册成功</h1>
          <p className="text-gray-600">您的参会确认函已生成，请下载保存</p>
        </div>

        {/* Confirmation Letter Card */}
        <div
          ref={ticketRef}
          className="bg-white rounded shadow-2xl overflow-hidden mb-8 border border-gray-200"
        >
          {/* Header */}
          <div className="bg-[#1a365d] text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 border-2 border-[#c9a227] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold">{conference?.name_zh || '国际学术论坛'}</h2>
                    <p className="text-gray-300 text-sm">{conference?.subtitle_zh || ''}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">参会确认函</div>
                <div className="text-lg font-medium text-[#c9a227]">
                  {order.quantity} 人参会
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: Event Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a365d]/10 rounded flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#1a365d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">会议日期</div>
                    <div className="font-medium text-[#1a365d]">{formatDateRange()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a365d]/10 rounded flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#1a365d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">签到时间</div>
                    <div className="font-medium text-[#1a365d]">{formatCheckinDate()} {conference?.checkin_time || '08:30 - 09:00'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a365d]/10 rounded flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#1a365d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">会议地点</div>
                    <div className="font-medium text-[#1a365d]">{conference?.venue_zh || '新西兰教科文中心'}</div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px bg-gray-200 relative">
                <div className="absolute -top-6 -left-3 w-6 h-6 bg-[#faf8f5] rounded-full"></div>
                <div className="absolute -bottom-6 -left-3 w-6 h-6 bg-[#faf8f5] rounded-full"></div>
              </div>
              <div className="md:hidden h-px bg-gray-200 relative">
                <div className="absolute top-1/2 -left-6 -translate-y-1/2 w-6 h-6 bg-[#faf8f5] rounded-full"></div>
                <div className="absolute top-1/2 -right-6 -translate-y-1/2 w-6 h-6 bg-[#faf8f5] rounded-full"></div>
              </div>

              {/* Right: Attendee Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="text-sm text-gray-500 mb-2">参会者信息</div>
                  {attendees.length > 0 ? (
                    <div className="space-y-2">
                      {attendees.map((attendee, index) => (
                        <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                          <span className="font-serif font-bold text-[#1a365d]">{attendee.name}</span>
                          <span className="text-sm text-[#7b2c3a] font-medium">{attendee.ticketName}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-lg font-serif font-bold text-[#1a365d]">{order.customer_name}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">联系邮箱</div>
                  <div className="font-medium text-gray-700">{order.customer_email}</div>
                </div>
                {order.customer_phone && (
                  <div>
                    <div className="text-sm text-gray-500">联系电话</div>
                    <div className="font-medium text-gray-700">{order.customer_phone}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#faf8f5] px-6 py-4 border-t border-dashed border-gray-300">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">注册编号</div>
                  <div className="font-mono font-bold text-[#1a365d]">{order.order_no}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">参会人数</div>
                  <div className="font-serif font-bold text-[#1a365d]">{order.quantity} 人</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">注册费</div>
                  <div className="font-serif font-bold text-[#7b2c3a]">¥{order.total_amount.toFixed(0)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">状态</div>
                  <div className="font-bold text-green-600">已确认</div>
                </div>
              </div>
              {/* QR Code Placeholder */}
              <div className="w-20 h-20 bg-white border-2 border-[#1a365d]/20 rounded flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-8 h-8 text-[#1a365d]/40 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <div className="text-xs text-gray-400 mt-1">签到码</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-8 py-3 bg-[#1a365d] text-white font-medium rounded hover:bg-[#234876] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                生成中...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                下载参会确认函 (PDF)
              </>
            )}
          </button>
          <Link
            to="/"
            className="px-8 py-3 border border-[#1a365d] text-[#1a365d] font-medium rounded hover:bg-[#1a365d]/5 transition-colors text-center"
          >
            返回首页
          </Link>
        </div>

        {/* Notice */}
        <div className="mt-8 p-4 bg-[#faf8f5] border border-[#c9a227]/50 rounded">
          <h3 className="font-serif font-medium text-[#1a365d] mb-2">温馨提示</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>1. 请下载并保存参会确认函，入场时需出示</li>
            <li>2. 参会确认函已同步发送至您的注册邮箱</li>
            <li>3. 如有问题请联系会务组：{conference?.contact_email || 'forum@example.com'}</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
