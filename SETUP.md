# HookLab AI - Complete Setup Guide

This guide will walk you through setting up HookLab AI from scratch for the hackathon.

## Prerequisites

- Node.js 18+ installed
- Foundry installed ([getfoundry.sh](https://getfoundry.sh))
- Base wallet with testnet ETH (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
- Accounts for:
  - Supabase
  - Neynar
  - Google AI (Gemini)
  - Coinbase Developer Platform (OnchainKit)

---

## Step 1: Smart Contract Deployment

### 1.1 Build and Test Contract

```bash
cd /home/user/hackathon-hooklabai

# Build contracts
forge build

# Run tests
forge test -vv

# All 19 tests should pass
```

### 1.2 Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env and add:
# PRIVATE_KEY=your_wallet_private_key
# BASE_RPC_URL=https://sepolia.base.org (for testnet)
# ETHERSCAN_API_KEY=your_basescan_api_key
```

### 1.3 Deploy to Base Sepolia (Testnet)

```bash
# Deploy contract
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_RPC_URL \
  --broadcast \
  --verify

# Save the deployed contract address!
# Example output: HookLabSubscription deployed to: 0x...
```

### 1.4 Deploy to Base Mainnet (Production)

```bash
# Only do this when ready for production
BASE_RPC_URL=https://mainnet.base.org

forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://mainnet.base.org \
  --broadcast \
  --verify
```

---

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose a region close to your users
4. Save your project URL and anon key

### 2.2 Run Database Schema

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase-schema.sql`
3. Run the SQL script
4. Verify tables are created: `users`, `quotas`, `usage_logs`

### 2.3 Get API Credentials

- Project URL: `https://your-project.supabase.co`
- Anon Key: Found in Settings → API

---

## Step 3: API Keys Setup

### 3.1 Neynar API Key

1. Go to [neynar.com](https://neynar.com)
2. Sign up and create API key
3. Free tier should be sufficient for hackathon

### 3.2 Google Gemini API Key

1. Go to [ai.google.dev](https://ai.google.dev)
2. Get API key for Gemini
3. Free tier: 60 requests/minute

### 3.3 Coinbase OnchainKit API Key

1. Go to [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com)
2. Create new project
3. Get API key

---

## Step 4: Frontend Setup

### 4.1 Install Dependencies

```bash
cd frontend

# Install all dependencies
npm install

# This will install:
# - Next.js
# - OnchainKit
# - Wagmi & Viem
# - Supabase client
# - React Query
```

### 4.2 Configure Environment

```bash
# Create .env.local file
cp .env.example .env.local

# Edit .env.local and add all your keys:
```

```env
# Chain & Contract
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_CONTRACT_ADDRESS=0x_YOUR_DEPLOYED_CONTRACT_ADDRESS

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Keys (Server-side only)
NEYNAR_API_KEY=your_neynar_api_key
GEMINI_API_KEY=your_gemini_api_key

# OnchainKit
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_coinbase_api_key
```

**Important Notes:**
- Use `84532` for Base Sepolia testnet
- Use `8453` for Base mainnet
- Replace `0x_YOUR_DEPLOYED_CONTRACT_ADDRESS` with actual address from Step 1.3

### 4.3 Run Development Server

```bash
npm run dev

# Open http://localhost:3000
```

---

## Step 5: Testing End-to-End Flow

### 5.1 Connect Wallet

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Use Coinbase Wallet or compatible wallet
4. Ensure you're on Base Sepolia network

### 5.2 Test Free User Flow

1. Choose a topic (e.g., "Base ecosystem")
2. Wait for hooks to generate
3. Select a hook
4. Verify quota is deducted
5. View full content
6. Test "Post to Warpcast" button

### 5.3 Test Premium Subscription

1. Click "Subscribe" button
2. Approve transaction (0.001 ETH)
3. Wait for confirmation
4. Verify "Premium ✨" badge appears
5. Generate hooks - should have unlimited quota

### 5.4 Test Warpcast Integration

1. Generate content
2. Click "Post to Warpcast"
3. Should open Warpcast app or web composer
4. Content should be pre-filled

---

## Step 6: Deployment (Production)

### 6.1 Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
```

### 6.2 Update Contract Address

If deploying to mainnet:
1. Deploy contract to Base mainnet (Step 1.4)
2. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in Vercel
3. Update `NEXT_PUBLIC_CHAIN_ID=8453`

---

## Troubleshooting

### Contract Issues

**Problem:** Tests fail
```bash
# Check Foundry version
forge --version

# Update Foundry
foundryup

# Clean and rebuild
forge clean
forge build
```

**Problem:** Deployment fails
- Ensure wallet has enough ETH
- Check RPC URL is correct
- Verify private key format (should start with 0x)

### Frontend Issues

**Problem:** Module not found errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem:** Wallet won't connect
- Ensure you're on correct network (Base Sepolia)
- Check OnchainKit API key is valid
- Try different wallet (Coinbase Wallet recommended)

**Problem:** API routes return errors
- Check all environment variables are set
- Verify API keys are valid
- Check Supabase tables exist

### API Issues

**Problem:** Neynar API fails
- Check API key is valid
- Verify rate limits not exceeded
- Use fallback hooks if needed (already implemented)

**Problem:** Gemini API fails
- Check API key is valid
- Verify quota not exceeded
- Fallback templates will be used automatically

---

## Hackathon Demo Tips

### 1. Prepare Demo Data

Before demo:
- Deploy contract to testnet
- Create test user with premium subscription
- Generate sample hooks to show variety

### 2. Demo Script (60 seconds)

```
0:00 - "HookLab AI helps creators generate viral Farcaster hooks"
0:10 - Connect wallet (should be instant)
0:15 - "Choose a topic - let's try Base ecosystem"
0:20 - Show hooks generating (with real trend data)
0:30 - "Blind selection - you only see hooks, not full content"
0:35 - Select a hook
0:40 - Show quota deduction
0:45 - Reveal full content
0:50 - "Post directly to Warpcast with one click"
0:55 - Show premium subscription option
1:00 - "All subscription data is onchain on Base"
```

### 3. Key Talking Points

✅ **Onchain Premium:** "Subscription status is verified onchain, not in our database"

✅ **Trend-Jacking:** "We analyze real Base channel engagement data to find what works"

✅ **Blind Selection:** "Users commit to hooks before seeing full content, ensuring authentic engagement"

✅ **Hackathon-Ready:** "Clean architecture with clear separation of concerns"

### 4. What NOT to Claim

❌ "Quota is stored onchain" (it's in Supabase)
❌ "We track token purchases" (we track subscriptions)
❌ "Production-ready scaling" (it's a hackathon MVP)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js + OnchainKit + Mobile-First UI                     │
│  • Wallet connection                                         │
│  • Topic selection                                           │
│  • Blind hook display                                        │
│  • Warpcast deep link                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (API Routes)                      │
│  Next.js API Routes - Single Source of Truth                │
│  • Quota enforcement                                         │
│  • Premium verification (reads contract)                     │
│  • Neynar data fetching                                      │
│  • AI orchestration (Gemini)                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   SMART CONTRACT (Base)                      │
│  Foundry - HookLabSubscription.sol                           │
│  • subscribeMonthly() - x402 payment                         │
│  • isPremium(address) - view function                        │
│  • Subscribed event emission                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Support & Resources

- [Base Documentation](https://docs.base.org)
- [Farcaster Documentation](https://docs.farcaster.xyz)
- [OnchainKit Documentation](https://onchainkit.xyz)
- [Neynar API Docs](https://docs.neynar.com)
- [Foundry Book](https://book.getfoundry.sh)

---

## License

MIT - Built for Base Hackathon
