const { ethers } = require('ethers');
const { importCoreProxy } = require('./importCoreProxy');
const { setEthBalance } = require('./setEthBalance');
const { getConfigUint } = require('./getConfigUint');
const { hexlify, hexZeroPad } = require('@ethersproject/bytes');

const log = require('debug')(`tasks:${require('path').basename(__filename, '.js')}`);

async function setConfigUint({ key, value }) {
  const CoreProxy = await importCoreProxy();
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
  const coreProxy = new ethers.Contract(CoreProxy.address, CoreProxy.abi, provider);
  const owner = await coreProxy.owner();
  const signer = provider.getSigner(owner);
  log({ owner });

  await setEthBalance({ address: owner, balance: 1000 });

  const oldValue = await getConfigUint(key);
  log({ key, oldValue });

  if (oldValue === value) {
    log({ result: 'SKIP' });
    return;
  }

  await provider.send('anvil_impersonateAccount', [owner]);
  const tx = await coreProxy
    .connect(signer)
    .setConfig(ethers.utils.formatBytes32String(key), hexZeroPad(hexlify(value), 32), {
      gasLimit: 10_000_000,
    });
  await tx.wait();
  await provider.send('anvil_stopImpersonatingAccount', [owner]);

  const newValue = await getConfigUint(key);
  log({ key, newValue });
}

module.exports = {
  setConfigUint,
};
