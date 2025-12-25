import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Sparkles, Loader2, Palette, Shirt, Zap } from 'lucide-react'
import { fashionAPI, transformers, handleAPIError, STYLES, COLORS } from '../api'
import ImageGrid from '../components/ImageGrid'
import AutoencoderDemo from '../components/AutoencoderDemo'
import toast from 'react-hot-toast'

const modelInfo = {
  autoencoder: {
    title: 'Autoencoder',
    description: 'Standard Autoencoder for fashion image reconstruction',
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-500'
  },
  vae: {
    title: 'VAE',
    description: 'Variational Autoencoder for probabilistic fashion generation',
    icon: Sparkles,
    gradient: 'from-indigo-500 to-purple-500'
  },
  transformer: {
    title: 'Transformer',
    description: 'Advanced transformer model for text-to-fashion generation',
    icon: Palette,
    gradient: 'from-green-500 to-emerald-500'
  },
  gan: {
    title: 'GAN',
    description: 'Generative Adversarial Network for high-quality fashion images',
    icon: Shirt,
    gradient: 'from-purple-500 to-pink-500'
  },
  diffusion: {
    title: 'Diffusion',
    description: 'State-of-the-art diffusion model for controllable fashion generation',
    icon: Zap,
    gradient: 'from-orange-500 to-red-500'
  }
}

const examplePrompts = [
  "A stylish red dress with floral patterns",
  "Modern blue jeans with distressed details",
  "Elegant black formal suit",
  "Casual white t-shirt with graphics"
]

function ModelTab() {
  const { modelName } = useParams()
  const [formData, setFormData] = useState({
    prompt: '',
    numImages: 2,
    style: '',
    color: '',
    material: '',
    season: ''
  })
  const [generatedImages, setGeneratedImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastGeneration, setLastGeneration] = useState(null)

  const model = modelInfo[modelName]

  useEffect(() => {
    if (!model) {
      toast.error('Model not found')
    }
  }, [modelName, model])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    
    if (!formData.prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setLoading(true)
    
    try {
      const requestData = transformers.formatGenerationRequest(formData)
      const result = await fashionAPI.generateFashionItem(modelName, requestData)
      
      setGeneratedImages(result.generated_images)
      setLastGeneration(result)
      toast.success(`Generated ${result.generated_images.length} images successfully!`)
    } catch (error) {
      const errorInfo = handleAPIError(error)
      toast.error(errorInfo.message)
      console.error('Generation error:', errorInfo)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadAll = () => {
    if (generatedImages.length === 0) {
      toast.error('No images to download')
      return
    }
    
    toast.success('Download feature coming soon!')
  }

  if (!model) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Model Not Found</h1>
        <Link to="/" className="btn-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>
    )
  }

  const IconComponent = model.icon

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Link to="/" className="btn-secondary p-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${model.gradient}`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{model.title}</h1>
              <p className="text-gray-600 dark:text-gray-300">{model.description}</p>
            </div>
          </div>
        </div>
        
        {generatedImages.length > 0 && (
          <button 
            onClick={handleDownloadAll}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download All
          </button>
        )}
      </motion.div>

      {/* Conditional Content Based on Model */}
      {modelName === 'autoencoder' || modelName === 'vae' ? (
        /* Autoencoder/VAE Demo Component */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AutoencoderDemo modelType={modelName} />
        </motion.div>
      ) : (
        /* Standard Generation Interface for Other Models */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generation Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="card sticky top-8">
              <h2 className="text-xl font-semibold mb-6">Generate Fashion Item</h2>
              
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prompt *
                  </label>
                  <textarea
                    name="prompt"
                    value={formData.prompt}
                    onChange={handleInputChange}
                    placeholder="Describe the fashion item you want to generate..."
                    className="input-field h-24 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Images
                  </label>
                  <select
                    name="numImages"
                    value={formData.numImages}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Style
                    </label>
                    <select
                      name="style"
                      value={formData.style}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Any Style</option>
                      {STYLES.map(style => (
                        <option key={style} value={style}>
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Any Color</option>
                      {COLORS.map(color => (
                        <option key={color} value={color}>
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Material
                  </label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    placeholder="e.g., cotton, silk, leather"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Season
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Any Season</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="fall">Fall</option>
                    <option value="winter">Winter</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate
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
                      className="text-left text-sm text-primary-600 hover:text-primary-700 block w-full"
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
            <div className="space-y-6">
              {/* Generation Info */}
              {lastGeneration && (
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Generation Results</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Model:</span>
                      <div className="font-medium dark:text-white">{lastGeneration.model_used}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Images:</span>
                      <div className="font-medium dark:text-white">{lastGeneration.generated_images.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Time:</span>
                      <div className="font-medium dark:text-white">{lastGeneration.generation_time.toFixed(2)}s</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Prompt:</span>
                      <div className="font-medium truncate dark:text-white">{lastGeneration.prompt_used}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Generated Images */}
              {loading ? (
                <div className="card">
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                    <h3 className="text-lg font-medium mb-2 dark:text-white">Generating Fashion Items</h3>
                    <p className="text-gray-600 dark:text-gray-300">This may take a few moments...</p>
                  </div>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Generated Images</h3>
                  <ImageGrid images={generatedImages} />
                </div>
              ) : (
                <div className="card">
                  <div className="text-center py-12">
                    <IconComponent className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                    <h3 className="text-lg font-medium mb-2 dark:text-white">Ready to Generate</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Enter a prompt and click generate to create fashion items with {model.title}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ModelTab