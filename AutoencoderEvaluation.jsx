import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Loader2, Info, TrendingUp, BarChart3, Activity } from 'lucide-react'
import { fashionAPI } from '../api'
import toast from 'react-hot-toast'

function AutoencoderEvaluation() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(() => {
    const saved = sessionStorage.getItem('autoencoderResults');
    return saved ? JSON.parse(saved) : null;
  })
  const [numSamples, setNumSamples] = useState(20)

  // Persist results to sessionStorage whenever they change
  useEffect(() => {
    if (results) {
      sessionStorage.setItem('autoencoderResults', JSON.stringify(results));
    }
  }, [results]);

  const handleEvaluate = async () => {
    setLoading(true)
    
    try {
      const data = await fashionAPI.evaluateAutoencoder(numSamples)
      setResults(data)
      toast.success('Evaluation completed successfully!')
    } catch (error) {
      toast.error(`Evaluation failed: ${error.message}`)
      console.error('Evaluation error:', error)
    } finally {
      setLoading(false)
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
          Autoencoder Evaluation Metrics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Comprehensive performance metrics for your trained autoencoder model on the test dataset
        </p>
      </motion.div>

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
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-300">
              <p className="font-medium mb-1">Evaluation Complete!</p>
              <p>Analyzed {results.num_samples} test images. Lower MSE and higher PSNR/SSIM indicate better reconstruction quality.</p>
            </div>
          </div>

          {/* Reconstruction Quality Metrics */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                color="blue"
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
                <span className="font-semibold text-blue-600 dark:text-blue-400">SSIM (Structural Similarity):</span> Measures perceptual similarity (0-1). Higher is better (1 = identical structure).
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
          className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700"
        >
          <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Evaluation Results Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click the "Run Evaluation" button above to start evaluating your autoencoder model
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default AutoencoderEvaluation
