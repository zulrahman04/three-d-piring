import { create } from 'zustand';
import { PlateCustomizationState, PlateSize, PlateFinish, RimTrim, RimPattern, LogoPlacement } from '@/types/plate';
import { PLATE_SIZES, PLATE_COLORS, RIM_TRIMS, RIM_PATTERNS, DESIGN_PRESETS } from '@/constants/presets';

export const usePlateStore = create<PlateCustomizationState>((set, get) => ({
  // Default plate appearance: Master ukuran piring aktif
  availableSizes: PLATE_SIZES,
  selectedSize: PLATE_SIZES[0],
  plateColor: PLATE_COLORS[0].hex,
  plateFinish: 'glossy' as PlateFinish,
  rimTrim: 'none' as RimTrim,
  rimTrimCustomColor: '#D4AF37',
  rimPattern: 'none' as RimPattern,
  customRimPatternUrl: null as string | null,
  customRimPatternName: null as string | null,
  customRimPatternRepeat: 24,
  customRimPatternMode: 'repeat' as 'repeat' | 'full',
  printCoverage: 'center',

  // Default design & Logo placement: Start with the Royal Delft Blue Floral preset
  designUrl: DESIGN_PRESETS[0].dataUrl,
  designName: DESIGN_PRESETS[0].name,
  logoPlacement: 'center' as LogoPlacement,
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
  setAvailableSizes: (sizes: PlateSize[]) => set({ availableSizes: sizes }),
  loadMasterSizes: async () => {
    try {
      const res = await fetch('/api/master/sizes');
      if (!res.ok) return;
      const data = await res.json();
      if (data.sizes && Array.isArray(data.sizes) && data.sizes.length > 0) {
        const currentSelectedId = get().selectedSize.id;
        const matchingCurrent = data.sizes.find((s: PlateSize) => s.id === currentSelectedId);
        set({
          availableSizes: data.sizes,
          selectedSize: matchingCurrent || data.sizes[0],
        });
      }
    } catch (err) {
      console.warn('Gagal memuat master ukuran piring dari database:', err);
    }
  },
  setPlateColor: (color: string) => set({ plateColor: color }),
  setPlateFinish: (finish: PlateFinish) => set({ plateFinish: finish }),
  setRimTrim: (rim: RimTrim) => set({ rimTrim: rim }),
  setRimTrimCustomColor: (color: string) => set({ rimTrimCustomColor: color }),
  setRimPattern: (pattern: RimPattern) => set({ rimPattern: pattern }),
  setCustomRimPatternUrl: (url: string | null, name?: string) => {
    const currentUrl = get().customRimPatternUrl;
    if (currentUrl && currentUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(currentUrl);
      } catch {}
    }
    set({
      customRimPatternUrl: url,
      customRimPatternName: name || (url ? 'Custom Pattern' : null),
      rimPattern: url ? 'custom' : 'none',
    });
  },
  setCustomRimPatternRepeat: (repeat: number) =>
    set({ customRimPatternRepeat: Math.max(4, Math.min(64, repeat)) }),
  setCustomRimPatternMode: (mode: 'repeat' | 'full') =>
    set({ customRimPatternMode: mode }),
  clearCustomRimPattern: () => {
    const currentUrl = get().customRimPatternUrl;
    if (currentUrl && currentUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(currentUrl);
      } catch {}
    }
    set({
      customRimPatternUrl: null,
      customRimPatternName: null,
      rimPattern: 'none',
    });
  },
  setLogoPlacement: (placement: LogoPlacement) => set({ logoPlacement: placement }),
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
    const rimPatternConfig = RIM_PATTERNS.find((p) => p.id === state.rimPattern);
    const rimPatternFee = state.rimPattern === 'custom' ? 35000 : (rimPatternConfig ? rimPatternConfig.price : 0);

    const unitTotal = unitBasePrice + printFee + rimTrimFee + rimPatternFee;
    const quantity = state.orderQuantity;
    const grandTotal = unitTotal * quantity;

    return {
      unitBasePrice,
      printFee,
      rimTrimFee,
      rimPatternFee,
      unitTotal,
      quantity,
      grandTotal,
    };
  },
}));
