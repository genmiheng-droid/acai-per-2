export type CategoryId =
  | 'signature'
  | 'make-your-own'
  | 'pints'
  | 'bundles'
  | 'toasts-pops';

export interface SizeOption {
  id: 'S' | 'M' | 'L' | 'Standard';
  label: string;
  weight: string;
  price: number;
}

export interface AddOnOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  category: Exclude<CategoryId, 'make-your-own'>;
  name: string;
  kicker: string;
  description: string;
  ingredients: string[];
  image: string;
  sizes: SizeOption[];
  supportsDrizzle: boolean;
  supportsAddOns: boolean;
  calories?: string;
}

export interface CartItem {
  cartId: string;
  itemId: string;
  name: string;
  image: string;
  sizeLabel: string;
  unitPrice: number;
  quantity: number;
  drizzle?: string;
  addOns: string[];
  customDetails?: string[];
  notes?: string;
}

export const HERO_IMAGE = '/src/assets/images/hero_acai_spread_1795157669754.jpg';
export const TRIPLE_A_IMAGE = '/src/assets/images/bowl_triple_a_1795157670325.jpg';
export const NUTTY_PARTY_IMAGE = '/src/assets/images/bowl_nutty_party_1795157669735.jpg';
export const PINTS_BUNDLE_IMAGE = '/src/assets/images/pint_takehome_bundle_1795157669824.jpg';
export const TOAST_POP_IMAGE = '/src/assets/images/toast_popsicle_acai_1795157670192.jpg';

export const CATEGORY_TABS: { id: CategoryId; label: string }[] = [
  { id: 'signature', label: 'Signature Bowls' },
  { id: 'make-your-own', label: 'Make Your Own' },
  { id: 'pints', label: 'Take-Home Pints' },
  { id: 'bundles', label: 'Party Bundles' },
  { id: 'toasts-pops', label: 'Toasts & Pops' },
];

export const DRIZZLE_OPTIONS: { id: string; name: string; extraPrice: number }[] = [
  { id: 'cookie-butter', name: 'Cookie Butter (Biscoff)', extraPrice: 0 },
  { id: 'almond-butter', name: '100% Roasted Almond Butter', extraPrice: 0 },
  { id: 'peanut-butter', name: '100% Natural Peanut Butter', extraPrice: 0 },
  { id: 'cashew-butter', name: 'Creamy Cashew Butter', extraPrice: 0 },
  { id: 'wild-honey', name: 'Raw Wildflower Honey', extraPrice: 0 },
  { id: 'pistachio', name: 'Roasted Pistachio Crème', extraPrice: 1.2 },
  { id: 'none', name: 'No Drizzle', extraPrice: 0 },
];

