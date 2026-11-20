import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import {
  CartItem,
  DRIZZLE_OPTIONS,
  MYO_BASES,
  MYO_CRUNCH,
  MYO_FRUITS,
  MYO_SIZES,
  MYO_SUPERFOODS,
  TRIPLE_A_IMAGE,
} from '../data/menu';
import { ResilientImage } from './ResilientImage';

interface BuildYourOwnViewProps {
  onAddToCart: (cartItem: CartItem) => void;
}

export function BuildYourOwnView({ onAddToCart }: BuildYourOwnViewProps) {
  const [sizeId, setSizeId] = useState<'S' | 'M' | 'L'>('M');
  const [baseId, setBaseId] = useState<string>('organic-acai');
  const [selectedFruits, setSelectedFruits] = useState<string[]>(['Banana', 'Strawberry', 'Blueberry']);
  const [selectedCrunch, setSelectedCrunch] = useState<string[]>(['Honey Oat Granola']);
  const [selectedSuperfoods, setSelectedSuperfoods] = useState<string[]>([
    'Toasted Almond Flakes',
    'Peruvian Cacao Nibs',
  ]);
  const [drizzleId, setDrizzleId] = useState<string>('cookie-butter');
  const [justAdded, setJustAdded] = useState(false);

  const activeSize = MYO_SIZES.find((s) => s.id === sizeId) || MYO_SIZES[1];
  const activeBase = MYO_BASES.find((b) => b.id === baseId) || MYO_BASES[0];
  const activeDrizzle = DRIZZLE_OPTIONS.find((d) => d.id === drizzleId) || DRIZZLE_OPTIONS[0];

  const handleSizeChange = (newSizeId: 'S' | 'M' | 'L') => {
    const nextSize = MYO_SIZES.find((s) => s.id === newSizeId)!;
    setSizeId(newSizeId);
    setSelectedFruits((prev) => prev.slice(0, nextSize.maxFruits));
    setSelectedCrunch((prev) => prev.slice(0, nextSize.maxCrunch));
    setSelectedSuperfoods((prev) => prev.slice(0, nextSize.maxSuperfoods));
  };

  const toggleWithLimit = (
    item: string,
    current: string[],
    limit: number,
    setter: (val: string[]) => void
  ) => {
    if (current.includes(item)) {
      setter(current.filter((x) => x !== item));
    } else if (current.length < limit) {
      setter([...current, item]);
    } else {
      setter([...current.slice(1), item]);
    }
  };

  const totalPrice = activeSize.price + activeBase.extra + activeDrizzle.extraPrice;

  const handleReset = () => {
    setSizeId('M');
    setBaseId('organic-acai');
    setSelectedFruits(['Banana', 'Strawberry', 'Blueberry']);
    setSelectedCrunch(['Honey Oat Granola']);
    setSelectedSuperfoods(['Toasted Almond Flakes', 'Peruvian Cacao Nibs']);
    setDrizzleId('cookie-butter');
  };

  const handleAdd = () => {
    const details = [
      `Base: ${activeBase.name}`,
      selectedFruits.length > 0 ? `Fruits: ${selectedFruits.join(', ')}` : null,
      selectedCrunch.length > 0 ? `Crunch: ${selectedCrunch.join(', ')}` : null,
      selectedSuperfoods.length > 0 ? `Superfoods: ${selectedSuperfoods.join(', ')}` : null,
    ].filter((d): d is string => Boolean(d));

    onAddToCart({
      cartId: `myo-${sizeId}-${Date.now()}`,
      itemId: 'make-your-own',
      name: 'Make Your Own Bowl',
      image: TRIPLE_A_IMAGE,
      sizeLabel: `${activeSize.label} (${activeSize.weight})`,
      unitPrice: totalPrice,
      quantity: 1,
      drizzle: activeDrizzle.name,
      addOns: [],
      customDetails: details,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <section aria-labelledby="myo-heading" className="py-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E1D8]">
        <div>
          <p className="text-xs font-medium text-[#1B3B2B] mb-1">
            Custom Craft · 100% Organic Brazilian Açaí
          </p>
          <h2 id="myo-heading" className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900">
            Make Your Own Bowl
          </h2>
          <p className="text-sm text-zinc-600 mt-1 max-w-xl">
            Build your ideal balance of thick unsweetened açaí, chilled fresh fruits, house granola crunch, and pure nut butter drizzles.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="self-start sm:self-auto min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white hover:bg-[#F3F1EC] text-xs font-semibold text-zinc-700 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Bowl
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Step-by-step configurator */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Size */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-base font-semibold text-zinc-900">01. Choose Bowl Size</h3>
              <span className="text-xs text-zinc-500">Includes fruits, crunch & superfoods</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MYO_SIZES.map((s) => {
                const selected = s.id === sizeId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSizeChange(s.id)}
                    className={`min-h-[68px] p-4 rounded-2xl border text-left transition-colors ${
                      selected
                        ? 'border-[#5D2E6D] bg-[#5D2E6D]/6 text-zinc-900'
                        : 'border-[#E5E1D8] bg-white hover:border-zinc-400 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{s.label}</span>
                      <span className="text-sm font-bold tabular-nums text-[#441E52]">
                        ${s.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {s.weight} · {s.maxFruits} fruits · {s.maxSuperfoods} superfoods
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Base */}
          <div className="border-t border-[#E5E1D8] pt-7">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-base font-semibold text-zinc-900">02. Select Your Base</h3>
              <span className="text-xs text-zinc-500">Pick 1 base</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MYO_BASES.map((b) => {
                const selected = b.id === baseId;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBaseId(b.id)}
                    className={`min-h-[64px] p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-colors ${
                      selected
                        ? 'border-[#5D2E6D] bg-[#5D2E6D]/6'
                        : 'border-[#E5E1D8] bg-white hover:border-zinc-400'
                    }`}
                  >
                    <div>
                      <span className="block text-sm font-semibold text-zinc-900">{b.name}</span>
                      <span className="block text-xs text-zinc-500 mt-0.5">{b.note}</span>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-zinc-600 shrink-0">
                      {b.extra > 0 ? `+$${b.extra.toFixed(2)}` : 'Included'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Fresh Fruits */}
          <div className="border-t border-[#E5E1D8] pt-7">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-base font-semibold text-zinc-900">03. Fresh Fruits</h3>
              <span className="text-xs font-medium tabular-nums text-[#5D2E6D]">
                {selectedFruits.length} / {activeSize.maxFruits} selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {MYO_FRUITS.map((fruit) => {
                const selected = selectedFruits.includes(fruit);
                return (
                  <button
                    key={fruit}
                    type="button"
                    onClick={() =>
                      toggleWithLimit(fruit, selectedFruits, activeSize.maxFruits, setSelectedFruits)
                    }
                    className={`min-h-[46px] px-3.5 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-between transition-colors ${
                      selected
                        ? 'border-[#1B3B2B] bg-[#E8EFEA] text-[#1B3B2B]'
                        : 'border-[#E5E1D8] bg-white text-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    <span className="truncate">{fruit}</span>
                    {selected && <Check className="w-4 h-4 shrink-0 ml-2" strokeWidth={2.25} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Crunch & Granola */}
          <div className="border-t border-[#E5E1D8] pt-7">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-base font-semibold text-zinc-900">04. Crunch & Granola</h3>
              <span className="text-xs font-medium tabular-nums text-[#5D2E6D]">
                {selectedCrunch.length} / {activeSize.maxCrunch} selected
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {MYO_CRUNCH.map((crunch) => {
                const selected = selectedCrunch.includes(crunch);
                return (
                  <button
                    key={crunch}
                    type="button"
                    onClick={() =>
                      toggleWithLimit(crunch, selectedCrunch, activeSize.maxCrunch, setSelectedCrunch)
                    }
                    className={`min-h-[46px] px-3.5 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-between transition-colors ${
                      selected
                        ? 'border-[#1B3B2B] bg-[#E8EFEA] text-[#1B3B2B]'
                        : 'border-[#E5E1D8] bg-white text-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    <span className="truncate">{crunch}</span>
                    {selected && <Check className="w-4 h-4 shrink-0 ml-2" strokeWidth={2.25} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 5: Superfoods */}
          <div className="border-t border-[#E5E1D8] pt-7">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-base font-semibold text-zinc-900">05. Nuts & Superfoods</h3>
              <span className="text-xs font-medium tabular-nums text-[#5D2E6D]">
                {selectedSuperfoods.length} / {activeSize.maxSuperfoods} selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {MYO_SUPERFOODS.map((sf) => {
                const selected = selectedSuperfoods.includes(sf);
                return (
                  <button
                    key={sf}
                    type="button"
                    onClick={() =>
                      toggleWithLimit(
                        sf,
                        selectedSuperfoods,
                        activeSize.maxSuperfoods,
                        setSelectedSuperfoods
                      )
                    }
                    className={`min-h-[46px] px-3.5 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-between transition-colors ${
                      selected
                        ? 'border-[#1B3B2B] bg-[#E8EFEA] text-[#1B3B2B]'
                        : 'border-[#E5E1D8] bg-white text-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    <span className="truncate">{sf}</span>
                    {selected && <Check className="w-4 h-4 shrink-0 ml-2" strokeWidth={2.25} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 6: Drizzle */}
          <div className="border-t border-[#E5E1D8] pt-7">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-base font-semibold text-zinc-900">06. Signature Drizzle</h3>
              <span className="text-xs text-zinc-500">Pick 1 finish</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DRIZZLE_OPTIONS.map((d) => {
                const selected = d.id === drizzleId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDrizzleId(d.id)}
                    className={`min-h-[46px] px-3.5 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-between transition-colors ${
                      selected
                        ? 'border-[#5D2E6D] bg-[#5D2E6D]/6 text-zinc-900'
                        : 'border-[#E5E1D8] bg-white text-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    <span>{d.name}</span>
                    <span className="text-xs tabular-nums text-zinc-500">
                      {d.extraPrice > 0 ? `+$${d.extraPrice.toFixed(2)}` : 'Included'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Live Bowl Summary Card */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden shadow-sm">
          <div className="h-44 bg-[#F3F1EC]">
            <ResilientImage
              src={TRIPLE_A_IMAGE}
              alt="Custom Make Your Own Açaí Bowl"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-xl font-semibold text-zinc-900">Your Custom Bowl</h3>
              <span className="text-lg font-bold tabular-nums text-[#441E52]">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <dl className="space-y-2.5 text-xs border-t border-[#E5E1D8] pt-3.5">
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500">Size</dt>
                <dd className="font-medium text-zinc-900 text-right">
                  {activeSize.label} ({activeSize.weight})
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500">Base</dt>
                <dd className="font-medium text-zinc-900 text-right">{activeBase.name}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500">Fruits</dt>
                <dd className="font-medium text-zinc-900 text-right max-w-[65%]">
                  {selectedFruits.length > 0 ? selectedFruits.join(', ') : 'None'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500">Crunch</dt>
                <dd className="font-medium text-zinc-900 text-right max-w-[65%]">
                  {selectedCrunch.length > 0 ? selectedCrunch.join(', ') : 'None'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500">Superfoods</dt>
                <dd className="font-medium text-zinc-900 text-right max-w-[65%]">
                  {selectedSuperfoods.length > 0 ? selectedSuperfoods.join(', ') : 'None'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500">Drizzle</dt>
                <dd className="font-medium text-zinc-900 text-right">{activeDrizzle.name}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleAdd}
              className={`w-full min-h-[48px] px-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                justAdded
                  ? 'bg-[#1B3B2B] text-white'
                  : 'bg-[#5D2E6D] hover:bg-[#441E52] text-white'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <span>Add to Cart — ${totalPrice.toFixed(2)}</span>
              )}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
