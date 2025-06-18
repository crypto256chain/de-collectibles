import { connectToDatabase } from "./database"

export class TokenManager {
  private static instance: TokenManager
  private currentTokenId = 0
  private initialized = false

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      const { db } = await connectToDatabase()

      // Get the highest token ID from the database
      const highestTokenNFT = await db
        .collection("nfts")
        .findOne({ tokenId: { $exists: true, $ne: null } }, { sort: { tokenId: -1 } })

      if (highestTokenNFT && highestTokenNFT.tokenId) {
        this.currentTokenId = Number.parseInt(highestTokenNFT.tokenId)
      }

      this.initialized = true
    } catch (error) {
      console.error("Error initializing TokenManager:", error)
      this.currentTokenId = 0
    }
  }

  public async getNextTokenId(): Promise<number> {
    if (!this.initialized) {
      await this.initialize()
    }

    this.currentTokenId += 1
    return this.currentTokenId
  }

  public async reserveTokenId(nftId: string): Promise<number> {
    const tokenId = await this.getNextTokenId()

    try {
      const { db } = await connectToDatabase()

      // Reserve the token ID in the database
      await db.collection("nfts").updateOne(
        { id: nftId },
        {
          $set: {
            reservedTokenId: tokenId.toString(),
            updatedAt: new Date(),
          },
        },
      )

      return tokenId
    } catch (error) {
      console.error("Error reserving token ID:", error)
      throw error
    }
  }

  public getCurrentTokenId(): number {
    return this.currentTokenId
  }
}

export const tokenManager = TokenManager.getInstance()
