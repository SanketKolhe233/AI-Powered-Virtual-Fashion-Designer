import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Cpu, Brain, ArrowRight, Star, Users, Trophy } from 'lucide-react'
import { fashionAPI } from '../api'
import toast from 'react-hot-toast'

const modelInfo = {
  autoencoder: {
    icon: Cpu,
    title: 'Autoencoder',
    description: 'Standard Autoencoder for fashion image reconstruction and generation',
    features: ['Image reconstruction', 'Fast encoding', 'Compact representation'],
    color: 'from-blue-500 to-cyan-500'
  },
  diffusion: {
    icon: Brain,
    title: 'Diffusion',
    description: 'Denoising Diffusion Probabilistic Model for high-quality text-guided generation',
    features: ['Advanced denoising', 'Text-guided synthesis', 'State-of-the-art quality'],
    color: 'from-indigo-500 to-purple-500'
  },
  transformer: {
    icon: Sparkles,
    title: 'Transformer',
    description: 'Advanced Vision Transformer for text-to-fashion generation',
    features: ['Text-to-image', 'Natural language prompts', 'Creative fashion design'],
    color: 'from-green-500 to-emerald-500'
  },
  gan: {
    icon: Zap,
    title: 'GAN',
    description: 'Generative Adversarial Network for high-quality generation',
    features: ['High resolution', 'Photorealistic output', 'Style control'],
    color: 'from-purple-500 to-pink-500'
  }
}

const stats = [
  { icon: Users, label: 'Evaluation Metrics', value: '4' },
  { icon: Star, label: 'Dataset Size', value: '44K+' },
  { icon: Trophy, label: 'AI Models', value: '4' },
]

function Home() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const modelData = await fashionAPI.getModels()
        setModels(modelData)
      } catch (error) {
        toast.error('Failed to load models')
        console.error('Error fetching models:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-20"
      >
        <h1 className="text-5xl md:text-7xl font-light tracking-wider bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-6" style={{ fontFamily: "'Playfair Display', 'Bodoni Moda', 'Cormorant Garamond', serif", letterSpacing: '0.05em' }}>
          AI-Powered Virtual Fashion Designer
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto font-light" style={{ fontFamily: "'Montserrat', 'Inter', sans-serif", letterSpacing: '0.02em' }}>
          Create stunning fashion items using cutting-edge AI models. 
          Generate, evaluate, and compare designs with the power of artificial intelligence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/model/diffusion" className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2">
            Start Creating <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/comparison" className="btn-secondary text-lg px-8 py-3">
            Compare Models
          </Link>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
              <stat.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
            <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
          </div>
        ))}
      </motion.section>

      {/* Models Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your AI Model
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Each model offers unique capabilities and strengths. Select the one that best fits your creative vision.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-6 bg-secondary-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-secondary-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-secondary-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                <div className="h-10 bg-secondary-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(modelInfo).map(([modelName, info]) => {
              const modelData = models.find(m => m.name === modelName)
              const IconComponent = info.icon
              const isDisabled = info.disabled || false
              
              return (
                <motion.div
                  key={modelName}
                  whileHover={{ scale: isDisabled ? 1.0 : 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`card transition-all duration-300 ${
                    isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${info.color}`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {info.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          isDisabled ? 'bg-gray-400' : 
                          modelData?.status === 'available' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {isDisabled ? 'Coming Soon' : 
                           modelData?.status === 'available' ? 'Ready' : 'Loading'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{info.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {info.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  {isDisabled ? (
                    <button 
                      disabled
                      className="btn-secondary w-full justify-center flex items-center gap-2 opacity-50 cursor-not-allowed"
                    >
                      Retraining in Progress
                    </button>
                  ) : (
                    <Link 
                      to={`/model/${modelName}`}
                      className="btn-primary w-full justify-center flex items-center gap-2"
                    >
                      Try {info.title} <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 md:p-12"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Everything you need to create amazing fashion designs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">AI-Powered Generation</h3>
            <p className="text-gray-600 dark:text-gray-300">Generate unique fashion items from text descriptions using state-of-the-art AI models.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Model Evaluation</h3>
            <p className="text-gray-600 dark:text-gray-300">Compare model performance with comprehensive metrics like FID, BLEU, and Inception Score.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Real-time Comparison</h3>
            <p className="text-gray-600 dark:text-gray-300">Compare different AI models side-by-side with the same prompt for optimal results.</p>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default Home