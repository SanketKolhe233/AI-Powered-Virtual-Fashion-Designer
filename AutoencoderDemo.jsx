import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Loader2, Image as ImageIcon, Zap, Info } from 'lucide-react'
import { fashionAPI } from '../api'
import toast from 'react-hot-toast'

function AutoencoderDemo({ modelType = 'autoencoder' }) {
  const [modelInfo, setModelInfo] = useState(null)
  const [sampleImages, setSampleImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [reconstruction, setReconstruction] = useState(null)
  const [loading, setLoading] = useState({
    modelInfo: true,
    images: true,
    reconstruction: false
  })

  const modelTitle = modelType === 'vae' ? 'VAE' : 'Autoencoder'

  useEffect(() => {
    fetchModelInfo()
    fetchSampleImages()
  }, [modelType])

  const fetchModelInfo = async () => {
    try {
      const info = modelType === 'vae' 
        ? await fashionAPI.getVAEInfo()
        : await fashionAPI.getAutoencoderInfo()
      setModelInfo(info)
      toast.success(`Trained ${modelTitle} model loaded!`)
    } catch (error) {
      toast.error('Failed to load model info')
      console.error('Model info error:', error)
    } finally {
      setLoading(prev => ({ ...prev, modelInfo: false }))
    }
  }

  const fetchSampleImages = async () => {
    try {
      const data = await fashionAPI.getDatasetImages('train', 12)
      setSampleImages(data.images || [])
    } catch (error) {
      toast.error('Failed to load sample images')
      console.error('Sample images error:', error)
    } finally {
      setLoading(prev => ({ ...prev, images: false }))
    }
  }

  const handleImageSelect = async (image) => {
    setSelectedImage(image)
    setReconstruction(null)
    setLoading(prev => ({ ...prev, reconstruction: true }))

    try {
      const result = modelType === 'vae'
        ? await fashionAPI.reconstructImageVAE('train', image.file_name)
        : await fashionAPI.reconstructImage('train', image.file_name)
      setReconstruction(result)
      toast.success('Image reconstructed successfully!')
    } catch (error) {
      toast.error('Reconstruction failed')
      console.error('Reconstruction error:', error)
    } finally {
      setLoading(prev => ({ ...prev, reconstruction: false }))
    }
  }

  return (
    <div className="space-y-8">
      {/* Model Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${modelType === 'vae' ? 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20' : 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'} rounded-xl p-6`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 ${modelType === 'vae' ? 'bg-indigo-500' : 'bg-blue-500'} rounded-lg`}>
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              {modelType === 'vae' ? 'Trained VAE Model' : 'Trained Autoencoder Model'}
              <Info className={`w-5 h-5 ${modelType === 'vae' ? 'text-indigo-500 dark:text-indigo-400' : 'text-blue-500 dark:text-blue-400'}`} />
            </h3>
            {loading.modelInfo ? (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading model information...
              </div>
            ) : modelInfo ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">Image Size</div>
                  <div className={modelType === 'vae' ? 'text-indigo-600 dark:text-indigo-400' : 'text-blue-600 dark:text-blue-400'}>{modelInfo.img_size}x{modelInfo.img_size}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">Device</div>
                  <div className={modelType === 'vae' ? 'text-indigo-600' : 'text-blue-600'}>{modelInfo.device}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">Status</div>
                  <div className="text-green-600 dark:text-green-400">
                    {modelInfo.model_loaded ? 'Loaded' : 'Not Loaded'}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">Normalization</div>
                  <div className={modelType === 'vae' ? 'text-indigo-600 dark:text-indigo-400' : 'text-blue-600 dark:text-blue-400'}>Mean: {modelInfo.mean?.join(', ')}</div>
                </div>
              </div>
            ) : (
              <div className="text-red-600 dark:text-red-400">Failed to load model information</div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Test Your Trained Autoencoder
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Click on any fashion image below to see how your trained autoencoder reconstructs it. 
          This demonstrates the real AI model you've trained working with actual fashion images from your dataset.
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Real dataset images
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Trained model inference
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Live reconstruction
          </div>
        </div>
      </motion.div>

      {/* Sample Images Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Select a Fashion Image to Reconstruct
        </h3>
        
        {loading.images ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sampleImages.map((image, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleImageSelect(image)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage?.file_name === image.file_name
                    ? modelType === 'vae' 
                      ? 'border-indigo-500 ring-2 ring-indigo-200'
                      : 'border-blue-500 ring-2 ring-blue-200'
                    : modelType === 'vae'
                      ? 'border-gray-200 hover:border-indigo-300'
                      : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <img
                  src={image.url}
                  alt={`Fashion item ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Reconstruction Results */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Autoencoder Reconstruction
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Image */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Original Image</h4>
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                <img
                  src={selectedImage.url}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                File: {selectedImage.file_name}
              </p>
            </div>

            {/* Reconstructed Image */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Reconstructed Image</h4>
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                {loading.reconstruction ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className={`w-8 h-8 animate-spin ${modelType === 'vae' ? 'text-indigo-500' : 'text-blue-500'}`} />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reconstructing with trained model...</p>
                  </div>
                ) : reconstruction ? (
                  <img
                    src={reconstruction.reconstruction.reconstructed}
                    alt="Reconstructed"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Reconstruction will appear here</p>
                  </div>
                )}
              </div>
              {reconstruction && (
                <p className="text-sm text-green-600">
                  ✓ Successfully reconstructed with trained autoencoder
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AutoencoderDemo