# Deployment Guide

This guide will help you deploy the Open Source Pay-per-Contribution platform.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Ethereum wallet with testnet ETH (for Sepolia)
- GitHub account for webhook integration

## 1. Smart Contract Deployment

### Deploy to Sepolia Testnet

```bash
cd contracts

# Set environment variables
export PRIVATE_KEY="your_private_key_here"
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"

# Deploy contracts
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

### Update Backend Configuration

After deployment, update your backend `.env` file with the deployed contract addresses:

```env
CHANNEL_FACTORY_ADDRESS="0x..."
```

## 2. Backend Deployment

### Local Development

```bash
cd backend

# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### Production Deployment (Railway)

1. Create a Railway account
2. Connect your GitHub repository
3. Add environment variables:
   - `DATABASE_URL`
   - `ETHEREUM_RPC_URL`
   - `PRIVATE_KEY`
   - `GITHUB_WEBHOOK_SECRET`
   - `GITHUB_TOKEN`
4. Deploy

## 3. Web Application Deployment

### Local Development

```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_BACKEND_URL`
3. Deploy

## 4. GitHub Integration

### Set Up Webhooks

1. Go to your GitHub repository settings
2. Navigate to "Webhooks"
3. Add webhook with URL: `https://your-backend-url.com/api/github/webhook`
4. Set content type to `application/json`
5. Select events: `Pull requests`, `Issues`, `Pushes`
6. Add secret and save

### Configure GitHub Token

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with repo access
3. Add to backend environment variables

## 5. Database Setup

### Local PostgreSQL

```bash
# Create database
createdb opensource_payments

# Run migrations
cd backend
npx prisma db push
```

### Production Database

Use a managed PostgreSQL service like:
- Railway PostgreSQL
- Supabase
- PlanetScale
- AWS RDS

## 6. Testing the Deployment

### 1. Create a Test Project

1. Connect your wallet to the web application
2. Create a new project
3. Verify it appears in the database

### 2. Test GitHub Integration

1. Make a test commit to your repository
2. Check if it appears in the contributions list
3. Verify webhook is working

### 3. Test Smart Contracts

1. Create a channel between owner and contributor
2. Make a test contribution
3. Verify state updates work correctly

## 7. Monitoring and Maintenance

### Backend Monitoring

- Set up logging for webhook events
- Monitor database performance
- Track API usage

### Smart Contract Monitoring

- Monitor contract events
- Track channel creation and settlements
- Monitor for any failed transactions

### Web Application Monitoring

- Monitor user engagement
- Track conversion rates
- Monitor performance metrics

## 8. Security Considerations

### Smart Contracts

- Always test on testnet first
- Use multi-signature wallets for production
- Regularly audit contract code

### Backend Security

- Use HTTPS for all endpoints
- Validate all webhook signatures
- Implement rate limiting
- Use environment variables for secrets

### Web Application Security

- Implement proper authentication
- Use HTTPS in production
- Validate all user inputs
- Implement CSRF protection

## 9. Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is correct
   - Verify webhook secret matches
   - Check backend logs for errors

2. **Smart contract transactions failing**
   - Check gas prices
   - Verify contract addresses
   - Check RPC endpoint is working

3. **Database connection issues**
   - Verify DATABASE_URL is correct
   - Check database is running
   - Verify network connectivity

### Support

For issues and questions:
- Check the GitHub repository issues
- Join our Discord community
- Contact the development team

