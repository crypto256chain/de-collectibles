// MongoDB setup script for NFT Marketplace
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "0g-nft-marketplace"

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(DB_NAME)

    // Create collections
    const collections = ["nfts", "collections", "users", "transactions", "offers", "favorites"]

    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName)
        console.log(`Created collection: ${collectionName}`)
      } catch (error) {
        if (error.code === 48) {
          console.log(`Collection ${collectionName} already exists`)
        } else {
          throw error
        }
      }
    }

    // Create indexes
    await db.collection("nfts").createIndex({ tokenId: 1, contractAddress: 1 }, { unique: true })
    await db.collection("nfts").createIndex({ name: "text", description: "text" })
    await db.collection("nfts").createIndex({ collection: 1 })
    await db.collection("nfts").createIndex({ creator: 1 })
    await db.collection("nfts").createIndex({ owner: 1 })
    await db.collection("nfts").createIndex({ price: 1 })
    await db.collection("nfts").createIndex({ createdAt: -1 })

    await db.collection("users").createIndex({ address: 1 }, { unique: true })
    await db.collection("transactions").createIndex({ nftId: 1 })
    await db.collection("transactions").createIndex({ from: 1 })
    await db.collection("transactions").createIndex({ to: 1 })
    await db.collection("transactions").createIndex({ timestamp: -1 })

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await client.close()
  }
}

setupDatabase()
