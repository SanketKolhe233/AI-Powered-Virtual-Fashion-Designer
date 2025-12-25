import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Loader2, Info, TrendingUp, BarChart3, Activity, Sparkles, Image as ImageIcon } from 'lucide-react'
import { fashionAPI } from '../api'
import toast from 'react-hot-toast'

function VAEEvaluation() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(() => {
    const saved = sessionStorage.getItem('vaeResults');
    return saved ? JSON.parse(saved) : null;
  })
  const [numSamples, setNumSamples] = useState(20)
  
  // Generation state
  const [generatingImages, setGeneratingImages] = useState(false)
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [numGeneratedSamples, setNumGeneratedSamples] = useState(5)
  const [generatedResults, setGeneratedResults] = useState(() => {
    const saved = sessionStorage.getItem('vaeGeneratedResults');
    return saved ? JSON.parse(saved) : null;
  })

  // Persist results to sessionStorage whenever they change
  useEffect(() => {
    if (results) {
      sessionStorage.setItem('vaeResults', JSON.stringify(results));
    }
  }, [results]);

  useEffect(() => {
    if (generatedResults) {
      sessionStorage.setItem('vaeGeneratedResults', JSON.stringify(generatedResults));
    }
  }, [generatedResults]);

  const handleEvaluate = async () => {
    setLoading(true)
    
    try {
      const data = await fashionAPI.evaluateVAE(numSamples)
      setResults(data)
      toast.success('Evaluation completed successfully!')
    } catch (error) {
      toast.error(`Evaluation failed: ${error.message}`)
      console.error('Evaluation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!generationPrompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setGeneratingImages(true)
    
    try {
      const data = await fashionAPI.generateVAEImages(generationPrompt, numGeneratedSamples)
      setGeneratedResults(data)
      toast.success(`Generated ${data.num_generated} images!`)
    } catch (error) {
      toast.error(`Generation failed: ${error.message}`)
      console.error('Generation error:', error)
    } finally {
      setGeneratingImages(false)
    }
  }

  const MetricCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400 mb-1`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          VAE: Trying It Out
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Generate new fashion images from text prompts or evaluate reconstruction quality
        </p>
      </motion.div>

      {/* IMAGE GENERATION SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Text-to-Image Generation</h2>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            <strong>How it works:</strong> The VAE finds fashion items matching your prompt, learns their latent representations, 
            and generates new variations by sampling from the learned distribution.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe what you want to generate
              </label>
              <input
                type="text"
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                placeholder="e.g., red dress, blue jeans, striped shirt..."
                className="input-field"
                disabled={generatingImages}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of variations to generate
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={numGeneratedSamples}
                onChange={(e) => setNumGeneratedSamples(parseInt(e.target.value) || 5)}
                className="input-field"
                disabled={generatingImages}
              />
            </div>
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={generatingImages || !generationPrompt.trim()}
          className="btn btn-primary flex items-center gap-2"
        >
          {generatingImages ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating images...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Images
            </>
          )}
        </button>
      </motion.div>

      {/* Generated Images Display */}
      {generatedResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Generated Images</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Prompt: "<em>{generatedResults.prompt}</em>" • Strategy: {generatedResults.strategy.replace('_', ' ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{generatedResults.num_generated}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">images generated</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {generatedResults.images.map((imgSrc, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="relative group"
              >
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                  <img
                    src={imgSrc}
                    alt={`Generated ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white font-semibold text-lg">
                    #{idx + 1}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          
          {generatedResults.strategy === 'random_sampling' && (
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                No matching reference images found in the dataset. Generating from random latent space samples.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">Evaluation Metrics</span>
        </div>
      </div>

      {/* Evaluation Control */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Test Samples
            </label>
            <input
              type="number"
              min="5"
              max="100"
              value={numSamples}
              onChange={(e) => setNumSamples(parseInt(e.target.value) || 10)}
              className="input-field"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              More samples = more accurate metrics (but slower)
            </p>
          </div>
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2 h-fit mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Evaluation
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Info Banner */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-900 dark:text-indigo-300">
              <p className="font-medium mb-1">Evaluation Complete!</p>
              <p>Analyzed {results.num_samples} test images. Lower MSE and higher PSNR/SSIM indicate better reconstruction quality.</p>
            </div>
          </div>

          {/* Reconstruction Quality Metrics */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Reconstruction Quality Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Mean Squared Error (MSE)"
                value={results.metrics.mse.mean.toFixed(6)}
                subtitle={`σ = ${results.metrics.mse.std.toFixed(6)}`}
                icon={TrendingUp}
                color="red"
              />
              <MetricCard
                title="Peak Signal-to-Noise Ratio (PSNR)"
                value={results.metrics.psnr.mean.toFixed(2)}
                subtitle={`${results.metrics.psnr.min.toFixed(2)} - ${results.metrics.psnr.max.toFixed(2)} dB`}
                icon={Activity}
                color="green"
              />
              <MetricCard
                title="Structural Similarity (SSIM)"
                value={results.metrics.ssim.mean.toFixed(4)}
                subtitle={`σ = ${results.metrics.ssim.std.toFixed(4)}`}
                icon={BarChart3}
                color="indigo"
              />
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detailed Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* MSE Details */}
              <div>
                <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">MSE Distribution</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mean:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{results.metrics.mse.mean.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Std Dev:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{results.metrics.mse.std.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Min:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{results.metrics.mse.min.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Max:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{results.metrics.mse.max.toFixed(6)}</span>
                  </div>
                </div>
              </div>

              {/* PSNR Details */}
              <div>
                <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-3">PSNR Distribution (dB)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mean:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{results.metrics.psnr.mean.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Std Dev:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{results.metrics.psnr.std.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Min:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{results.metrics.psnr.min.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Max:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{results.metrics.psnr.max.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* SSIM Details */}
              <div>
                <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">SSIM Distribution</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mean:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{results.metrics.ssim.mean.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Std Dev:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{results.metrics.ssim.std.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Min:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{results.metrics.ssim.min.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Max:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{results.metrics.ssim.max.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Latent Dimension</p>
                <p className="font-semibold text-gray-900 dark:text-white">{results.model_info.latent_dim}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Image Size</p>
                <p className="font-semibold text-gray-900 dark:text-white">{results.model_info.image_size}×{results.model_info.image_size}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Training Epochs</p>
                <p className="font-semibold text-gray-900 dark:text-white">{results.model_info.training_epochs}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Model Size</p>
                <p className="font-semibold text-gray-900 dark:text-white">{results.model_info.model_size_mb.toFixed(2)} MB</p>
              </div>
            </div>
          </div>

          {/* Metrics Explanation */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Understanding the Metrics</h3>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <span className="font-semibold text-red-600 dark:text-red-400">MSE (Mean Squared Error):</span> Measures average pixel-wise squared difference. Lower is better (0 = perfect reconstruction).
              </div>
              <div>
                <span className="font-semibold text-green-600 dark:text-green-400">PSNR (Peak Signal-to-Noise Ratio):</span> Measures reconstruction quality in dB. Higher is better (typically 20-40 dB for good quality).
              </div>
              <div>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">SSIM (Structural Similarity):</span> Measures perceptual similarity (0-1). Higher is better (1 = identical structure).
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!results && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600"
        >
          <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Evaluation Results Yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Click the "Run Evaluation" button above to start evaluating your VAE model
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default VAEEvaluation
