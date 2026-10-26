import { create } from 'zustand';
import { PlateCustomizationState, PlateSize, PlateFinish, RimTrim } from '@/types/plate';
import { PLATE_SIZES, PLATE_COLORS, RIM_TRIMS, DESIGN_PRESETS } from '@/constants/presets';

export const usePlateStore = create<PlateCustomizationState>((set, get) => ({
  // Default plate appearance: Dinner plate, Porcelain white, Glossy, No rim
  selectedSize: PLATE_SIZES[0],
  plateColor: PLATE_COLORS[0].hex,
  plateFinish: 'glossy' as PlateFinish,
  rimTrim: 'none' as RimTrim,
  rimTrimCustomColor: '#D4AF37',
  printCoverage: 'center',

  // Default design: Start with the Royal Delft Blue Floral preset for instant visual wow!
  designUrl: DESIGN_PRESETS[0].dataUrl,
  designName: DESIGN_PRESETS[0].name,
  designScale: 1.0,
  designRotation: 0,
  designOffsetX: 0,
  designOffsetY: 0,
  designOpacity: 1.0,

  // 3D Canvas
  autoRotate: false,
  cameraPreset: 'perspective',
  isCapturing: false,
  capturedSnapshot: null,

  // Order modal & checkout
  isOrderModalOpen: false,
  orderQuantity: 1,

  // Actions
  setSize: (size: PlateSize) => set({ selectedSize: size }),
  setPlateColor: (color: string) => set({ plateColor: color }),
  setPlateFinish: (finish: PlateFinish) => set({ plateFinish: finish }),
  setRimTrim: (rim: RimTrim) => set({ rimTrim: rim }),
  setRimTrimCustomColor: (color: string) => set({ rimTrimCustomColor: color }),
  setPrintCoverage: (coverage: 'center' | 'full') => set({ printCoverage: coverage }),

  setDesignImage: (url: string | null, name?: string) => {
    const currentUrl = get().designUrl;
    // Revoke previous blob URL if it was a user file to avoid memory leaks
    if (currentUrl && currentUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(currentUrl);
      } catch (err) {
        console.warn('Failed to revoke object URL', err);
      }
    }

    set({
      designUrl: url,
      designName: name ?? (url ? 'Custom Upload' : null),
    });
  },

  setDesignScale: (scale: number) => set({ designScale: scale }),
  setDesignRotation: (rotation: number) => set({ designRotation: rotation }),
  setDesignOffset: (x: number, y: number) => set({ designOffsetX: x, designOffsetY: y }),
  setDesignOpacity: (opacity: number) => set({ designOpacity: opacity }),

  resetDesignTransforms: () =>
    set({
      designScale: 1.0,
      designRotation: 0,
      designOffsetX: 0,
      designOffsetY: 0,
      designOpacity: 1.0,
    }),

  clearDesign: () => {
    const currentUrl = get().designUrl;
    if (currentUrl && currentUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(currentUrl);
      } catch (err) {
        console.warn('Failed to revoke object URL', err);
      }
    }
    set({
      designUrl: null,
      designName: null,
    });
  },

  setAutoRotate: (autoRotate: boolean) => set({ autoRotate }),
  toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),

  setCapturedSnapshot: (dataUrl: string | null) => set({ capturedSnapshot: dataUrl }),
  setIsCapturing: (capturing: boolean) => set({ isCapturing: capturing }),

  setOrderModalOpen: (open: boolean) => set({ isOrderModalOpen: open }),
  setOrderQuantity: (quantity: number) => set({ orderQuantity: Math.max(1, quantity) }),

  calculateTotalPrice: () => {
    const state = get();
    const unitBasePrice = state.selectedSize.basePrice;
    const printFee = state.designUrl ? 35000 : 0;
    const rimConfig = RIM_TRIMS.find((r) => r.id === state.rimTrim);
    const rimTrimFee = rimConfig ? rimConfig.price : 0;

    const unitTotal = unitBasePrice + printFee + rimTrimFee;
    const quantity = state.orderQuantity;
    const grandTotal = unitTotal * quantity;

    return {
      unitBasePrice,
      printFee,
      rimTrimFee,
      unitTotal,
      quantity,
      grandTotal,
    };
  },
}));
