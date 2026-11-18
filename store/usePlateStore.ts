import { create } from 'zustand';
import {
  PlateCustomizationState,
  PlateSize,
  PlateColor,
  DesignPreset,
  PlateFinish,
  RimTrim,
  RimPattern,
  LogoPlacement,
  CartItem,
} from '@/types/plate';
import { PLATE_SIZES, PLATE_COLORS, DESIGN_PRESETS } from '@/constants/presets';
import { calculatePlatePricing } from '@/lib/pricing';

const DRAFT_STORAGE_KEY = 'ceramix3d_studio_draft_v1';
const CART_STORAGE_KEY = 'ceramix3d_cart_v1';

let draftSaveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSaveDraft(state: PlateCustomizationState) {
  if (typeof window === 'undefined') return;
  if (draftSaveTimer) clearTimeout(draftSaveTimer);
  draftSaveTimer = setTimeout(() => {
    try {
      const payload = {
        selectedSizeId: state.selectedSize.id,
        plateColor: state.plateColor,
        plateFinish: state.plateFinish,
        rimTrim: state.rimTrim,
        rimTrimCustomColor: state.rimTrimCustomColor,
        rimPattern: state.rimPattern,
        customRimPatternUrl:
          state.customRimPatternUrl && state.customRimPatternUrl.length < 700_000
            ? state.customRimPatternUrl
            : null,
        customRimPatternName: state.customRimPatternName,
        customRimPatternRepeat: state.customRimPatternRepeat,
        customRimPatternMode: state.customRimPatternMode,
        printCoverage: state.printCoverage,
        logoPlacement: state.logoPlacement,
        designUrl: state.designUrl && state.designUrl.length < 700_000 ? state.designUrl : null,
        designName: state.designName,
        designScale: state.designScale,
        designRotation: state.designRotation,
        designOffsetX: state.designOffsetX,
        designOffsetY: state.designOffsetY,
        designOpacity: state.designOpacity,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, 350);
}

function saveCartToStorage(cart: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    // Strip large snapshot base64 if storage is tight
    const compact = cart.map((item) => ({
      ...item,
      snapshotUrl: item.snapshotUrl && item.snapshotUrl.length < 400_000 ? item.snapshotUrl : null,
      designUrl: item.designUrl && item.designUrl.length < 600_000 ? item.designUrl : null,
    }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(compact));
  } catch {
    // Ignore storage quota errors
  }
}

export const usePlateStore = create<PlateCustomizationState>((set, get) => ({
  // Default plate appearance: Master ukuran, warna, dan preset aktif
  availableSizes: PLATE_SIZES,
  availableColors: PLATE_COLORS,
  availablePresets: DESIGN_PRESETS,
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

  // 3D Canvas & Guides
  autoRotate: false,
  cameraPreset: 'perspective',
  showSafeZoneGuides: false,
  isCapturing: false,
  capturedSnapshot: null,

  // Cart & Order modal
  cart: [],
  isOrderModalOpen: false,
  orderQuantity: 1,

  // Actions
  setSize: (size: PlateSize) => {
    set({ selectedSize: size });
    scheduleSaveDraft(get());
  },
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

  loadMasterCatalog: async () => {
    try {
      const [resSizes, resColors, resPresets] = await Promise.all([
        fetch('/api/master/sizes').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/master/colors').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/master/presets').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);

      const updates: Partial<PlateCustomizationState> = {};

      if (resSizes?.sizes && Array.isArray(resSizes.sizes) && resSizes.sizes.length > 0) {
        const currentSelectedId = get().selectedSize.id;
        const matchingCurrent = resSizes.sizes.find((s: PlateSize) => s.id === currentSelectedId);
        updates.availableSizes = resSizes.sizes;
        updates.selectedSize = matchingCurrent || resSizes.sizes[0];
      }

      if (resColors?.colors && Array.isArray(resColors.colors) && resColors.colors.length > 0) {
        updates.availableColors = resColors.colors as PlateColor[];
      }

      if (resPresets?.presets && Array.isArray(resPresets.presets) && resPresets.presets.length > 0) {
        updates.availablePresets = resPresets.presets as DesignPreset[];
      }

      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    } catch (err) {
      console.warn('Gagal memuat katalog master dari database:', err);
    }
  },

  setPlateColor: (color: string) => {
    set({ plateColor: color });
    scheduleSaveDraft(get());
  },
  setPlateFinish: (finish: PlateFinish) => {
    set({ plateFinish: finish });
    scheduleSaveDraft(get());
  },
  setRimTrim: (rim: RimTrim) => {
    set({ rimTrim: rim });
    scheduleSaveDraft(get());
  },
  setRimTrimCustomColor: (color: string) => {
    set({ rimTrimCustomColor: color });
    scheduleSaveDraft(get());
  },
  setRimPattern: (pattern: RimPattern) => {
    set({ rimPattern: pattern });
    scheduleSaveDraft(get());
  },
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
    scheduleSaveDraft(get());
  },
  setCustomRimPatternRepeat: (repeat: number) => {
    set({ customRimPatternRepeat: Math.max(4, Math.min(64, repeat)) });
    scheduleSaveDraft(get());
  },
  setCustomRimPatternMode: (mode: 'repeat' | 'full') => {
    set({ customRimPatternMode: mode });
    scheduleSaveDraft(get());
  },
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
    scheduleSaveDraft(get());
  },
  setLogoPlacement: (placement: LogoPlacement) => {
    set({ logoPlacement: placement });
    scheduleSaveDraft(get());
  },
  setPrintCoverage: (coverage: 'center' | 'full') => {
    set({ printCoverage: coverage });
    scheduleSaveDraft(get());
  },

  setDesignImage: (url: string | null, name?: string) => {
    const currentUrl = get().designUrl;
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
    scheduleSaveDraft(get());
  },

  setDesignScale: (scale: number) => {
    set({ designScale: scale });
    scheduleSaveDraft(get());
  },
  setDesignRotation: (rotation: number) => {
    set({ designRotation: rotation });
    scheduleSaveDraft(get());
  },
  setDesignOffset: (x: number, y: number) => {
    set({ designOffsetX: x, designOffsetY: y });
    scheduleSaveDraft(get());
  },
  setDesignOpacity: (opacity: number) => {
    set({ designOpacity: opacity });
    scheduleSaveDraft(get());
  },

  resetDesignTransforms: () => {
    set({
      designScale: 1.0,
      designRotation: 0,
      designOffsetX: 0,
      designOffsetY: 0,
      designOpacity: 1.0,
    });
    scheduleSaveDraft(get());
  },

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
    scheduleSaveDraft(get());
  },

  setAutoRotate: (autoRotate: boolean) => set({ autoRotate }),
  toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  setShowSafeZoneGuides: (show: boolean) => set({ showSafeZoneGuides: show }),

  setCapturedSnapshot: (dataUrl: string | null) => set({ capturedSnapshot: dataUrl }),
  setIsCapturing: (capturing: boolean) => set({ isCapturing: capturing }),

  addToCart: (snapshotUrl?: string | null, quantity = 1) => {
    const state = get();
    const newItem: CartItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      selectedSize: state.selectedSize,
      plateColor: state.plateColor,
      plateFinish: state.plateFinish,
      rimTrim: state.rimTrim,
      rimTrimCustomColor: state.rimTrimCustomColor,
      rimPattern: state.rimPattern,
      customRimPatternUrl: state.customRimPatternUrl,
      customRimPatternName: state.customRimPatternName,
      customRimPatternRepeat: state.customRimPatternRepeat,
      customRimPatternMode: state.customRimPatternMode,
      printCoverage: state.printCoverage,
      logoPlacement: state.logoPlacement,
      designUrl: state.designUrl,
      designName: state.designName,
      designScale: state.designScale,
      designRotation: state.designRotation,
      designOffsetX: state.designOffsetX,
      designOffsetY: state.designOffsetY,
      designOpacity: state.designOpacity,
      snapshotUrl: snapshotUrl ?? state.capturedSnapshot ?? null,
      quantity: Math.max(1, quantity),
    };
    const nextCart = [...state.cart, newItem];
    set({ cart: nextCart });
    saveCartToStorage(nextCart);
  },

  updateCartItemQuantity: (id: string, quantity: number) => {
    const nextCart = get().cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    set({ cart: nextCart });
    saveCartToStorage(nextCart);
  },

  removeCartItem: (id: string) => {
    const nextCart = get().cart.filter((item) => item.id !== id);
    set({ cart: nextCart });
    saveCartToStorage(nextCart);
  },

  clearCart: () => {
    set({ cart: [] });
    saveCartToStorage([]);
  },

  restoreDraft: () => {
    if (typeof window === 'undefined') return;
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          set({ cart: parsedCart });
        }
      }

      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      const sizes = get().availableSizes;
      const matchedSize = sizes.find((s) => s.id === draft.selectedSizeId);

      set({
        ...(matchedSize ? { selectedSize: matchedSize } : {}),
        ...(draft.plateColor ? { plateColor: draft.plateColor } : {}),
        ...(draft.plateFinish ? { plateFinish: draft.plateFinish } : {}),
        ...(draft.rimTrim ? { rimTrim: draft.rimTrim } : {}),
        ...(draft.rimTrimCustomColor ? { rimTrimCustomColor: draft.rimTrimCustomColor } : {}),
        ...(draft.rimPattern ? { rimPattern: draft.rimPattern } : {}),
        ...(draft.customRimPatternUrl !== undefined ? { customRimPatternUrl: draft.customRimPatternUrl } : {}),
        ...(draft.customRimPatternName !== undefined ? { customRimPatternName: draft.customRimPatternName } : {}),
        ...(draft.customRimPatternRepeat ? { customRimPatternRepeat: draft.customRimPatternRepeat } : {}),
        ...(draft.customRimPatternMode ? { customRimPatternMode: draft.customRimPatternMode } : {}),
        ...(draft.printCoverage ? { printCoverage: draft.printCoverage } : {}),
        ...(draft.logoPlacement ? { logoPlacement: draft.logoPlacement } : {}),
        ...(draft.designUrl !== undefined ? { designUrl: draft.designUrl } : {}),
        ...(draft.designName !== undefined ? { designName: draft.designName } : {}),
        ...(typeof draft.designScale === 'number' ? { designScale: draft.designScale } : {}),
        ...(typeof draft.designRotation === 'number' ? { designRotation: draft.designRotation } : {}),
        ...(typeof draft.designOffsetX === 'number' ? { designOffsetX: draft.designOffsetX } : {}),
        ...(typeof draft.designOffsetY === 'number' ? { designOffsetY: draft.designOffsetY } : {}),
        ...(typeof draft.designOpacity === 'number' ? { designOpacity: draft.designOpacity } : {}),
      });
    } catch {
      // Ignore corrupt localStorage entries
    }
  },

  setOrderModalOpen: (open: boolean) => set({ isOrderModalOpen: open }),
  setOrderQuantity: (quantity: number) => set({ orderQuantity: Math.max(1, quantity) }),

  calculateTotalPrice: () => {
    const state = get();
    return calculatePlatePricing({
      unitBasePrice: state.selectedSize.basePrice,
      hasDesign: Boolean(state.designUrl),
      rimTrim: state.rimTrim,
      rimPattern: state.rimPattern,
      quantity: state.orderQuantity,
    });
  },
}));
