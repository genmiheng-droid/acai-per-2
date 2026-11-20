import { FormEvent, useEffect, useState } from 'react';
import { Award, CheckCircle2, LogOut, Sparkles, Ticket, X } from 'lucide-react';

export interface MemberAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedAt: string;
  voucherCode: string;
  voucherAmount: number;
  voucherUsed: boolean;
  points: number;
}

interface MemberAuthModalProps {
  isOpen: boolean;
  initialTab: 'signup' | 'signin' | 'account';
  currentMember: MemberAccount | null;
  onClose: () => void;
  onSignUp: (name: string, email: string, phone: string) => { ok: boolean; error?: string };
  onSignIn: (email: string) => { ok: boolean; error?: string };
  onSignOut: () => void;
}

export function MemberAuthModal({
  isOpen,
  initialTab,
  currentMember,
  onClose,
  onSignUp,
  onSignIn,
  onSignOut,
}: MemberAuthModalProps) {
  const [tab, setTab] = useState<'signup' | 'signin'>(
    initialTab === 'signin' ? 'signin' : 'signup'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signInEmail, setSignInEmail] = useState('');
  const [error, setError] = useState('');
  const [justSignedUp, setJustSignedUp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab === 'signin' ? 'signin' : 'signup');
      setError('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const memberPoints = currentMember?.points ?? 0;
  const rewardReady = memberPoints >= 10;
  const pointsProgress = Math.min(100, (memberPoints / 10) * 100);
  const pointsNeeded = Math.max(0, 10 - memberPoints);

  const handleSignUpSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!/^\d{8}$/.test(phone.replace(/\s+/g, ''))) {
      setError('Please enter a valid 8-digit Singapore mobile number.');
      return;
    }

    const res = onSignUp(name.trim(), email.trim().toLowerCase(), phone.replace(/\s+/g, ''));
    if (!res.ok) {
      setError(res.error || 'Could not complete sign-up.');
      return;
    }

    setJustSignedUp(true);
    setName('');
    setEmail('');
    setPhone('');
  };

  const handleSignInSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const res = onSignIn(signInEmail.trim().toLowerCase());
    if (!res.ok) {
      setError(res.error || 'No member found with that email.');
      return;
    }
    setSignInEmail('');
    setJustSignedUp(false);
    onClose();
  };

  const handleClose = () => {
    setError('');
    setJustSignedUp(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-modal-title"
      onClick={handleClose}
    >
      <div
        className="w-full md:max-w-md max-h-[90dvh] bg-[#FAF9F6] rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#E5E1D8] flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs font-medium text-[#1B3B2B]">BellyBellyGood Membership</p>
            <h2 id="member-modal-title" className="font-display text-xl font-semibold text-zinc-900">
              {currentMember
                ? `Welcome, ${currentMember.name.split(' ')[0]}`
                : 'Join & Get $20 Voucher'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close member window"
            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 hover:bg-[#F3F1EC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {currentMember ? (
            <>
              {justSignedUp && (
                <div className="p-4 rounded-2xl bg-[#E8EFEA] border border-[#1B3B2B]/20 flex items-start gap-3 text-[#1B3B2B]">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold text-sm">Membership confirmed</p>
                    <p className="mt-0.5">
                      Your $20 welcome voucher (WELCOME20) is active and ready to apply in your cart. Offer valid till 31st Dec.
                    </p>
                  </div>
                </div>
              )}

              {/* BellyBellyGood Membership Card (Name & Points) */}
              <div className="rounded-2xl bg-[#14532D] border-2 border-[#22C55E] p-5 text-white shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                      BellyBellyGood Member Card
                    </p>
                    <p className="font-display text-xl font-semibold text-white mt-1">
                      {currentMember.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-white/80">Points Balance</p>
                    <p className="text-2xl font-bold tabular-nums text-white leading-tight">
                      {memberPoints} <span className="text-sm font-medium">pts</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-[#4ADE80] transition-all duration-300"
                      style={{ width: `${pointsProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/90 tabular-nums">
                    <span>Every $10 spent = 1 point</span>
                    <span>
                      {rewardReady
                        ? '10 pts reached · $10 off unlocked'
                        : `${pointsNeeded} more ${pointsNeeded === 1 ? 'pt' : 'pts'} for $10 off`}
                    </span>
                  </div>
                </div>

                {rewardReady && (
                  <div className="px-3 py-2 rounded-xl bg-[#166534] border border-[#4ADE80] text-xs font-medium text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>10 points ready — redeem $10.00 off your total price in your cart.</span>
                  </div>
                )}
              </div>

              {/* Active Member Voucher Card */}
              <div className="bg-white border border-[#E5E1D8] rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#5D2E6D]/10 text-[#5D2E6D] flex items-center justify-center shrink-0">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">New Member Reward · Valid till 31st Dec</p>
                      <p className="text-base font-semibold text-zinc-900 tabular-nums">
                        $20.00 Welcome Voucher
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#1B3B2B] tabular-nums">
                    {currentMember.voucherUsed ? 'Redeemed' : 'Active'}
                  </span>
                </div>

                <div className="px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5E1D8] flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Voucher Code</span>
                  <span className="font-semibold tracking-wide text-[#441E52]">
                    {currentMember.voucherCode}
                  </span>
                </div>

                <p className="text-xs text-zinc-600">
                  Signed in as {currentMember.email} · +65 {currentMember.phone}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSignOut();
                  setTab('signin');
                  setJustSignedUp(false);
                }}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E5E1D8] bg-white hover:bg-[#F3F1EC] text-xs font-semibold text-zinc-700 inline-flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              {/* Segmented Tabs: Sign Up | Sign In */}
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#EFECE6]">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setError('');
                  }}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    tab === 'signup'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setError('');
                  }}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    tab === 'signin'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-800"
                >
                  {error}
                </div>
              )}

              {tab === 'signup' ? (
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#E8EFEA] text-xs text-[#1B3B2B] flex items-start gap-2.5">
                    <Award className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      New members receive a <span className="font-semibold">$20.00 voucher</span> (valid till 31st Dec) plus a Membership Card that earns <span className="font-semibold">1 point per $10 spent</span> (10 points = $10 off).
                    </p>
                  </div>

                  <div>
                    <label htmlFor="member-name" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      Full Name
                    </label>
                    <input
                      id="member-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Cheryl Tan"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm focus:outline-none focus:border-[#5D2E6D]"
                    />
                  </div>

                  <div>
                    <label htmlFor="member-email" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="member-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm focus:outline-none focus:border-[#5D2E6D]"
                    />
                  </div>

                  <div>
                    <label htmlFor="member-phone" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      Singapore Mobile (+65)
                    </label>
                    <input
                      id="member-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9123 4567"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm tabular-nums focus:outline-none focus:border-[#5D2E6D]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#5D2E6D] hover:bg-[#441E52] text-white text-sm font-semibold transition-colors"
                  >
                    Create Account & Claim $20 Voucher
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="signin-email" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      Registered Member Email
                    </label>
                    <input
                      id="signin-email"
                      type="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm focus:outline-none focus:border-[#5D2E6D]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#5D2E6D] hover:bg-[#441E52] text-white text-sm font-semibold transition-colors"
                  >
                    Sign In
                  </button>

                  <p className="text-xs text-zinc-500 text-center">
                    New to BellyBellyGood?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('signup')}
                      className="font-semibold text-[#5D2E6D] underline underline-offset-2"
                    >
                      Sign up for $20 off
                    </button>
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
