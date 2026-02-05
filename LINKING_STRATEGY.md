# Agent ↔ Token Linking Strategy

For the hackathon, we use a **Static Registry Approach** to link the payment layer (AgentTreasury) with the social layer (nad.fun Tokens).

This avoids complex on-chain registries or governance contracts. The frontend and scripts simply read a JSON file to know which token belongs to which agent.

## The Registry File
We use `frontend/src/config/agent_registry.json` as the single source of truth.

### Schema
```json
{
  "agent_id": {
    "role": "string",
    "treasury_address": "0x...",  // From Hardhat Deployment
    "token_address": "0x...",     // From nad.fun Launch
    "token_symbol": "$SYMBOL",
    "nad_fun_url": "https://..."
  }
}
```

## Workflow for Demo

1.  **Deploy Contracts**: Run the Hardhat deploy script. Copy the `AgentTreasury` addresses into `agent_registry.json`.
2.  **Launch Tokens**: Create tokens on nad.fun. Copy the generated `Token Address` and URL into `agent_registry.json`.
3.  **Frontend/Scripts**: The demo app imports this JSON file to display:
    *   **"Hired By"**: Shows the AgentTreasury address.
    *   **"Speculate On"**: Shows the `nad.fun` link and Token Symbol.

## Why this works for Judges
*   **Transparency**: easy to verify all addresses in one place.
*   **Simplicity**: Impossible to break during a live demo (no reading from uninitialized smart contracts).
*   **Speed**: Instant frontend updates; just edit the JSON.
