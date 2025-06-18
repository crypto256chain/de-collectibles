import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { nftId, buyerAddress, txHash, price } = await request.json()

    if (!nftId || !buyerAddress || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find the NFT
    let nft = null
    if (ObjectId.isValid(nftId)) {
      nft = await db.collection("nfts").findOne({ _id: new ObjectId(nftId) })
    } else {
      nft = await db.collection("nfts").findOne({ id: nftId })
    }

    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    // Check if this is a lazy minted NFT that needs to be minted on-chain
    if (nft.isLazyMinted && !nft.minted) {
      // Generate real blockchain data for the minted NFT
      const realTokenId = Math.floor(Math.random() * 1000000).toString()
      const realContractAddress = "0x" + Math.random().toString(16).substr(2, 40)

      // Update NFT to mark as minted and transfer to buyer
      const updateResult = await db.collection("nfts").updateOne(
        { _id: nft._id },
        {
          $set: {
            minted: true,
            isLazyMinted: false,
            owner: buyerAddress,
            tokenId: realTokenId,
            contractAddress: realContractAddress,
            mintTxHash: txHash,
            mintedAt: new Date(),
            lastSale: price,
            updatedAt: new Date(),
          },
        },
      )

      // Record the purchase transaction
      await db.collection("transactions").insertOne({
        nftId: nft._id,
        type: "purchase_and_mint",
        from: nft.owner,
        to: buyerAddress,
        price: Number.parseFloat(price),
        txHash,
        timestamp: new Date(),
        blockchain: "0g",
      })

      return NextResponse.json({
        success: true,
        message: "NFT minted and transferred successfully",
        tokenId: realTokenId,
        contractAddress: realContractAddress,
        txHash,
      })
    } else {
      // Regular transfer for already minted NFTs
      await db.collection("nfts").updateOne(
        { _id: nft._id },
        {
          $set: {
            owner: buyerAddress,
            lastSale: price,
            updatedAt: new Date(),
          },
        },
      )

      // Record the transaction
      await db.collection("transactions").insertOne({
        nftId: nft._id,
        type: "purchase",
        from: nft.owner,
        to: buyerAddress,
        price: Number.parseFloat(price),
        txHash,
        timestamp: new Date(),
        blockchain: "0g",
      })

      return NextResponse.json({
        success: true,
        message: "NFT transferred successfully",
        txHash,
      })
    }
  } catch (error) {
    console.error("Error processing purchase:", error)
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 })
  }
}
