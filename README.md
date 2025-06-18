# ![Fundraiser Platform](https://dapps-crowdfunding.vercel.app/Logo.svg) Fundraiser - Decentralized Blockchain Crowdfunding Platform on Ethereum

## Live Demo

[https://dapps-crowdfunding.vercel.app/](https://dapps-crowdfunding.vercel.app/)

## Overview

Fundraiser is a Web3 crowdfunding platform built on the Ethereum blockchain that allows users to create, fund, and manage fundraising campaigns in a transparent and trustless manner. Leveraging smart contract technology, the platform implements a unique approval mechanism where campaigns require community validation before becoming active, ensuring quality and legitimacy in the decentralized finance (DeFi) space.

## Key Features

- **Blockchain-Based Campaign Creation**: Anyone can create a fundraising campaign with a title, description, funding goal, and deadline on the Ethereum network.
- **Web3 Direct Donations**: Users can donate ETH directly to campaigns through secure smart contract transactions without intermediaries.
- **Decentralized Community Approval System**: New campaigns require approval tokens from the community before becoming active, creating a self-governing ecosystem.
- **Transparent On-Chain Fund Management**: All transactions are recorded on the Ethereum blockchain, ensuring complete transparency and immutability.
- **Tokenized Approval Economy**: Users earn approval tokens by donating to active campaigns, which they can use to approve new campaigns, creating a sustainable Web3 ecosystem.
- **Automatic Smart Contract Activation**: First few campaigns are automatically approved via smart contracts to bootstrap the platform.
- **Trustless Deadline-based Withdrawals**: Campaign creators can only withdraw funds after reaching their target or after the deadline has passed, enforced by smart contract logic.

## Technology Stack

### Blockchain & Smart Contracts

- Solidity ^0.8.28 for secure smart contract development
- Hardhat 2.24.0 Ethereum development environment
- Ethers.js 6.14.1 for blockchain interaction
- Ethereum Web3 infrastructure
- Smart contract security best practices

### Frontend & Web3 Integration

- React 19
- Vite
- Tailwind CSS
- React Router
- Ethers.js for Web3 wallet integration
- MetaMask connectivity for blockchain transactions

## Smart Contract Architecture

The dApp consists of two main Ethereum smart contracts:

1. **CampaignFactory**: Manages the creation of campaigns and tracks active/inactive campaigns on the blockchain. It also handles the approval token economy and implements the governance mechanism.

2. **Campaign**: Individual campaign smart contract that manages donations, approvals, and withdrawals for a specific fundraising initiative with built-in security measures.

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MetaMask or other Ethereum wallet
- Basic understanding of blockchain transactions

### Local Blockchain Development

1. Clone the repository:

```bash
git clone https://github.com/ahmdyaasiin/dapp-crowdfunding
cd dapp-crowdfunding
```

2. Install dependencies:

```bash
npm install
cd web
npm install
```

3. Start a local Hardhat Ethereum node:

```bash
npx hardhat node
```

4. Deploy smart contracts to local network:

```bash
npx hardhat ignition deploy ./ignition/modules/CampaignFactory.js --network localhost
```

5. Start the frontend Web3 development server:

```bash
cd web
npm run dev
```

6. Connect MetaMask to your local Hardhat Ethereum network (usually http://127.0.0.1:8545)

### Deployment to Ethereum Testnet

1. Configure your `.env` file with your private key and Infura/Alchemy API URL:

```
PRIVATE_KEY=your_private_key
API_URL=your_infura_or_alchemy_url
ETHERSCAN_API_KEY=your_etherscan_api_key
```

2. Deploy smart contracts to Sepolia Ethereum testnet:

```bash
npx hardhat ignition deploy ./ignition/modules/CampaignFactory.js --network sepolia
```

3. Update the contract address in the frontend for Web3 connectivity:

```
// web/src/utils/contract.js
export const factoryAddress = "your_deployed_contract_address";
```

4. Build and deploy the Web3 frontend:

```bash
cd web
npm run build
```

## How The Blockchain Platform Works

1. **Creating a Campaign on Ethereum**: Users connect their Web3 wallet and create a campaign by providing details and setting a funding goal, which deploys a new smart contract.

2. **Approving Campaigns via Smart Contracts**: New campaigns need approval tokens from the community to become active. Users spend their approval tokens to support campaigns they believe in through on-chain transactions.

3. **Donating with Cryptocurrency**: Once active, campaigns can receive ETH donations from any user. Donors receive approval tokens proportional to their donation amount, minted by the smart contract.

4. **Trustless Fund Withdrawals**: Campaign creators can withdraw funds only if:

   - The campaign has reached its funding goal, OR
   - The campaign deadline has passed

   All enforced by immutable smart contract logic, not human intermediaries.

## Web3 Security Considerations

- All smart contracts follow security best practices and implement access controls
- Funds are held in individual campaign contracts to prevent cross-campaign vulnerabilities
- Deadline and funding goal logic is enforced at the contract level
- Community approval mechanism helps prevent fraudulent campaigns

## Contributing to this Blockchain Project

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing Web3 feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Blockchain Technology Acknowledgments

- [Ethereum](https://ethereum.org/) - The blockchain platform powering this dApp
- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [OpenZeppelin](https://openzeppelin.com/) - Secure smart contract libraries
- [Ethers.js](https://docs.ethers.org/) - Ethereum Web3 library
- [React](https://reactjs.org/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [MetaMask](https://metamask.io/) - Web3 wallet integration
