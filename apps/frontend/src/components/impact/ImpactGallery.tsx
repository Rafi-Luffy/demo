import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImpactGalleryProps {
  isOpen: boolean
  onClose: () => void
}

const galleryImages = Array.from({ length: 13 }, (_, i) => ({
  id: i + 1,
  src: `/images/image_${i + 1}.png`,
  alt: `Impact Story ${i + 1}`,
  title: `Real Impact Story ${i + 1}`,
  description: `Witness the transformative power of your donations - real stories of hope, change, and progress in communities across India.`
}))

export function ImpactGallery({ isOpen, onClose }: ImpactGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-6xl w-full h-full flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-warm-orange" fill="currentColor" />
              <h2 className="text-2xl font-handwritten text-white">Impact Gallery</h2>
              <span className="text-white/70 text-sm">Stories of Hope & Change</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10 rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Main Image */}
          <div className="flex-1 flex items-center justify-center relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevImage}
              className="absolute left-4 z-10 text-white hover:bg-white/10 rounded-full"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="relative max-w-4xl max-h-[70vh] mx-auto"
            >
              <img
                src={galleryImages[currentIndex].src}
                alt={galleryImages[currentIndex].alt}
                className="w-full h-full object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://images.unsplash.com/photo-${1500000000000 + currentIndex}?w=800&h=600&fit=crop&crop=center`;
                }}
              />
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <h3 className="text-xl font-handwritten text-white mb-2">
                  {galleryImages[currentIndex].title}
                </h3>
                <p className="text-white/90 text-sm">
                  {galleryImages[currentIndex].description}
                </p>
              </div>
            </motion.div>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextImage}
              className="absolute right-4 z-10 text-white hover:bg-white/10 rounded-full"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>

          {/* Thumbnails */}
          <div className="flex justify-center space-x-2 mt-4 overflow-x-auto pb-2">
            {galleryImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-warm-orange shadow-lg' 
                    : 'border-white/30 hover:border-warm-orange/50'
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://images.unsplash.com/photo-${1500000000000 + index}?w=100&h=100&fit=crop&crop=center`;
                  }}
                />
              </button>
            ))}
          </div>

          {/* Counter */}
          <div className="text-center mt-4">
            <span className="text-white/70 text-sm">
              {currentIndex + 1} of {galleryImages.length}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
