// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract BetNFT is ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    enum betState {PENDING, WON, LOST}

    // 베팅 관련 정보
    struct Bet {
        address opponent;
        uint256 amount;
        uint256 tokenId;
        betState state;
    }

    AggregatorV3Interface internal eth_usd_price_feed;
    AggregatorV3Interface internal btc_usd_price_feed;

    mapping(address => Bet) public bets;
    address public winner;
    /**
     * Network: Ethereum Mainnet 돈나가 안대ㅐㅐㅐ
     * Aggregator: ETH/USD
     * Address: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
     * Aggregator: KRW/USD
     * Address: 0x01435677FB11763550905594A16B645847C1d0F3
     */

     /**
     * Network: Sepolia Testnet
     * Aggregator: ETH/USD
     * Address: 0 x694AA1769357215DE4FAC081bf1f309aDC325306
     * Aggregator: BTC/USD
     * Address: 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
     */


    constructor() ERC721("SKKRYPTO NFT", "SKKRYPTONFT") {
        eth_usd_price_feed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        btc_usd_price_feed = AggregatorV3Interface(0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43);
        
    }
    
    // NFT 민팅 함수
    function mintNFT(string memory tokenURI) public returns (uint256){
        _tokenIdCounter.increment();
        uint256 ID = _tokenIdCounter.current();
        _mint(msg.sender, ID);
        _setTokenURI(ID, tokenURI);
        return ID;
    }

    // 베팅 관련 정보를 입력하고 베팅을 합니다.
    function placeBet(uint256 tokenId, address opponent, uint256 amount) public {
        require(ownerOf(tokenId) == msg.sender, "You don't own the NFT");
        require(bets[msg.sender].opponent == address(0), "Already placed a bet");
        bets[msg.sender] = Bet(opponent, amount, tokenId, betState.PENDING);

        // 베팅할 NFT ID, 베팅 상대, 베팅 금액을 정했으면 NFT를 이 smart contract로 보냅니다. (마지막에 이긴 사람한테 다 줄 수 있도록)
        _transfer(msg.sender, address(this), tokenId);
    }

    // 두 명의 사람이 베팅을 완료했습니다. 베팅 결과를 산정합니다.
    function settleBet() public {
        require(bets[msg.sender].opponent != address(0), "No bet placement");
        address opponent = bets[msg.sender].opponent;
        require(bets[opponent].tokenId >= 1, "Opponent has not placed a bet");

        // msg.sender가 베팅한 금액입니다.
        uint256 amount = bets[msg.sender].amount;
        // opponent가 베팅한 금액입니다.
        uint256 opponent_amount = bets[opponent].amount;
        // msg.sender가 베팅한 NFT ID 입니다.
        uint256 tokenId = bets[msg.sender].tokenId;
        // opponent가 베팅한 NFT ID 입니다.
        uint256 tokenId_opponent = bets[opponent].tokenId;

        // 실제 ETH 금액과 각각이 베팅한 금액의 차이값을 계산합니다.
        uint mydiff = getEthAccuracy(amount);
        uint opdiff = getEthAccuracy(opponent_amount);
        
        // 차이값이 작은 사람이 이기게 됩니다.
        if(mydiff < opdiff){
            bets[msg.sender] = Bet(opponent, amount, tokenId, betState.WON);
        }
        else{
            bets[msg.sender] = Bet(opponent, amount, tokenId, betState.LOST);
        }
        
        // betState가 WON인 사람에게 베팅된 모든 NFT를 전송합니다.
        if(bets[msg.sender].state == betState.LOST){
            // opponent가 이긴 경우
            _transfer(address(this), opponent, tokenId);
            _transfer(address(this), opponent, tokenId_opponent);
            winner =  opponent;
        }
        else {
            // msg.sender가 이긴 경우
            _transfer(address(this), msg.sender, tokenId);
            _transfer(address(this), msg.sender, tokenId_opponent);
            winner= msg.sender;
        }
    }

    // NFT를 상대방에게 전송합니다.
    function transferNFT(address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not approved or owner");
        _transfer(msg.sender, to, tokenId);
    }

    /*
     @notice contract can receive Ether.
    */
    receive() external payable {}

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    /**
     * Returns the latest price
     */
    // 가장 최신의 ETH 금액을 USD의 값으로 리턴합니다.
    function getEthUsd() public view returns (uint) {
        (
            , 
            int price
            ,
            ,
            ,
            
        ) = eth_usd_price_feed.latestRoundData();
        uint256 adjustPrice = uint(price) /1e8;

        return adjustPrice;
    }

    // 베팅 금액과 실제 ETH 금액을 비교하는 함수 입니다.
    function getEthAccuracy(uint _betEth) public view returns (uint){
        uint EthUsd = uint(getEthUsd());
        uint newEth = _betEth * 10 ** 5;

        if(EthUsd >= newEth){
            return EthUsd - newEth;
        }else{
            return newEth - EthUsd;
        }
    }
}