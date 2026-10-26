-- ============================================================================
-- CERAMIX 3D - POSTGRESQL DATABASE SCHEMA
-- Proyek: Kustomisasi Piring Porselen 3D & E-Commerce Pemesanan
-- Database: PostgreSQL 13+ (Supabase, Neon, AWS RDS, Local Docker)
-- ============================================================================

-- Aktifkan ekstensi UUID (standar pgcrypto / uuid-ossp jika diperlukan)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUM TYPES
-- ============================================================================

-- Tipe glasir porselen
CREATE TYPE plate_finish_enum AS ENUM (
    'glossy',   -- Kilap porselen klasik berkilau tinggi
    'matte',    -- Doff modern bebas pantulan
    'satin'     -- Semi-satin kilau lembut
);

-- Tipe aksen pinggiran metallic rim
CREATE TYPE rim_trim_enum AS ENUM (
    'none',         -- Polos tanpa trim
    'gold',         -- 24K Gold Luster Rim
    'silver',       -- Platinum Silver Rim
    'rose_gold',    -- Rose Gold Rim
    'custom'        -- Warna kustom (kode Hex bebas)
);

-- Cakupan area cetak motif
CREATE TYPE print_coverage_enum AS ENUM (
    'center',   -- Cekungan tengah piring saja (basin)
    'full'      -- Menyeluruh dari cekungan hingga bibir piring (full surface)
);

-- Metode pembayaran
CREATE TYPE payment_method_enum AS ENUM (
    'bca',
    'mandiri',
    'qris',
    'gopay'
);

-- Status pembayaran
CREATE TYPE payment_status_enum AS ENUM (
    'unpaid',       -- Menunggu pembayaran
    'paid',         -- Pembayaran terverifikasi
    'failed',       -- Pembayaran gagal / kadaluarsa
    'refunded'      -- Dana dikembalikan
);

-- Status siklus hidup pesanan piring keramik
CREATE TYPE order_status_enum AS ENUM (
    'pending_payment',  -- Menunggu konfirmasi bayar
    'design_review',    -- Pemeriksaan resolusi & kesiapan cetak oleh tim artisan
    'in_production',    -- Proses pembakaran kiln 1.250°C & decal printing
    'quality_check',    -- Pengecekan cacat glasir & ketahanan
    'shipped',          -- Dikirim dengan kurir / packing kayu
    'delivered',        -- Pesanan telah diterima konsumen
    'cancelled'         -- Pesanan dibatalkan
);

-- Role pengguna
CREATE TYPE user_role_enum AS ENUM (
    'customer',
    'admin',
    'artisan'
);

-- ============================================================================
-- 2. MASTER DATA TABLES
-- ============================================================================

