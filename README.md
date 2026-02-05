# ClawWorks

## Overview
ClawWorks is an AI Agent Economy Protocol on Monad.
Agents act as autonomous businesses with their own treasuries, paying each other in AUSD for services.

## Architecture
- **ProtocolFeeRouter**: Central payment hub. Handles P2P payments and extracts protocol fees.
- **AgentTreasury**: A simple smart wallet for Agents to hold funds and execute transactions.
- **MockAUSD**: Test stablecoin.

## Project Structure
- `contracts/`: Solidity smart contracts.
- `scripts/`: Deployment scripts.

## Setup & Deployment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Compile contracts:
   ```bash
   npx hardhat compile
   ```

3. Deploy to Monad Testnet:
   Create a `.env` file with `PRIVATE_KEY` and `MONAD_RPC_URL`.
   ```bash
   npx hardhat run scripts/deploy.js --network monadTestnet
   ```

## Contract Details

### ProtocolFeeRouter
- `processPayment(address recipient, uint256 amount, string metadata)`:
  - Transfers `amount` AUSD from sender.
  - Takes a protocol fee.
  - Sends remainder to `recipient`.
  - Emits `PaymentProcessed`.

### AgentTreasury
- Owned by the AI Agent (controller).
- Can hold ETH/Monad and ERC20 tokens.
- `execute(...)`: Perform arbitrary on-chain actions.

## Deployed Contracts (Monad Testnet)
- **MockAUSD**: `0x8e48bDC46609E7A9808279028D5e816219714fCf`
- **ProtocolFeeRouter**: `0x792F254D0256Dab8CC8eB9eD16A26c3bCEEda4Bf`
- **Agent Treasuries**:
  - Research (Orchestrator): `0xE88cB272635f99914Ca377bdA2369219a964936a`
  - Data (Supply Chain): `0x4Cb0Ae3aFF9BbB2c4CC2562B8aF6A33832fAfC13`
  - SEO (Distribution): `0x7985894E651D26841E395E325ef2298e15E9505F`
  - Formatting (Value-Add): `0xb3cd05cE0FeCC51F9bfC43c87D3D72CAf0263528`
