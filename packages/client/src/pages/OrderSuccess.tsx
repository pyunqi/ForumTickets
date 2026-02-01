import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { getOrder } from '../api/orders';
import type { Order } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function OrderSuccess() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNo) return;
      try {
        const data = await getOrder(orderNo);
        setOrder(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
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
      pdf.save(`Forum2024-Ticket-${order.order_no}.pdf`);
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
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">支付成功</h1>
          <p className="text-gray-600">您的电子票已生成，请下载保存</p>
        </div>

        {/* Ticket Card */}
        <div
          ref={ticketRef}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8"
        >
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-1">Forum 2024</h2>
                <p className="text-blue-200">年度技术峰会</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-200">电子票</div>
                <div className="text-lg font-bold">{order.ticket_name}</div>
              </div>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: Event Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">活动日期</div>
                    <div className="font-semibold">2024年12月15日</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">签到时间</div>
                    <div className="font-semibold">08:30 - 09:00</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">活动地点</div>
                    <div className="font-semibold">北京国家会议中心</div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px bg-gray-200 relative">
                <div className="absolute -top-6 -left-3 w-6 h-6 bg-gray-100 rounded-full"></div>
                <div className="absolute -bottom-6 -left-3 w-6 h-6 bg-gray-100 rounded-full"></div>
              </div>
              <div className="md:hidden h-px bg-gray-200 relative">
                <div className="absolute top-1/2 -left-6 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded-full"></div>
                <div className="absolute top-1/2 -right-6 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded-full"></div>
              </div>

              {/* Right: Attendee Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="text-sm text-gray-500">参会者</div>
                  <div className="text-xl font-bold text-gray-900">{order.customer_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">邮箱</div>
                  <div className="font-medium text-gray-700">{order.customer_email}</div>
                </div>
                {order.customer_phone && (
                  <div>
                    <div className="text-sm text-gray-500">联系电话</div>
                    <div className="font-medium text-gray-700">{order.customer_phone}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">票数</div>
                  <div className="font-medium text-gray-700">{order.quantity} 张</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-dashed">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase">订单号</div>
                  <div className="font-mono font-bold text-gray-900">{order.order_no}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase">金额</div>
                  <div className="font-bold text-green-600">¥{order.total_amount.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase">状态</div>
                  <div className="font-bold text-green-600">已支付</div>
                </div>
              </div>
              {/* QR Code Placeholder */}
              <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
                下载电子票 (PDF)
              </>
            )}
          </button>
          <Link
            to="/"
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            返回首页
          </Link>
        </div>

        {/* Notice */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="font-medium text-amber-800 mb-2">温馨提示</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• 请下载并保存电子票，入场时需出示</li>
            <li>• 电子票已同步发送至您的邮箱</li>
            <li>• 如有问题请联系：contact@forum2024.com</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
