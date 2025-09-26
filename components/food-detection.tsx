"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, CameraOff, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface NutritionInfo {
  [key: string]: number | string
}

interface DetectionResult {
  foodName: string
  confidence: number
  nutritionInfo: NutritionInfo | null
}

export function FoodDetectionComponent() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsDetecting(true)
      }
    } catch (err) {
      setError("Could not access camera. Please ensure camera permissions are granted.")
      console.error("Camera access error:", err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsDetecting(false)
    setDetectionResult(null)
  }

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error("Could not get canvas context")
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
        }, 'image/jpeg', 0.8)
      })

      // Create FormData and send to API
      const formData = new FormData()
      formData.append('image', blob, 'capture.jpg')

      const response = await fetch('/api/food-detection', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Detection failed: ${response.statusText}`)
      }

      const result: DetectionResult = await response.json()
      setDetectionResult(result)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Detection failed")
      console.error("Detection error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const formatNutritionValue = (key: string, value: number | string) => {
    if (typeof value === 'number') {
      // Format numbers appropriately
      if (key.toLowerCase().includes('calorie') || key.toLowerCase().includes('energy')) {
        return `${value} kcal`
      } else if (key.toLowerCase().includes('protein') || key.toLowerCase().includes('fat') || 
                 key.toLowerCase().includes('carb') || key.toLowerCase().includes('fiber')) {
        return `${value} g`
      } else if (key.toLowerCase().includes('sodium')) {
        return `${value} mg`
      } else if (key.toLowerCase().includes('vitamin') || key.toLowerCase().includes('mineral')) {
        return `${value} mg`
      }
    }
    return value.toString()
  }

  return (
    <div className="space-y-6">
      {/* Camera Section */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Video Display */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[500px] object-cover"
                style={{ display: isDetecting ? 'block' : 'none' }}
              />
              {!isDetecting && (
                <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <div className="text-center">
                    <Camera className="h-20 w-20 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 text-xl">Camera not active</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Controls */}
            <div className="flex gap-3">
              {!isDetecting ? (
                <Button onClick={startCamera} className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={captureAndDetect} 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    {isLoading ? "Detecting..." : "Detect Food"}
                  </Button>
                  <Button onClick={stopCamera} variant="outline" className="flex items-center gap-2">
                    <CameraOff className="h-4 w-4" />
                    Stop Camera
                  </Button>
                </>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detection Results */}
      {detectionResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Food Information */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Detected Food</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {detectionResult.foodName}
                  </h3>
                  <Badge 
                    variant={detectionResult.confidence > 0.7 ? "default" : "secondary"}
                    className="text-sm"
                  >
                    Confidence: {(detectionResult.confidence * 100).toFixed(1)}%
                  </Badge>
                </div>
                
                {detectionResult.confidence < 0.7 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Low confidence detection. Please try again with better lighting or a clearer view of the food.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Nutrition Information */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Nutritional Information</CardTitle>
            </CardHeader>
            <CardContent>
              {detectionResult.nutritionInfo ? (
                <div className="space-y-3">
                  {/* Priority nutrition fields */}
                  {['Caloric Value', 'Protein', 'Fat', 'Carbohydrates', 'Fiber', 'Sodium'].map(field => {
                    const value = detectionResult.nutritionInfo![field]
                    if (value !== undefined && value !== null) {
                      return (
                        <div key={field} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                          <span className="font-medium">{field}</span>
                          <span className="text-primary font-semibold">
                            {formatNutritionValue(field, value)}
                          </span>
                        </div>
                      )
                    }
                    return null
                  })}
                  
                  {/* Additional nutrition fields */}
                  {Object.entries(detectionResult.nutritionInfo)
                    .filter(([key]) => !['Caloric Value', 'Protein', 'Fat', 'Carbohydrates', 'Fiber', 'Sodium'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-1 text-sm">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="text-muted-foreground">
                          {formatNutritionValue(key, value)}
                        </span>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No nutritional information available for this food item.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. Click "Start Camera" to activate your webcam</p>
            <p>2. Point the camera at a food item</p>
            <p>3. Click "Detect Food" to analyze the image</p>
            <p>4. View the detected food name and nutritional information</p>
            <p>5. Click "Stop Camera" when finished</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
