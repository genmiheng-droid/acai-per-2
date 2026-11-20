import { useEffect, useState } from 'react';
import { Check, Minus, Plus, X } from 'lucide-react';
import { BOWL_ADDONS, CartItem, DRIZZLE_OPTIONS, MenuItem } from '../data/menu';
import { ResilientImage } from './ResilientImage';

interface ItemDetailSheetProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export function ItemDetailSheet({ item, onClose, onAddToCart }: ItemDetailSheetProps) {
  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [selectedDrizzleId, setSelectedDrizzleId] = useState<string>('cookie-butter');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (item) {
      const defaultSize = item.sizes.find((s) => s.id === 'M') || item.sizes[0];
      setSelectedSizeId(defaultSize.id);
      setSelectedDrizzleId('cookie-butter');
      setSelectedAddOns([]);
      setQuantity(1);
      setNotes('');
    }
  }, [item]);

  if (!item) return null;

  const activeSize = item.sizes.find((s) => s.id === selectedSizeId) || item.sizes[0];
  const activeDrizzle = DRIZZLE_OPTIONS.find((d) => d.id === selectedDrizzleId) || DRIZZLE_OPTIONS[0];

  const drizzleExtra = item.supportsDrizzle ? activeDrizzle.extraPrice : 0;
  const addOnsTotal = item.supportsAddOns
    ? selectedAddOns.reduce((sum, id) => {
        const found = BOWL_ADDONS.find((a) => a.id === id);
        return sum + (found ? found.price : 0);
      }, 0)
    : 0;

  const unitPrice = activeSize.price + drizzleExtra + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const addOnNames = selectedAddOns
      .map((id) => BOWL_ADDONS.find((a) => a.id === id)?.name)
      .filter((name): name is string => Boolean(name));

    onAddToCart({
      cartId: `${item.id}-${activeSize.id}-${selectedDrizzleId}-${Date.now()}`,
      itemId: item.id,
      name: item.name,
      image: item.image,
      sizeLabel: activeSize.label,
      unitPrice,
      quantity,
      drizzle: item.supportsDrizzle ? activeDrizzle.name : undefined,
      addOns: addOnNames,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-sheet-title"
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-xl max-h-[90dvh] bg-[#FAF9F6] rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="md:hidden pt-2.5 pb-1 flex justify-center bg-white">
          <div className="w-10 h-1 rounded-full bg-zinc-300" />
        </div>

        {/* Top close button & hero */}
        <div className="relative h-52 sm:h-60 bg-[#F3F1EC] shrink-0">
          <ResilientImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close item customizer"
            className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/95 text-zinc-900 flex items-center justify-center shadow-sm hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5D2E6D]"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <p className="text-xs font-medium text-white/90 tracking-wide mb-0.5">{item.kicker}</p>
            <h2 id="item-sheet-title" className="font-display text-2xl font-semibold leading-tight">
              {item.name}
            </h2>
          </div>
        </div>

        {/* Scrollable options */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div>
            <p className="text-sm text-zinc-700 leading-relaxed">{item.description}</p>
            <p className="mt-2.5 text-xs text-zinc-500 leading-relaxed">
              Includes: {item.ingredients.join(' · ')}
            </p>
          </div>

          {/* Size selector */}
          <div className="border-t border-[#E5E1D8] pt-5">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="font-sans text-sm font-semibold text-zinc-900">Select Size</h3>
              <span className="text-xs text-zinc-500">Required</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {item.sizes.map((size) => {
                const isSelected = size.id === activeSize.id;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSizeId(size.id)}
                    className={`min-h-[52px] px-3.5 py-2.5 rounded-xl border text-left transition-colors flex sm:flex-col items-center sm:items-start justify-between ${
                      isSelected
                        ? 'border-[#5D2E6D] bg-[#5D2E6D]/6 text-zinc-900'
                        : 'border-[#E5E1D8] bg-white text-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    <div>
                      <span className="block text-sm font-semibold">{size.label}</span>
                      <span className="block text-xs text-zinc-500">{size.weight}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-[#441E52] sm:mt-1">
                      ${size.price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drizzle selector */}
          {item.supportsDrizzle && (
            <div className="border-t border-[#E5E1D8] pt-5">
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-sans text-sm font-semibold text-zinc-900">Choice of Drizzle</h3>
                <span className="text-xs text-zinc-500">100% Natural · No Added Sugar</span>
              </div>
              <div className="space-y-2">
                {DRIZZLE_OPTIONS.map((drizzle) => {
                  const isSelected = drizzle.id === selectedDrizzleId;
                  return (
                    <button
                      key={drizzle.id}
                      type="button"
                      onClick={() => setSelectedDrizzleId(drizzle.id)}
                      className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-left transition-colors ${
                        isSelected
                          ? 'border-[#5D2E6D] bg-[#5D2E6D]/6 text-zinc-900'
                          : 'border-[#E5E1D8] bg-white text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      <span className="text-sm font-medium">{drizzle.name}</span>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-xs font-medium tabular-nums text-zinc-500">
                          {drizzle.extraPrice > 0 ? `+$${drizzle.extraPrice.toFixed(2)}` : 'Included'}
                        </span>
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#5D2E6D] bg-[#5D2E6D] text-white' : 'border-zinc-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" strokeWidth={2.5} />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extra superfood add-ons */}
          {item.supportsAddOns && (
            <div className="border-t border-[#E5E1D8] pt-5">
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-sans text-sm font-semibold text-zinc-900">Optional Superfood Boosts</h3>
                <span className="text-xs text-zinc-500">Optional</span>
              </div>
              <div className="space-y-2">
                {BOWL_ADDONS.map((addon) => {
                  const isChecked = selectedAddOns.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddOn(addon.id)}
                      className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-left transition-colors ${
                        isChecked
                          ? 'border-[#1B3B2B] bg-[#E8EFEA]/60 text-zinc-900'
                          : 'border-[#E5E1D8] bg-white text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      <span className="text-sm font-medium">{addon.name}</span>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-xs font-semibold tabular-nums text-zinc-600">
                          +${addon.price.toFixed(2)}
                        </span>
                        <span
                          className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            isChecked ? 'border-[#1B3B2B] bg-[#1B3B2B] text-white' : 'border-zinc-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" strokeWidth={2.5} />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special instructions */}
          <div className="border-t border-[#E5E1D8] pt-5">
            <label htmlFor="bowl-notes" className="block text-sm font-semibold text-zinc-900 mb-2">
              Special Instructions
            </label>
            <input
              id="bowl-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pack drizzle on the side, no banana"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#5D2E6D]"
            />
          </div>
        </div>

        {/* Sticky Footer CTA */}
        <div className="border-t border-[#E5E1D8] bg-white px-5 py-3.5 flex items-center gap-3 shrink-0">
          <div className="flex items-center border border-[#E5E1D8] rounded-xl bg-[#FAF9F6] shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-11 h-11 flex items-center justify-center text-zinc-700 hover:text-zinc-950"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-7 text-center text-sm font-semibold tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="w-11 h-11 flex items-center justify-center text-zinc-700 hover:text-zinc-950"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-[#5D2E6D] hover:bg-[#441E52] active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-between transition-all whitespace-nowrap"
          >
            <span>Add to Cart</span>
            <span className="tabular-nums">${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
