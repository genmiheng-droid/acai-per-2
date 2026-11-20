import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  MapPin,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  Truck,
  User,
  Utensils,
  X,
} from 'lucide-react';
import { BuildYourOwnView } from './components/BuildYourOwnView';
import { CartDrawer } from './components/CartDrawer';
import { ItemDetailSheet } from './components/ItemDetailSheet';
import { MemberAccount, MemberAuthModal } from './components/MemberAuthModal';
import { ResilientImage } from './components/ResilientImage';
import {
  CATEGORY_TABS,
  CartItem,
  CategoryId,
  HERO_IMAGE,
  MENU_ITEMS,
  MenuItem,
  PICKUP_OUTLETS,
} from './data/menu';

const MEMBERS_STORAGE_KEY = 'bbg_members_v1';
const CURRENT_MEMBER_STORAGE_KEY = 'bbg_current_member_v1';
const SIGNUP_COUNT_STORAGE_KEY = 'bbg_signup_count_v1';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('signature');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPromoBanner, setShowPromoBanner] = useState<boolean>(true);

  // Membership & Sign-up Measurement State
  const [members, setMembers] = useState<MemberAccount[]>(() => {
    try {
      const saved = localStorage.getItem(MEMBERS_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved) as Partial<MemberAccount>[];
      return parsed.map((m) => ({
        id: m.id || `mem-${Date.now()}`,
        name: m.name || 'Member',
        email: m.email || '',
        phone: m.phone || '',
        joinedAt: m.joinedAt || new Date().toISOString(),
        voucherCode: m.voucherCode || 'WELCOME20',
        voucherAmount: m.voucherAmount ?? 20,
        voucherUsed: Boolean(m.voucherUsed),
        points: typeof m.points === 'number' ? m.points : 0,
      }));
    } catch {
      return [];
    }
  });
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CURRENT_MEMBER_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [totalSignUps, setTotalSignUps] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SIGNUP_COUNT_STORAGE_KEY);
      return saved ? Number(saved) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [memberModalOpen, setMemberModalOpen] = useState<boolean>(false);
  const [memberModalTab, setMemberModalTab] = useState<'signup' | 'signin' | 'account'>('signin');

  useEffect(() => {
    try {
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
    } catch {
      // Ignore storage quota errors
    }
  }, [members]);

  useEffect(() => {
    try {
      if (currentMemberId) {
        localStorage.setItem(CURRENT_MEMBER_STORAGE_KEY, currentMemberId);
      } else {
        localStorage.removeItem(CURRENT_MEMBER_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [currentMemberId]);

  useEffect(() => {
    try {
      localStorage.setItem(SIGNUP_COUNT_STORAGE_KEY, String(totalSignUps));
    } catch {
      // Ignore storage errors
    }
  }, [totalSignUps]);

  const currentMember = useMemo(
    () => members.find((m) => m.id === currentMemberId) || null,
    [members, currentMemberId]
  );

  const totalBagCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const bagSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      return MENU_ITEMS.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.kicker.toLowerCase().includes(query) ||
          item.ingredients.some((ing) => ing.toLowerCase().includes(query))
      );
    }
    if (activeCategory === 'make-your-own') return [];
    return MENU_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory, searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const handleAddToCart = (newItem: CartItem) => {
    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
    showToast(`Added ${newItem.name} to cart`);
  };

  const handleUpdateQty = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartId === cartId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSignUp = (name: string, email: string, phone: string) => {
    const existing = members.find((m) => m.email === email);
    if (existing) {
      return { ok: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const newMember: MemberAccount = {
      id: `mem-${Date.now()}`,
      name,
      email,
      phone,
      joinedAt: new Date().toISOString(),
      voucherCode: 'WELCOME20',
      voucherAmount: 20,
      voucherUsed: false,
      points: 0,
    };

    setMembers((prev) => [newMember, ...prev]);
    setCurrentMemberId(newMember.id);
    setTotalSignUps((count) => count + 1);
    return { ok: true };
  };

  const handleSignIn = (email: string) => {
    const found = members.find((m) => m.email === email);
    if (!found) {
      return { ok: false, error: 'No member account found for that email. Sign up to claim your $20 voucher.' };
    }
    setCurrentMemberId(found.id);
    setMemberModalOpen(false);
    showToast(`Welcome back, ${found.name.split(' ')[0]} · Choose your açaí below`);
    setTimeout(() => {
      const menuEl = document.getElementById('menu-section');
      if (menuEl) {
        menuEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
    return { ok: true };
  };

  const handleSignOut = () => {
    setCurrentMemberId(null);
  };

  const handleCompleteMemberOrder = (
    memberId: string,
    options: {
      usedWelcomeVoucher: boolean;
      usedPointsReward: boolean;
      pointsEarned: number;
    }
  ) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const currentPts = m.points ?? 0;
        const afterRedeem = Math.max(0, currentPts - (options.usedPointsReward ? 10 : 0));
        return {
          ...m,
          voucherUsed: m.voucherUsed || options.usedWelcomeVoucher,
          points: afterRedeem + options.pointsEarned,
        };
      })
    );
  };

  const openMemberModal = (tab: 'signup' | 'signin' | 'account') => {
    setMemberModalTab(tab);
    setMemberModalOpen(true);
  };

  const navigateToCategory = (category: CategoryId) => {
    setSearchQuery('');
    setActiveCategory(category);
    const menuEl = document.getElementById('menu-section');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#FAF9F6] text-[#18181B] flex flex-col pb-20 md:pb-0 transition-[padding] duration-200 ${
        isCartOpen ? 'md:pr-[380px] lg:pr-[420px]' : ''
      }`}
    >
      {/* Locked Sticky Header Stack: Fixed New Members Offer Banner + Top Bar */}
      <div className="sticky top-0 z-30">
        {showPromoBanner && (
          <div className="bg-[#FAF9F6]/95 backdrop-blur-md pt-2 px-3 sm:px-6 lg:px-8 pb-2 border-b border-[#E5E1D8]/60">
            <div className="max-w-7xl mx-auto rounded-2xl bg-[#14532D] border-2 border-[#22C55E] px-4 py-2.5 sm:px-5 sm:py-3.5 text-white shadow-sm relative flex items-center justify-between gap-3 pr-11">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold tracking-wide text-white/90 truncate">
                  New Member Offer · Valid till 31st Dec
                </p>
                <p className="font-display text-sm sm:text-lg font-semibold text-white leading-snug truncate">
                  New members get $20 voucher on your first BellyBellyGood order
                </p>
              </div>
              <button
                type="button"
                onClick={() => openMemberModal(currentMember ? 'account' : 'signup')}
                className="min-h-[40px] px-3.5 sm:px-5 py-2 rounded-xl border-2 border-[#4ADE80] bg-[#166534] hover:bg-[#15803D] text-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors"
              >
                {currentMember ? 'My Card' : 'Sign Up & Claim $20'}
              </button>
              <button
                type="button"
                onClick={() => setShowPromoBanner(false)}
                aria-label="Dismiss promotion banner"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Top Bar: Brand — Nav Links — Member Sign In (top right) + Bag */}
        <header className="h-[54px] md:h-16 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E5E1D8]">
          <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 md:gap-8">
            <a
              href="#top"
              className="font-display text-xl md:text-2xl font-semibold tracking-tight text-[#1B3B2B] whitespace-nowrap shrink-0"
            >
              BellyBellyGood
            </a>

            <nav
              aria-label="Primary menu navigation"
              className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600"
            >
              <button
                type="button"
                onClick={() => navigateToCategory('signature')}
                className="hover:text-[#5D2E6D] transition-colors whitespace-nowrap shrink-0"
              >
                Signature Bowls
              </button>
              <button
                type="button"
                onClick={() => navigateToCategory('make-your-own')}
                className="hover:text-[#5D2E6D] transition-colors whitespace-nowrap shrink-0"
              >
                Make Your Own
              </button>
              <button
                type="button"
                onClick={() => navigateToCategory('pints')}
                className="hover:text-[#5D2E6D] transition-colors whitespace-nowrap shrink-0"
              >
                Take-Home Pints
              </button>
              <a
                href="#delivery-info"
                className="hover:text-[#5D2E6D] transition-colors whitespace-nowrap shrink-0"
              >
                Delivery Info
              </a>
            </nav>

            {/* Top Right Hand Corner: Member Sign-In + Bag */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => openMemberModal(currentMember ? 'account' : 'signin')}
                className="min-h-[40px] px-3 py-2 rounded-xl border border-[#E5E1D8] bg-white hover:bg-[#F3F1EC] text-zinc-900 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <User className="w-4 h-4 text-[#5D2E6D]" />
                <span className="tabular-nums">
                  {currentMember
                    ? `${currentMember.name.split(' ')[0]} · ${currentMember.points ?? 0} pts`
                    : 'Member Sign In'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="hidden md:inline-flex min-h-[40px] px-4 py-2 rounded-xl bg-[#5D2E6D] hover:bg-[#441E52] text-white text-xs sm:text-sm font-semibold items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
                <span className="tabular-nums">
                  ({totalBagCount})
                  {bagSubtotal > 0 ? ` · $${bagSubtotal.toFixed(2)}` : ''}
                </span>
              </button>
            </div>
          </div>
        </header>
      </div>

      <main id="top" className="flex-1">
        {/* Hero Split */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch bg-white border border-[#E5E1D8] rounded-3xl overflow-hidden">
            <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
              <p className="text-xs font-semibold tracking-wide text-[#1B3B2B] mb-3">
                Singapore Islandwide Delivery · 100% Organic Brazilian Açaí
              </p>
              <h1
                className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-zinc-900 leading-[1.12] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Pure, thick, undiluted açaí bowls delivered chilled to your door.
              </h1>
              <p className="mt-4 text-sm sm:text-base text-zinc-600 leading-relaxed max-w-lg">
                Zero apple juice dilution, zero artificial sweeteners. Packed in insulated thermal bags with ice packs so every BellyBellyGood bowl and pint arrives frozen firm across Singapore.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateToCategory('signature')}
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-[#5D2E6D] hover:bg-[#441E52] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  Order Signature Bowls
                </button>
                <button
                  type="button"
                  onClick={() => navigateToCategory('make-your-own')}
                  className="min-h-[48px] px-5 py-3 rounded-xl border border-[#E5E1D8] bg-[#FAF9F6] hover:bg-[#F3F1EC] text-zinc-900 text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  Build Your Own Bowl
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 min-h-[240px] sm:min-h-[320px] lg:min-h-[420px] bg-[#F3F1EC]">
              <ResilientImage
                src={HERO_IMAGE}
                alt="BellyBellyGood organic Brazilian açaí bowls with fresh berries, banana, kiwi, and honey granola"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Strategic New Member Offer Spotlight — Prominent Green Border with White Words */}
          <div className="mt-5 rounded-2xl bg-[#14532D] border-2 border-[#22C55E] p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wide text-white/90">
                New Member Offer · Valid till 31st Dec
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-white leading-snug">
                Join BellyBellyGood today and get a $20 welcome voucher
              </h2>
              <p className="text-sm text-white/90">
                Instant $20 off your order with code WELCOME20 · Offer valid till 31st Dec
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => openMemberModal(currentMember ? 'account' : 'signup')}
                className="min-h-[48px] px-6 py-3 rounded-xl border-2 border-[#4ADE80] bg-[#166534] hover:bg-[#15803D] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                {currentMember ? 'View My $20 Voucher' : 'Sign Up & Claim $20'}
              </button>
            </div>
          </div>

          {/* 4-column Singapore Delivery Strip */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4">
              <p className="text-xs text-zinc-500">Islandwide Delivery</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900 tabular-nums">
                Free on orders $121+
              </p>
            </div>
            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4">
              <p className="text-xs text-zinc-500">Order Before 7:00 PM</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                Next-day 12:00 – 4:00 PM
              </p>
            </div>
            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4">
              <p className="text-xs text-zinc-500">Cold-Chain Transit</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                Thermal bag + ice packs
              </p>
            </div>
            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4">
              <p className="text-xs text-zinc-500">Outlet Self-Pickup</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                5 Singapore cafés · Free
              </p>
            </div>
          </div>
        </section>

        {/* Menu Section */}
        <section
          id="menu-section"
          aria-label="Açaí Delivery Menu"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12"
        >
          {/* Category Tabs & Search Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E5E1D8]">
            <div
              role="tablist"
              aria-label="Menu categories"
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0"
            >
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeCategory === tab.id && !searchQuery;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory(tab.id);
                    }}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#1B3B2B] text-white'
                        : 'bg-white border border-[#E5E1D8] text-zinc-700 hover:border-zinc-400 hover:text-zinc-950'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-72 shrink-0">
              <Search
                className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bowls, pints, toppings..."
                aria-label="Search menu items"
                className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#5D2E6D]"
              />
            </div>
          </div>

          {/* Active Category Content */}
          {activeCategory === 'make-your-own' && !searchQuery ? (
            <BuildYourOwnView onAddToCart={handleAddToCart} />
          ) : (
            <div className="pt-6">
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900">
                  {searchQuery
                    ? `Search results for “${searchQuery}”`
                    : CATEGORY_TABS.find((c) => c.id === activeCategory)?.label}
                </h2>
                <span className="text-xs text-zinc-500 tabular-nums">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="bg-white border border-[#E5E1D8] rounded-2xl p-10 text-center">
                  <p className="font-display text-lg font-semibold text-zinc-900">
                    No matching items found
                  </p>
                  <p className="text-sm text-zinc-600 mt-1">
                    Try searching for Triple A, Nutty Party, Pint, or Sourdough.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-[#5D2E6D] text-white text-xs font-semibold"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${
                    isCartOpen ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3'
                  }`}
                >
                  {filteredItems.map((item) => {
                    const startingPrice = Math.min(...item.sizes.map((s) => s.price));
                    const hasMultipleSizes = item.sizes.length > 1;
                    return (
                      <article
                        key={item.id}
                        className="group bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="text-left flex-1 flex flex-col focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#5D2E6D]"
                        >
                          <div className="aspect-[4/3] w-full bg-[#F3F1EC] overflow-hidden">
                            <ResilientImage
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between w-full">
                            <div>
                              <p className="text-xs font-medium text-[#1B3B2B] mb-1">
                                {item.kicker}
                              </p>
                              <h3 className="font-display text-xl font-semibold text-zinc-900 leading-snug">
                                {item.name}
                              </h3>
                              <p className="mt-2 text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            <div className="mt-4 pt-3.5 border-t border-[#F0ECE3] flex items-center justify-between w-full">
                              <div>
                                <span className="text-sm font-bold tabular-nums text-zinc-900">
                                  {hasMultipleSizes
                                    ? `From $${startingPrice.toFixed(2)}`
                                    : `$${startingPrice.toFixed(2)}`}
                                </span>
                                {item.calories && (
                                  <span className="ml-2 text-xs text-zinc-400 tabular-nums">
                                    · {item.calories}
                                  </span>
                                )}
                              </div>

                              <span className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#5D2E6D]/10 text-[#441E52] group-hover:bg-[#5D2E6D] group-hover:text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0">
                                <Plus className="w-3.5 h-3.5" />
                                <span>{item.supportsDrizzle || hasMultipleSizes ? 'Customize' : 'Add'}</span>
                              </span>
                            </div>
                          </div>
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Singapore Delivery & Thermal Care Information Section */}
        <section
          id="delivery-info"
          aria-labelledby="delivery-heading"
          className="bg-[#EFECE6]/70 border-t border-[#E5E1D8] py-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-8">
              <p className="text-xs font-semibold text-[#1B3B2B] mb-1.5">
                BellyBellyGood Islandwide Delivery Guide
              </p>
              <h2
                id="delivery-heading"
                className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900"
              >
                How our cold-chain delivery works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 space-y-2.5">
                <Truck className="w-5 h-5 text-[#5D2E6D]" strokeWidth={1.75} />
                <h3 className="text-base font-semibold text-zinc-900">Islandwide Fee Tiers</h3>
                <p className="text-sm text-zinc-600 leading-relaxed tabular-nums">
                  Orders $70 & below: $15 · Orders $71–$120: $12 · Orders $121+: Free Delivery. Tuas, Sentosa & Jurong Island carry a +$5 surcharge.
                </p>
              </div>

              <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 space-y-2.5">
                <Snowflake className="w-5 h-5 text-[#1B3B2B]" strokeWidth={1.75} />
                <h3 className="text-base font-semibold text-zinc-900">Thermal Bag Transit</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Orders placed before 7:00 PM arrive the next day between 12:00 PM and 4:00 PM in insulated foil bags. Place pints straight into the freezer upon arrival (keeps up to 6 months).
                </p>
              </div>

              <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 space-y-2.5">
                <MapPin className="w-5 h-5 text-[#5D2E6D]" strokeWidth={1.75} />
                <h3 className="text-base font-semibold text-zinc-900">Free Outlet Self-Pickup</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Skip the delivery fee by picking up at {PICKUP_OUTLETS.slice(0, 3).join(', ')}, Tampines 1, or Jewel Changi.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-[#E5E1D8] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            <span className="font-display text-base font-semibold text-[#1B3B2B]">
              BellyBellyGood
            </span>
            <p className="mt-1">100% Organic Brazilian Açaí · Singapore Islandwide Ordering</p>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => navigateToCategory('signature')}
              className="hover:text-zinc-900"
            >
              Signature Bowls
            </button>
            <button
              type="button"
              onClick={() => navigateToCategory('make-your-own')}
              className="hover:text-zinc-900"
            >
              Make Your Own
            </button>
            <button
              type="button"
              onClick={() => openMemberModal(currentMember ? 'account' : 'signup')}
              className="hover:text-zinc-900"
            >
              Membership ($20 Voucher)
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation (60px high, keeps total sticky < 15% of viewport) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[60px] bg-white/95 backdrop-blur-md border-t border-[#E5E1D8] grid grid-cols-4 items-center"
      >
        <button
          type="button"
          onClick={() => navigateToCategory('signature')}
          className={`h-full flex flex-col items-center justify-center gap-0.5 ${
            activeCategory === 'signature' ? 'text-[#5D2E6D]' : 'text-zinc-500'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-tight">Menu</span>
        </button>

        <button
          type="button"
          onClick={() => navigateToCategory('make-your-own')}
          className={`h-full flex flex-col items-center justify-center gap-0.5 ${
            activeCategory === 'make-your-own' ? 'text-[#5D2E6D]' : 'text-zinc-500'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-tight">Build Bowl</span>
        </button>

        <button
          type="button"
          onClick={() => navigateToCategory('bundles')}
          className={`h-full flex flex-col items-center justify-center gap-0.5 ${
            activeCategory === 'bundles' || activeCategory === 'pints'
              ? 'text-[#5D2E6D]'
              : 'text-zinc-500'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-tight">Bundles</span>
        </button>

        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="h-full flex flex-col items-center justify-center gap-0.5 text-zinc-700 relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-[#5D2E6D]" />
            {totalBagCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#5D2E6D] text-white text-[10px] font-bold tabular-nums flex items-center justify-center">
                {totalBagCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold tracking-tight text-[#441E52] tabular-nums">
            {bagSubtotal > 0 ? `$${bagSubtotal.toFixed(2)}` : 'Cart'}
          </span>
        </button>
      </nav>

      {/* Subtle Add-to-Cart Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1B3B2B] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3 text-xs font-semibold whitespace-nowrap ${
            isCartOpen ? 'md:left-[calc(50%-190px)] lg:left-[calc(50%-210px)]' : ''
          }`}
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
          {!isCartOpen && (
            <button
              type="button"
              onClick={() => {
                setToastMessage(null);
                setIsCartOpen(true);
              }}
              className="underline underline-offset-2 text-white/90 hover:text-white ml-1"
            >
              View Cart
            </button>
          )}
        </div>
      )}

      {/* Item Customizer Sheet */}
      <ItemDetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart & Singapore Delivery Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        currentMember={currentMember}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOpenSignUp={() => {
          setIsCartOpen(false);
          openMemberModal('signup');
        }}
        onCompleteMemberOrder={handleCompleteMemberOrder}
      />

      {/* Member Sign-In / Sign-Up Modal */}
      <MemberAuthModal
        isOpen={memberModalOpen}
        initialTab={memberModalTab}
        currentMember={currentMember}
        onClose={() => setMemberModalOpen(false)}
        onSignUp={handleSignUp}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
