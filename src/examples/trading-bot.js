require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const moment = require('moment-timezone')
const numeral = require('numeral')
const _ = require('lodash')

// SERVER CONFIG
const PORT = process.env.PORT || 5000
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))

// WEB3 CONFIG
web3 = new Web3('https://mainnet.infura.io/v3/d771c1c5fe814da1b330f11a82ea5ac9');
//const web3 = new Web3(new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_URL) )

// Ropsten DAI
const DAI_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"INITIAL_SUPPLY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"burn","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_value","type":"uint256"}],"name":"burnFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_burner","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]
const DAI_ADDRESS = '0xad6d458402f60fd3bd25163575031acdce07538d'
const daiContract = new web3.eth.Contract(DAI_ABI, DAI_ADDRESS);

// Ropsten Uniswap Dai Exchange: https://ropsten.etherscan.io/address/0xc0fc958f7108be4060F33a699a92d3ea49b0B5f0
const EXCHANGE_ABI = [{name:'TokenPurchase',inputs:[{type:'address',name:'buyer',indexed:!0},{type:'uint256',name:'eth_sold',indexed:!0},{type:'uint256',name:'tokens_bought',indexed:!0}],anonymous:!1,type:'event'},{name:'EthPurchase',inputs:[{type:'address',name:'buyer',indexed:!0},{type:'uint256',name:'tokens_sold',indexed:!0},{type:'uint256',name:'eth_bought',indexed:!0}],anonymous:!1,type:'event'},{name:'AddLiquidity',inputs:[{type:'address',name:'provider',indexed:!0},{type:'uint256',name:'eth_amount',indexed:!0},{type:'uint256',name:'token_amount',indexed:!0}],anonymous:!1,type:'event'},{name:'RemoveLiquidity',inputs:[{type:'address',name:'provider',indexed:!0},{type:'uint256',name:'eth_amount',indexed:!0},{type:'uint256',name:'token_amount',indexed:!0}],anonymous:!1,type:'event'},{name:'Transfer',inputs:[{type:'address',name:'_from',indexed:!0},{type:'address',name:'_to',indexed:!0},{type:'uint256',name:'_value',indexed:!1}],anonymous:!1,type:'event'},{name:'Approval',inputs:[{type:'address',name:'_owner',indexed:!0},{type:'address',name:'_spender',indexed:!0},{type:'uint256',name:'_value',indexed:!1}],anonymous:!1,type:'event'},{name:'setup',outputs:[],inputs:[{type:'address',name:'token_addr'}],constant:!1,payable:!1,type:'function',gas:175875},{name:'addLiquidity',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'min_liquidity'},{type:'uint256',name:'max_tokens'},{type:'uint256',name:'deadline'}],constant:!1,payable:!0,type:'function',gas:82605},{name:'removeLiquidity',outputs:[{type:'uint256',name:'out'},{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'amount'},{type:'uint256',name:'min_eth'},{type:'uint256',name:'min_tokens'},{type:'uint256',name:'deadline'}],constant:!1,payable:!1,type:'function',gas:116814},{name:'__default__',outputs:[],inputs:[],constant:!1,payable:!0,type:'function'},{name:'ethToTokenSwapInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'min_tokens'},{type:'uint256',name:'deadline'}],constant:!1,payable:!0,type:'function',gas:12757},{name:'ethToTokenTransferInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'min_tokens'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'}],constant:!1,payable:!0,type:'function',gas:12965},{name:'ethToTokenSwapOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_bought'},{type:'uint256',name:'deadline'}],constant:!1,payable:!0,type:'function',gas:50455},{name:'ethToTokenTransferOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_bought'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'}],constant:!1,payable:!0,type:'function',gas:50663},{name:'tokenToEthSwapInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_sold'},{type:'uint256',name:'min_eth'},{type:'uint256',name:'deadline'}],constant:!1,payable:!1,type:'function',gas:47503},{name:'tokenToEthTransferInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_sold'},{type:'uint256',name:'min_eth'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'}],constant:!1,payable:!1,type:'function',gas:47712},{name:'tokenToEthSwapOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'eth_bought'},{type:'uint256',name:'max_tokens'},{type:'uint256',name:'deadline'}],constant:!1,payable:!1,type:'function',gas:50175},{name:'tokenToEthTransferOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'eth_bought'},{type:'uint256',name:'max_tokens'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'}],constant:!1,payable:!1,type:'function',gas:50384},{name:'tokenToTokenSwapInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_sold'},{type:'uint256',name:'min_tokens_bought'},{type:'uint256',name:'min_eth_bought'},{type:'uint256',name:'deadline'},{type:'address',name:'token_addr'}],constant:!1,payable:!1,type:'function',gas:51007},{name:'tokenToTokenTransferInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_sold'},{type:'uint256',name:'min_tokens_bought'},{type:'uint256',name:'min_eth_bought'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'},{type:'address',name:'token_addr'}],constant:!1,payable:!1,type:'function',gas:51098},{name:'tokenToTokenSwapOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_bought'},{type:'uint256',name:'max_tokens_sold'},{type:'uint256',name:'max_eth_sold'},{type:'uint256',name:'deadline'},{type:'address',name:'token_addr'}],constant:!1,payable:!1,type:'function',gas:54928},{name:'tokenToTokenTransferOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_bought'},{type:'uint256',name:'max_tokens_sold'},{type:'uint256',name:'max_eth_sold'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'},{type:'address',name:'token_addr'}],constant:!1,payable:!1,type:'function',gas:55019},{name:'tokenToExchangeSwapInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_sold'},{type:'uint256',name:'min_tokens_bought'},{type:'uint256',name:'min_eth_bought'},{type:'uint256',name:'deadline'},{type:'address',name:'exchange_addr'}],constant:!1,payable:!1,type:'function',gas:49342},{name:'tokenToExchangeTransferInput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_sold'},{type:'uint256',name:'min_tokens_bought'},{type:'uint256',name:'min_eth_bought'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'},{type:'address',name:'exchange_addr'}],constant:!1,payable:!1,type:'function',gas:49532},{name:'tokenToExchangeSwapOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_bought'},{type:'uint256',name:'max_tokens_sold'},{type:'uint256',name:'max_eth_sold'},{type:'uint256',name:'deadline'},{type:'address',name:'exchange_addr'}],constant:!1,payable:!1,type:'function',gas:53233},{name:'tokenToExchangeTransferOutput',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_bought'},{type:'uint256',name:'max_tokens_sold'},{type:'uint256',name:'max_eth_sold'},{type:'uint256',name:'deadline'},{type:'address',name:'recipient'},{type:'address',name:'exchange_addr'}],constant:!1,payable:!1,type:'function',gas:53423},{name:'getEthToTokenInputPrice',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'eth_sold'}],constant:!0,payable:!1,type:'function',gas:5542},{name:'getEthToTokenOutputPrice',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_bought'}],constant:!0,payable:!1,type:'function',gas:6872},{name:'getTokenToEthInputPrice',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'tokens_sold'}],constant:!0,payable:!1,type:'function',gas:5637},{name:'getTokenToEthOutputPrice',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'uint256',name:'eth_bought'}],constant:!0,payable:!1,type:'function',gas:6897},{name:'tokenAddress',outputs:[{type:'address',name:'out'}],inputs:[],constant:!0,payable:!1,type:'function',gas:1413},{name:'factoryAddress',outputs:[{type:'address',name:'out'}],inputs:[],constant:!0,payable:!1,type:'function',gas:1443},{name:'balanceOf',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'address',name:'_owner'}],constant:!0,payable:!1,type:'function',gas:1645},{name:'transfer',outputs:[{type:'bool',name:'out'}],inputs:[{type:'address',name:'_to'},{type:'uint256',name:'_value'}],constant:!1,payable:!1,type:'function',gas:75034},{name:'transferFrom',outputs:[{type:'bool',name:'out'}],inputs:[{type:'address',name:'_from'},{type:'address',name:'_to'},{type:'uint256',name:'_value'}],constant:!1,payable:!1,type:'function',gas:110907},{name:'approve',outputs:[{type:'bool',name:'out'}],inputs:[{type:'address',name:'_spender'},{type:'uint256',name:'_value'}],constant:!1,payable:!1,type:'function',gas:38769},{name:'allowance',outputs:[{type:'uint256',name:'out'}],inputs:[{type:'address',name:'_owner'},{type:'address',name:'_spender'}],constant:!0,payable:!1,type:'function',gas:1925},{name:'name',outputs:[{type:'bytes32',name:'out'}],inputs:[],constant:!0,payable:!1,type:'function',gas:1623},{name:'symbol',outputs:[{type:'bytes32',name:'out'}],inputs:[],constant:!0,payable:!1,type:'function',gas:1653},{name:'decimals',outputs:[{type:'uint256',name:'out'}],inputs:[],constant:!0,payable:!1,type:'function',gas:1683},{name:'totalSupply',outputs:[{type:'uint256',name:'out'}],inputs:[],constant:!0,payable:!1,type:'function',gas:1713}]
const EXCHANGE_ADDRESS = '0xc0fc958f7108be4060F33a699a92d3ea49b0B5f0'
const exchangeContract = new web3.eth.Contract(EXCHANGE_ABI, EXCHANGE_ADDRESS);

// Minimum eth to swap
const ETH_AMOUNT = web3.utils.toWei('1', 'Ether')
console.log("Eth Amount", ETH_AMOUNT)

const ETH_SELL_PRICE = web3.utils.toWei('200', 'Ether') // 200 Dai a.k.a. $200 USD

async function sellEth(ethAmount, daiAmount) {
  // Set Deadline 1 minute from now
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  console.log("Deadline", DEADLINE)

  // Transaction Settings
  const SETTINGS = {
    gasLimit: 8000000, // Override gas settings: https://github.com/ethers-io/ethers.js/issues/469
    gasPrice: web3.utils.toWei('50', 'Gwei'),
    from: process.env.ACCOUNT, // Use your account here
    value: ethAmount // Amount of Ether to Swap
  }

  // Perform Swap
  console.log('Performing swap...')
  let result = await exchangeContract.methods.ethToTokenSwapInput(daiAmount.toString(), DEADLINE).send(SETTINGS)
  console.log(`Successful Swap: https://ropsten.etherscan.io/tx/${result.transactionHash}`)
}

async function checkBalances() {
  let balance

  // Check Ether balance swap
  balance = await web3.eth.getBalance(process.env.ACCOUNT) // .call() ??
  balance = web3.utils.fromWei(balance, 'Ether')
  console.log("Ether Balance:", balance)

  // Check Dai balance swap
  balance = await daiContract.methods.balanceOf(process.env.ACCOUNT).call()
  balance = web3.utils.fromWei(balance, 'Ether')
  console.log("Dai Balance:", balance)
}

let priceMonitor
let monitoringPrice = false

async function monitorPrice() {
  if(monitoringPrice) {
    return
  }

  console.log("Checking price...")
  monitoringPrice = true

  try {

    // Check Eth Price
    const daiAmount = await exchangeContract.methods.getEthToTokenInputPrice(ETH_AMOUNT).call()
    const price = web3.utils.fromWei(daiAmount.toString(), 'Ether')
    console.log('Eth Price:', price, ' DAI')

    if(price <= ETH_SELL_PRICE) {
      console.log('Selling Eth...')
      // Check balance before sale
      await checkBalances()

      // Sell Eth
      await sellEth(ETH_AMOUNT, daiAmount)

      // Check balances after sale
      await checkBalances()

      // Stop monitoring prices
      clearInterval(priceMonitor)
    }

  } catch (error) {
    console.error(error)
    monitoringPrice = false
    clearInterval(priceMonitor)
    return
  }

  monitoringPrice = false
}

// Check markets every n seconds
const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 1000 // 1 Second
priceMonitor = setInterval(async () => { await monitorPrice() }, POLLING_INTERVAL)