export const BOWL_ADDONS: AddOnOption[] = [
  { id: 'extra-acai', name: 'Extra Organic Açaí Scoop', price: 2.5 },
  { id: 'chia-pudding', name: 'Dairy-Free Chia Pudding Layer', price: 1.8 },
  { id: 'cacao-nibs', name: 'Organic Peruvian Cacao Nibs', price: 1.0 },
  { id: 'honey-granola', name: 'Extra Honey Oat Granola', price: 1.5 },
  { id: 'protein-boost', name: 'Plant Pea Protein Scoop', price: 2.2 },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'triple-a',
    category: 'signature',
    name: 'Triple A',
    kicker: 'Best Seller · Dairy-Free · Vegan',
    description:
      'Our flagship organic Brazilian açaí layered with six fresh seasonal fruits, house granola, and seven superfoods.',
    ingredients: [
      'Organic Açaí',
      'Banana',
      'Strawberry',
      'Blueberry',
      'Kiwi',
      'Dragonfruit',
      'Pineapple',
      'Honey Granola',
      'Almond Flakes',
      'Pumpkin Seeds',
      'Cacao Nibs',
      'Coconut Shavings',
      'Goji Berries',
      'Chia Seeds',
    ],
    image: TRIPLE_A_IMAGE,
    sizes: [
      { id: 'S', label: 'Small', weight: '250g', price: 7.5 },
      { id: 'M', label: 'Medium', weight: '380g', price: 10.8 },
      { id: 'L', label: 'Large', weight: '540g', price: 16.4 },
    ],
    supportsDrizzle: true,
    supportsAddOns: true,
    calories: '380 kcal (M)',
  },
  {
    id: 'nutty-party',
    category: 'signature',
    name: 'Nutty Party',
    kicker: 'High Crunch · Nut Lover · Vegan',
    description:
      'Pure undiluted açaí crafted for crunch lovers—bananas, roasted almond flakes, pepitas, cacao nibs, and your choice of nut butter drizzle.',
    ingredients: [
      'Organic Açaí',
      'Banana',
      'Honey Granola',
      'Roasted Almond Flakes',
      'Pumpkin Seeds',
      'Cacao Nibs',
    ],
    image: NUTTY_PARTY_IMAGE,
    sizes: [
      { id: 'S', label: 'Small', weight: '250g', price: 7.5 },
      { id: 'M', label: 'Medium', weight: '380g', price: 10.8 },
      { id: 'L', label: 'Large', weight: '540g', price: 16.4 },
    ],
    supportsDrizzle: true,
    supportsAddOns: true,
    calories: '420 kcal (M)',
  },
  {
    id: 'ch-ch-ch-chia',
    category: 'signature',
    name: 'Ch-Ch-Ch-Chia',
    kicker: 'Chia Layered · Dairy-Free',
    description:
      'Silky coconut chia pudding swirled between organic Brazilian açaí, fresh berries, toasted granola, and antioxidant seeds.',
    ingredients: [
      'Organic Açaí',
      'Coconut Chia Pudding',
      'Strawberry',
      'Blueberry',
      'Banana',
      'Granola',
      'Almond Flakes',
      'Goji Berries',
    ],
    image: HERO_IMAGE,
    sizes: [
      { id: 'S', label: 'Small', weight: '260g', price: 8.2 },
      { id: 'M', label: 'Medium', weight: '400g', price: 11.6 },
      { id: 'L', label: 'Large', weight: '560g', price: 16.9 },
    ],
    supportsDrizzle: true,
    supportsAddOns: true,
    calories: '405 kcal (M)',
  },
  {
    id: 'greek-physique',
    category: 'signature',
    name: 'Greek Physique',
    kicker: 'High Protein · Greek Yogurt',
    description:
      'Thick strained Greek yogurt paired with organic açaí, fresh kiwi, berries, crunchy granola, and toasted seeds for post-workout recovery.',
    ingredients: [
      'Organic Açaí',
      'Strained Greek Yogurt',
      'Strawberry',
      'Kiwi',
      'Banana',
      'Granola',
      'Pumpkin Seeds',
      'Chia Seeds',
    ],
    image: TRIPLE_A_IMAGE,
    sizes: [
      { id: 'S', label: 'Small', weight: '260g', price: 8.2 },
      { id: 'M', label: 'Medium', weight: '400g', price: 11.6 },
      { id: 'L', label: 'Large', weight: '560g', price: 16.9 },
    ],
    supportsDrizzle: true,
    supportsAddOns: true,
    calories: '440 kcal (M)',
  },
  {
    id: 'berried-alive',
    category: 'signature',
    name: 'Berried Alive',
    kicker: 'Sorbet Swirl · Dairy-Free',
    description:
      'Half organic açaí, half bright strawberry-coconut sorbet crowned with dragonfruit, berries, coconut flakes, and raw cacao.',
    ingredients: [
      'Organic Açaí',
      'Strawberry Coconut Sorbet',
      'Strawberry',
      'Blueberry',
      'Dragonfruit',
      'Coconut Shavings',
      'Granola',
    ],
    image: HERO_IMAGE,
    sizes: [
      { id: 'S', label: 'Small', weight: '250g', price: 7.9 },
      { id: 'M', label: 'Medium', weight: '380g', price: 11.2 },
      { id: 'L', label: 'Large', weight: '540g', price: 16.4 },
    ],
    supportsDrizzle: true,
    supportsAddOns: true,
    calories: '365 kcal (M)',
  },
  {
    id: 'berry-me-bliss',
    category: 'signature',
    name: 'Berry Me Bliss',
    kicker: 'All Berries · Antioxidant Rich',
    description:
      'Extra-berry harvest with strawberries, blueberries, goji berries, chia seeds, and crisp honey oat granola over pure açaí.',
    ingredients: [
      'Organic Açaí',
      'Strawberry',
      'Blueberry',
      'Goji Berries',
      'Honey Granola',
      'Chia Seeds',
      'Cacao Nibs',
    ],
    image: TRIPLE_A_IMAGE,
    sizes: [
      { id: 'S', label: 'Small', weight: '250g', price: 7.9 },
      { id: 'M', label: 'Medium', weight: '380g', price: 11.2 },
      { id: 'L', label: 'Large', weight: '540g', price: 16.4 },
    ],
    supportsDrizzle: true,
    supportsAddOns: true,
    calories: '355 kcal (M)',
  },
  {
    id: 'pure-acai-pint',
    category: 'pints',
    name: 'Pure Organic Açaí Pint',
    kicker: '473ml Tub · Stores 6 Months',
    description:
      '100% pure, unsweetened Brazilian açaí harvested in Pará—zero apple juice dilution, zero guarana syrup. Ready to scoop at home.',
    ingredients: ['100% Organic Brazilian Açaí Puree', 'Thermal Insulated Delivery'],
    image: PINTS_BUNDLE_IMAGE,
    sizes: [{ id: 'Standard', label: '1 Pint (473ml)', weight: '3–4 servings', price: 18.9 }],
    supportsDrizzle: false,
    supportsAddOns: true,
  },
  {
    id: 'diy-triple-a-pint',
    category: 'pints',
    name: 'Triple A DIY Pint Kit',
    kicker: 'Pint + Granola + Superfood Pouch',
    description:
      'Everything you need to recreate our #1 Triple A bowl in your kitchen: 1 organic açaí pint, honey oat granola pack, and superfood seed mix.',
    ingredients: ['1x Organic Açaí Pint (473ml)', '1x Honey Granola Pouch', '1x Superfood Mix', '1x Nut Butter Pot'],
    image: PINTS_BUNDLE_IMAGE,
    sizes: [{ id: 'Standard', label: 'Complete Kit', weight: '4 servings', price: 24.9 }],
    supportsDrizzle: true,
    supportsAddOns: false,
  },
  {
    id: 'strawberry-coconut-pint',
    category: 'pints',
    name: 'Strawberry Coconut Sorbet Pint',
    kicker: '473ml Tub · Dairy-Free',
    description:
      'Velvety plant-based sorbet churned with sun-ripened strawberries and cold-pressed coconut cream. Refreshing and naturally sweet.',
    ingredients: ['Strawberry Puree', 'Cold-Pressed Coconut Cream', 'Organic Cane Touch'],
    image: PINTS_BUNDLE_IMAGE,
    sizes: [{ id: 'Standard', label: '1 Pint (473ml)', weight: '3–4 servings', price: 16.9 }],
    supportsDrizzle: false,
    supportsAddOns: false,
  },
  {
    id: 'buddy-bundle',
    category: 'bundles',
    name: 'Buddy Bundle (2 Pax)',
    kicker: 'Most Popular · Save $4.80',
    description:
      'Perfect for two at home: 1 regular organic açaí pint, 1 artisanal nut butter jar (Almond or Cookie Butter), and 1 house-baked granola pack.',
    ingredients: ['1x Organic Açaí Pint', '1x Natural Nut Butter Jar', '1x Honey Oat Granola Pack'],
    image: PINTS_BUNDLE_IMAGE,
    sizes: [{ id: 'Standard', label: '2 Pax Set', weight: 'Thermal Bag Included', price: 26.9 }],
    supportsDrizzle: true,
    supportsAddOns: false,
  },
  {
    id: 'party-bundle',
    category: 'bundles',
    name: 'Party Bundle (4–6 Pax)',
    kicker: 'Sharing Feast · Save $9.50',
    description:
      'Host an effortless wellness brunch: 2 organic açaí or sorbet pints, 2 granola retail packs, superfood toppings box, and 2 drizzle jars.',
    ingredients: ['2x Açaí / Sorbet Pints', '2x Granola Retail Packs', '2x Nut Butter Jars', 'Superfood Seed Box'],
    image: HERO_IMAGE,
    sizes: [{ id: 'Standard', label: '4–6 Pax Set', weight: 'Thermal Bag + Dry Ice', price: 52.9 }],
    supportsDrizzle: true,
    supportsAddOns: true,
  },
  {
    id: 'family-freezer-pack',
    category: 'bundles',
    name: 'Family Freezer Stash (4 Pints)',
    kicker: 'Qualifies for Free Delivery ($121+)',
    description:
      'Stock the freezer for the month with 3 pure organic açaí pints, 1 strawberry coconut sorbet pint, 2 granola packs, and 2 nut butter jars.',
    ingredients: ['3x Organic Açaí Pints', '1x Strawberry Coconut Pint', '2x Granola Packs', '2x Nut Butter Jars'],
    image: PINTS_BUNDLE_IMAGE,
    sizes: [{ id: 'Standard', label: '4-Pint Stash', weight: 'Free Islandwide Delivery Ready', price: 78.0 }],
    supportsDrizzle: true,
    supportsAddOns: false,
  },
  {
    id: 'acai-choco-pop',
    category: 'toasts-pops',
    name: 'Açaí Choco Popsicle',
    kicker: 'Hand-Dipped · Dairy-Free',
    description:
      'Thick organic açaí bar hand-dipped in 70% Belgian dark chocolate and rolled in crushed roasted almonds.',
    ingredients: ['Organic Açaí Core', '70% Dark Chocolate Shell', 'Crushed Roasted Almonds'],
    image: TOAST_POP_IMAGE,
    sizes: [
      { id: 'Standard', label: 'Single Pop', weight: '95g', price: 6.8 },
      { id: 'L', label: 'Box of 4 Pops', weight: '380g', price: 24.5 },
    ],
    supportsDrizzle: false,
    supportsAddOns: false,
  },
  {
    id: 'berry-crunchy-toast',
    category: 'toasts-pops',
    name: 'Berry Crunchy Sourdough',
    kicker: 'Artisanal Sourdough · Freshly Toasted',
    description:
      'Thick-cut country sourdough spread with roasted almond butter, topped with fresh strawberries, blueberries, honey granola, and chia.',
    ingredients: ['Country Sourdough', 'Roasted Almond Butter', 'Strawberry', 'Blueberry', 'Honey Granola', 'Wild Honey'],
    image: TOAST_POP_IMAGE,
    sizes: [{ id: 'Standard', label: '1 Slice', weight: 'Freshly Packed', price: 9.2 }],
    supportsDrizzle: true,
    supportsAddOns: false,
  },
  {
    id: 'you-butter-believe-toast',
    category: 'toasts-pops',
    name: 'You Butter Believe Toast',
    kicker: 'All-Natural Nut Butter · Banana',
    description:
      'Toasted sourdough layered with creamy peanut or cashew butter, caramelized banana slices, cacao nibs, and cinnamon oat crumble.',
    ingredients: ['Country Sourdough', 'Natural Nut Butter', 'Banana', 'Cacao Nibs', 'Honey Granola'],
    image: TOAST_POP_IMAGE,
    sizes: [{ id: 'Standard', label: '1 Slice', weight: 'Freshly Packed', price: 8.9 }],
    supportsDrizzle: true,
    supportsAddOns: false,
  },
  {
    id: 'coco-splash-smoothie',
    category: 'toasts-pops',
    name: 'Coco Splash Smoothie',
    kicker: '420ml Bottle · Hydrating',
    description:
      'Cold-blended organic açaí, young coconut water, banana, and pineapple—light, hydrating, and bottled chilled for transit.',
    ingredients: ['Organic Açaí', 'Young Coconut Water', 'Banana', 'Pineapple'],
    image: HERO_IMAGE,
    sizes: [{ id: 'Standard', label: '420ml Chilled', weight: 'No Ice Dilution', price: 5.5 }],
    supportsDrizzle: false,
    supportsAddOns: true,
  },
];

