import { EstimationSettings } from '../types';

export interface CalculationInputDish {
  dish_id: string;
  name: string;
  category_id: string;
  category_name: string;
  food_type: string;
  price_per_person: number; // in paise
  quantity_per_person: number; // customer-selected portion (e.g. 4 pcs or 150g)
  base_quantity_per_person?: number; // base menu catalog portion (e.g. 2 pcs or 100g)
  serving_unit: string;
}

export interface CalculationResult {
  guest_count: number;
  items: {
    dish_id: string;
    dish_name: string;
    category_id: string;
    category_name: string;
    food_type: string;
    price_per_person: number; // paise
    quantity_per_person: number;
    serving_unit: string;
    total_dish_quantity: number;
    dish_cost: number; // paise
  }[];
  subtotal: number; // paise
  service_charge: number; // paise
  service_charge_rate: number;
  service_charge_enabled: boolean;
  transportation_charge: number; // paise
  transportation_enabled: boolean;
  taxable_amount: number; // paise
  gst_amount: number; // paise
  gst_rate: number;
  gst_enabled: boolean;
  grand_total: number; // paise
  cost_per_guest: number; // paise
}

/**
 * Calculates catering cost using integer minor currency units (paise).
 * Formula specified in requirements:
 * Total Dish Quantity = Quantity Per Person × Number of Guests
 * Dish Cost = Price Per Person × Number of Guests
 * Food Subtotal = Sum of All Dish Costs
 * Grand Total = Food Subtotal + Catering Charges + Transportation + Taxes
 * Cost Per Guest = Grand Total / Number of Guests
 */
export function calculateEstimation(
  dishes: CalculationInputDish[],
  guestCount: number,
  settings: EstimationSettings
): CalculationResult {
  const safeGuests = Math.max(1, guestCount || 1);

  const calculatedItems = dishes.map((dish) => {
    // Proportional serving scaling: if base is 2 pcs @ ₹30 and customer selects 4 pcs (2x),
    // scale factor is 2.0 -> scaled price per guest = ₹60
    const baseQty = (dish.base_quantity_per_person && dish.base_quantity_per_person > 0)
      ? dish.base_quantity_per_person
      : (dish.quantity_per_person > 0 ? dish.quantity_per_person : 1);
    const portionScale = dish.quantity_per_person > 0 ? (dish.quantity_per_person / baseQty) : 1;
    const scaledPricePerPerson = Math.round(dish.price_per_person * portionScale);
    const totalDishQuantity = Math.round(dish.quantity_per_person * safeGuests);
    const dishCost = Math.round(scaledPricePerPerson * safeGuests); // in paise

    return {
      dish_id: dish.dish_id,
      dish_name: dish.name,
      category_id: dish.category_id,
      category_name: dish.category_name,
      food_type: dish.food_type,
      price_per_person: scaledPricePerPerson,
      quantity_per_person: dish.quantity_per_person,
      serving_unit: dish.serving_unit,
      total_dish_quantity: totalDishQuantity,
      dish_cost: dishCost,
    };
  });

  // Food Subtotal (paise)
  const subtotal = calculatedItems.reduce((acc, item) => acc + item.dish_cost, 0);

  // Catering Service Charges (paise)
  const serviceChargeEnabled = Boolean(settings.service_charge_enabled);
  const serviceCharge = serviceChargeEnabled
    ? Math.round(subtotal * (settings.service_charge_rate / 100))
    : 0;

  // Transportation (paise)
  const transportationEnabled = Boolean(settings.transportation_enabled);
  const transportationCharge = transportationEnabled
    ? Math.round(settings.transportation_charge)
    : 0;

  const taxableAmount = subtotal + serviceCharge + transportationCharge;

  // GST (paise)
  const gstEnabled = Boolean(settings.gst_enabled);
  const gstAmount = gstEnabled
    ? Math.round(taxableAmount * (settings.gst_rate / 100))
    : 0;

  // Grand Total (paise)
  const grandTotal = taxableAmount + gstAmount;

  // Cost Per Guest (paise)
  const costPerGuest = Math.round(grandTotal / safeGuests);

  return {
    guest_count: safeGuests,
    items: calculatedItems,
    subtotal,
    service_charge: serviceCharge,
    service_charge_rate: settings.service_charge_rate,
    service_charge_enabled: serviceChargeEnabled,
    transportation_charge: transportationCharge,
    transportation_enabled: transportationEnabled,
    taxable_amount: taxableAmount,
    gst_amount: gstAmount,
    gst_rate: settings.gst_rate,
    gst_enabled: gstEnabled,
    grand_total: grandTotal,
    cost_per_guest: costPerGuest,
  };
}
