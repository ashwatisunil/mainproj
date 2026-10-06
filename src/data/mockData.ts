import {
  User,
  Ingredient,
  MenuItem,
  WeatherCondition,
  CalendarEvent,
  PurchaseOrder,
  WasteRecord,
  SalesOrder
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Rajesh Sharma',
    email: 'rajesh.admin@cloudkitchen.in',
    role: 'admin',
    kitchenName: 'Master Cloud Kitchen',
    location: 'Koramangala 5th Block, Bengaluru',
    avatarInitials: 'RS',
    isSetupCompleted: true
  },
  {
    id: 'user-manager',
    name: 'Priya Venkatesh',
    email: 'priya.ops@cloudkitchen.in',
    role: 'manager',
    kitchenName: 'Master Cloud Kitchen',
    location: 'Koramangala 5th Block, Bengaluru',
    avatarInitials: 'PV',
    isSetupCompleted: true
  },
  {
    id: 'user-chef',
    name: 'Chef Mohammed Farooq',
    email: 'farooq.chef@cloudkitchen.in',
    role: 'chef',
    kitchenName: 'Master Cloud Kitchen',
    location: 'Koramangala 5th Block, Bengaluru',
    avatarInitials: 'MF',
    isSetupCompleted: true
  }
];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-basmati-rice',
    name: 'Rice',
    category: 'Rice, Flour & Grains',
    currentStock: 48.0,
    minStock: 40.0,
    safetyStock: 25.0,
    unit: 'kg',
    packSize: 25.0,
    unitCost: 0,
    supplierId: 'sup-rice',
    supplierName: 'Grain Depot',
    storageZone: 'Dry Spices & Grain Store',
    shelfLifeDays: 180,
    expiryDate: '2027-03-15',
    batchNumber: 'LOT-RICE-2026-9',
    lastRestocked: '2026-09-28'
  },
  {
    id: 'ing-fresh-paneer',
    name: 'Paneer',
    category: 'Dairy & Paneer',
    currentStock: 9.5,
    minStock: 15.0,
    safetyStock: 8.0,
    unit: 'kg',
    packSize: 5.0,
    unitCost: 0,
    supplierId: 'sup-dairy',
    supplierName: 'Dairy Depot',
    storageZone: 'Walk-in Chiller',
    shelfLifeDays: 4,
    expiryDate: '2026-10-03',
    batchNumber: 'LOT-PNR-8841',
    lastRestocked: '2026-09-29'
  },
  {
    id: 'ing-chicken-currycut',
    name: 'Chicken',
    category: 'Poultry & Meat',
    currentStock: 28.0,
    minStock: 35.0,
    safetyStock: 20.0,
    unit: 'kg',
    packSize: 10.0,
    unitCost: 0,
    supplierId: 'sup-meat',
    supplierName: 'Poultry Depot',
    storageZone: 'Walk-in Chiller',
    shelfLifeDays: 3,
    expiryDate: '2026-10-02',
    batchNumber: 'LOT-CHK-9912',
    lastRestocked: '2026-09-29'
  },
  {
    id: 'ing-chicken-wings',
    name: 'Chicken Wings',
    category: 'Poultry & Meat',
    currentStock: 12.0,
    minStock: 25.0,
    safetyStock: 15.0,
    unit: 'kg',
    packSize: 10.0,
    unitCost: 0,
    supplierId: 'sup-meat',
    supplierName: 'Poultry Depot',
    storageZone: 'Deep Freezer',
    shelfLifeDays: 30,
    expiryDate: '2026-10-28',
    batchNumber: 'LOT-WNG-3011',
    lastRestocked: '2026-09-26'
  },
  {
    id: 'ing-desi-ghee',
    name: 'Ghee',
    category: 'Spices, Ghee & Oils',
    currentStock: 14.0,
    minStock: 12.0,
    safetyStock: 8.0,
    unit: 'kg',
    packSize: 5.0,
    unitCost: 0,
    supplierId: 'sup-dairy',
    supplierName: 'Dairy Depot',
    storageZone: 'Dry Spices & Grain Store',
    shelfLifeDays: 90,
    expiryDate: '2026-12-15',
    batchNumber: 'LOT-GHEE-119',
    lastRestocked: '2026-09-27'
  },
  {
    id: 'ing-amul-butter',
    name: 'Butter',
    category: 'Dairy & Paneer',
    currentStock: 11.5,
    minStock: 15.0,
    safetyStock: 8.0,
    unit: 'kg',
    packSize: 5.0,
    unitCost: 0,
    supplierId: 'sup-dairy',
    supplierName: 'Dairy Depot',
    storageZone: 'Walk-in Chiller',
    shelfLifeDays: 30,
    expiryDate: '2026-10-25',
    batchNumber: 'LOT-AMUL-772',
    lastRestocked: '2026-09-28'
  },
  {
    id: 'ing-onions',
    name: 'Onions',
    category: 'Mandi Fresh Produce',
    currentStock: 65.0,
    minStock: 80.0,
    safetyStock: 40.0,
    unit: 'kg',
    packSize: 50.0,
    unitCost: 0,
    supplierId: 'sup-mandi',
    supplierName: 'Vegetable Mandi',
    storageZone: 'Veg Prep Station',
    shelfLifeDays: 14,
    expiryDate: '2026-10-12',
    batchNumber: 'LOT-PYAZ-551',
    lastRestocked: '2026-09-28'
  },
  {
    id: 'ing-tomatoes',
    name: 'Tomatoes',
    category: 'Mandi Fresh Produce',
    currentStock: 22.0,
    minStock: 30.0,
    safetyStock: 18.0,
    unit: 'kg',
    packSize: 20.0,
    unitCost: 0,
    supplierId: 'sup-mandi',
    supplierName: 'Vegetable Mandi',
    storageZone: 'Veg Prep Station',
    shelfLifeDays: 5,
    expiryDate: '2026-10-03',
    batchNumber: 'LOT-TOM-441',
    lastRestocked: '2026-09-29'
  },
  {
    id: 'ing-ginger-garlic',
    name: 'Ginger Garlic Paste',
    category: 'Spices, Ghee & Oils',
    currentStock: 8.5,
    minStock: 10.0,
    safetyStock: 5.0,
    unit: 'kg',
    packSize: 5.0,
    unitCost: 0,
    supplierId: 'sup-mandi',
    supplierName: 'Vegetable Mandi',
    storageZone: 'Walk-in Chiller',
    shelfLifeDays: 10,
    expiryDate: '2026-10-08',
    batchNumber: 'LOT-GG-201',
    lastRestocked: '2026-09-28'
  },
  {
    id: 'ing-dosa-batter',
    name: 'Dosa Batter',
    category: 'Rice, Flour & Grains',
    currentStock: 16.0,
    minStock: 25.0,
    safetyStock: 12.0,
    unit: 'kg',
    packSize: 10.0,
    unitCost: 0,
    supplierId: 'sup-batter',
    supplierName: 'Batter Mill',
    storageZone: 'Walk-in Chiller',
    shelfLifeDays: 3,
    expiryDate: '2026-10-02',
    batchNumber: 'LOT-BAT-902',
    lastRestocked: '2026-09-29'
  },
  {
    id: 'ing-coriander-chillies',
    name: 'Coriander & Chillies',
    category: 'Mandi Fresh Produce',
    currentStock: 3.5,
    minStock: 5.0,
    safetyStock: 2.5,
    unit: 'kg',
    packSize: 2.0,
    unitCost: 0,
    supplierId: 'sup-mandi',
    supplierName: 'Vegetable Mandi',
    storageZone: 'Veg Prep Station',
    shelfLifeDays: 3,
    expiryDate: '2026-10-02',
    batchNumber: 'LOT-COR-118',
    lastRestocked: '2026-09-29'
  },
  {
    id: 'ing-cashew-paste',
    name: 'Cashew Paste',
    category: 'Spices, Ghee & Oils',
    currentStock: 6.0,
    minStock: 8.0,
    safetyStock: 4.0,
    unit: 'kg',
    packSize: 5.0,
    unitCost: 0,
    supplierId: 'sup-dryfruits',
    supplierName: 'Spice Depot',
    storageZone: 'Dry Spices & Grain Store',
    shelfLifeDays: 60,
    expiryDate: '2026-11-28',
    batchNumber: 'LOT-KAJU-661',
    lastRestocked: '2026-09-22'
  },
  {
    id: 'ing-shahi-spices',
    name: 'Spices',
    category: 'Spices, Ghee & Oils',
    currentStock: 4.5,
    minStock: 5.0,
    safetyStock: 3.0,
    unit: 'kg',
    packSize: 2.0,
    unitCost: 0,
    supplierId: 'sup-dryfruits',
    supplierName: 'Spice Depot',
    storageZone: 'Dry Spices & Grain Store',
    shelfLifeDays: 90,
    expiryDate: '2026-12-30',
    batchNumber: 'LOT-SPC-332',
    lastRestocked: '2026-09-20'
  },
  {
    id: 'ing-maida-atta',
    name: 'Atta / Maida',
    category: 'Rice, Flour & Grains',
    currentStock: 55.0,
    minStock: 60.0,
    safetyStock: 35.0,
    unit: 'kg',
    packSize: 50.0,
    unitCost: 0,
    supplierId: 'sup-rice',
    supplierName: 'Flour Mill',
    storageZone: 'Dry Spices & Grain Store',
    shelfLifeDays: 60,
    expiryDate: '2026-11-20',
    batchNumber: 'LOT-ATA-774',
    lastRestocked: '2026-09-25'
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-hyderabadi-biryani',
    name: 'Biryani',
    brand: 'Main Kitchen',
    category: 'Biryanis & Rice',
    price: 0,
    prepTimeMinutes: 12,
    active: true,
    historicalWeeklySales: [54, 50, 62, 70, 115, 138, 125],
    baseAverageDemand: 88,
    imageColor: 'from-amber-600 to-amber-950',
    recipe: [
      { ingredientId: 'ing-basmati-rice', amount: 0.25, notes: '250g Rice' },
      { ingredientId: 'ing-chicken-currycut', amount: 0.28, notes: '280g Chicken' },
      { ingredientId: 'ing-desi-ghee', amount: 0.035, notes: '35g Ghee' },
      { ingredientId: 'ing-onions', amount: 0.08, notes: '80g Onions' },
      { ingredientId: 'ing-ginger-garlic', amount: 0.025, notes: '25g Ginger Garlic Paste' },
      { ingredientId: 'ing-shahi-spices', amount: 0.012, notes: '12g Spices' }
    ]
  },
  {
    id: 'menu-butter-chicken',
    name: 'Chicken Curry',
    brand: 'Main Kitchen',
    category: 'Curries & Gravies',
    price: 0,
    prepTimeMinutes: 10,
    active: true,
    historicalWeeklySales: [45, 42, 48, 55, 92, 110, 98],
    baseAverageDemand: 70,
    imageColor: 'from-orange-600 to-red-950',
    recipe: [
      { ingredientId: 'ing-chicken-currycut', amount: 0.24, notes: '240g Chicken' },
      { ingredientId: 'ing-amul-butter', amount: 0.05, notes: '50g Butter' },
      { ingredientId: 'ing-tomatoes', amount: 0.16, notes: '160g Tomatoes' },
      { ingredientId: 'ing-cashew-paste', amount: 0.025, notes: '25g Cashew Paste' },
      { ingredientId: 'ing-ginger-garlic', amount: 0.02, notes: '20g Ginger Garlic Paste' }
    ]
  },
  {
    id: 'menu-paneer-tikka-masala',
    name: 'Paneer Curry',
    brand: 'Main Kitchen',
    category: 'Curries & Gravies',
    price: 0,
    prepTimeMinutes: 9,
    active: true,
    historicalWeeklySales: [40, 44, 46, 50, 78, 88, 82],
    baseAverageDemand: 61,
    imageColor: 'from-amber-500 to-orange-900',
    recipe: [
      { ingredientId: 'ing-fresh-paneer', amount: 0.18, notes: '180g Paneer' },
      { ingredientId: 'ing-amul-butter', amount: 0.04, notes: '40g Butter' },
      { ingredientId: 'ing-tomatoes', amount: 0.14, notes: '140g Tomatoes' },
      { ingredientId: 'ing-cashew-paste', amount: 0.02, notes: '20g Cashew Paste' },
      { ingredientId: 'ing-coriander-chillies', amount: 0.015, notes: '15g Coriander & Chillies' }
    ]
  },
  {
    id: 'menu-ghee-roast-dosa',
    name: 'Dosa',
    brand: 'Main Kitchen',
    category: 'Tiffins & South Indian',
    price: 0,
    prepTimeMinutes: 6,
    active: true,
    historicalWeeklySales: [65, 68, 72, 70, 85, 118, 128],
    baseAverageDemand: 87,
    imageColor: 'from-amber-400 to-yellow-800',
    recipe: [
      { ingredientId: 'ing-dosa-batter', amount: 0.22, notes: '220g Dosa Batter' },
      { ingredientId: 'ing-desi-ghee', amount: 0.035, notes: '35g Ghee' },
      { ingredientId: 'ing-onions', amount: 0.04, notes: '40g Onions' },
      { ingredientId: 'ing-coriander-chillies', amount: 0.01, notes: '10g Coriander & Chillies' }
    ]
  },
  {
    id: 'menu-tandoori-wings',
    name: 'Chicken Wings',
    brand: 'Main Kitchen',
    category: 'Tandoor & Kebabs',
    price: 0,
    prepTimeMinutes: 14,
    active: true,
    historicalWeeklySales: [25, 28, 32, 42, 85, 125, 110],
    baseAverageDemand: 64,
    imageColor: 'from-rose-600 to-red-950',
    recipe: [
      { ingredientId: 'ing-chicken-wings', amount: 0.45, notes: '450g Chicken Wings' },
      { ingredientId: 'ing-ginger-garlic', amount: 0.03, notes: '30g Ginger Garlic Paste' },
      { ingredientId: 'ing-shahi-spices', amount: 0.02, notes: '20g Spices' }
    ]
  },
  {
    id: 'menu-samosa-chaat',
    name: 'Samosa',
    brand: 'Main Kitchen',
    category: 'Chaat & Street Food',
    price: 0,
    prepTimeMinutes: 5,
    active: true,
    historicalWeeklySales: [38, 35, 40, 48, 75, 95, 88],
    baseAverageDemand: 60,
    imageColor: 'from-emerald-600 to-amber-900',
    recipe: [
      { ingredientId: 'ing-maida-atta', amount: 0.12, notes: '120g Atta / Maida' },
      { ingredientId: 'ing-onions', amount: 0.04, notes: '40g Onions' },
      { ingredientId: 'ing-desi-ghee', amount: 0.02, notes: '20g Ghee' },
      { ingredientId: 'ing-coriander-chillies', amount: 0.015, notes: '15g Coriander & Chillies' }
    ]
  }
];