export const MYO_SIZES: { id: 'S' | 'M' | 'L'; label: string; weight: string; price: number; maxFruits: number; maxCrunch: number; maxSuperfoods: number }[] = [
  { id: 'S', label: 'Small', weight: '250g', price: 7.5, maxFruits: 2, maxCrunch: 1, maxSuperfoods: 2 },
  { id: 'M', label: 'Medium', weight: '380g', price: 10.8, maxFruits: 3, maxCrunch: 2, maxSuperfoods: 3 },
  { id: 'L', label: 'Large', weight: '540g', price: 16.4, maxFruits: 4, maxCrunch: 2, maxSuperfoods: 4 },
];

export const MYO_BASES = [
  { id: 'organic-acai', name: '100% Organic Brazilian Açaí', note: 'Pure, thick & dairy-free', extra: 0 },
  { id: 'acai-chia', name: 'Açaí + Coconut Chia Pudding', note: 'Half açaí, half chia layer', extra: 1.0 },
  { id: 'acai-greek', name: 'Açaí + Greek Yogurt', note: 'High protein swirl (Dairy)', extra: 1.0 },
  { id: 'acai-strawberry', name: 'Açaí + Strawberry Coconut Sorbet', note: 'Bright & tangy vegan blend', extra: 0.8 },
];