-- Tabel Pengguna (Membedakan Customer, Admin, dan Artisan Produksi)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),                      -- Hash password untuk login Admin / Customer
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    role user_role_enum DEFAULT 'customer' NOT NULL, -- 'customer' | 'admin' | 'artisan'
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Master Ukuran Piring Keramik (Dinner 27cm, Salad 21cm, Dessert 16cm)
CREATE TABLE plate_sizes (
    id VARCHAR(50) PRIMARY KEY, -- 'dinner', 'salad', 'dessert'
    name VARCHAR(100) NOT NULL,
    diameter_cm NUMERIC(5,2) NOT NULL,
    base_price NUMERIC(12,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Master Warna Glasir Keramik
CREATE TABLE plate_colors (
    id VARCHAR(50) PRIMARY KEY, -- 'porcelain-white', 'matte-black', dll.
    name VARCHAR(100) NOT NULL,
    hex_code VARCHAR(10) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Master Template Desain Piring (Royal Delft, Botanical, Japanese Wave, dll.)
CREATE TABLE design_presets (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    thumbnail_svg_url TEXT,
    data_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 3. CUSTOMIZATION & 3D ARTWORK CONFIGURATION
-- ============================================================================

-- Tabel Konfigurasi Desain Piring 3D (Menyimpan posisi 3D, skala, rotasi, & snapshot 4K)
CREATE TABLE plate_customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable untuk guest visitor
    plate_size_id VARCHAR(50) REFERENCES plate_sizes(id) NOT NULL,
    
    -- Karakteristik Bodi Keramik
    plate_color_hex VARCHAR(10) NOT NULL,           -- e.g. '#232326' (Matte Obsidian)
    plate_finish plate_finish_enum NOT NULL DEFAULT 'glossy',
    rim_trim rim_trim_enum NOT NULL DEFAULT 'none',
    rim_trim_custom_color VARCHAR(10),              -- e.g. '#D4AF37' jika custom
    print_coverage print_coverage_enum NOT NULL DEFAULT 'center',

    -- Parameter Transformasi Decal 3D
    design_image_url TEXT,                          -- URL gambar motif (S3 / Supabase Storage / Cloudinary)
    design_name VARCHAR(200),                       -- Nama template atau file asli
    design_scale NUMERIC(5,2) DEFAULT 1.00 NOT NULL, -- 0.20 sampai 2.00
    design_rotation NUMERIC(5,1) DEFAULT 0.0 NOT NULL, -- 0.0 sampai 360.0 derajat
    design_offset_x NUMERIC(6,3) DEFAULT 0.000 NOT NULL, -- Geser kiri/kanan (-0.500 s/d 0.500)
    design_offset_y NUMERIC(6,3) DEFAULT 0.000 NOT NULL, -- Geser atas/bawah (-0.500 s/d 0.500)
    design_opacity NUMERIC(4,2) DEFAULT 1.00 NOT NULL,   -- Transparansi 0.20 s/d 1.00

    -- Hasil Render 3D Ultra HD
    preview_snapshot_url TEXT,                      -- URL file foto 2K/4K PNG hasil export studio
    
    -- Metadata tambahan dalam bentuk JSONB untuk fleksibilitas masa depan
    metadata JSONB DEFAULT '{}'::jsonB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 4. ORDERS & TRANSACTIONS
-- ============================================================================

-- Tabel Header Pesanan (Order)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,        -- e.g. 'CRMX-20261026-0001'
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Informasi Pemesan / Pengiriman
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    shipping_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(15) NOT NULL,
    special_notes TEXT,

    -- Kalkulasi Biaya (Mata Uang IDR)
    total_base_price NUMERIC(14,2) NOT NULL,         -- Total harga piring dasar
    total_print_fee NUMERIC(14,2) DEFAULT 0 NOT NULL,-- Total biaya sablon/decal
    total_rim_trim_fee NUMERIC(14,2) DEFAULT 0 NOT NULL, -- Total biaya metallic rim trim emas/perak
    shipping_cost NUMERIC(14,2) DEFAULT 0 NOT NULL,  -- Biaya kirim + packing kayu bergaransi
    discount_amount NUMERIC(14,2) DEFAULT 0 NOT NULL,-- Potongan diskon grosir / promo
    grand_total NUMERIC(14,2) NOT NULL,              -- Total akhir pembayaran

    -- Status & Pembayaran
    payment_method payment_method_enum NOT NULL,
    payment_status payment_status_enum DEFAULT 'unpaid' NOT NULL,
    order_status order_status_enum DEFAULT 'pending_payment' NOT NULL,
    
    payment_proof_url TEXT,                          -- Bukti transfer (jika manual bank transfer)
    payment_reference_id VARCHAR(150),               -- ID transaksi dari payment gateway (Midtrans/Xendit)
    tracking_number VARCHAR(100),                    -- Nomor resi kurir (JNE / SiCepat / Deliveree)

    paid_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabel Detail Item Pesanan (Order Items)
-- Menyimpan snapshot data fisik saat dipesan agar riwayat pesanan tidak terpengaruh jika master data berubah
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    customization_id UUID REFERENCES plate_customizations(id) ON DELETE SET NULL,

    -- Snapshot Spesifikasi Piring
    plate_size_name VARCHAR(100) NOT NULL,           -- e.g. 'Dinner Plate'
    diameter_cm NUMERIC(5,2) NOT NULL,               -- e.g. 27.00
    plate_color_name VARCHAR(100) NOT NULL,          -- e.g. 'Matte Obsidian'
    plate_color_hex VARCHAR(10) NOT NULL,
    plate_finish plate_finish_enum NOT NULL,
    rim_trim_name VARCHAR(100) NOT NULL,             -- e.g. '24K Gold Luster Rim'
    rim_trim_custom_hex VARCHAR(10),
    print_coverage print_coverage_enum NOT NULL,

    -- File Aset Desain Terkait
    design_image_url TEXT,
    snapshot_render_url TEXT NOT NULL,               -- Foto 2K/4K bukti mockup visual

    -- Breakdown Harga Satuan Item
    unit_base_price NUMERIC(12,2) NOT NULL,
    unit_print_fee NUMERIC(12,2) DEFAULT 0 NOT NULL,
    unit_rim_trim_fee NUMERIC(12,2) DEFAULT 0 NOT NULL,
    unit_total_price NUMERIC(12,2) NOT NULL,

    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
    subtotal_price NUMERIC(14,2) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 5. AUDIT LOG & ORDER PRODUCTION TIMELINE
-- ============================================================================

-- Riwayat Tracking Produksi Keramik (Tahapan Kiln, QC, Packaging)
CREATE TABLE order_production_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    operator_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin / Artisan yang mengupdate
    stage order_status_enum NOT NULL,
    title VARCHAR(150) NOT NULL,                     -- e.g. 'Pembakaran Kiln 1.250°C Selesai'
    description TEXT,                                -- Catatan artisan / suhu kiln / hasil QC
    operator_name VARCHAR(100),                      -- Nama pengrajin / staf QC
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 6. INDEXES UNTUK PERFORMA QUERY
-- ============================================================================

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_customization_id ON order_items(customization_id);

CREATE INDEX idx_plate_customizations_user_id ON plate_customizations(user_id);
CREATE INDEX idx_plate_customizations_created_at ON plate_customizations(created_at DESC);

CREATE INDEX idx_order_production_logs_order_id ON order_production_logs(order_id);

-- ============================================================================
-- 7. TRIGGER OTOMATIS: AUTO-UPDATE UPDATED_AT TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_timestamp_plate_customizations
BEFORE UPDATE ON plate_customizations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================================
-- 8. INITIAL SEED DATA (SESUAI PRESETS APLIKASI CERAMIX 3D)
-- ============================================================================

-- Seed Data Ukuran Piring
INSERT INTO plate_sizes (id, name, diameter_cm, base_price) VALUES
('dinner', 'Dinner Plate', 27.00, 125000.00),
('salad', 'Salad / Pasta Plate', 21.00, 95000.00),
('dessert', 'Dessert / Side Plate', 16.00, 75000.00)
ON CONFLICT (id) DO NOTHING;

-- Seed Data Warna Glasir Keramik
INSERT INTO plate_colors (id, name, hex_code, description) VALUES
('porcelain-white', 'Porcelain White', '#FAF7F2', 'Putih gading porselen klasik berkilau'),
('matte-black', 'Matte Obsidian', '#232326', 'Hitam arang doff modern dan eksklusif'),
('warm-cream', 'Warm Cream', '#E8CCA4', 'Krem vanila hangat bernuansa rustic'),
('sage-green', 'Sage Green', '#7D9678', 'Hijau sage pastel lembut bernuansa alam'),
('dusty-terracotta', 'Terracotta', '#B86851', 'Tanah liat panggang hangat bernuansa bohemian'),
('blush-pink', 'Blush Pastel', '#DE9F9D', 'Merah muda pastel feminin & elegan'),
('deep-navy', 'Midnight Navy', '#1C2938', 'Biru dongker pekat bernuansa royal')
ON CONFLICT (id) DO NOTHING;
