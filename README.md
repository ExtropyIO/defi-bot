> ### TLDR:
> * The author provides a detailed guide to coding a DeFi arbitrage bot. The bot uses flash loans to borrow assets from dYdX and sells them on 1inch exchange when profitable.

### Citation

* Extropy.IO. Coding a DeFi Arbitrage Bot, Medium. Oct, 29, 2020. Accessed on: Mar, 16, 2021. [Online] Available: Part 1: https://extropy-io.medium.com/coding-a-defi-arbitrage-bot-45e550d85089, Part 2: https://extropy-io.medium.com/arbitrage-bot-part-2-97e7b710dcf
* Credits for this README go to Ting Ting Lee who wrote [Coding a DeFi arbitrage bot](https://www.smartcontractresearch.org/t/research-summary-coding-a-defi-arbitrage-bot/282) for the Smart Contracts Research Forum.

### Link

* Part 1: https://extropy-io.medium.com/coding-a-defi-arbitrage-bot-45e550d85089
* Part 2: https://extropy-io.medium.com/arbitrage-bot-part-2-97e7b710dcf

### Core Research Question

* How can an arbitrage between DEXes be automatically performed using flash loans?

### Background

* **Arbitrage** is the purchase and sale of an asset in order to profit from a difference in the asset’s price between marketplaces.
* **Price slippage** refers to the difference between the expected price of a trade and the price at which the trade is executed. It usually happens when the market is highly volatile within a short period of time or when the current trade volume exceeds the existing bid/ask spread.
* **Flash Loan** is a type of uncollateralized loan that is only valid within a single transaction. It can be implemented through a smart contract. The transaction will be reverted if the execution result is not as expected.
  * For more details on flash loans, please refer to the research summary “[Attacking the DeFi Ecosystem with Flash Loans for Fun and Profit](https://www.smartcontractresearch.org/t/research-summary-attacking-the-defi-ecosystem-with-flash-loans-for-fun-and-profit/260)”.
* **Decentralized exchanges (DEX)** are a type of cryptocurrency exchange which allow peer-to-peer cryptocurrency exchanges to take place securely online, without needing an intermediary.
* **DEX aggregators** source liquidity from different DEXs and thus offer users better token swap rates than any single DEX.
* **Liquidity pool** is a collection of funds locked in a smart contract to provide liquidity for DEXes. The advantage of a liquidity pool is that it doesn’t require matching orders between buyers and sellers, and instead leverages a pre-funded liquidity pool with low slippage.
* An **Orderbook** consists of a collection of bid-and-ask orders. Orders are matched and executed only when a bid and ask price are the same.
* An **Automated Market Maker (AMM)** uses a liquidity pool instead of an orderbook and relies on mathematical formulas to price assets. The assets can be automatically swapped against the pool’s latest price, making it more efficient than traditional orderbooks.
* **Wrapped ETH (WETH)** is the ERC20 tradable version of Ethereum. WETH is easier to trade within smart contracts than ETH is. Users can also revoke access to their WETH after sending it to an exchange, which is not possible with ETH.

### Summary

* The author describes the advantages of DeFi arbitrage over centralized exchanges:
  * DeFi
    * Insolvency risks are minimized as smart contracts execute automatically following predetermined parameters. A trade will be reverted if it cannot be executed as expected.
    * Traders can perform arbitrage using borrowed funds with flash loans.
  * Centralized exchanges
    * Since a trader cannot execute trades simultaneously, they may suffer from price slippage if a trade is delayed.
    * Traders need to own funds or borrow them from a bank.
* Arbitrage between DEXes that use AMM
  * Popular platforms
    * [Kyber Network](https://kyber.network/), [Uniswap](https://uniswap.org/), [Balancer](https://balancer.finance/), and [Curve Finance](https://curve.fi/).
  * Result
    * Bring prices into efficiency between two liquidity pools
  * Scenario
    * When the pools on different DEXes offer different prices to exchange assets.
  * Execution
    * Exchange from asset A to asset B on one pool and exchange it back on another pool to benefit from the price spread between two pools.
* Arbitrage between DEXes that use classic orderbook
  * Popular platforms
    * [Radar Relay](https://relay.radar.tech/), powered by the [0x protocol](https://0x.org).
  * Scenario
    * Traders can fill limit orders from a DEX and then see if the tokens acquired could be sold to any other liquidity pools for better returns.
* The author describes the basic operation of an arbitrage bot.
  * For example, to arbitrage the pair WETH/DAI:
  * The bot will query the [0x API](https://0x.org/api) looking for WETH/DAI pair limit orders
    * The 0x API can get the limit orders for a currency pair from every exchange that uses the 0x protocol.
    * Example API url for orders buying WETH with DAI: https://api.0x.org/sra/v3/orders?page=1&perPage=1000&makerAssetProxyId=0xf47261b0&takerAssetProxyId=0xf47261b0&makerAssetAddress=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&takerAssetAddress=0x6b175474e89094c44da98b954eedeac495271d0f
      * Parameters
        * the maker token’s contract address (WETH)
        * the taker token’s contract address (DAI)
      * Sample response from the above request
      * ![|512x215](upload://4yiFnlZcJCpmtPuCTK22fGOjV45.jpeg)
      * However, the above opportunity may not actually exist in practice, because we would need both limit orders to exist at the same time for the arbitrage to work.
* The author thus proposes to perform the arbitrage using a flash loan.
  * Steps
    * Get a flash loan DAI from [DyDx exchange](https://dydx.exchange/)
    * Buy WETH from 0x using the DAI borrowed with the flash loan
    * Use 1inch to find the best exchange to sell the WETH acquired in step 2
    * Pay back the flash loan DAI and keep the remainder as profit
* The author provides the code and explains how the arbitrage smart contract works
  * The contract inherits the DyDxFloashLoan smart contract.
  * Functions
    * Swap
      * Perform the trade
    * getExpectedReturn
      * Get the current asset price
    * getWeth
      * Turn any ETH sent into WETH
    * approveWeth
      * Approve the 0x proxy to collect WETH as the fee for using 0x.
    * getFlashloan
      * Called whenever a profitable arbitrage is found by the client.
      * All of the parameters for this function will be constructed and passed in from the client script.
    * callFunction
      * Has to be deployed in our smart contract to receive a flash loan from dYdX.
    * _arb
      * Arbitrage function that is called when the loan is successful.
      * Tracks the balance of our smart contract before and after the trade.
      * If the end balance is not greater than the start balance, the operation will revert.

### Method

* The prerequisite for the arbitrage bot is to have a browser with the Metamask extension installed.
* The programming language used is NodeJS.
* Project structure: only two files
  * index.js
    * a node.js server that continuously fetches crypto prices on exchanges looking for arbitrage opportunities, trying to guarantee that the trade is possible before even attempting to execute it.
  * TradingBot.sol
    * a smart contract that gets called by the node app only when a profitable arbitrage is found, it will borrow funds with a flash loan and execute trades on DEXes.
* Detailed setup
  * Install Metamask browser extension
  * Create an Ethereum Mainnet account with some ETH for paying gas fees.
    * Don’t use your personal account for this, create a new account for the bot in order to limit accidental losses.
  * Go to [Remix online IDE](https://remix.ethereum.org/) and paste the smart contract solidity code
  * Compile the code using compiler version 0.5.17.
  * Deploy with an initial 100 wei, which is enough for 100 flash loans on dYdX.
* Environment setup
  * By cloning the project’s code repository, users will find a file called .env.example inside the /src folder
  * Fill in the fields:
    * RPC_URL : the public address of an Ethereum node, the easiest one to set up is the Infura RPC provider, register an account in order to get an API key.
    * ADDRESS and PRIVATE_KEY: fill in the public Ethereum address of the bot account, and its corresponding private key.
    * CONTRACT_ADDRESS : paste in the smart contract’s address that was returned from Remix after the deployment step.
    * GAS_LIMIT : how much gas the contract is allowed to use, leave as 3000000 or decrease to 2000000 which should be fine
    * GAS_PRICE : change this depending on how fast you want the transaction to be mined, see https://ethgasstation.info/ for info.
    * ESTIMATED_GAS : leave as is
* Running the bot
  * Execute the command from the project’s root directory.
    * node src/index.js

### Results

* The full working code can be found at https://github.com/ExtropyIO/defi-bot.

### Discussion & Key Takeaways

* The author created an open-source DeFi arbitrage bot that uses flash loans to borrow assets from dYdX and sells them on 1inch exchange when profitable.
* The author explains the main components of the arbitrage bot and the underlying logic of how arbitrage works.
* After following this tutorial, users can create a working example of a customizable flash loan arbitrage bot.
* The most efficient way to perform a flash loan arbitrage is to continuously fetch the real time prices using NodeJS client and execute the contract with profitable parameters when an opportunity is found.

### Implications & Follow-ups

* Arbitrage is a zero-sum game. There are a finite number of arbitrage opportunities for a large group of people competing to find and execute them.
* To make the bot more efficient, the author suggests the following improvements:
  * Consider taker fees when calculating profits
  * Use Partial fills
  * Check orders again
  * Handle failures to continue execution
  * Execute multiple orders simultaneously
  * Dynamically calculate gas fees
* If such arbitrage bot becomes prevalent, the price differences between different DEXes will be minimized. DEX aggregators such as 1inch may no longer be needed as the price differences become more and more negligible in the future.
* It may be interesting to measure the actual APR of running this bot, considering the cost of server hosting and contract deployment.

### Applicability

* Interested readers can refer to the working code to have their own arbitrage bot: https://github.com/ExtropyIO/defi-bot.
* Currently, the example only supports flash loans from dYdX. Users can add other flash loan provider’s support.