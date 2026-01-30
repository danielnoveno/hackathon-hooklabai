# HookLab AI - Quick Reference Card

## 🎯 Elevator Pitch (10 seconds)
"HookLab AI helps Farcaster creators generate viral hooks using real Base channel trends, with blind selection and onchain subscriptions."

## 🚀 60-Second Demo Script

**0:00-0:10** - Introduction
- "This is HookLab AI - AI-powered hook generation for Farcaster"
- Connect wallet (should be instant with Coinbase Wallet)

**0:10-0:25** - Show Trend-Jacking
- "Choose a topic - let's try Base ecosystem"
- "We're analyzing real engagement data from the Base channel"
- Show hooks generating

**0:25-0:40** - Blind Selection Mechanism
- "Here's the key innovation: blind selection"
- "You only see hooks, not full content"
- "This ensures authentic engagement"
- Select a hook
- Show quota deduction

**0:40-0:50** - Content Reveal
- "Now we reveal the full content"
- "Generated based on what actually performs well"
- Show full post

**0:50-0:60** - Onchain Premium
- "One click to post to Warpcast"
- "Subscribe onchain for unlimited access"
- "Premium status verified on Base, not in our database"

## 🎨 Key Talking Points

### What Makes It Special

✅ **Blind Selection**
- "Users commit to hooks before seeing full content"
- "This prevents gaming the system"
- "Ensures authentic creator choice"

✅ **Trend-Jacking**
- "We analyze real Farcaster engagement data"
- "Calculate hook strength: (likes + recasts + replies) / followers"
- "AI learns from what actually works"

✅ **Onchain Premium**
- "Subscription payment is onchain on Base"
- "Premium status verified via smart contract"
- "No centralized database for access control"

✅ **Clean Architecture**
- "Smart contract ONLY handles payment"
- "Backend is single source of truth for quota"
- "Frontend never calls AI directly"

### What NOT to Claim

❌ "Quota is stored onchain" → It's in Supabase
❌ "We track token purchases" → We track subscriptions
❌ "Production-ready scaling" → It's a hackathon MVP
❌ "Advanced AI reasoning" → It's prompt-based

## 📊 Technical Stack (If Asked)

**Smart Contract:** Foundry, Solidity, Base
**Frontend:** Next.js, OnchainKit, Wagmi, Viem
**Backend:** Next.js API Routes
**AI:** Google Gemini
**Data:** Neynar API (Farcaster), Supabase
**Deployment:** Vercel + Base

## 🔧 Live Demo Checklist

### Before Demo
- [ ] Contract deployed to Base
- [ ] Frontend deployed to Vercel
- [ ] All API keys configured
- [ ] Supabase database set up
- [ ] Demo wallet funded with Base ETH
- [ ] Test full flow 3 times
- [ ] Have backup screenshots ready

### During Demo
- [ ] Start with wallet already connected (save time)
- [ ] Use quick topic button (faster than typing)
- [ ] Have premium subscription ready to show
- [ ] Show Warpcast deep link working
- [ ] Mention Base ecosystem integration

### If Something Breaks
- [ ] Fallback to screenshots
- [ ] Explain architecture anyway
- [ ] Show smart contract tests passing
- [ ] Emphasize clean code structure

## 💡 Q&A Preparation

**Q: Why not store quota onchain?**
A: "For hackathon speed and flexibility. In production, we'd consider L2 storage or optimistic rollups. The important part - premium status - IS onchain."

**Q: How do you prevent AI from generating duplicate content?**
A: "High temperature (0.9) for creativity, and we use trend patterns as inspiration, not templates. Each generation is unique."

**Q: What if Neynar API fails?**
A: "We have fallback template-based hooks. The demo always works. In production, we'd add caching and multiple data sources."

**Q: How does blind selection improve engagement?**
A: "Creators choose based on hook quality, not full content. This mirrors real social media behavior - you commit to a post idea before fully writing it."

**Q: Why Gemini instead of GPT?**
A: "Cost and speed for hackathon. Gemini has generous free tier and fast response times. Architecture supports swapping LLMs."

**Q: How do you verify premium status?**
A: "Backend reads isPremium(address) directly from the smart contract on Base. Trustless verification."

## 📱 Demo URLs

**Frontend:** https://your-app.vercel.app
**Contract (Sepolia):** https://sepolia.basescan.org/address/0x...
**Contract (Mainnet):** https://basescan.org/address/0x...
**GitHub:** https://github.com/your-username/hooklab-ai

## 🎬 Backup Plan

If live demo fails:
1. Show smart contract tests passing
2. Walk through code architecture
3. Show screenshots of working flow
4. Emphasize clean separation of concerns
5. Discuss Base ecosystem alignment

## 🏆 Winning Points

1. **Solves Real Problem:** Creators struggle with hook generation
2. **Base Integration:** Onchain payments, Farcaster native
3. **Clean Architecture:** Defensible technical decisions
4. **Hackathon Feasible:** Actually works, not vaporware
5. **Creator Monetization:** Aligns with Base ecosystem goals

## 📞 Emergency Contacts

- Supabase Status: status.supabase.com
- Base Status: status.base.org
- Neynar Status: status.neynar.com

## 🎯 Success Metrics

- ✅ Demo completes in <60 seconds
- ✅ All features work live
- ✅ Architecture questions answered confidently
- ✅ Judges understand the value prop
- ✅ Technical decisions are defensible

---

**Remember:** You built a complete, working product. Be confident, be honest, and show the value you're creating for Farcaster creators on Base.

Good luck! 🚀
