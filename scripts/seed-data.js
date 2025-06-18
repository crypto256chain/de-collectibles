// Seed script to populate the database with mock NFT data
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "0g-nft-marketplace"

const mockNFTs = [
  {
    tokenId: "1",
    name: "Cosmic Wanderer #001",
    description: "A mystical being traversing the cosmic realms of the 0G universe.",
    image: "/placeholder.svg?height=400&width=400",
    model3d: "/assets/3d/duck.glb",
    type: "3d",
    price: "2.5",
    usdPrice: "125.00",
    lastSale: "2.2",
    collection: "0G Cosmic Collection",
    creator: "0x1234567890123456789012345678901234567890",
    owner: "0x8765432109876543210987654321098765432109",
    contractAddress: "0xabcdefghijklmnopqrstuvwxyz1234567890abcdef",
    rarity: "Legendary",
    attributes: [
      { trait_type: "Background", value: "Cosmic Purple" },
      { trait_type: "Body", value: "Ethereal" },
      { trait_type: "Eyes", value: "Galaxy" },
      { trait_type: "Rarity Score", value: 95 },
    ],
    likes: 234,
    views: 1567,
    createdAt: new Date("2024-01-15T10:30:00Z"),
    blockchain: "0g",
    listed: true,
    verified: true,
  },
  {
    tokenId: "42",
    name: "AI Genesis Bot",
    description: "First generation AI entity born on the 0G blockchain.",
    image: "/placeholder.svg?height=400&width=400",
    type: "image",
    price: "1.8",
    usdPrice: "90.00",
    lastSale: "1.5",
    collection: "AI Artifacts",
    creator: "0x2345678901234567890123456789012345678901",
    owner: "0x9876543210987654321098765432109876543210",
    contractAddress: "0xbcdefghijklmnopqrstuvwxyz234567890abcdefg",
    rarity: "Epic",
    attributes: [
      { trait_type: "Generation", value: "Genesis" },
      { trait_type: "AI Level", value: "Advanced" },
      { trait_type: "Power Core", value: "Quantum" },
      { trait_type: "Rarity Score", value: 87 },
    ],
    likes: 156,
    views: 892,
    createdAt: new Date("2024-01-20T14:15:00Z"),
    blockchain: "0g",
    listed: true,
    verified: true,
  },
]

const mockCollections = [
  {
    name: "0G Cosmic Collection",
    description: "Mystical beings from the cosmic realms of the 0G universe",
    image: "/placeholder.svg?height=300&width=300",
    banner: "/placeholder.svg?height=200&width=800",
    creator: "0x1234567890123456789012345678901234567890",
    contractAddress: "0xabcdefghijklmnopqrstuvwxyz1234567890abcdef",
    totalSupply: 10000,
    floorPrice: "1.8",
    volume: "12450",
    owners: 3456,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    verified: true,
  },
  {
    name: "AI Artifacts",
    description: "First generation AI entities on the 0G blockchain",
    image: "/placeholder.svg?height=300&width=300",
    banner: "/placeholder.svg?height=200&width=800",
    creator: "0x2345678901234567890123456789012345678901",
    contractAddress: "0xbcdefghijklmnopqrstuvwxyz234567890abcdefg",
    totalSupply: 5000,
    floorPrice: "1.2",
    volume: "8750",
    owners: 2134,
    createdAt: new Date("2024-01-05T00:00:00Z"),
    verified: true,
  },
]

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB for seeding")

    const db = client.db(DB_NAME)

    // Clear existing data
    await db.collection("nfts").deleteMany({})
    await db.collection("collections").deleteMany({})
    console.log("Cleared existing data")

    // Insert NFTs
    const nftResult = await db.collection("nfts").insertMany(mockNFTs)
    console.log(`Inserted ${nftResult.insertedCount} NFTs`)

    // Insert Collections
    const collectionResult = await db.collection("collections").insertMany(mockCollections)
    console.log(`Inserted ${collectionResult.insertedCount} collections`)

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
