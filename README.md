# NaloDAO 🌱

A Web3-native DAO platform that tracks regenerative activities, governs community proposals, and manages a multi-chain token ecosystem across Solana and Move-based blockchains.

## 🎯 Vision

**"A New Economy for Earth"** - Building a decentralized platform where regenerative activities are tracked, rewarded, and governed by the community.

## 🚀 Tech Stack

### Frontend
- **React 18** + **Vite** - Modern, fast development
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing

### Backend & Database
- **Supabase** - Postgres + Auth + Storage + Realtime
- **Rust + Axum** - High-performance backend (future)

### Blockchain Integration
- **Solana** - Solana Web3.js + Anchor
- **Move-based** - Aptos SDK + Sui SDK
- **Wallet Connect** - Multi-wallet support

### Storage & Hosting
- **IPFS** - Decentralized file storage
- **Vercel** - Frontend hosting
- **Fly.io/Supabase Edge Functions** - Backend hosting

## 🏗️ Project Structure

```
naloDAO/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── stores/         # Zustand stores
│   │   ├── services/       # API and blockchain services
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Rust + Axum backend (future)
├── contracts/              # Smart contracts
│   ├── solana/            # Solana programs
│   └── move/              # Move modules
├── docs/                   # Documentation
└── scripts/               # Development scripts
```

## 🎯 Core Features

### Sprint 1 (Current) ✅
- [x] Landing page with hero section
- [x] Authentication (Supabase + Wallet Connect)
- [x] User profile system
- [x] Responsive design with dark/light mode

### Sprint 2 (Next)
- [ ] Activity logging with IPFS
- [ ] Activity feed and history
- [ ] Impact calculation system

### Sprint 3
- [ ] DAO governance (proposals + voting)
- [ ] Token balance tracking
- [ ] Multi-chain wallet integration

### Sprint 4
- [ ] Interactive impact map
- [ ] Real-time activity sync
- [ ] Geographic data visualization

### Sprint 5
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Activity verification system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `.env.local` in the frontend directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

## 🌱 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🌍 Impact

NaloDAO is building the infrastructure for a regenerative economy where:
- Every tree planted is tracked and rewarded
- Every community proposal is democratically governed
- Every impact is visible on a global map
- Every participant owns a piece of the future

Join us in building **A New Economy for Earth** 🌱
