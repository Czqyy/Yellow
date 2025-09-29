# Open Source Pay-per-Contribution

A decentralized platform that enables instant micro-payments for open-source contributions using state channels. Project owners can deposit funds and pay contributors instantly for each accepted contribution, without the high fees and delays of traditional payment systems.

## 🌟 Features

- **Instant Micro-Payments**: Pay contributors $1-$10 per contribution instantly using state channels
- **Smart Contract Integration**: Secure, trustless payments via Ethereum smart contracts
- **GitHub Integration**: Automatic contribution tracking via GitHub webhooks
- **Modern Web Interface**: Built with Next.js, TypeScript, and Tailwind CSS
- **Wallet Integration**: Connect with MetaMask, WalletConnect, and other wallets
- **Real-time Updates**: Live contribution status and payment tracking

## 🏗️ Architecture

### Smart Contracts (Foundry)
- **ChannelFactory**: Creates state channels between project owners and contributors
- **Channel**: Manages off-chain state updates and on-chain settlement
- **ERC-20 Support**: Works with any ERC-20 token or ETH

### Backend Service (Node.js/TypeScript)
- **REST API**: Project, channel, and contribution management
- **GitHub Webhooks**: Automatic contribution detection
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Off-chain state coordination

### Web Application (Next.js)
- **Project Management**: Create and manage open-source projects
- **Contribution Tracking**: View and manage contributions
- **Wallet Integration**: RainbowKit + Wagmi for wallet connectivity
- **Real-time UI**: Modern, responsive interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Git
- Foundry (for smart contracts)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd open-source-pay-per-contribution
```

### 2. Set Up Smart Contracts
```bash
cd contracts
forge install
forge build
forge test
```

### 3. Set Up Backend
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database URL and other settings
npx prisma generate
npx prisma db push
npm run dev
```

### 4. Set Up Web Application
```bash
cd web
npm install
cp .env.example .env.local
# Edit .env.local with your settings
npm run dev
```

### 5. Deploy Smart Contracts
```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
```

## 📁 Project Structure

```
open-source-pay-per-contribution/
├── contracts/                 # Smart contracts (Foundry)
│   ├── src/
│   │   ├── ChannelFactory.sol
│   │   ├── Channel.sol
│   │   └── MockERC20.sol
│   ├── test/
│   └── foundry.toml
├── backend/                   # Backend service (Node.js/TypeScript)
│   ├── src/
│   │   ├── routes/
│   │   ├── index.ts
│   │   └── ...
│   ├── prisma/
│   └── package.json
├── web/                       # Web application (Next.js)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── ...
│   └── package.json
└── docs/                     # Documentation
    └── PRODUCT_IDEA.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/opensource_payments"
ETHEREUM_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
PRIVATE_KEY="your_private_key_here"
GITHUB_WEBHOOK_SECRET="your_github_webhook_secret"
GITHUB_TOKEN="your_github_token"
PORT=3001
```

#### Web Application (.env.local)
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
```

## 🎯 How It Works

### 1. Project Creation
- Project owners create projects and deposit funds
- Smart contracts create state channels for each contributor
- GitHub webhooks are configured for automatic contribution tracking

### 2. Contribution Flow
- Contributors make contributions (PRs, issues, commits)
- GitHub webhooks detect contributions
- Project owners review and approve contributions
- Off-chain state updates credit contributors instantly

### 3. Settlement
- State channels can be settled on-chain at any time
- Final balances are distributed to contributors
- No gas fees for individual contributions (only settlement)

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
forge test
```

### Backend API
```bash
cd backend
npm test
```

### Web Application
```bash
cd web
npm test
```

## 🚀 Deployment

### Smart Contracts
1. Deploy to testnet (Sepolia)
2. Verify contracts on Etherscan
3. Update contract addresses in backend

### Backend
1. Set up PostgreSQL database
2. Configure environment variables
3. Deploy to your preferred platform (Railway, Heroku, etc.)

### Web Application
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Product Documentation](docs/PRODUCT_IDEA.md)
- [Smart Contract Documentation](contracts/README.md)
- [Backend Documentation](backend/README.md)
- [Web Application Documentation](web/README.md)

## 💡 Future Enhancements

- Multi-signature channels for team projects
- Reputation scoring system
- AI-powered contribution pricing
- Mobile application
- Integration with more Git platforms (GitLab, Bitbucket)
- Advanced analytics and reporting