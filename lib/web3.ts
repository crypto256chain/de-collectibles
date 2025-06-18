"use client"

declare global {
  interface Window {
    ethereum?: any
  }
}

export const OG_NETWORK_CONFIG = {
  chainId: 16601,
  chainIdHex: "0x40D9",
  chainName: "0G-Galileo-Testnet",
  nativeCurrency: {
    name: "OG",
    symbol: "OG",
    decimals: 18,
  },
  rpcUrls: ["https://evmrpc-testnet.0g.ai"],
  blockExplorerUrls: ["https://chainscan-galileo.0g.ai"],
}

export class Web3Service {
  private static instance: Web3Service
  private provider: any = null

  private constructor() {
    if (typeof window !== "undefined" && window.ethereum) {
      this.provider = window.ethereum
    }
  }

  public static getInstance(): Web3Service {
    if (!Web3Service.instance) {
      Web3Service.instance = new Web3Service()
    }
    return Web3Service.instance
  }

  async connectWallet(): Promise<string[]> {
    if (!this.provider) {
      throw new Error("No wallet provider found")
    }

    try {
      const accounts = await this.provider.request({
        method: "eth_requestAccounts",
      })

      await this.switchToOGNetwork()
      return accounts
    } catch (error) {
      console.error("Error connecting wallet:", error)
      throw error
    }
  }

  async switchToOGNetwork(): Promise<void> {
    if (!this.provider) {
      throw new Error("No wallet provider found")
    }

    try {
      await this.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: OG_NETWORK_CONFIG.chainIdHex }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        await this.addOGNetwork()
      } else {
        throw error
      }
    }
  }

  async addOGNetwork(): Promise<void> {
    if (!this.provider) {
      throw new Error("No wallet provider found")
    }

    await this.provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: OG_NETWORK_CONFIG.chainIdHex,
          chainName: OG_NETWORK_CONFIG.chainName,
          nativeCurrency: OG_NETWORK_CONFIG.nativeCurrency,
          rpcUrls: OG_NETWORK_CONFIG.rpcUrls,
          blockExplorerUrls: OG_NETWORK_CONFIG.blockExplorerUrls,
        },
      ],
    })
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error("No wallet provider found")
    }

    const balance = await this.provider.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    })

    return (Number.parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
  }

  async getCurrentAccount(): Promise<string | null> {
    if (!this.provider) {
      return null
    }

    try {
      const accounts = await this.provider.request({
        method: "eth_accounts",
      })
      return accounts.length > 0 ? accounts[0] : null
    } catch (error) {
      console.error("Error getting current account:", error)
      return null
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new Error("No wallet provider found")
    }

    const accounts = await this.getCurrentAccount()
    if (!accounts) {
      throw new Error("No account connected")
    }

    return await this.provider.request({
      method: "personal_sign",
      params: [message, accounts],
    })
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (this.provider) {
      this.provider.on("accountsChanged", callback)
    }
  }

  onChainChanged(callback: (chainId: string) => void): void {
    if (this.provider) {
      this.provider.on("chainChanged", callback)
    }
  }

  removeAllListeners(): void {
    if (this.provider) {
      this.provider.removeAllListeners()
    }
  }
}

export const web3Service = Web3Service.getInstance()
