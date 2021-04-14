require('dotenv').config()
require('console.table')
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const moment = require('moment-timezone')
const numeral = require('numeral')
const _ = require('lodash')
const axios = require('axios')
const { uniswapFactoryContract, UNISWAP_EXCHANGE_ABI } = require("./exchange/uniswap")
const { kyberRateContract } = require("./exchange/kyber");
const {forTokens} = require('./coins/erc20');

// SERVER CONFIG
const PORT = process.env.PORT || 5000
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))

// WEB3 CONFIG
const web3 = new Web3(process.env.RPC_URL)
exports.web3 = web3

async function checkPair(args) {
  const { inputTokenSymbol, inputTokenAddress, outputTokenSymbol, outputTokenAddress, inputAmount } = args
  
  const exchangeAddress = await uniswapFactoryContract.methods.getExchange(outputTokenAddress).call()
  const uniswap = new web3.eth.Contract(UNISWAP_EXCHANGE_ABI, exchangeAddress);
  
  const uniswapResult = await uniswap.methods.getEthToTokenInputPrice(inputAmount).call()
  let kyberResult = await kyberRateContract.methods.getExpectedRate(inputTokenAddress, outputTokenAddress, inputAmount, true).call()

  console.table([{
    'Input Token': inputTokenSymbol,
    'Output Token': outputTokenSymbol,
    'Input Amount': web3.utils.fromWei(inputAmount, 'Ether'),
    'Uniswap Return': web3.utils.fromWei(uniswapResult, 'Ether'),
    'Kyber Expected Rate': web3.utils.fromWei(kyberResult.expectedRate, 'Ether'),
    'Kyber Min Return': web3.utils.fromWei(kyberResult.slippageRate, 'Ether'),
    'Timestamp': moment().tz('America/Chicago').format(),
  }])
}

let priceMonitor
let monitoringPrice = false

async function monitorPrice() {
  if(monitoringPrice) {
    return
  }

  console.log("Checking prices...")
  monitoringPrice = true

  try {

    await checkPair(forTokens("ETH", "MKR", web3.utils.toWei('1', 'ETHER')));
    // await checkPair(forTokens("ETH", "DAI", web3.utils.toWei('1', 'ETHER')));
    // await checkPair(forTokens("ETH", "KNC", web3.utils.toWei('1', 'ETHER')));
    // await checkPair(forTokens("ETH", "LINK", web3.utils.toWei('1', 'ETHER')));
    // await checkPair(forTokens("ETH", "AMPL", web3.utils.toWei('1', 'ETHER')));

  } catch (error) {
    console.error(error)
    monitoringPrice = false
    clearInterval(priceMonitor)
    return
  }

  monitoringPrice = false
}

// Check markets every n seconds
const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 3000 // 3 Seconds
priceMonitor = setInterval(async () => { await monitorPrice() }, POLLING_INTERVAL)


/*

require('dotenv').config()
const express = require('express')
const http = require('http')
const Web3 = require('web3')
const {checkPair} = require('./checkPair');
const {forTokens} = require('./coins/erc20')

// SERVER CONFIG
const PORT = process.env.PORT || 5000
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))

// WEB3 CONFIG
const web3 = new Web3(process.env.RPC_URL)
exports.web3 = web3

let priceMonitor
let monitoringPrice = false

async function monitorPrice() {
  if(monitoringPrice) {
    return
  }

  console.log("Checking prices...")
  monitoringPrice = true

  try {

    await checkPair(forTokens("DAI", "WBTC", web3.utils.toWei('1', 'ETHER')));
    await checkPair(forTokens("ETH", "WBTC", web3.utils.toWei('1', 'ETHER')));
    await checkPair(forTokens("ETH", "DAI", web3.utils.toWei('1', 'ETHER')));
    await checkPair(forTokens("ETH", "KNC", web3.utils.toWei('1', 'ETHER')));
    await checkPair(forTokens("ETH", "LINK", web3.utils.toWei('1', 'ETHER')));
    await checkPair(forTokens("ETH", "AMPL", web3.utils.toWei('1', 'ETHER')));

  } catch (error) {
    console.error(error)
    monitoringPrice = false
    clearInterval(priceMonitor)
    return
  }

  monitoringPrice = false
}

// Check markets every n seconds
const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 3000 // 3 Seconds
priceMonitor = setInterval(async () => { await monitorPrice() }, POLLING_INTERVAL)

*/