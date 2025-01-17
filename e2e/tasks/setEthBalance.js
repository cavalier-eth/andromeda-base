const { ethers } = require('ethers');

const log = require('debug')(`tasks:${require('path').basename(__filename, '.js')}`);

async function setEthBalance({ address, balance }) {
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
  const oldBalance = parseFloat(ethers.utils.formatUnits(await provider.getBalance(address)));
  log({ address, oldBalance });

  await provider.send('anvil_setBalance', [
    address,
    ethers.utils.parseEther(`${balance}`).toHexString(),
  ]);
  const newBalance = parseFloat(ethers.utils.formatUnits(await provider.getBalance(address)));
  log({ address, newBalance });
  return newBalance;
}

module.exports = {
  setEthBalance,
};
