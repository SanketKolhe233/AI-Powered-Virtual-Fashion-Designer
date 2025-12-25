import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Expand, X } from 'lucide-react'

function ImageGrid({ images, columns = 2 }) {
  const [selectedImage, setSelectedImage] = useState(null)

  const handleImageClick = (image, index) => {
    setSelectedImage({ image, index })
  }

  const handleDownload = (image, index) => {
    // In a real app, this would trigger image download
    console.log('Download image:', index)
    // For base64 images, you could create a download link
    // For URLs, you could fetch and download
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-500 dark:text-gray-500">
        No images to display
      </div>
    )
  }

  return (
    <>
      <div className={`grid gap-4 ${
        columns === 1 ? 'grid-cols-1' :
        columns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
        columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative group cursor-pointer rounded-lg overflow-hidden bg-secondary-100 dark:bg-gray-800"
          >
            {/* Display actual image */}
            <div className="aspect-square">
              <img
                src={image}
                alt={`Generated image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback placeholder if image fails to load */}
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center" style={{display: 'none'}}>
                <div className="text-center p-4">
                  <div className="text-2xl mb-2">🎨</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Generated Image {index + 1}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Failed to load
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleImageClick(image, index)
                  }}
                  className="p-2 bg-white dark:bg-gray-800 rounded-full text-secondary-700 dark:text-gray-300 hover:bg-secondary-100 dark:hover:bg-gray-700 transition-colors"
                  title="View larger"
                >
                  <Expand className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(image, index)
                  }}
                  className="p-2 bg-white dark:bg-gray-800 rounded-full text-secondary-700 dark:text-gray-300 hover:bg-secondary-100 dark:hover:bg-gray-700 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal for enlarged image */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative max-w-4xl max-h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                Generated Image {selectedImage.index + 1}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedImage.image, selectedImage.index)}
                  className="p-2 text-secondary-600 dark:text-gray-400 hover:text-secondary-800 dark:hover:text-white hover:bg-secondary-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 text-secondary-600 dark:text-gray-400 hover:text-secondary-800 dark:hover:text-white hover:bg-secondary-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal content */}
            <div className="p-4">
              {/* Enlarged image */}
              <div className="aspect-square max-w-lg mx-auto">
                <img
                  src={selectedImage.image}
                  alt={`Generated image ${selectedImage.index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback placeholder if image fails to load */}
                <div className="aspect-square bg-gradient-to-br from-primary-100 to-purple-100 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🎨</div>
                    <div className="text-lg text-gray-700 dark:text-gray-300 mb-2">Generated Fashion Item</div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      Image {selectedImage.index + 1}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                      Failed to load image
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Image metadata */}
              <div className="mt-4 p-3 bg-secondary-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <div className="mb-1">
                    <span className="font-medium">Format:</span> JPEG
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Resolution:</span> 512x512
                  </div>
                  <div>
                    <span className="font-medium">Generated:</span> Just now
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export default ImageGrid