export type PlateFinish = 'glossy' | 'matte' | 'satin';

export type PlateSize = {
  id: 'dinner' | 'salad' | 'dessert';
  name: string;
  diameterCm: number;
  basePrice: number;
};

export type PlateColor = {
  id: string;
  name: string;
  hex: string;
  description: string;
};

export type RimTrim = 'none' | 'gold' | 'silver' | 'rose-gold' | 'custom';

export type DesignPreset = {
  id: string;
  name: string;
  category: string;
  thumbnailSvg: string;
  dataUrl: string;
};

export interface PlateCustomizationState {
  // Plate Appearance
  selectedSize: PlateSize;
  plateColor: string;
  plateFinish: PlateFinish;
  rimTrim: RimTrim;
  rimTrimCustomColor: string;
  printCoverage: 'center' | 'full';

  // Custom Artwork / Texture
  designUrl: string | null;
  designName: string | null;
  designScale: number; // 0.2 to 2.0
  designRotation: number; // 0 to 360 degrees
  designOffsetX: number; // -0.5 to 0.5
  designOffsetY: number; // -0.5 to 0.5
  designOpacity: number; // 0.2 to 1.0

  // 3D Canvas Interaction
  autoRotate: boolean;
  cameraPreset: 'perspective' | 'top' | 'close-up' | 'bottom';
  isCapturing: boolean;
  capturedSnapshot: string | null;

  // Order & Modal
  isOrderModalOpen: boolean;
  orderQuantity: number;

  // Actions
  setSize: (size: PlateSize) => void;
  setPlateColor: (color: string) => void;
  setPlateFinish: (finish: PlateFinish) => void;
  setRimTrim: (rim: RimTrim) => void;
  setRimTrimCustomColor: (color: string) => void;
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
  setCapturedSnapshot: (dataUrl: string | null) => void;
  setIsCapturing: (capturing: boolean) => void;
  setOrderModalOpen: (open: boolean) => void;
  setOrderQuantity: (quantity: number) => void;
  calculateTotalPrice: () => {
    unitBasePrice: number;
    printFee: number;
    rimTrimFee: number;
    unitTotal: number;
    quantity: number;
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
