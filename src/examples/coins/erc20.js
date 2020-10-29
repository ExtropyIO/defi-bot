
const ETH = {
    symbol:"ETH",
    address:'0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
}
const DAI = {
    symbol:"DAI",
    address:'0x6b175474e89094c44da98b954eedeac495271d0f'
}

const MKR = {
    symbol: 'MKR',
    address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
}

const KNC = {
    symbol: 'KNC',
    address: '0xdd974d5c2e2928dea5f71b9825b8b646686bd200'
}

const LINK = {
    symbol: 'LINK',
    address: '0x514910771af9ca656af840dff83e8264ecf986ca'
}

const AMPL = {
    symbol: 'AMPL',
    address: '0xd46ba6d942050d489dbd938a2c909a5d5039a161'
}

const erc20s = {
    ETH, DAI,
    MKR,
    KNC,
    LINK,AMPL
}

function forTokens(inputToken, outputToken, inputAmount){
    let input = erc20s[inputToken];
    let output = erc20s[outputToken];
    return {
        inputTokenSymbol: input.symbol,
        inputTokenAddress: input.address,
        outputTokenSymbol:  output.symbol,
        outputTokenAddress: output.address,
        inputAmount: inputAmount
      };
}

exports.forTokens = forTokens;