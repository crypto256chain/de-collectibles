"use client"

import { Suspense, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Html } from "@react-three/drei"
import { Loader2, AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NFT3DViewerProps {
  modelUrl: string
}

function Model({ url }: { url: string }) {
  const [model, setModel] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Simple 3D model loader fallback
    const loadModel = async () => {
      try {
        // For demo purposes, we'll create a simple 3D object
        // In production, you'd use useGLTF or similar
        setModel({ scene: null })
      } catch (err) {
        setError(true)
      }
    }
    loadModel()
  }, [url])

  if (error) {
    throw new Error("Model failed to load")
  }

  // Simple 3D cube as fallback
  return (
    <mesh rotation={[0, 0, 0]} scale={[2, 2, 2]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8b5cf6" />
    </mesh>
  )
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-red-400 bg-black/80 p-6 rounded-2xl backdrop-blur-sm border border-red-500/20">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg font-semibold mb-2">3D model failed to load</p>
        <p className="text-sm text-red-300 mb-4">The 3D model couldn't be displayed</p>
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="border-red-400 text-red-400 hover:bg-red-400/10 rounded-xl"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    </Html>
  )
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-black/80 p-6 rounded-2xl backdrop-blur-sm border border-purple-500/20">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-4" />
        <p className="text-white text-lg font-semibold">Loading 3D model...</p>
        <p className="text-white/60 text-sm">This may take a moment</p>
      </div>
    </Html>
  )
}

export function NFT3DViewer({ modelUrl }: NFT3DViewerProps) {
  const [error, setError] = useState(false)
  const [key, setKey] = useState(0)

  const handleRetry = () => {
    setError(false)
    setKey((prev) => prev + 1)
  }

  const handleError = () => {
    setError(true)
  }

  useEffect(() => {
    setError(false)
    setKey((prev) => prev + 1)
  }, [modelUrl])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div className="text-center text-white/60 p-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h3 className="text-xl font-semibold mb-2">3D Model Unavailable</h3>
          <p className="mb-4 text-white/40">The 3D model couldn't be loaded</p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            className="border-white/20 text-white hover:bg-white/10 rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden">
      <Canvas
        key={key}
        camera={{ position: [0, 0, 5], fov: 45 }}
        onError={handleError}
        className="rounded-2xl"
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <directionalLight position={[0, 10, 5]} intensity={0.8} />

        <Suspense fallback={<LoadingSpinner />}>
          <Model url={modelUrl} />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
          minDistance={2}
          maxDistance={10}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>

      {/* 3D Controls Overlay */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-white/10">
        <p className="text-white/80 text-sm font-medium">🖱️ Drag to rotate • 🔍 Scroll to zoom</p>
      </div>

      {/* 3D Badge */}
      <div className="absolute top-4 left-4 bg-purple-500/20 backdrop-blur-sm rounded-xl px-3 py-2 border border-purple-500/30">
        <p className="text-purple-300 text-sm font-semibold">3D Model</p>
      </div>
    </div>
  )
}
