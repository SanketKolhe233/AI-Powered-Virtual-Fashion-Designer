import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, Wand2, Image as ImageIcon, Download } from 'lucide-react'
import { fashionAPI } from '../api'
import toast from 'react-hot-toast'

function TransformerGeneration() {
  const [generatingImages, setGeneratingImages] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [numSamples, setNumSamples] = useState(4)
  const [generatedResults, setGeneratedResults] = useState(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setGeneratingImages(true)
    
    try {
      const data = await fashionAPI.generateWithModel('transformer', prompt, numSamples)
      setGeneratedResults(data)
      toast.success(`Generated ${data.num_generated} images!`)
    } catch (error) {
      toast.error(`Generation failed: ${error.message}`)
      console.error('Generation error:', error)
    } finally {
      setGeneratingImages(false)
    }
  }

  const downloadImage = (imageUrl, index) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `transformer_${index + 1}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Transformer: Text-to-Image
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Generate fashion images from text descriptions using Vision Transformer
        </p>
      </motion.div>

      {/* Generation Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generate Images</h2>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Describe the fashion item
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., elegant black evening dress with lace details"
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            rows="3"
          />
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of images: {numSamples}
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={numSamples}
              onChange={(e) => setNumSamples(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span>8</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generatingImages || !prompt.trim()}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {generatingImages ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Images
            </>
          )}
        </button>
      </motion.div>

      {/* Generated Images */}
      {generatedResults && generatedResults.generated_images && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generated Images ({generatedResults.num_generated})
              </h3>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Prompt: "{generatedResults.prompt}"
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {generatedResults.generated_images.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all"
              >
                <img
                  src={img}
                  alt={`Generated ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => downloadImage(img, idx)}
                    className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  Image {idx + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!generatedResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center"
        >
          <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No images generated yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a prompt above and click "Generate Images" to create fashion images
          </p>
        </motion.div>
      )}

      {/* Model Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-4"
      >
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          About Transformer Model
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Vision Transformer with cross-attention mechanism</li>
          <li>• Trained on 256×256 fashion images</li>
          <li>• Generates images from natural language descriptions</li>
          <li>• 58M parameters, trained for 80 epochs</li>
        </ul>
      </motion.div>
    </div>
  )
}

export default TransformerGeneration
