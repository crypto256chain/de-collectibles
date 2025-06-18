// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract OGMarketplace is ERC721URIStorage, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;
    
    uint256 public marketplaceFee = 100; // 1% = 100 basis points
    address payable public feeRecipient;
    
    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        bool active;
        uint256 listingTime;
    }
    
    struct Auction {
        uint256 tokenId;
        address payable seller;
        uint256 startingPrice;
        uint256 reservePrice;
        uint256 highestBid;
        address payable highestBidder;
        uint256 startTime;
        uint256 endTime;
        bool active;
        bool ended;
    }
    
    mapping(uint256 => MarketItem) private idToMarketItem;
    mapping(uint256 => Auction) private idToAuction;
    mapping(uint256 => mapping(address => uint256)) public pendingReturns;
    
    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );
    
    event MarketItemSold(
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );
    
    event AuctionCreated(
        uint256 indexed tokenId,
        address seller,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 duration
    );
    
    event BidPlaced(
        uint256 indexed tokenId,
        address bidder,
        uint256 amount
    );
    
    event AuctionEnded(
        uint256 indexed tokenId,
        address winner,
        uint256 amount
    );
    
    constructor() ERC721("0G NFT Marketplace", "OGNFT") {
        feeRecipient = payable(0xbeeBc6142A1964E956886072ba2A7d15065Ec8Ad);
    }
    
    function setFeeRecipient(address payable _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }
    
    function setMarketplaceFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee cannot exceed 10%");
        marketplaceFee = _fee;
    }
    
    function mintAndList(
        string memory tokenURI,
        uint256 price
    ) external payable nonReentrant returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        createMarketItem(newTokenId, price);
        
        return newTokenId;
    }
    
    function createMarketItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be greater than 0");
        require(ownerOf(tokenId) == msg.sender, "Only token owner can list");
        
        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false,
            true,
            block.timestamp
        );
        
        _transfer(msg.sender, address(this), tokenId);
        
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );
    }
    
    function createMarketSale(uint256 tokenId) external payable nonReentrant {
        MarketItem storage item = idToMarketItem[tokenId];
        require(item.active, "Item not active");
        require(!item.sold, "Item already sold");
        require(msg.value >= item.price, "Insufficient payment");
        
        uint256 fee = (item.price * marketplaceFee) / 10000;
        uint256 sellerAmount = item.price - fee;
        
        item.owner = payable(msg.sender);
        item.sold = true;
        item.active = false;
        _itemsSold.increment();
        
        _transfer(address(this), msg.sender, tokenId);
        
        item.seller.transfer(sellerAmount);
        feeRecipient.transfer(fee);
        
        // Refund excess payment
        if (msg.value > item.price) {
            payable(msg.sender).transfer(msg.value - item.price);
        }
        
        emit MarketItemSold(tokenId, item.seller, msg.sender, item.price);
    }
    
    function createAuction(
        uint256 tokenId,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 duration
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Only token owner can auction");
        require(duration >= 1 hours, "Minimum auction duration is 1 hour");
        require(duration <= 30 days, "Maximum auction duration is 30 days");
        
        uint256 endTime = block.timestamp + duration;
        
        idToAuction[tokenId] = Auction(
            tokenId,
            payable(msg.sender),
            startingPrice,
            reservePrice,
            0,
            payable(address(0)),
            block.timestamp,
            endTime,
            true,
            false
        );
        
        _transfer(msg.sender, address(this), tokenId);
        
        emit AuctionCreated(tokenId, msg.sender, startingPrice, reservePrice, duration);
    }
    
    function placeBid(uint256 tokenId) external payable nonReentrant {
        Auction storage auction = idToAuction[tokenId];
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value >= auction.startingPrice, "Bid below starting price");
        require(msg.value > auction.highestBid, "Bid too low");
        
        if (auction.highestBidder != address(0)) {
            pendingReturns[tokenId][auction.highestBidder] += auction.highestBid;
        }
        
        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);
        
        emit BidPlaced(tokenId, msg.sender, msg.value);
    }
    
    function endAuction(uint256 tokenId) external nonReentrant {
        Auction storage auction = idToAuction[tokenId];
        require(auction.active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction still ongoing");
        require(!auction.ended, "Auction already ended");
        
        auction.active = false;
        auction.ended = true;
        
        if (auction.highestBidder != address(0) && 
            auction.highestBid >= auction.reservePrice) {
            
            uint256 fee = (auction.highestBid * marketplaceFee) / 10000;
            uint256 sellerAmount = auction.highestBid - fee;
            
            _transfer(address(this), auction.highestBidder, tokenId);
            auction.seller.transfer(sellerAmount);
            feeRecipient.transfer(fee);
            
            emit AuctionEnded(tokenId, auction.highestBidder, auction.highestBid);
        } else {
            // Return NFT to seller if reserve not met
            _transfer(address(this), auction.seller, tokenId);
            
            // Return highest bid if any
            if (auction.highestBidder != address(0)) {
                pendingReturns[tokenId][auction.highestBidder] += auction.highestBid;
            }
            
            emit AuctionEnded(tokenId, address(0), 0);
        }
    }
    
    function withdraw(uint256 tokenId) external {
        uint256 amount = pendingReturns[tokenId][msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        pendingReturns[tokenId][msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
    
    function fetchMarketItems() external view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 unsoldItemCount = _tokenIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;
        
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].active && !idToMarketItem[i + 1].sold) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
    
    function fetchMyNFTs() external view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (ownerOf(i + 1) == msg.sender) {
                itemCount += 1;
            }
        }
        
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (ownerOf(i + 1) == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
    
    function getMarketItem(uint256 tokenId) external view returns (MarketItem memory) {
        return idToMarketItem[tokenId];
    }
    
    function getAuction(uint256 tokenId) external view returns (Auction memory) {
        return idToAuction[tokenId];
    }
    
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    function getTotalItemsSold() external view returns (uint256) {
        return _itemsSold.current();
    }
}