export const MYO_FRUITS = [
  'Banana',
  'Strawberry',
  'Blueberry',
  'Kiwi',
  'Red Dragonfruit',
  'Sweet Pineapple',
];

export const MYO_CRUNCH = [
  'Honey Oat Granola',
  'Vegan Nut-Free Granola',
  'Vanilla Cocoa Granola',
  'Lotus Biscoff Crumble',
  'Oreo Cookie Crumble',
];

export const MYO_SUPERFOODS = [
  'Toasted Almond Flakes',
  'Organic Chia Seeds',
  'Peruvian Cacao Nibs',
  'Pumpkin Seeds',
  'Goji Berries',
  'Toasted Coconut Shavings',
  'Walnuts',
];

export const PICKUP_OUTLETS = [
  'Katong (168 East Coast Rd)',
  'Holland Village (21 Lorong Mambong)',
  'Orchard Central (#B1-16)',
  'Tampines 1 (#01-33)',
  'Jewel Changi (#B2-262)',
];

export function calculateDeliveryFee(
  subtotal: number,
  fulfillment: 'delivery' | 'pickup',
  isRemoteZone: boolean
): number {
  if (fulfillment === 'pickup' || subtotal === 0) return 0;
  let baseFee = 15;
  if (subtotal >= 121) {
    baseFee = 0;
  } else if (subtotal >= 71) {
    baseFee = 12;
  }
  return baseFee + (isRemoteZone ? 5 : 0);
}
