# HookLab AI (Frontend)

Platform AI Agent yang menghasilkan "killer hooks" dan visual menarik untuk sosial media (Farcaster/Warpcast), terintegrasi dengan pembayaran Crypto (Base Network).

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- [Foundry](https://getfoundry.sh/) (Jika ingin menjalankan Anvil/Localhost Blockchain)

### 2. Installation
```bash
cd frontend
npm install
```

### 3. Environment Setup
Copy `.env.example` (atau buat baru) ke `.env.local`:

```bash
# === BLOCKCHAIN CONFIG ===
# 84532 = Base Sepolia (Testnet)
# 31337 = Anvil (Local)
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (Alamat Smart Contract)

# === AI CONFIG (EIGEN AI) ===
EIGEN_API_KEY=sk-...
EIGEN_BASE_URL=https://api-web.eigenai.com/api/v1
EIGEN_TEXT_MODEL=gpt-oss-120b
EIGEN_IMAGE_MODEL=eigen-image

# === 3RD PARTY KEYS ===
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEYNAR_API_KEY=...
NEXT_PUBLIC_ONCHAINKIT_API_KEY=...

# === DEVELOPER MODE ===
# Bypass pembayaran wallet (GRATIS)
NEXT_PUBLIC_MOCK_PAYMENT=true
# Gunakan data dummy tanpa panggil API AI
NEXT_PUBLIC_USE_MOCK_AI=false
```

---

## ⚙️ Network Setup (Switching)

Aplikasi ini mendukung perpindahan dinamis antara **Localhost** dan **Testnet**.

### Mode Local (Anvil) - Development Gratis
Setup ini mem bypass waiting time transaksi blockchain asli.

1.  Jalankan Anvil di terminal terpisah:
    ```bash
    anvil
    ```
2.  Update `.env.local`:
    ```bash
    NEXT_PUBLIC_CHAIN_ID=31337
    NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (Ambil yg didapat saat deploy contract ke anvil)
    ```

### Mode Testnet (Base Sepolia) - Demo Public
Setup ini menggunakan blockchain asli (Testnet).

1.  Update `.env.local`:
    ```bash
    NEXT_PUBLIC_CHAIN_ID=84532
    NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (Alamat Contract Sepolia)
    ```

**Catatan:** Saat tombol "Pay" diklik, aplikasi akan otomatis meminta Wallet pengguna untuk pindah ke network yang sesuai dengan `NEXT_PUBLIC_CHAIN_ID`.

---

## 🛠️ Developer Features

### Mock Payment (Bypass Wallet)
Jika Anda malas menandatangani transaksi setiap kali tes generate gambar:
Set `NEXT_PUBLIC_MOCK_PAYMENT=true`.
Aplikasi akan melewatkan langkah `sendTransaction` dan langsung memanggil API Image Generation.

### Eigen AI Troubleshooting
Jika `generate-image` error:
- Pastikan `EIGEN_IMAGE_MODEL=eigen-image`.
- Pastikan `EIGEN_BASE_URL` mengarah ke endpoint yang benar.
- Cek script manual di `verify-eigen-image.js` untuk tes koneksi independen.

## ▶️ Running App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)
