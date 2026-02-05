export const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

export const ROUTER_ABI = [
    "function paymentToken() view returns (address)",
    "function protocolTreasury() view returns (address)",
    "function processPayment(address recipient, uint256 amount, string referenceId)",
    "function protocolFeeBps() view returns (uint256)"
];

// Monad Testnet Deployment
export const PROTOCOL_ROUTER_ADDRESS = "0xD72De456b2Aa5217a4Fd2E4d64443Ac92FA28791"; 
