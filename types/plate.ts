export type PlateFinish = 'glossy' | 'matte' | 'satin';

export type PlateSize = {
  id: string;
  name: string;
  diameterCm: number;
  basePrice: number;
  outerRadius: number; // Radius total dalam unit 3D (dihitung otomatis: diameterCm / 20)
  wellRatio: number; // Rasio lebar cekungan tengah terhadap diameter total (misal: 0.64)
  wellDepth: number; // Kedalaman cekungan tengah dalam unit 3D (misal: 0.11)
  thickness: number; // Ketebalan bodi keramik konstan (misal: 0.038)
  footRingRadiusRatio: number; // Rasio posisi cincin kaki bawah dari outerRadius (misal: 0.56)
  rimHeight?: number;
  rimAngleDeg?: number;
  isActive?: boolean;
};

export type PlateColor = {
  id: string;
  name: string;
  hex: string;
  description: string;
};

export type RimTrim = 'none' | 'gold' | 'silver' | 'rose-gold' | 'custom';

export type RimPattern =
  | 'none'
  | 'gold-double'
  | 'gold-single'
  | 'silver-double'
  | 'black-modern'
  | 'batik-kawung'
  | 'batik-megamendung'
  | 'greek-key'
  | 'pearl-dots'
  | 'custom';

export type LogoPlacement = 'center' | 'top-rim' | 'free';

export type DesignPreset = {
  id: string;
  name: string;
  category: string;
  thumbnailSvg: string;
  dataUrl: string;
};

export type CartItem = {
  id: string;
  selectedSize: PlateSize;
  plateColor: string;
  plateFinish: PlateFinish;
  rimTrim: RimTrim;
  rimTrimCustomColor: string;
  rimPattern: RimPattern;
  customRimPatternUrl: string | null;
  customRimPatternName: string | null;
  customRimPatternRepeat: number;
  customRimPatternMode: 'repeat' | 'full';
  printCoverage: 'center' | 'full';
  logoPlacement: LogoPlacement;
  designUrl: string | null;
  designName: string | null;
  designScale: number;
  designRotation: number;
  designOffsetX: number;
  designOffsetY: number;
  designOpacity: number;
  snapshotUrl: string | null;
  quantity: number;
};

export interface PlateCustomizationState {
  // Plate Appearance & Geometry (Flat Master via selectedSize)
  availableSizes: PlateSize[];
  availableColors: PlateColor[];
  availablePresets: DesignPreset[];
  selectedSize: PlateSize;
  plateColor: string;
  plateFinish: PlateFinish;
  rimTrim: RimTrim;
  rimTrimCustomColor: string;
  rimPattern: RimPattern;
  customRimPatternUrl: string | null;
  customRimPatternName: string | null;
  customRimPatternRepeat: number; // 8 to 64
  customRimPatternMode: 'repeat' | 'full';
  printCoverage: 'center' | 'full';

  // Custom Artwork / Texture & Logo Placement
  designUrl: string | null;
  designName: string | null;
  logoPlacement: LogoPlacement;
  designScale: number; // 0.2 to 2.0
  designRotation: number; // 0 to 360 degrees
  designOffsetX: number; // -0.5 to 0.5
  designOffsetY: number; // -0.5 to 0.5
  designOpacity: number; // 0.2 to 1.0

  // 3D Canvas Interaction & Guides
  autoRotate: boolean;
  cameraPreset: 'perspective' | 'top' | 'close-up' | 'bottom';
  showSafeZoneGuides: boolean;
  isCapturing: boolean;
  capturedSnapshot: string | null;

  // Cart, Order & Modal
  cart: CartItem[];
  isOrderModalOpen: boolean;
  orderQuantity: number;

  // Actions
  setSize: (size: PlateSize) => void;
  setAvailableSizes: (sizes: PlateSize[]) => void;
  loadMasterSizes: () => Promise<void>;
  loadMasterCatalog: () => Promise<void>;
  setPlateColor: (color: string) => void;
  setPlateFinish: (finish: PlateFinish) => void;
  setRimTrim: (rim: RimTrim) => void;
  setRimTrimCustomColor: (color: string) => void;
  setRimPattern: (pattern: RimPattern) => void;
  setCustomRimPatternUrl: (url: string | null, name?: string) => void;
  setCustomRimPatternRepeat: (repeat: number) => void;
  setCustomRimPatternMode: (mode: 'repeat' | 'full') => void;
  clearCustomRimPattern: () => void;
  setLogoPlacement: (placement: LogoPlacement) => void;
  setPrintCoverage: (coverage: 'center' | 'full') => void;
  setDesignImage: (url: string | null, name?: string) => void;
  setDesignScale: (scale: number) => void;
  setDesignRotation: (rotation: number) => void;
  setDesignOffset: (x: number, y: number) => void;
  setDesignOpacity: (opacity: number) => void;
  resetDesignTransforms: () => void;
  clearDesign: () => void;
  setAutoRotate: (autoRotate: boolean) => void;
  toggleAutoRotate: () => void;
  setCameraPreset: (preset: 'perspective' | 'top' | 'close-up' | 'bottom') => void;
  setShowSafeZoneGuides: (show: boolean) => void;
  setCapturedSnapshot: (dataUrl: string | null) => void;
  setIsCapturing: (capturing: boolean) => void;
  addToCart: (snapshotUrl?: string | null, quantity?: number) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  removeCartItem: (id: string) => void;
  clearCart: () => void;
  restoreDraft: () => void;
  setOrderModalOpen: (open: boolean) => void;
  setOrderQuantity: (quantity: number) => void;
  calculateTotalPrice: () => {
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
  };
}

export interface CustomerOrderData {
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  specialNotes?: string;
  paymentMethod: 'bca' | 'mandiri' | 'qris' | 'gopay';
}
