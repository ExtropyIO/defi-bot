pragma solidity ^0.5.0;

/*******
* Pseudo-code
******/

interface Exchange1 {
    function sellTokens(address _token, uint _amount) external returns (uint amount);
}

interface Exchange2 {
    function buyTokens(address _token) external payable returns (uint amount);
}

interface ERC20 {
    function transfer(address _to, uint _value) external returns (bool success);
    function approve(address _spender, uint _value) external returns (bool success);
}

contract SimpleArb {
    address public exchange1 = 0x818E6FECD516Ecc3849DAf6845e3EC868087B755; // Kyber
    address public exchange2 = 0x09cabEC1eAd1c0Ba254B09efb3EE13841712bE14; // Uniswap
    address public token = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359; // Sai

    function arb() internal {
        uint amount = 10000000000000000000; // 100 tokens
        ERC20(token).approve(exchange1, amount); // Approve tokens
        uint ethAmount = Exchange1(exchange1).sellTokens(token, amount); // Sell Tokens for Ether
        Exchange2(exchange1).buyTokens.value(ethAmount)(token); // Sell Tokens for Ether
    }
}
