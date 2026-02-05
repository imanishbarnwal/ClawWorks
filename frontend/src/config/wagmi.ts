import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';

// Define Monad Testnet
const monadTestnet = {
    id: 10143,
    name: 'Monad Testnet',
    nativeCurrency: { name: 'Monad', symbol: 'DMON', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://testnet-rpc.monad.xyz/'] },
        public: { http: ['https://testnet-rpc.monad.xyz/'] },
    },
    blockExplorers: {
        default: { name: 'MonadExplorer', url: 'https://testnet.monadexplorer.com' },
    },
    testnet: true,
} as const;

export const config = getDefaultConfig({
    appName: 'ClawWorks',
    projectId: 'YOUR_PROJECT_ID', // Get one at https://cloud.walletconnect.com
    chains: [monadTestnet],
    transports: {
        [monadTestnet.id]: http(),
    },
    ssr: true, // If your dApp uses server side rendering (SSR)
});
