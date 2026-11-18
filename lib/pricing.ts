import { RIM_TRIMS, RIM_PATTERNS } from '@/constants/presets';

export interface PricingCalculationInput {
  unitBasePrice: number;
  hasDesign: boolean;
  rimTrim?: string;
  rimPattern?: string;
  quantity: number;
}

export interface PricingBreakdown {
  unitBasePrice: number;
  printFee: number;
  rimTrimFee: number;
  rimPatternFee: number;
  unitTotal: number;
  quantity: number;
  subtotalBeforeDiscount: number;
  discountPercent: number;
  discountAmount: number;
  grandTotal: number;
}

/**
 * Tiered wholesale discount aligned with Ceramix 3D pricing policy:
 * - 12–49 pcs: 10%
 * - 50–99 pcs: 20%
 * - 100+ pcs: 35%
 */
export function getWholesaleDiscountPercent(totalQuantity: number): number {
  const qty = Math.max(0, Math.floor(totalQuantity));
  if (qty >= 100) return 35;
  if (qty >= 50) return 20;
  if (qty >= 12) return 10;
  return 0;
}

export function calculatePlatePricing({
  unitBasePrice,
  hasDesign,
  rimTrim = 'none',
  rimPattern = 'none',
  quantity,
}: PricingCalculationInput): PricingBreakdown {
  const safeQty = Math.max(1, Math.floor(Number(quantity) || 1));
  const safeBase = Math.max(0, Number(unitBasePrice) || 0);
  const printFee = hasDesign ? 35000 : 0;

  const rimConfig = RIM_TRIMS.find((r) => r.id === rimTrim);
  const rimTrimFee = rimConfig ? rimConfig.price : 0;

  const rimPatternConfig = RIM_PATTERNS.find((p) => p.id === rimPattern);
  const rimPatternFee =
    rimPattern === 'custom'
      ? 35000
      : rimPatternConfig
      ? rimPatternConfig.price
      : 0;

  const unitTotal = safeBase + printFee + rimTrimFee + rimPatternFee;
  const subtotalBeforeDiscount = unitTotal * safeQty;
  const discountPercent = getWholesaleDiscountPercent(safeQty);
  const discountAmount = Math.round((subtotalBeforeDiscount * discountPercent) / 100);
  const grandTotal = Math.max(0, subtotalBeforeDiscount - discountAmount);

  return {
    unitBasePrice: safeBase,
    printFee,
    rimTrimFee,
    rimPatternFee,
    unitTotal,
    quantity: safeQty,
    subtotalBeforeDiscount,
    discountPercent,
    discountAmount,
    grandTotal,
  };
}
