# Trending Posts Feature - Implementation Guide

## 📋 Overview

Saya telah menambahkan section baru di Landing Page yang menampilkan postingan viral dari Base ecosystem yang telah di-scrape. Section ini muncul **di atas FAQ section** dan menampilkan postingan dalam bentuk card yang mirip dengan Threads/Base posts.

## ✨ Fitur yang Ditambahkan

### 1. **API Route** (`/api/posts`)
- **File**: `frontend/app/api/posts/route.ts`
- Mengambil top 6 posts dari Supabase berdasarkan `total_engagement`
- Mengembalikan data dalam format JSON

### 2. **PostCard Component**
- **File**: `frontend/app/components/PostCard.tsx`
- Menampilkan card postingan dengan style Threads/Base
- Fitur:
  - Author info (avatar, display name, username)
  - Post content (dengan line-clamp untuk text panjang)
  - Engagement stats (likes, comments, recasts, total engagement)
  - Timestamp relatif (e.g., "2d ago", "5h ago")
  - Hover effects yang smooth
  - Badge "Base" di pojok kanan atas

### 3. **TrendingPosts Section**
- **File**: `frontend/app/components/TrendingPosts.tsx`
- Section utama yang menampilkan grid posts
- Fitur:
  - Loading state dengan spinner
  - Error handling (section tidak muncul jika error)
  - Responsive grid (1 kolom mobile, 2 tablet, 3 desktop)
  - Animasi fade-in dengan stagger effect
  - Header dengan badge "Powered by Real Data"

### 4. **Navigation Update**
- Menambahkan link "Trending" ke navigation menu
- Smooth scroll ke section trending

## 🗄️ Database Schema

### Struktur Tabel `posts`

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  hash TEXT UNIQUE NOT NULL,
  text TEXT NOT NULL,
  author_display_name TEXT,
  author_username TEXT,
  author_pfp_url TEXT,
  author_fid INTEGER,
  timestamp TIMESTAMP NOT NULL,
  total_engagement INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  recasts_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Setup Instructions

### Step 1: Buat Tabel di Supabase

1. Buka Supabase Dashboard: https://dakukppdidwacascbmlh.supabase.co
2. Pergi ke **SQL Editor**
3. Jalankan script dari file: `supabase-posts-schema.sql`

### Step 2: Seed Data ke Supabase

Ada 2 cara untuk mengisi data:

#### Cara 1: Menggunakan Script (Recommended)

```bash
cd frontend
npx tsx scripts/seed-posts.ts
```

Script ini akan:
- Membaca data dari `data/analyzed_posts.json`
- Transform data sesuai schema
- Insert ke Supabase dalam batch
- Menampilkan progress dan hasil

#### Cara 2: Manual Insert via Supabase Dashboard

1. Buka Supabase Dashboard
2. Pergi ke **Table Editor** → `posts`
3. Import data dari `data/analyzed_posts.json` (perlu transform manual)

### Step 3: Verifikasi

1. Pastikan dev server masih running:
```bash
npm run dev
```

2. Buka browser: http://localhost:3000

3. Scroll ke bawah sampai section "Trending on Base"

4. Pastikan:
   - Posts muncul dengan benar
   - Avatar author tampil
   - Engagement stats terlihat
   - Hover effects bekerja
   - Navigation "Trending" berfungsi

## 📊 Data Source

Data postingan diambil dari:
- **Source**: Farcaster /base channel via Neynar API
- **File**: `data/analyzed_posts.json`
- **Total Posts**: ~8 posts (dari file yang ada)
- **Metrics**: likes, recasts, replies, total_engagement

## 🎨 Design Features

### Card Design
- **Background**: Glass morphism effect (`bg-white/5 backdrop-blur-xl`)
- **Border**: Subtle white border yang glow saat hover
- **Avatar**: Rounded dengan ring effect
- **Badge**: "Base" badge di pojok kanan atas
- **Stats Icons**: SVG icons untuk likes, comments, recasts

### Animations
- **Fade-in**: Setiap card fade-in dengan stagger delay
- **Hover**: Smooth transition untuk border, background, dan colors
- **Scroll**: Smooth scroll dari navigation

### Responsive
- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 3 columns

## 🔧 Troubleshooting

### Posts tidak muncul?

1. **Check Supabase Connection**:
```bash
cd frontend
npx tsx scripts/test-supabase.ts
```

2. **Check API Response**:
- Buka browser console
- Pergi ke Network tab
- Cari request ke `/api/posts`
- Periksa response

3. **Check Database**:
- Buka Supabase Dashboard
- Pergi ke Table Editor → `posts`
- Pastikan ada data

### Error saat seed?

1. Pastikan file `.env` sudah benar:
```env
NEXT_PUBLIC_SUPABASE_URL=https://dakukppdidwacascbmlh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

2. Pastikan tabel `posts` sudah dibuat di Supabase

3. Check error message di console

## 📁 File Structure

```
frontend/
├── app/
│   ├── api/
│   │   └── posts/
│   │       └── route.ts          # API endpoint
│   ├── components/
│   │   ├── LandingPage.tsx       # Updated with TrendingPosts
│   │   ├── TrendingPosts.tsx     # Main section component
│   │   └── PostCard.tsx          # Individual post card
│   └── lib/
│       └── supabaseClient.ts     # Supabase client
├── scripts/
│   ├── seed-posts.ts             # Seed script
│   └── test-supabase.ts          # Test connection
└── .env                          # Environment variables

supabase-posts-schema.sql         # Database schema
data/
└── analyzed_posts.json           # Source data
```

## 🎯 Next Steps (Optional)

1. **Pagination**: Tambahkan load more atau infinite scroll
2. **Filtering**: Filter by category atau engagement level
3. **Search**: Tambahkan search functionality
4. **Real-time**: Update posts secara real-time dari Neynar API
5. **Analytics**: Track which posts users click

## 📝 Notes

- Section ini hanya muncul jika ada data di database
- Jika error atau tidak ada posts, section akan hidden
- Loading state ditampilkan saat fetching data
- Data di-cache oleh browser untuk performa lebih baik

## 🙏 Credits

- **Data Source**: Neynar API (Farcaster)
- **Design Inspiration**: Threads, Base, Warpcast
- **Icons**: Heroicons (via SVG)
