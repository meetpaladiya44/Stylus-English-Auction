# 🏆 English Auction Contract

A decentralized English Auction smart contract built with Rust and Stylus, featuring a modern Next.js frontend for seamless interaction.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Smart Contract Details](#smart-contract-details)
- [Frontend Features](#frontend-features)
- [Setup Instructions](#setup-instructions)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The English Auction Contract is a decentralized auction system that allows users to auction ERC721 NFTs through a transparent, time-based bidding process. Built on Arbitrum Sepolia testnet using Stylus (Rust-based smart contracts), it provides a secure and efficient way to conduct NFT auctions.

### Key Highlights

- **Rust-based Smart Contract**: High performance and security with Stylus
- **Modern Web Interface**: Beautiful, responsive Next.js frontend
- **Real-time Updates**: Live transaction tracking and status updates
- **Comprehensive UI**: Detailed ownership checks, approval management, and flow guidance
- **Block Explorer Integration**: Complete transaction history and blockchain verification

## ✨ Features

### 🏗️ Smart Contract Features

- **One-time Initialization**: Secure auction setup with immutable parameters
- **NFT Transfer Management**: Automatic NFT custody during auction period
- **7-Day Auction Period**: Configurable auction duration
- **Bid Management**: Higher bid replacement with automatic refunds
- **Withdrawal System**: Refund mechanism for outbid participants
- **End Game Logic**: Automatic winner determination and asset distribution

### 🎨 Frontend Features

- **Interactive Dashboard**: Real-time auction status and bidding interface
- **NFT Ownership Verification**: Comprehensive ownership and approval checks
- **Transaction History**: Complete block explorer with transaction tracking
- **Status Indicators**: Visual feedback for all operations
- **Responsive Design**: Mobile-friendly interface
- **Error Handling**: Detailed error messages and recovery guidance

### 🔒 Security Features

- **Ownership Verification**: Ensures only NFT owners can start auctions
- **Approval Management**: Secure NFT transfer permissions
- **Bid Validation**: Prevents invalid or low bids
- **Time-based Security**: Auction end enforcement
- **Refund Protection**: Secure withdrawal mechanism

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  • Debug Interface    • Block Explorer    • Status UI     │
│  • Transaction Mgmt   • NFT Verification  • Error Handling│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                English Auction Contract                     │
│                    (Rust + Stylus)                         │
├─────────────────────────────────────────────────────────────┤
│  • Initialize        • Start Auction      • Bid Management │
│  • Withdraw          • End Auction        • NFT Transfer   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                ERC721 NFT Contract                         │
│                  (Test Contract)                           │
├─────────────────────────────────────────────────────────────┤
│  • 100 Test NFTs     • Token IDs 1-100   • Arbitrum Sepolia│
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Smart Contract Details

### Contract Address
```
0x4e16ec2bae1c7806664438002f4d23c57b8e593c
```
**Network**: Arbitrum Sepolia Testnet

### Core Functions

#### 1. Initialize Auction
```rust
pub fn initialize(&mut self, nft: Address, nft_id: U256, starting_bid: U256) -> Result<(), EnglishAuctionError>
```
- **Purpose**: Set up auction parameters
- **Requirements**: Contract not already initialized
- **Sets**: NFT address, token ID, seller, starting bid
- **One-time only**: Cannot be changed after initialization

#### 2. Start Auction
```rust
pub fn start(&mut self) -> Result<(), EnglishAuctionError>
```
- **Purpose**: Begin the 7-day auction period
- **Requirements**: Only seller can call, NFT ownership verified
- **Actions**: Transfers NFT to contract, sets end time
- **One-time only**: Cannot be restarted

#### 3. Place Bid
```rust
#[payable]
pub fn bid(&mut self) -> Result<(), EnglishAuctionError>
```
- **Purpose**: Submit bids during auction
- **Requirements**: Auction active, bid higher than current highest
- **Actions**: Updates highest bidder, refunds previous bidder
- **Multiple calls**: Can bid multiple times

#### 4. Withdraw Refunds
```rust
pub fn withdraw(&mut self) -> Result<(), EnglishAuctionError>
```
- **Purpose**: Withdraw refundable bids
- **Requirements**: Must have refundable balance
- **Actions**: Transfers ETH back to bidder
- **Multiple calls**: Can withdraw multiple times

#### 5. End Auction
```rust
pub fn end(&mut self) -> Result<(), EnglishAuctionError>
```
- **Purpose**: Conclude auction after 7 days
- **Requirements**: 7-day period elapsed, auction not already ended
- **Actions**: Distributes NFT to winner, ETH to seller
- **One-time only**: Cannot be called twice

### Error Handling

| Error | Description |
|-------|-------------|
| `AlreadyInitialized` | Contract already initialized |
| `AlreadyStarted` | Auction already started |
| `NotSeller` | Only seller can perform action |
| `AuctionEnded` | Auction has concluded |
| `BidTooLow` | Bid amount too low |
| `NotStarted` | Auction not started yet |
| `NotEnded` | 7-day period not elapsed |

## 🎨 Frontend Features

### Debug Interface (`/debug`)

#### 1. Contract Information Display
- **Contract Address**: Prominently displayed with copy functionality
- **Network Information**: Arbitrum Sepolia testnet details
- **Block Explorer Links**: Direct access to Arbiscan

#### 2. Auction Management
- **Initialize Auction**: Set up NFT and starting bid
- **Start Auction**: Begin 7-day auction period
- **Place Bids**: Submit bids during active auction
- **Withdraw/End**: Manage refunds and conclude auction

#### 3. NFT Verification System
- **Ownership Check**: Verify NFT ownership
- **Approval Management**: Approve auction contract for transfers
- **Status Display**: Real-time ownership and approval status
- **Error Handling**: Clear guidance for common issues

#### 4. Visual Status Indicators
- **Operation Icons**: 🚀 Initialize, ▶️ Start, 💰 Bid, 💸 Withdraw, 🏁 End
- **Status Colors**: Green (success), Blue (pending), Red (error)
- **Progress Tracking**: Step-by-step completion indicators

### Block Explorer (`/blockexplorer`)

#### 1. Transaction History
- **Complete Log**: All transactions with timestamps
- **Status Tracking**: Real-time status updates
- **Operation Details**: Clear operation descriptions

#### 2. Statistics Dashboard
- **Total Transactions**: Count of all operations
- **Success Rate**: Successful vs failed transactions
- **Pending Count**: Currently processing transactions

#### 3. Interactive Features
- **Copy Hashes**: One-click transaction hash copying
- **Blockchain Links**: Direct Arbiscan integration
- **Search & Filter**: Easy transaction lookup

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Rust toolchain
- Stylus CLI
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd erc20-buildathon2
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd packages/nextjs
npm install

# Install Rust dependencies (if building contract)
cd ../english-auction
cargo stylus build
```

### 3. Environment Setup

Create `.env.local` in `packages/nextjs/`:

```env
NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_PRIVATE_KEY=your_private_key_here
```

### 4. Deploy Contract (Optional)

```bash
cd packages/english-auction
cargo stylus deploy
```

### 5. Start Development Server

```bash
cd packages/nextjs
npm run dev
```

## 📖 Usage Guide

### For Demo Users (Quick Start)

1. **Visit the Debug Page**: Navigate to `/debug`
2. **Use Test NFT**: Click "Use Test NFT" to auto-fill contract address
3. **Enter Token ID**: Use any ID between 1-100
4. **Set Starting Bid**: Enter minimum bid amount in ETH
5. **Initialize Auction**: Click "Initialize Auction"
6. **Check Ownership**: Verify NFT ownership status
7. **Approve Contract**: Allow contract to transfer NFT
8. **Start Auction**: Begin the 7-day auction period
9. **Place Bids**: Submit bids during active auction
10. **End Auction**: Conclude after 7 days

### For Developers (Full Setup)

1. **Clone Repository**: Get the complete codebase
2. **Set Up Environment**: Configure private key and RPC URL
3. **Deploy Contract**: Deploy your own auction contract
4. **Use Own NFTs**: Deploy and use your own ERC721 contracts
5. **Customize UI**: Modify frontend as needed

### Step-by-Step Auction Process

#### Phase 1: Initialization
```typescript
// 1. Enter NFT contract address
const nftAddress = "0xf7486B2D17Cdf217395B2AE7F281335546bdeb3C";

// 2. Set token ID (1-100 for test contract)
const tokenId = "1";

// 3. Set starting bid in ETH
const startingBid = "0.1";

// 4. Initialize auction
await contract.initialize(nftAddress, tokenId, startingBid);
```

#### Phase 2: Starting Auction
```typescript
// 1. Check NFT ownership
const isOwner = await checkNFTOwnership();

// 2. Approve auction contract (if needed)
await nftContract.approve(auctionContractAddress, tokenId);

// 3. Start auction
await contract.start();
```

#### Phase 3: Bidding
```typescript
// 1. Place bid (must be higher than current highest)
const bidAmount = "0.2"; // in ETH
await contract.bid({ value: ethers.parseEther(bidAmount) });

// 2. Withdraw refunds (if outbid)
await contract.withdraw();
```

#### Phase 4: Ending Auction
```typescript
// 1. End auction (after 7 days)
await contract.end();
```

## 🔌 API Reference

### Contract Functions

| Function | Type | Parameters | Returns | Description |
|----------|------|------------|---------|-------------|
| `initialize` | Write | `nft`, `nft_id`, `starting_bid` | `()` | Initialize auction |
| `start` | Write | None | `()` | Start auction |
| `bid` | Payable | None | `()` | Place bid |
| `withdraw` | Write | None | `()` | Withdraw refunds |
| `end` | Write | None | `()` | End auction |
| `nft` | View | None | `address` | Get NFT address |
| `nftId` | View | None | `uint256` | Get token ID |
| `seller` | View | None | `address` | Get seller address |
| `started` | View | None | `bool` | Check if started |
| `ended` | View | None | `bool` | Check if ended |
| `highestBidder` | View | None | `address` | Get highest bidder |
| `highestBid` | View | None | `uint256` | Get highest bid |
| `bids` | View | `address` | `uint256` | Get bidder's refundable amount |

### Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `Start` | None | Auction started |
| `Bid` | `sender`, `amount` | Bid placed |
| `Withdraw` | `bidder`, `amount` | Refund withdrawn |
| `End` | `winner`, `amount` | Auction ended |

## 🧪 Testing

### Unit Tests

```bash
cd packages/english-auction
cargo test
```

### Integration Tests

```bash
cd packages/nextjs
npm run test
```

### Manual Testing

1. **Initialize Auction**: Test with valid/invalid parameters
2. **Start Auction**: Test ownership and approval requirements
3. **Place Bids**: Test bid validation and refund logic
4. **Withdraw**: Test refund mechanism
5. **End Auction**: Test end conditions and distribution

## 🚀 Deployment

### Contract Deployment

```bash
cd packages/english-auction
cargo stylus build
cargo stylus deploy --private-key <your_private_key>
```

### Frontend Deployment

```bash
cd packages/nextjs
npm run build
npm run start
```

### Environment Variables

```env
# Required
NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_PRIVATE_KEY=your_private_key

# Optional
NEXT_PUBLIC_CONTRACT_ADDRESS=0x4e16ec2bae1c7806664438002f4d23c57b8e593c
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Rust best practices for smart contracts
- Use TypeScript for frontend code
- Write comprehensive tests
- Update documentation for new features
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🙏 Acknowledgments

- **Stylus Team**: For the Rust-based smart contract platform
- **Arbitrum**: For the Layer 2 scaling solution
- **Next.js Team**: For the React framework
- **Ethers.js**: For Ethereum interaction library

---

**Built with ❤️ using Rust, Stylus, and Next.js**
