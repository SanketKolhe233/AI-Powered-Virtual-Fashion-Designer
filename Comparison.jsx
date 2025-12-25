import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Loader2, Download, Clock, Trophy, Sparkles } from 'lucide-react'
import { fashionAPI, transformers, handleAPIError, MODELS } from '../api'
import ImageGrid from '../components/ImageGrid'
import toast from 'react-hot-toast'

function Comparison() {
  const [formData, setFormData] = useState({
    selectedModels: [MODELS.TRANSFORMER, MODELS.DIFFUSION],
    prompt: '',
    numImagesPerModel: 3
  })
  const [comparisonResults, setComparisonResults] = useState(() => {
    const saved = sessionStorage.getItem('comparisonResults');
    return saved ? JSON.parse(saved) : null;
  })
  const [loading, setLoading] = useState(false)

  // Persist comparison results to sessionStorage whenever they change
  useEffect(() => {
    if (comparisonResults) {
      sessionStorage.setItem('comparisonResults', JSON.stringify(comparisonResults));
    }
  }, [comparisonResults]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        selectedModels: checked 
          ? [...prev.selectedModels, value]
          : prev.selectedModels.filter(model => model !== value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleCompare = async (e) => {
    e.preventDefault()
    
    if (formData.selectedModels.length < 2) {
      toast.error('Please select at least 2 models for comparison')
      return
    }
    
    if (!formData.prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setLoading(true)
    
    try {
      const result = await fashionAPI.compareModelsWithAnalysis(
        formData.selectedModels, 
        formData.prompt,
        formData.numImagesPerModel
      )
      
      console.log('Comparison result:', result)
      console.log('Detailed comparison:', result.detailed_comparison)
      
      const formattedResults = transformers.formatComparisonResults(result)
      
      setComparisonResults({
        ...result,
        formattedResults
      })
      toast.success('Comparison completed successfully!')
    } catch (error) {
      const errorInfo = handleAPIError(error)
      toast.error(errorInfo.message)
      console.error('Comparison error:', errorInfo)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadResults = () => {
    if (!comparisonResults) {
      toast.error('No results to download')
      return
    }
    
    // In a real app, this would trigger downloads
    toast.success('Download feature coming soon!')
  }

  const examplePrompts = [
    'elegant black evening dress with sequins',
    'casual denim jacket with vintage patches',
    'red high-heeled boots with buckles',
    'white cotton t-shirt with graphic print',
    'brown leather handbag with gold hardware'
  ]

  const modelInfo = {
    autoencoder: { name: 'Autoencoder', color: 'bg-blue-500' },
    diffusion: { name: 'Diffusion', color: 'bg-cyan-500' },
    transformer: { name: 'Transformer', color: 'bg-green-500' },
    gan: { name: 'GAN', color: 'bg-purple-500' }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Model Comparison
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Compare different AI models side-by-side using the same prompt to see their unique strengths
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Comparison Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="card sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Comparison Setup</h2>
            
            <form onSubmit={handleCompare} className="space-y-6">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Models to Compare
                </label>
                <div className="space-y-2">
                  {Object.values(MODELS).map(model => (
                    <label key={model} className="flex items-center">
                      <input
                        type="checkbox"
                        name="selectedModels"
                        value={model}
                        checked={formData.selectedModels.includes(model)}
                        onChange={handleInputChange}
                        className="mr-2 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${modelInfo[model].color}`}></div>
                        <span className="capitalize text-gray-900 dark:text-gray-300">{modelInfo[model].name}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Selected: {formData.selectedModels.length} models
                </p>
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prompt for Comparison *
                </label>
                <textarea
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleInputChange}
                  placeholder="Enter the same prompt for all models..."
                  className="input-field h-24 resize-none"
                  required
                />
              </div>

              {/* Images per Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Images per Model
                </label>
                <select
                  name="numImagesPerModel"
                  value={formData.numImagesPerModel}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || formData.selectedModels.length < 2}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Compare Models
                  </>
                )}
              </button>
            </form>

            {/* Example Prompts */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Example Prompts:</h3>
              <div className="space-y-2">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setFormData(prev => ({ ...prev, prompt }))}
                    className="text-left text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 block w-full"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          {loading ? (
            <div className="card">
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Comparing Models</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Generating images with {formData.selectedModels.length} models...
                </p>
                <div className="mt-4">
                  <div className="flex justify-center gap-2">
                    {formData.selectedModels.map((model, index) => (
                      <div key={model} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${modelInfo[model].color} animate-pulse`}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{model}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : comparisonResults ? (
            <div className="space-y-6">
              {/* AI-Generated Comparison Summary */}
              {comparisonResults.detailed_comparison?.comparison_summary && (
                <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">AI Analysis</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {comparisonResults.detailed_comparison.comparison_summary}
                  </p>
                </div>
              )}

              {/* AI-Generated Comparison Table */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detailed Model Comparison</h3>
                  <button 
                    onClick={handleDownloadResults}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>

                {comparisonResults.detailed_comparison?.aspects ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Aspect</th>
                          {Object.keys(comparisonResults.detailed_comparison.aspects).map((modelName) => (
                            <th key={modelName} className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                              <div className="flex items-center justify-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${modelInfo[modelName]?.color || 'bg-gray-500'}`}></div>
                                <span className="capitalize">{modelInfo[modelName]?.name || modelName}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Dynamically generate rows from AI analysis */}
                        {[
                          { key: 'model_type', label: 'Model Type' },
                          { key: 'architecture', label: 'Architecture' },
                          { key: 'image_quality', label: 'Image Quality' },
                          { key: 'diversity', label: 'Output Diversity' },
                          { key: 'sharpness', label: 'Image Sharpness' },
                          { key: 'color_vibrancy', label: 'Color Vibrancy' },
                          { key: 'training_stability', label: 'Training Stability' },
                          { key: 'training_performance', label: 'Training Performance (Epoch 100)', category: 'training' },
                          { key: 'best_use_case', label: 'Best Use Case' },
                          { key: 'prompt_understanding', label: 'Prompt Understanding' },
                          { key: 'memory_usage', label: 'Memory Usage' },
                          { key: 'fid_score', label: 'FID Score (Lower = Better)', category: 'metrics' },
                          { key: 'bleu_score', label: 'BLEU Score (Higher = Better)', category: 'metrics' },
                          { key: 'inception_score', label: 'Inception Score (Higher = Better)', category: 'metrics' },
                          { key: 'diversity_score', label: 'Diversity Score (Higher = Better)', category: 'metrics' }
                        ].map((row, idx) => (
                          <tr key={row.key} className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${row.category === 'metrics' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''} ${row.category === 'training' ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}>
                            <td className={`px-4 py-3 text-sm font-medium ${row.category === 'metrics' ? 'text-blue-700 dark:text-blue-400' : ''} ${row.category === 'training' ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              {row.label}
                            </td>
                            {Object.entries(comparisonResults.detailed_comparison.aspects).map(([modelName, aspects]) => (
                              <td key={modelName} className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">
                                {aspects[row.key] || 'N/A'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    No detailed comparison data available
                  </div>
                )}

                {/* Prompt Info */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Prompt Used:</span> "{comparisonResults.prompt}"
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              {comparisonResults.analysis && (
                <div className="card bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">AI Analysis</h3>
                  </div>
                  
                  {/* Summary */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 dark:text-gray-300">{comparisonResults.analysis.summary}</p>
                  </div>
                  
                  {/* Insights */}
                  {comparisonResults.analysis.insights && comparisonResults.analysis.insights.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {comparisonResults.analysis.insights.map((insight, idx) => (
                        <div 
                          key={idx} 
                          className={`bg-white dark:bg-gray-700 rounded-lg p-4 border-l-4 ${
                            insight.severity === 'warning' ? 'border-yellow-500' : 
                            insight.severity === 'error' ? 'border-red-500' : 
                            'border-blue-500'
                          }`}
                        >
                          <div className="font-semibold text-gray-900 dark:text-white mb-1">{insight.title}</div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">{insight.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Recommendation */}
                  {comparisonResults.analysis.recommendation && (
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-4 border border-purple-300 dark:border-purple-700">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">
                            {comparisonResults.analysis.recommendation.title}
                          </div>
                          {comparisonResults.analysis.recommendation.model && (
                            <div className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-2">
                              Recommended: <span className="font-bold">{comparisonResults.analysis.recommendation.model}</span>
                            </div>
                          )}
                          <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {comparisonResults.analysis.recommendation.description}
                          </div>
                          {comparisonResults.analysis.recommendation.reason && (
                            <div className="text-xs text-purple-600 dark:text-purple-400 italic">
                              Reason: {comparisonResults.analysis.recommendation.reason}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Model Results */}
              {comparisonResults.formattedResults.map((result, index) => (
                <motion.div
                  key={result.modelName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${modelInfo[result.modelName]?.color || 'bg-gray-500'}`}></div>
                      <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
                        {modelInfo[result.modelName]?.name || result.modelName}
                      </h3>
                      {result.modelType === 'reconstruction' && (
                        <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                          Reconstruction Model
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {result.generationTime?.toFixed(2)}s
                      </div>
                      {result.qualityScore && (
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4" />
                          {result.qualityScore.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {result.note && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4 text-sm text-blue-800 dark:text-blue-300">
                      ℹ️ {result.note}
                    </div>
                  )}
                  
                  {result.error ? (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-800 dark:text-red-300">
                      Error: {result.error}
                    </div>
                  ) : result.modelType === 'reconstruction' ? (
                    <div className="space-y-4">
                      {result.reconstructions.map((recon, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Original Input</div>
                            <img 
                              src={recon.original} 
                              alt="Original" 
                              className="w-full h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Reconstructed Output</div>
                            <img 
                              src={recon.reconstructed} 
                              alt="Reconstructed" 
                              className="w-full h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ImageGrid images={result.images} />
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-12">
                <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Ready to Compare</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Select models, enter a prompt, and click "Compare Models" to see the results
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      </div>
    </div>
  )
}

export default Comparison