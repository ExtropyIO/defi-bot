const moment = require('moment-timezone');
const { uniswapFactoryContract } = require("./exchange/uniswap");
const { kyberRateContract } = require("./exchange/kyber");
const { uniswapV2Factory } = require('./exchange/uniswapv2');
const web3 = require('web3')


async function checkPair(args) {
  const { inputTokenSymbol, inputTokenAddress, outputTokenSymbol, outputTokenAddress, inputAmount } = args;
  const uniswapV2 = uniswapV2Factory({ symbol: inputTokenSymbol, address: inputTokenAddress },
    { symbol: outputTokenSymbol, address: outputTokenAddress });
    const uv2Value = await uniswapV2.getPrice();
    const uv2slippageRate = 0.005; 
    //   const exchangeAddress = await uniswapFactoryContract.methods.getExchange(outputTokenAddress).call();
  // const uniswap = new web3.eth.Contract(UNISWAP_EXCHANGE_ABI, exchangeAddress);
//   const uniswapResult = await uniswap.methods.getEthToTokenInputPrice(inputAmount).call();
    let kyberResult = await kyberRateContract.methods.getExpectedRate(inputTokenAddress, outputTokenAddress, inputAmount, true).call();

    const uniswapMinReturn = uv2Value.mid - (uv2Value.mid * uv2slippageRate);
    const khyberMinReturn = web3.utils.fromWei(kyberResult.slippageRate, 'Ether');
    console.table([{
    'Input Token': inputTokenSymbol,
    'Output Token': outputTokenSymbol,
    'Input Amount': web3.utils.fromWei(inputAmount, 'Ether'),
    // 'Uniswap Return': uv2Value.mid,
    'Uniswap Min Return': uniswapMinReturn,
    // 'Kyber Expected Rate': web3.utils.fromWei(kyberResult.expectedRate, 'Ether'),
    'Kyber Min Return': khyberMinReturn,
    'EXPECTED RETURN': (uniswapMinReturn - khyberMinReturn) / (1/uv2Value.midverse) ,
    'Timestamp': moment().tz('America/Chicago').format(),
  }]);
}
module.exports = {checkPair};