export const WEATHER_PRESETS: WeatherCondition[] = [
  {
    type: 'monsoon_rain',
    label: 'Heavy Rain (23°C)',
    temperatureC: 23,
    precipitationProb: 90,
    humidity: 95,
    deliveryMultiplier: 1.35,
    categoryMultipliers: {
      'Biryanis & Rice': 1.45,
      'Curries & Gravies': 1.35,
      'Chaat & Street Food': 1.65,
      'Tandoor & Kebabs': 1.25,
      'Tiffins & South Indian': 1.20,
      'Breads & Desserts': 1.25
    }
  },
  {
    type: 'thunderstorm_monsoon',
    label: 'Heavy Storm (21°C)',
    temperatureC: 21,
    precipitationProb: 98,
    humidity: 98,
    deliveryMultiplier: 1.45,
    categoryMultipliers: {
      'Biryanis & Rice': 1.60,
      'Curries & Gravies': 1.45,
      'Chaat & Street Food': 1.75,
      'Tandoor & Kebabs': 1.35,
      'Tiffins & South Indian': 1.25,
      'Breads & Desserts': 1.30
    }
  },
  {
    type: 'summer_heatwave',
    label: 'Extreme Heat (42°C)',
    temperatureC: 42,
    precipitationProb: 0,
    humidity: 28,
    deliveryMultiplier: 1.15,
    categoryMultipliers: {
      'Biryanis & Rice': 0.85,
      'Curries & Gravies': 0.80,
      'Tiffins & South Indian': 1.35,
      'Chaat & Street Food': 1.20,
      'Tandoor & Kebabs': 0.85,
      'Breads & Desserts': 0.90
    }
  },
  {
    type: 'winter_chill',
    label: 'Winter Cold (9°C)',
    temperatureC: 9,
    precipitationProb: 15,
    humidity: 85,
    deliveryMultiplier: 1.30,
    categoryMultipliers: {
      'Tandoor & Kebabs': 1.60,
      'Curries & Gravies': 1.55,
      'Biryanis & Rice': 1.40,
      'Breads & Desserts': 1.50,
      'Chaat & Street Food': 1.25,
      'Tiffins & South Indian': 0.90
    }
  },
  {
    type: 'pleasant_dry',
    label: 'Normal Weather (24°C)',
    temperatureC: 24,
    precipitationProb: 5,
    humidity: 50,
    deliveryMultiplier: 1.00,
    categoryMultipliers: {
      'Biryanis & Rice': 1.00,
      'Curries & Gravies': 1.00,
      'Tandoor & Kebabs': 1.00,
      'Tiffins & South Indian': 1.00,
      'Chaat & Street Food': 1.00,
      'Breads & Desserts': 1.00
    }
  }
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-regular',
    title: 'Standard Day (No Events)',
    date: '2026-10-01',
    impactLevel: 'low',
    categoryMultipliers: {
      'Biryanis & Rice': 1.0,
      'Curries & Gravies': 1.0,
      'Tandoor & Kebabs': 1.0,
      'Tiffins & South Indian': 1.0,
      'Chaat & Street Food': 1.0,
      'Breads & Desserts': 1.0
    },
    notes: 'Baseline kitchen run.'
  },
  {
    id: 'evt-ipl-match',
    title: 'Match / Game Night',
    date: '2026-10-02',
    impactLevel: 'high',
    categoryMultipliers: {
      'Tandoor & Kebabs': 1.70,
      'Biryanis & Rice': 1.55,
      'Curries & Gravies': 1.30,
      'Chaat & Street Food': 1.45,
      'Tiffins & South Indian': 0.85,
      'Breads & Desserts': 1.20
    },
    notes: 'High demand shift.'
  },
  {
    id: 'evt-diwali',
    title: 'Festival Week',
    date: '2026-10-03',
    impactLevel: 'high',
    categoryMultipliers: {
      'Biryanis & Rice': 1.55,
      'Curries & Gravies': 1.50,
      'Tandoor & Kebabs': 1.45,
      'Breads & Desserts': 1.80,
      'Chaat & Street Food': 1.40,
      'Tiffins & South Indian': 1.10
    },
    notes: 'Festive surge.'
  },
  {
    id: 'evt-weekend-biryani',
    title: 'Weekend Surge',
    date: '2026-10-02',
    impactLevel: 'high',
    categoryMultipliers: {
      'Biryanis & Rice': 1.40,
      'Tandoor & Kebabs': 1.35,
      'Curries & Gravies': 1.25,
      'Tiffins & South Indian': 1.20,
      'Chaat & Street Food': 1.25,
      'Breads & Desserts': 1.20
    },
    notes: 'Higher volume shift.'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [];
export const INITIAL_WASTE_RECORDS: WasteRecord[] = [];
export const INITIAL_RECENT_ORDERS: SalesOrder[] = [];
