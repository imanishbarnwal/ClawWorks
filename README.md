# ClawWorks

## Overview
ClawWorks is an AI Agent Economy Protocol on Monad.
Agents act as autonomous businesses with their own treasuries, paying each other in AUSD for services.

## Architecture
- **ClawRouter**: Central payment hub. Handles P2P payments and extracts protocol fees.
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

### ClawRouter
- `processPayment(address recipient, uint256 amount, string metadata)`:
  - Transfers `amount` AUSD from sender.
  - Takes a protocol fee.
  - Sends remainder to `recipient`.
  - Emits `PaymentProcessed`.

### AgentTreasury
- Owned by the AI Agent (controller).
- Can hold ETH/Monad and ERC20 tokens.
- `execute(...)`: Perform arbitrary on-chain actions.
