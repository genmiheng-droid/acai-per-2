import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Snowflake,
  Ticket,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { calculateDeliveryFee, CartItem, PICKUP_OUTLETS } from '../data/menu';
import { MemberAccount } from './MemberAuthModal';
import { ResilientImage } from './ResilientImage';

const SINGAPORE_GST_RATE = 0.09;

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  currentMember: MemberAccount | null;
  onClose: () => void;
  onUpdateQty: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  onOpenSignUp: () => void;
  onCompleteMemberOrder: (
    memberId: string,
    options: {
      usedWelcomeVoucher: boolean;
      usedPointsReward: boolean;
      pointsEarned: number;
    }
  ) => void;
}

type CheckoutStep = 'cart' | 'checkout' | 'confirmed';

interface ConfirmedOrder {
  orderNumber: string;
  fulfillment: 'delivery' | 'pickup';
  slotOrOutlet: string;
  subtotal: number;
  deliveryFee: number;
  gstAmount: number;
  total: number;
  voucherDiscountApplied: number;
  pointsDiscountApplied: number;
  pointsEarned: number;
  newPointsBalance: number | null;
  customerName: string;
  addressSummary: string;
  paymentMethod: string;
  itemsCount: number;
}

export function CartDrawer({
  isOpen,
  items,
  currentMember,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenSignUp,
  onCompleteMemberOrder,
}: CartDrawerProps) {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery');
  const [deliverySlot, setDeliverySlot] = useState<string>('Next-Day (12:00 PM – 4:00 PM)');
  const [pickupOutlet, setPickupOutlet] = useState<string>(PICKUP_OUTLETS[0]);
  const [isRemoteZone, setIsRemoteZone] = useState<boolean>(false);
  const [applyMemberVoucher, setApplyMemberVoucher] = useState<boolean>(true);
  const [applyPointsReward, setApplyPointsReward] = useState<boolean>(true);

  // Checkout form fields
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'PayNow' | 'Card' | 'Apple Pay'>('PayNow');
  const [formError, setFormError] = useState<string>('');
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  useEffect(() => {
    if (currentMember) {
      if (!fullName) setFullName(currentMember.name);
      if (!phone) setPhone(currentMember.phone);
    }
  }, [currentMember, fullName, phone]);

  // Reset to cart view automatically if user adds items after completing a previous order
  useEffect(() => {
    if (items.length > 0 && step === 'confirmed') {
      setStep('cart');
      setConfirmedOrder(null);
    }
  }, [items.length, step]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(subtotal, fulfillment, isRemoteZone);

  const canUseVoucher = Boolean(currentMember && !currentMember.voucherUsed && subtotal > 0);
  const voucherDiscount =
    canUseVoucher && applyMemberVoucher
      ? Math.min(currentMember!.voucherAmount, subtotal)
      : 0;

  const memberPoints = currentMember?.points ?? 0;
  const prePointsTotal = Math.max(0, subtotal - voucherDiscount + deliveryFee);
  const canUsePointsReward = Boolean(currentMember && memberPoints >= 10 && prePointsTotal > 0);
  const pointsDiscount =
    canUsePointsReward && applyPointsReward ? Math.min(10, prePointsTotal) : 0;

  const taxableTotal = Math.max(0, prePointsTotal - pointsDiscount);
  const gstAmount = Number((taxableTotal * SINGAPORE_GST_RATE).toFixed(2));
  const grandTotal = Number((taxableTotal + gstAmount).toFixed(2));
  const pointsEarnedOnOrder = Math.floor(grandTotal / 10);

  let tierHint = '';
  let tierProgress = 0;
  if (fulfillment === 'pickup') {
    tierHint = 'Self-pickup at any BellyBellyGood outlet is always free.';
    tierProgress = 100;
  } else if (subtotal === 0) {
    tierHint = 'Free Singapore islandwide delivery on orders $121 and above.';
    tierProgress = 0;
  } else if (subtotal < 71) {
    const neededForMid = (71 - subtotal).toFixed(2);
    tierHint = `Add $${neededForMid} more to drop delivery fee from $15 to $12 (Free at $121).`;
    tierProgress = Math.min(100, (subtotal / 121) * 100);
  } else if (subtotal < 121) {
    const neededForFree = (121 - subtotal).toFixed(2);
    tierHint = `Add $${neededForFree} more to unlock FREE islandwide delivery!`;
    tierProgress = Math.min(100, (subtotal / 121) * 100);
  } else {
    tierHint = 'You unlocked FREE Singapore islandwide delivery.';
    tierProgress = 100;
  }

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    if (!/^\d{8}$/.test(phone.replace(/\s+/g, ''))) {
      setFormError('Please enter a valid 8-digit Singapore mobile number.');
      return;
    }
    if (fulfillment === 'delivery') {
      if (!/^\d{6}$/.test(postalCode.trim())) {
        setFormError('Please enter a valid 6-digit Singapore postal code.');
        return;
      }
      if (!streetAddress.trim()) {
        setFormError('Please enter your block, street name, and unit number.');
        return;
      }
    }

    const usedVoucher = voucherDiscount > 0;
    const usedPoints = pointsDiscount > 0;
    let updatedBalance: number | null = null;

    if (currentMember) {
      updatedBalance =
        Math.max(0, currentMember.points - (usedPoints ? 10 : 0)) + pointsEarnedOnOrder;
      onCompleteMemberOrder(currentMember.id, {
        usedWelcomeVoucher: usedVoucher,
        usedPointsReward: usedPoints,
        pointsEarned: pointsEarnedOnOrder,
      });
    }

    const orderNum = `BBG-${Math.floor(1000 + Math.random() * 9000)}`;
    setConfirmedOrder({
      orderNumber: orderNum,
      fulfillment,
      slotOrOutlet: fulfillment === 'delivery' ? deliverySlot : pickupOutlet,
      subtotal,
      deliveryFee,
      gstAmount,
      total: grandTotal,
      voucherDiscountApplied: voucherDiscount,
      pointsDiscountApplied: pointsDiscount,
      pointsEarned: pointsEarnedOnOrder,
      newPointsBalance: updatedBalance,
      customerName: fullName.trim(),
      addressSummary:
        fulfillment === 'delivery'
          ? `${streetAddress.trim()}, Singapore ${postalCode.trim()}`
          : pickupOutlet,
      paymentMethod,
      itemsCount: totalCount,
    });
    onClearCart();
    setStep('confirmed');
  };

  const handleCloseDrawer = () => {
    if (step === 'confirmed') {
      setStep('cart');
      setConfirmedOrder(null);
    }
    onClose();
  };

  return (
    <aside
      aria-label="Shopping Cart and Delivery Checkout"
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px] md:inset-y-0 md:left-auto md:right-0 md:w-[380px] lg:w-[420px] md:z-40 md:bg-transparent md:backdrop-blur-none"
      onClick={handleCloseDrawer}
    >
      <div
        className="w-full max-w-md md:max-w-none h-full bg-[#FAF9F6] shadow-2xl md:shadow-lg md:border-l md:border-[#E5E1D8] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#E5E1D8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('cart')}
                aria-label="Back to cart"
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-zinc-700 hover:bg-[#F3F1EC]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="font-display text-xl font-semibold text-zinc-900">
              {step === 'cart' && `Your Cart (${totalCount})`}
              {step === 'checkout' && 'Payment & Delivery Checkout'}
              {step === 'confirmed' && 'Order Confirmed'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCloseDrawer}
            aria-label="Close cart"
            className="w-11 h-11 rounded-full flex items-center justify-center text-zinc-600 hover:bg-[#F3F1EC] hover:text-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {step === 'confirmed' && confirmedOrder ? (
          <div className="flex-1 overflow-y-auto px-5 py-8 space-y-6">
            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-11 h-11 text-[#1B3B2B] mx-auto" strokeWidth={1.75} />
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1B3B2B]">
                Order #{confirmedOrder.orderNumber} Confirmed
              </p>
              <h3 className="font-display text-2xl font-semibold text-zinc-900">
                Thank you, {confirmedOrder.customerName}
              </h3>
              <p className="text-sm text-zinc-600">
                Your {confirmedOrder.itemsCount} organic açaí{' '}
                {confirmedOrder.itemsCount === 1 ? 'item is' : 'items are'} queued for preparation in insulated thermal bags.
              </p>
            </div>

            {/* Loyalty Points Summary Card shown after checkout is completed */}
            <div className="rounded-2xl bg-[#14532D] border-2 border-[#22C55E] p-5 text-white space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#4ADE80] shrink-0" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/90">
                    Loyalty Points
                  </span>
                </div>
                <span className="text-xs text-white/85">1 pt per $10 · 10 pts = $10 off</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl bg-[#166534] border border-[#4ADE80]/50 p-3">
                  <p className="text-[11px] text-white/85">Points Earned</p>
                  <p className="text-xl font-bold tabular-nums text-white mt-0.5">
                    +{confirmedOrder.pointsEarned}{' '}
                    <span className="text-xs font-medium">
                      {confirmedOrder.pointsEarned === 1 ? 'pt' : 'pts'}
                    </span>
                  </p>
                </div>

                <div className="rounded-xl bg-[#166534] border border-[#4ADE80]/50 p-3">
                  <p className="text-[11px] text-white/85">
                    {confirmedOrder.newPointsBalance !== null ? 'Total Points Balance' : 'Member Status'}
                  </p>
                  {confirmedOrder.newPointsBalance !== null ? (
                    <p className="text-xl font-bold tabular-nums text-white mt-0.5">
                      {confirmedOrder.newPointsBalance}{' '}
                      <span className="text-xs font-medium">
                        {confirmedOrder.newPointsBalance === 1 ? 'pt' : 'pts'}
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseDrawer();
                        onOpenSignUp();
                      }}
                      className="mt-1 text-xs font-semibold underline underline-offset-2 text-white text-left"
                    >
                      Join to save points
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Fulfillment</span>
                <span className="font-medium text-zinc-900 text-right">
                  {confirmedOrder.fulfillment === 'delivery' ? 'Islandwide Thermal Delivery' : 'Outlet Self-Pickup'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">
                  {confirmedOrder.fulfillment === 'delivery' ? 'Delivery Window' : 'Pickup Outlet'}
                </span>
                <span className="font-medium text-zinc-900 text-right">{confirmedOrder.slotOrOutlet}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Destination</span>
                <span className="font-medium text-zinc-900 text-right">{confirmedOrder.addressSummary}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Payment</span>
                <span className="font-medium text-zinc-900 text-right">{confirmedOrder.paymentMethod}</span>
              </div>

              <div className="pt-3 border-t border-[#E5E1D8] space-y-2">
                <div className="flex justify-between gap-4 text-zinc-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums">${confirmedOrder.subtotal.toFixed(2)}</span>
                </div>
                {confirmedOrder.voucherDiscountApplied > 0 && (
                  <div className="flex justify-between gap-4 text-[#1B3B2B]">
                    <span>New Member Voucher</span>
                    <span className="font-semibold tabular-nums">
                      -${confirmedOrder.voucherDiscountApplied.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4 text-zinc-600">
                  <span>Delivery</span>
                  <span className="tabular-nums">
                    {confirmedOrder.deliveryFee === 0 ? 'FREE' : `$${confirmedOrder.deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {confirmedOrder.pointsDiscountApplied > 0 && (
                  <div className="flex justify-between gap-4 text-[#1B3B2B]">
                    <span>10-Point Reward Redeemed</span>
                    <span className="font-semibold tabular-nums">
                      -${confirmedOrder.pointsDiscountApplied.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4 text-zinc-600">
                  <span>GST (9%)</span>
                  <span className="tabular-nums">${confirmedOrder.gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4 pt-2 border-t border-[#E5E1D8]">
                  <span className="font-semibold text-zinc-900">Total Paid</span>
                  <span className="font-bold tabular-nums text-[#441E52]">
                    ${confirmedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#E8EFEA] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#1B3B2B]">
              <Snowflake className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Care Note: Packed with cold packs in thermal bags. Please transfer pints and extra bowls straight into your freezer upon arrival.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCloseDrawer}
              className="w-full min-h-[48px] rounded-xl bg-[#5D2E6D] hover:bg-[#441E52] text-white text-sm font-semibold transition-colors"
            >
              Back to Menu
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F3F1EC] flex items-center justify-center text-zinc-500 mb-4">
              <ShoppingCart className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-display text-xl font-semibold text-zinc-900">Your cart is empty</h3>
            <p className="text-sm text-zinc-600 mt-1.5 max-w-xs">
              Explore BellyBellyGood Signature Bowls, Build Your Own, or Take-Home Pints for islandwide Singapore delivery.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#5D2E6D] hover:bg-[#441E52] text-white text-sm font-semibold transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : step === 'cart' ? (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Fulfillment toggle */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#EFECE6]">
                <button
                  type="button"
                  onClick={() => setFulfillment('delivery')}
                  className={`min-h-[42px] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                    fulfillment === 'delivery'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  Islandwide Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillment('pickup')}
                  className={`min-h-[42px] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                    fulfillment === 'pickup'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Outlet Pickup
                </button>
              </div>

              {/* Member Rewards: $20 Welcome Voucher + 10-Point $10 Off Redemption */}
              {currentMember ? (
                <div className="space-y-2.5">
                  {canUseVoucher && (
                    <label className="bg-[#E8EFEA] border border-[#1B3B2B]/15 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <Ticket className="w-4 h-4 text-[#1B3B2B] shrink-0" />
                        <div className="text-xs">
                          <p className="font-semibold text-[#1B3B2B]">
                            Apply $20 New Member Voucher (WELCOME20)
                          </p>
                          <p className="text-[#1B3B2B]/80">Valid till 31st Dec</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={applyMemberVoucher}
                        onChange={(e) => setApplyMemberVoucher(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#1B3B2B]"
                      />
                    </label>
                  )}

                  {canUsePointsReward ? (
                    <label className="bg-[#14532D] border-2 border-[#22C55E] rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer text-white">
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-[#4ADE80] shrink-0" />
                        <div className="text-xs">
                          <p className="font-semibold text-white">
                            Redeem 10 Points for $10.00 Off Total
                          </p>
                          <p className="text-white/80 tabular-nums">
                            Available balance: {memberPoints} pts
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={applyPointsReward}
                        onChange={(e) => setApplyPointsReward(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#22C55E]"
                      />
                    </label>
                  ) : (
                    <div className="bg-white border border-[#E5E1D8] rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 text-zinc-700">
                        <Award className="w-4 h-4 text-[#1B3B2B] shrink-0" />
                        <span>
                          You’ll earn <strong className="tabular-nums">{pointsEarnedOnOrder} {pointsEarnedOnOrder === 1 ? 'pt' : 'pts'}</strong> on this order (1 pt per $10)
                        </span>
                      </div>
                      <span className="font-semibold tabular-nums text-[#1B3B2B] shrink-0">
                        {memberPoints}/10 pts
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-[#E5E1D8] rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <p className="font-semibold text-zinc-900">New members get $20 voucher</p>
                    <p className="text-zinc-500">Plus earn 1 pt per $10 (10 pts = $10 off)</p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenSignUp}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#5D2E6D] text-white text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Delivery fee tier progress */}
              <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4 space-y-2.5">
                <p className="text-xs font-medium text-zinc-800">{tierHint}</p>
                <div className="h-1.5 w-full rounded-full bg-[#EFECE6] overflow-hidden">
                  <div
                    className="h-full bg-[#1B3B2B] transition-all duration-300"
                    style={{ width: `${tierProgress}%` }}
                  />
                </div>
                {fulfillment === 'delivery' && (
                  <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500 tabular-nums">
                    <span>≤$70: $15</span>
                    <span>$71–$120: $12</span>
                    <span>$121+: Free</span>
                  </div>
                )}
              </div>

              {/* Delivery window or Pickup outlet selector */}
              {fulfillment === 'delivery' ? (
                <div className="space-y-2">
                  <label htmlFor="slot-select" className="block text-xs font-semibold text-zinc-800">
                    Delivery Window (Order before 7 PM for Next-Day)
                  </label>
                  <select
                    id="slot-select"
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm text-zinc-900 focus:outline-none focus:border-[#5D2E6D]"
                  >
                    <option value="Next-Day (12:00 PM – 4:00 PM)">Next-Day (12:00 PM – 4:00 PM)</option>
                    <option value="Tomorrow Evening (5:00 PM – 8:30 PM)">
                      Tomorrow Evening (5:00 PM – 8:30 PM)
                    </option>
                    <option value="Weekend Afternoon (12:00 PM – 4:00 PM)">
                      Weekend Afternoon (12:00 PM – 4:00 PM)
                    </option>
                  </select>

                  <label className="flex items-center gap-2.5 pt-1 text-xs text-zinc-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRemoteZone}
                      onChange={(e) => setIsRemoteZone(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#5D2E6D]"
                    />
                    <span>Delivering to Sentosa, Tuas, or Jurong Island (+$5.00)</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="outlet-select" className="block text-xs font-semibold text-zinc-800">
                    Select Singapore Pickup Outlet
                  </label>
                  <select
                    id="outlet-select"
                    value={pickupOutlet}
                    onChange={(e) => setPickupOutlet(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm text-zinc-900 focus:outline-none focus:border-[#5D2E6D]"
                  >
                    {PICKUP_OUTLETS.map((outlet) => (
                      <option key={outlet} value={outlet}>
                        {outlet}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cart Items */}
              <div className="divide-y divide-[#E5E1D8] border-t border-[#E5E1D8]">
                {items.map((item) => (
                  <div key={item.cartId} className="py-4 flex gap-3.5">
                    <div className="w-18 h-18 rounded-xl overflow-hidden bg-[#F3F1EC] shrink-0">
                      <ResilientImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-zinc-900 leading-snug">
                            {item.name}
                          </h4>
                          <p className="text-xs text-zinc-500 mt-0.5">{item.sizeLabel}</p>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-zinc-900 shrink-0">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {item.drizzle && (
                        <p className="text-xs text-zinc-600 mt-1">Drizzle: {item.drizzle}</p>
                      )}
                      {item.addOns.length > 0 && (
                        <p className="text-xs text-zinc-600 mt-0.5">
                          Extras: {item.addOns.join(', ')}
                        </p>
                      )}
                      {item.customDetails && item.customDetails.length > 0 && (
                        <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                          {item.customDetails.join(' · ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-[#5D2E6D] mt-0.5">Note: “{item.notes}”</p>
                      )}

                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="inline-flex items-center border border-[#E5E1D8] rounded-lg bg-white">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.cartId, -1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:text-zinc-950"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.cartId, 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:text-zinc-950"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.cartId)}
                          aria-label={`Remove ${item.name}`}
                          className="min-h-[36px] px-2 text-xs text-zinc-500 hover:text-red-700 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer totals with GST (9%) */}
            <div className="bg-white border-t border-[#E5E1D8] px-5 py-4 space-y-3 shrink-0">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-[#1B3B2B]">
                    <span>New Member Voucher (WELCOME20)</span>
                    <span className="tabular-nums font-semibold">-${voucherDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>
                    {fulfillment === 'delivery' ? 'Islandwide Thermal Delivery' : 'Self-Pickup'}
                  </span>
                  <span className="tabular-nums font-medium">
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-[#1B3B2B]">
                    <span>10-Point Membership Reward</span>
                    <span className="tabular-nums font-semibold">-${pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>GST (9%)</span>
                  <span className="tabular-nums font-medium">${gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-zinc-900 pt-1.5 border-t border-[#E5E1D8]">
                  <span>Total (SGD)</span>
                  <span className="tabular-nums text-[#441E52]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#5D2E6D] hover:bg-[#441E52] text-white text-sm font-semibold flex items-center justify-between transition-colors"
              >
                <span>Proceed to Checkout</span>
                <span className="tabular-nums">${grandTotal.toFixed(2)}</span>
              </button>
            </div>
          </>
        ) : (
          /* Checkout Form with Payment Summary + GST */
          <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {formError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-800"
                >
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="sg-name" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Recipient Name
                  </label>
                  <input
                    id="sg-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Cheryl Tan"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm focus:outline-none focus:border-[#5D2E6D]"
                  />
                </div>

                <div>
                  <label htmlFor="sg-phone" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Singapore Mobile (+65)
                  </label>
                  <input
                    id="sg-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9123 4567"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm tabular-nums focus:outline-none focus:border-[#5D2E6D]"
                  />
                </div>

                {fulfillment === 'delivery' && (
                  <>
                    <div>
                      <label htmlFor="sg-postal" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                        Singapore Postal Code
                      </label>
                      <input
                        id="sg-postal"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 428801"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm tabular-nums focus:outline-none focus:border-[#5D2E6D]"
                      />
                    </div>

                    <div>
                      <label htmlFor="sg-address" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                        Block, Street & Unit Number
                      </label>
                      <input
                        id="sg-address"
                        type="text"
                        required
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="e.g. Blk 168 East Coast Road, #04-12"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm focus:outline-none focus:border-[#5D2E6D]"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-[#E5E1D8] pt-4">
                <span className="block text-xs font-semibold text-zinc-800 mb-2.5">
                  Payment Method
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['PayNow', 'Card', 'Apple Pay'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                        paymentMethod === method
                          ? 'border-[#5D2E6D] bg-[#5D2E6D]/8 text-[#441E52]'
                          : 'border-[#E5E1D8] bg-white text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Breakdown with GST (9%) */}
              <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4 space-y-2 text-xs">
                <p className="font-semibold text-zinc-900 text-sm mb-1">Payment Summary</p>
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-[#1B3B2B]">
                    <span>New Member Voucher (WELCOME20)</span>
                    <span className="tabular-nums font-semibold">-${voucherDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>{fulfillment === 'delivery' ? 'Delivery Fee' : 'Outlet Pickup'}</span>
                  <span className="tabular-nums">
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-[#1B3B2B]">
                    <span>10-Point Membership Reward</span>
                    <span className="tabular-nums font-semibold">-${pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>GST (9%)</span>
                  <span className="tabular-nums">${gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-[#E5E1D8]">
                  <span>Total Payable (SGD)</span>
                  <span className="tabular-nums text-[#441E52]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-[#E8EFEA] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#1B3B2B]">
                <Snowflake className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Thermal Guarantee: Every order ships in an insulated foil bag with ice packs to keep your organic Brazilian açaí firm in Singapore’s heat.
                </p>
              </div>
            </div>

            <div className="bg-white border-t border-[#E5E1D8] px-5 py-4 shrink-0">
              <button
                type="submit"
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#5D2E6D] hover:bg-[#441E52] text-white text-sm font-semibold flex items-center justify-between transition-colors"
              >
                <span>Confirm & Pay ({paymentMethod})</span>
                <span className="tabular-nums">${grandTotal.toFixed(2)}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </aside>
  );
}
