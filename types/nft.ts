export interface NFT {
  id: string
  name: string
  description: string
  image: string
  type: "image" | "3d" | "video" | "audio"
  price: string
  usdPrice: string
  collection: string
  creator: string
  owner: string
  tokenId: string
  contractAddress: string
  attributes: Array<{
    trait_type: string
    value: string
  }>
  rarity?: string
  views: number
  likes: number
  lastSale: string
  createdAt: string
  updatedAt?: string
  mintedAt?: string
  blockchain: string
  listed: boolean
  verified: boolean
  model3d?: string
  isLazyMinted?: boolean
  minted?: boolean
  mintTxHash?: string
  inAuction?: boolean
  auctionId?: string
}

export interface Collection {
  id: string
  name: string
  description: string
  image: string
  banner: string
  creator: string
  floorPrice: string
  totalVolume: string
  items: number
  owners: number
  createdAt: string
  verified: boolean
}

export interface Auction {
  id: string
  nftId: string
  seller: string
  startingPrice: number
  reservePrice?: number
  currentBid: number
  highestBidder?: string
  startTime: string
  endTime: string
  active: boolean
  bids: Array<{
    bidder: string
    amount: number
    txHash: string
    timestamp: string
  }>
  createdAt: string
}
