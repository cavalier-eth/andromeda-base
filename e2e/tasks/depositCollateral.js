const { ethers } = require('ethers');
const { getCollateralConfig } = require('./getCollateralConfig');
const { importCoreProxy } = require('./importCoreProxy');

const log = require('debug')(`tasks:${require('path').basename(__filename, '.js')}`);

async function depositCollateral({ privateKey, accountId, symbol, amount }) {
  const CoreProxy = await importCoreProxy();
  const config = await getCollateralConfig(symbol);
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
  const wallet = new ethers.Wallet(privateKey, provider);
  log({ address: wallet.address, accountId, symbol, amount });

  const coreProxy = new ethers.Contract(CoreProxy.address, CoreProxy.abi, wallet);

  const tx = await coreProxy.deposit(
    ethers.BigNumber.from(accountId),
    config.tokenAddress,
    ethers.utils.parseEther(`${amount}`),
    { gasLimit: 10_000_000 }
  );
  await tx.wait();

  return accountId;
}

module.exports = {
  depositCollateral,
};
