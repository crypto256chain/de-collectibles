"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Copy, ExternalLink, LogOut, AlertTriangle, CheckCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/components/wallet-provider"

export function WalletConnect() {
  const { isConnected, address, balance, isCorrectNetwork, connectWallet, disconnectWallet, switchNetwork, isLoading } =
    useWallet()
  const { toast } = useToast()

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    toast({
      title: "📋 Address Copied",
      description: "Wallet address copied to clipboard!",
    })
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleNetworkSwitch = async () => {
    try {
      await switchNetwork()
    } catch (error) {
      // Error is already handled in the wallet provider
    }
  }

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isLoading}
        className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300 wallet-connect-button"
      >
        <Wallet className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
        {isLoading ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-2 border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-xl rounded-2xl px-4 py-3 transform hover:scale-105 transition-all duration-300 wallet-connect-button"
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${isCorrectNetwork ? "bg-green-400" : "bg-red-400"} animate-pulse`}
            ></div>
            <span className="font-semibold">{formatAddress(address)}</span>
            <Badge
              variant="secondary"
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                isCorrectNetwork
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}
            >
              {balance} OG
            </Badge>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-black/90 border-white/10 backdrop-blur-2xl rounded-2xl p-2">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold text-lg">Connected Wallet</span>
            <div className="flex items-center gap-2">
              {isCorrectNetwork ? (
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1 rounded-full"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  0G Network
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-red-500/20 text-red-400 border-red-500/30 px-3 py-1 rounded-full"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Wrong Network
                </Badge>
              )}
            </div>
          </div>
          <div className="text-sm text-white/60 mb-3 font-mono bg-white/5 rounded-lg p-2">{address}</div>
          <div className="text-white font-semibold text-xl">Balance: {balance} OG</div>
        </div>

        <DropdownMenuSeparator className="bg-white/10" />

        {!isCorrectNetwork && (
          <>
            <DropdownMenuItem
              onClick={handleNetworkSwitch}
              className="text-orange-400 hover:bg-orange-500/10 focus:bg-orange-500/10 rounded-xl m-1 p-3"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Switch to 0G Network
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
          </>
        )}

        <DropdownMenuItem
          onClick={copyAddress}
          className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl m-1 p-3"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href={`https://chainscan-galileo.0g.ai/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-white hover:bg-white/10 focus:bg-white/10 rounded-xl m-1 p-3 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          onClick={disconnectWallet}
          className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 rounded-xl m-1 p-3"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
