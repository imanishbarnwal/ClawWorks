require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    monadTestnet: {
        // Placeholder URL for Monad Testnet - replace with actual RPC
        url: process.env.MONAD_RPC_URL || "https://rpc-devnet.monadinfra.com/rpc/3fe540e310bba1331828", 
        chainId: 20143, // Replace with actual chainId if different
        accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  },
};
