# Start Here: $CORE Token Creation (nad.fun)

This checklist covers the manual creation of the Research Agent's token during the Monad hackathon demo.

## 0. Prerequisites
- [ ] **Wallet**: Install Backpack Wallet or standard MetaMask (Monad Testnet).
- [ ] **Balance**: Ensure wallet has at least **200 MON** (Testnet).
  - 10 MON for creation fee.
  - ~100 MON to buy initial supply (optional but recommended for "dev lock").
  - Gas fees.
- [ ] **Assets**: Have the conceptual image ready (or use a placeholder blue geometric logo).

## 1. Creation Flow
1.  **Navigate**: Go to `https://testnet.nad.fun/create` (or main `nad.fun` if on mainnet).
2.  **Connect**: Connect the wallet acting as the "ClawWorks Deployer".
3.  **Input Metadata** (Copy/Paste from TOKENS_METADATA.md):
    - **Name**: `Claw Core`
    - **Ticker**: `CORE`
    - **Description**: `The central intelligence unit of the ClawWorks autonomous economy.`
    - **Image**: Upload the blue geometric node image.
4.  **Optional Settings**:
    - **Twitter Link**: (Leave blank for demo)
    - **Telegram Link**: (Leave blank for demo)
    - **Website**: Link to your GitHub repo or demo frontend.
5.  **Initial Buy**:
    - Recommended: Buy **5-10%** of supply immediately to prevent sniping.
    - Amount: ~100 MON.

## 2. Launch
1.  **Click**: `create coin`.
2.  **Approve**: Sign the transaction in your wallet.
3.  **Wait**: Wait for the "Transaction Confirmed" toast.

## 3. Post-Launch Verification
1.  **Copy Address**: Immediately copy the new Token Address from the URL or info panel.
2.  **Verify Curve**: Check that the bonding curve chart is live and moving.
3.  **Save Address**: You will need this address to link the token to the Research Agent in the next step.

## 4. Troubleshooting
- **"Transaction Failed"**: likely insufficient MON for gas + bonding curve entry.
- **"Image Upload Failed"**: adhere to `<1MB` PNG/JPG limits.
