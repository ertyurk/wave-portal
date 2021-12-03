require('dotenv').config();
require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [process.env.PRIVATE_RINKEBY_ACCOUNT_KEY],
    },
  },
};