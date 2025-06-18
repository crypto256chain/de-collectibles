"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface WalletContextType {
  isConnected: boolean
  address: string
  balance: string
  isCorrectNetwork: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: () => Promise<void>
  isLoading: boolean
  sendTransaction: (to: string, value: string, data?: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

const OG_NETWORK_CONFIG = {
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

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState("")
  const [balance, setBalance] = useState("0")
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const hasShownNetworkWarning = useRef(false)
  const isInitialized = useRef(false)
  const checkInterval = useRef<NodeJS.Timeout | null>(null)
  const networkCheckAttempts = useRef(0)

  useEffect(() => {
    const initializeWallet = async () => {
      if (typeof window === "undefined" || typeof window.ethereum === "undefined") return

      try {
        // Check if already connected
        const wasConnected = localStorage.getItem("walletConnected")
        const accounts = await window.ethereum.request({ method: "eth_accounts" })

        if (accounts.length > 0 && wasConnected) {
          setIsConnected(true)
          setAddress(accounts[0])
          await getBalance(accounts[0])

          // Enhanced network detection with multiple attempts
          await checkNetworkWithRetry(5)
        } else {
          // Even if not connected, check network to avoid false warnings
          await checkNetworkWithRetry(3)
        }

        // Set up continuous monitoring
        startContinuousMonitoring()
      } catch (error) {
        console.error("Error initializing wallet:", error)
      } finally {
        isInitialized.current = true
      }
    }

    if (!isInitialized.current) {
      // Add a small delay to ensure page is fully loaded
      setTimeout(() => {
        initializeWallet()
        setupEventListeners()
      }, 500)
    }

    return () => {
      removeEventListeners()
      if (checkInterval.current) {
        clearInterval(checkInterval.current)
      }
    }
  }, [])

  const checkNetworkWithRetry = async (maxRetries = 5) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        // Wait a bit longer between attempts
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1500))
        }

        const chainId = await window.ethereum.request({
          method: "eth_chainId",
          params: [],
        })

        console.log(`Network check attempt ${i + 1}: chainId = ${chainId}`)

        const isCorrect = chainId === OG_NETWORK_CONFIG.chainIdHex
        setIsCorrectNetwork(isCorrect)
        networkCheckAttempts.current = i + 1

        if (isCorrect) {
          console.log("✅ Correct network detected")
          break
        }

        // If this is the last attempt and still wrong network
        if (i === maxRetries - 1 && !isCorrect) {
          console.log("❌ Wrong network after all attempts")
        }
      } catch (error) {
        console.error(`Network check attempt ${i + 1} failed:`, error)
        if (i === maxRetries - 1) {
          setIsCorrectNetwork(false)
        }
      }
    }
  }

  const startContinuousMonitoring = () => {
    // Check wallet status every 3 seconds (less frequent to avoid spam)
    checkInterval.current = setInterval(async () => {
      if (typeof window.ethereum === "undefined") return

      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        const wasConnected = localStorage.getItem("walletConnected")

        if (accounts.length > 0 && wasConnected) {
          if (!isConnected || address !== accounts[0]) {
            setIsConnected(true)
            setAddress(accounts[0])
            await getBalance(accounts[0])
          }

          // Check network less frequently and with better error handling
          try {
            const chainId = await window.ethereum.request({ method: "eth_chainId" })
            const isCorrect = chainId === OG_NETWORK_CONFIG.chainIdHex

            if (isCorrectNetwork !== isCorrect) {
              setIsCorrectNetwork(isCorrect)
            }
          } catch (networkError) {
            console.error("Network check error in monitoring:", networkError)
          }
        } else if (isConnected) {
          // Wallet was disconnected
          setIsConnected(false)
          setAddress("")
          setBalance("0")
          setIsCorrectNetwork(false)
          localStorage.removeItem("walletConnected")
          localStorage.removeItem("walletAddress")
        }
      } catch (error) {
        console.error("Error in continuous monitoring:", error)
      }
    }, 3000)
  }

  const setupEventListeners = () => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
      window.ethereum.on("connect", handleConnect)
      window.ethereum.on("disconnect", handleDisconnect)
    }
  }

  const removeEventListeners = () => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", handleChainChanged)
      window.ethereum.removeListener("connect", handleConnect)
      window.ethereum.removeListener("disconnect", handleDisconnect)
    }
  }

  const handleConnect = () => {
    console.log("Wallet connected event")
    // Recheck network after connection
    setTimeout(() => checkNetworkWithRetry(3), 1000)
  }

  const handleDisconnect = () => {
    console.log("Wallet disconnected event")
    disconnectWallet()
  }

  const handleAccountsChanged = async (accounts: string[]) => {
    console.log("Accounts changed:", accounts)
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAddress(accounts[0])
      await getBalance(accounts[0])
      localStorage.setItem("walletConnected", "true")
      localStorage.setItem("walletAddress", accounts[0])

      // Recheck network when account changes
      setTimeout(() => checkNetworkWithRetry(3), 500)
    }
  }

  const handleChainChanged = async (chainId: string) => {
    console.log("Chain changed to:", chainId)
    const isCorrect = chainId === OG_NETWORK_CONFIG.chainIdHex
    setIsCorrectNetwork(isCorrect)

    // Only show notification if user is connected and initialized
    if (isConnected && isInitialized.current && !hasShownNetworkWarning.current) {
      if (!isCorrect) {
        toast({
          title: "⚠️ Network Changed",
          description: "Please switch to 0G Network to continue using the marketplace.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "✅ Network Connected",
          description: "Successfully connected to 0G Network!",
        })
      }
      hasShownNetworkWarning.current = true
      // Reset the flag after 5 seconds
      setTimeout(() => {
        hasShownNetworkWarning.current = false
      }, 5000)
    }
  }

  const getBalance = async (address: string) => {
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      const balanceInOG = (Number.parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
      setBalance(balanceInOG)
    } catch (error) {
      console.error("Error getting balance:", error)
    }
  }

  const addNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [OG_NETWORK_CONFIG],
      })

      // Wait a bit and then check network
      setTimeout(() => {
        checkNetworkWithRetry(3)
      }, 1000)

      toast({
        title: "🎉 Network Added",
        description: "0G Network has been successfully added to your wallet!",
      })
    } catch (error) {
      console.error("Error adding network:", error)
      throw error
    }
  }

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: OG_NETWORK_CONFIG.chainIdHex }],
      })

      // Wait a bit and then check network
      setTimeout(() => {
        checkNetworkWithRetry(3)
      }, 1000)

      toast({
        title: "✅ Network Switched",
        description: "Successfully switched to 0G Network!",
      })
    } catch (error: any) {
      if (error.code === 4902) {
        await addNetwork()
      } else {
        toast({
          title: "❌ Network Switch Failed",
          description: "Failed to switch to 0G Network. Please try manually in your wallet.",
          variant: "destructive",
        })
        throw error
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast({
        title: "❌ MetaMask Not Found",
        description: "Please install MetaMask or another Web3 wallet to connect.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      setIsConnected(true)
      setAddress(accounts[0])
      await getBalance(accounts[0])

      localStorage.setItem("walletConnected", "true")
      localStorage.setItem("walletAddress", accounts[0])

      // Check network after connection with delay
      setTimeout(() => {
        checkNetworkWithRetry(3)
      }, 1000)

      toast({
        title: "🎉 Wallet Connected",
        description: "Wallet connected successfully!",
      })
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      if (error.code === 4001) {
        toast({
          title: "⚠️ Connection Rejected",
          description: "Wallet connection was rejected by user.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "❌ Connection Failed",
          description: error.message || "Failed to connect wallet. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress("")
    setBalance("0")
    setIsCorrectNetwork(false)

    localStorage.removeItem("walletConnected")
    localStorage.removeItem("walletAddress")

    toast({
      title: "👋 Wallet Disconnected",
      description: "Your wallet has been disconnected from the marketplace.",
    })
  }

  const sendTransaction = async (to: string, value: string, data?: string): Promise<string> => {
    if (!isConnected) {
      throw new Error("Wallet not connected")
    }

    if (!isCorrectNetwork) {
      throw new Error("Please switch to 0G Network")
    }

    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to,
            value: `0x${Number.parseInt(value).toString(16)}`,
            data: data || "0x",
          },
        ],
      })

      return txHash
    } catch (error: any) {
      console.error("Transaction failed:", error)
      throw new Error(error.message || "Transaction failed")
    }
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        balance,
        isCorrectNetwork,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        isLoading,
        sendTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
