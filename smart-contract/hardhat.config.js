require("@nomiclabs/hardhat-waffle");


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/cNk_ugUsw89FshIrh_F4i_DNsfDAX7CX',
      accounts: [
        '739cc1daaea88692cff1b949661f00bd997b7d9960ae3cc12bc5fdfa80856076'
      ]
    }
  }
};
