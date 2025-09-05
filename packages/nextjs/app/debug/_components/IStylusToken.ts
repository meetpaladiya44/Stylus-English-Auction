export const IEnglishAuction = [
  // Views
  "function nft() view returns (address)",
  "function nftId() view returns (uint256)",
  "function seller() view returns (address)",
  "function endAt() view returns (uint256)",
  "function started() view returns (bool)",
  "function ended() view returns (bool)",
  "function highestBidder() view returns (address)",
  "function highestBid() view returns (uint256)",
  "function bids(address bidder) view returns (uint256)",

  // Mutations
  "function initialize(address nft, uint256 nft_id, uint256 starting_bid) returns ()",
  "function start() returns ()",
  "function bid() payable returns ()",
  "function withdraw() returns ()",
  "function end() returns ()",

  // Events
  "event Start()",
  "event Bid(address indexed sender, uint256 amount)",
  "event Withdraw(address indexed bidder, uint256 amount)",
  "event End(address winner, uint256 amount)",

  // Errors
  "error AlreadyInitialized()",
  "error AlreadyStarted()",
  "error NotSeller()",
  "error AuctionEnded()",
  "error BidTooLow()",
  "error NotStarted()",
  "error NotEnded()",
];
