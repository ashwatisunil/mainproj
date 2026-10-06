export type UserRole = 'admin' | 'manager' | 'chef' | 'cook' | 'inventory_staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  kitchenName: string;
  location: string;
  avatarInitials: string;
  phone?: string;
  station?: string;
  status?: 'active' | 'on_shift' | 'off_duty';
  isSetupCompleted?: boolean;
}

export type StorageZone =
  | 'Walk-in Chiller'
  | 'Deep Freezer'
  | 'Dry Spices & Grain Store'
  | 'Veg Prep Station'
  | 'Tandoor & Hot Line';

export type IngredientCategory =
  | 'Dairy & Paneer'
  | 'Poultry & Meat'
  | 'Rice, Flour & Grains'
  | 'Mandi Fresh Produce'
  | 'Spices, Ghee & Oils'
  | 'Packaging & Consumables';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  currentStock: number;
  minStock: number;
  safetyStock: number;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'units' | 'packs';
  packSize: number;
  unitCost: number;
  supplierId: string;
  supplierName: string;
  storageZone: StorageZone;
  shelfLifeDays: number;
  expiryDate: string;
  batchNumber: string;
  lastRestocked: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  amount: number;
  notes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  brand: string;
  category:
    | 'Biryanis & Rice'
    | 'Curries & Gravies'
    | 'Tandoor & Kebabs'
    | 'Tiffins & South Indian'
    | 'Chaat & Street Food'
    | 'Breads & Desserts';
  price: number;
  prepTimeMinutes: number;
  active: boolean;
  recipe: RecipeIngredient[];
  historicalWeeklySales: number[];
  baseAverageDemand: number;
  imageColor: string;
}

export interface KitchenPrepLog {
  id: string;
  batchNumber: string;
  menuItemId: string;
  menuItemName: string;
  category: string;
  portionsCount: number;
  timestamp: string;
  preparedBy: string;
  notes?: string;
  deductedIngredients: {
    ingredientName: string;
    amount: number;
    unit: string;
  }[];
}

export type WeatherType =
  | 'monsoon_rain'
  | 'thunderstorm_monsoon'
  | 'summer_heatwave'
  | 'winter_chill'
  | 'pleasant_dry'
  | 'humid_overcast';

export interface WeatherCondition {
  type: WeatherType;
  label: string;
  temperatureC: number;
  precipitationProb: number;
  humidity: number;
  deliveryMultiplier: number;
  categoryMultipliers: Record<string, number>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  impactLevel: 'high' | 'medium' | 'low';
  categoryMultipliers: Record<string, number>;
  notes: string;
}

export interface DemandPrediction {
  menuItemId: string;
  menuItemName: string;
  brand: string;
  category: string;
  baseDemand: number;
  dowFactor: number;
  weatherFactor: number;
  eventFactor: number;
  forecastUnits: number;
  confidenceLower: number;
  confidenceUpper: number;
  projectedRevenue: number;
  reasoning: string;
}

export interface IngredientRequirement {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  requiredAmount: number;
  currentStock: number;
  safetyStock: number;
  shortageAmount: number;
  recommendedOrder: number;
  unitCost: number;
  estimatedCost: number;
  supplierName: string;
  storageZone: StorageZone;
  status: 'critical' | 'warning' | 'sufficient';
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  platform: 'Swiggy' | 'Zomato' | 'Magicpin' | 'ONDC / Direct' | 'Counter POS';
  customerName?: string;
  timestamp: string;
  items: {
    menuItemId: string;
    menuItemName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'new' | 'preparing' | 'ready' | 'dispatched';
  notes?: string;
}

export interface PurchaseOrderItem {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  createdAt: string;
  deliveryDate: string;
  status: 'draft' | 'submitted' | 'received';
  items: PurchaseOrderItem[];
  totalCost: number;
  notes?: string;
}

export interface WasteRecord {
  id: string;
  ingredientId: string;
  ingredientName: string;
  amount: number;
  unit: string;
  costLoss: number;
  reason: 'expired' | 'damaged' | 'prep_error' | 'overcooked' | 'storage_failure' | 'spoilage';
  loggedAt: string;
  loggedBy: string;
}
