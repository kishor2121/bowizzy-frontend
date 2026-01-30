import { Search, Bell, Share2, Menu, User, Plus, Ticket } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useEffect, useState, useRef } from 'react';
import api from '@/api';

export default function DashNav({heading}: {heading: string}) {
    const { toggleSidebar } = useSidebar()
    const [credits, setCredits] = useState<number | null>(null);
    const [creditsLoading, setCreditsLoading] = useState(false);
    const [couponCode, setCouponCode] = useState<string | null>(null);
    const [showCreditsPopup, setShowCreditsPopup] = useState(false);
    const popupRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const loadCredits = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('user') || 'null');
                const userId = userData?.user_id;
                const token = userData?.token;

                if (!userId || !token) return;

                setCreditsLoading(true);
                const resp = await api.get(`/credits/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
                const data = resp?.data ?? resp;

                let creditsVal = null;
                let coupon = null;

                if (data) {
                    if (typeof data.credits === 'object') {
                        creditsVal = data.credits?.credits ?? null;
                    } else {
                        creditsVal = data.credits ?? null;
                    }

                    coupon = data.coupon_code ?? data?.coupon ?? null;
                }

                setCredits(typeof creditsVal === 'number' ? creditsVal : (Number(creditsVal) || null));
                setCouponCode(coupon ?? null);
            } catch (err) {
                console.warn('Failed to load credits', err);
                setCredits(null);
                setCouponCode(null);
            } finally {
                setCreditsLoading(false);
            }
        };

        loadCredits();
    }, []);

    // close popup on outside click
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!popupRef.current) return;
            const target = e.target as Node;
            if (popupRef.current.contains(target)) return;
            setShowCreditsPopup(false);
        };

        if (showCreditsPopup) {
            document.addEventListener('click', onDocClick);
        }
        return () => document.removeEventListener('click', onDocClick);
    }, [showCreditsPopup]);

    useEffect(() => {
        const onRefresh = (ev: Event) => {
            const detail = (ev as CustomEvent)?.detail;
            if (detail && (typeof detail.credits !== 'undefined' || typeof detail.coupon_code !== 'undefined')) {
                if (typeof detail.credits === 'number') setCredits(detail.credits);
                if (typeof detail.coupon_code === 'string') setCouponCode(detail.coupon_code);
                return;
            }
            (async () => {
                try {
                    setCreditsLoading(true);
                    const userData = JSON.parse(localStorage.getItem('user') || 'null');
                    const userId = userData?.user_id;
                    const token = userData?.token;
                    if (!userId || !token) return;
                    const resp = await api.get(`/credits/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
                    const data = resp?.data ?? resp;
                    const creditsVal = typeof data.credits === 'object' ? data.credits?.credits ?? null : data.credits ?? null;
                    const coupon = data.coupon_code ?? data?.coupon ?? null;
                    setCredits(typeof creditsVal === 'number' ? creditsVal : (Number(creditsVal) || null));
                    setCouponCode(coupon ?? null);
                } catch (err) {
                    console.warn('credits refresh failed', err);
                } finally {
                    setCreditsLoading(false);
                }
            })();
        };

        window.addEventListener('credits:refresh', onRefresh as EventListener);
        return () => window.removeEventListener('credits:refresh', onRefresh as EventListener);
    }, []);

    return (
        <nav className="flex items-center justify-between px-6 py-6 bg-white border-b border-gray-200">
            <div className="text-lg font-medium text-gray-700">{heading}</div>
            <div className="flex items-center gap-2">
                <button className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-100 transition">
                    <Search size={18} />
                </button>
                <div className="relative">
                    <button className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-100 transition">
                        <Bell size={18} />
                    </button>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
                </div>

                {/* User profile / credits popover */}
                <div className="relative" ref={popupRef}>
                    <button
                        onClick={() => setShowCreditsPopup((s) => !s)}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-100 transition"
                        aria-expanded={showCreditsPopup}
                        aria-haspopup="true"
                    >
                        <User size={16} />
                    </button>

                    {showCreditsPopup && (
                        <div className="absolute right-0 mt-2 w-72 z-50">
                            <div className="absolute right-6 -top-2 w-3 h-3 bg-white transform rotate-45 shadow-sm" />

                            <div className="rounded-xl shadow-lg overflow-hidden bg-white">
                                <div className="bg-gradient-to-br from-yellow-200 via-orange-300 to-orange-400 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-inner">
                                            <div className="text-white text-lg">⭐</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs text-white/90">Your Credits</div>
                                            <div className="mt-1 text-2xl font-bold text-white">
                                                {creditsLoading ? '...' : (credits != null ? credits : '—')}
                                            </div>
                                            <div className="text-xs text-white/80">Credits Available</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4">
                                    {couponCode ? (
                                        <div className="mb-3">
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <Ticket size={14} className="text-orange-500" />
                                                Coupon
                                            </div>
                                            <div className="inline-block mt-1 px-3 py-1 bg-gray-100 text-sm rounded-full font-medium text-gray-800">{couponCode}</div>
                                        </div>
                                    ) : (
                                        <div className="mb-3" />
                                    )}

                                    <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full py-2 shadow-md hover:from-orange-500 hover:to-orange-600 transition">
                                        <Plus size={16} />
                                        <span className="font-medium">Top up credits</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button className="flex items-center gap-1 px-4 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-100 transition">
                    <Share2 size={16} />
                    <span className="text-sm">Share</span>
                </button>
                <button 
                    onClick={() => toggleSidebar()} 
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white 
                            hover:bg-gray-100 transition lg:hidden"
                >
                    <Menu size={18} />
                </button>

            </div>
        </nav>
    );
}