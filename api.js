import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for loading states
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// API Functions
export const fashionAPI = {
  // Health check
  async healthCheck() {
    const response = await api.get('/')
    return response.data
  },

  // Get available models
  async getModels() {
    const response = await api.get('/models')
    return response.data
  },

  // Generate fashion items
  async generateFashionItem(modelName, requestData) {
    const response = await api.post(`/generate/${modelName}`, requestData)
    return response.data
  },

  // Evaluate models
  async evaluateModels(requestData) {
    const response = await api.post('/evaluate', requestData)
    return response.data
  },

  // Compare models
  async compareModels(modelNames, prompt, numImagesPerModel = 3) {
    const response = await api.post('/compare', {
      models: modelNames,
      prompt: prompt,
      num_images_per_model: numImagesPerModel
    })
    return response.data
  },

  // Compare models with AI analysis
  async compareModelsWithAnalysis(modelNames, prompt, numImagesPerModel = 3) {
    const response = await api.post('/compare/analyze', {
      models: modelNames,
      prompt: prompt,
      num_images_per_model: numImagesPerModel
    })
    return response.data
  },

  // Upload image (for future image-to-image generation)
  async uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Autoencoder specific functions
  async getAutoencoderInfo() {
    const response = await api.get('/autoencoder/info')
    return response.data
  },

  async reconstructImage(imageSplit, imageFilename) {
    const response = await api.post(`/autoencoder/reconstruct?image_split=${imageSplit}&image_filename=${imageFilename}`)
    const data = response.data
    // Convert relative URLs to absolute URLs
    if (data.original_image) {
      data.original_image = `${API_BASE_URL}${data.original_image}`
    }
    if (data.reconstruction && data.reconstruction.reconstructed_image) {
      // If it's not already a data URL, prepend API_BASE_URL
      if (!data.reconstruction.reconstructed_image.startsWith('data:')) {
        data.reconstruction.reconstructed_image = `${API_BASE_URL}${data.reconstruction.reconstructed_image}`
      }
    }
    return data
  },

  // Get dataset images for testing
  async getDatasetImages(split = 'train', count = 10) {
    const response = await api.get(`/dataset/images/${split}?count=${count}`)
    const data = response.data
    // Convert relative URLs to absolute URLs
    if (data.images) {
      data.images = data.images.map(img => ({
        ...img,
        url: `${API_BASE_URL}${img.url}`
      }))
    }
    return data
  },

  // Evaluate autoencoder
  async evaluateAutoencoder(numSamples = 10) {
    const response = await api.post(`/autoencoder/evaluate?num_samples=${numSamples}`)
    return response.data
  },

  // Evaluate Diffusion
  async evaluateDiffusion(numSamples = 10) {
    const response = await api.post(`/diffusion/evaluate?num_samples=${numSamples}`)
    return response.data
  },

  // Evaluate GAN
  async evaluateGAN(numSamples = 10) {
    const response = await api.post(`/gan/evaluate?num_samples=${numSamples}`)
    return response.data
  },

  // Generate images from text using Diffusion
  async generateDiffusionImages(prompt, numSamples = 5) {
    const response = await api.post('/diffusion/generate', {
      prompt: prompt,
      num_samples: numSamples
    })
    return response.data
  },

  // Diffusion specific functions
  async getDiffusionInfo() {
    const response = await api.get('/diffusion/info')
    return response.data
  },

  async reconstructImageDiffusion(imageSplit, imageFilename) {
    const response = await api.post(`/diffusion/reconstruct?image_split=${imageSplit}&image_filename=${imageFilename}`)
    const data = response.data
    // Convert relative URLs to absolute URLs
    if (data.original_image) {
      data.original_image = `${API_BASE_URL}${data.original_image}`
    }
    if (data.reconstruction && data.reconstruction.reconstructed_image) {
      // If it's not already a data URL, prepend API_BASE_URL
      if (!data.reconstruction.reconstructed_image.startsWith('data:')) {
        data.reconstruction.reconstructed_image = `${API_BASE_URL}${data.reconstruction.reconstructed_image}`
      }
    }
    return data
  },

  // GAN specific functions
  async getGANInfo() {
    const response = await api.get('/gan/info')
    return response.data
  },

  async generateGANImages(prompt, numSamples = 1) {
    const response = await api.post('/gan/generate', {
      prompt: prompt,
      num_samples: numSamples
    })
    return response.data
  }
}

// Utility functions for API data transformation
export const transformers = {
  // Transform generation request to API format
  formatGenerationRequest: (formData) => ({
    prompt: formData.prompt,
    num_images: parseInt(formData.numImages) || 1,
    style: formData.style || null,
    color: formData.color || null,
    material: formData.material || null,
    season: formData.season || null,
  }),

  // Transform evaluation request to API format
  formatEvaluationRequest: (formData) => ({
    models: formData.selectedModels,
    test_prompts: formData.testPrompts || null,
    metrics: formData.selectedMetrics || ['fid', 'bleu', 'inception_score'],
    num_samples: parseInt(formData.numSamples) || 10,
  }),

  // Format model comparison data for display
  formatComparisonResults: (results) => {
    if (!results.comparison_results) return []
    
    return Object.entries(results.comparison_results).map(([modelName, data]) => ({
      modelName,
      modelType: data.model_type || 'generation',
      images: data.generated_images || [],
      reconstructions: data.reconstructions || [],
      generationTime: data.generation_time,
      qualityScore: data.quality_score || null,
      note: data.note || null,
      error: data.error || null
    }))
  },

  // Format evaluation results for charts
  formatEvaluationChartData: (results) => {
    if (!results.evaluation_results) return []
    
    return Object.entries(results.evaluation_results).map(([modelName, metrics]) => ({
      model: modelName,
      fid: metrics.fid_score,
      bleu: metrics.bleu_score,
      inception: metrics.inception_score,
      diversity: metrics.diversity_score,
    }))
  }
}

// Error handling utilities
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    return {
      type: 'server',
      status,
      message: data.detail || data.message || 'Server error occurred',
      details: data
    }
  } else if (error.request) {
    // Network error
    return {
      type: 'network',
      message: 'Network error - please check your connection',
      details: error.request
    }
  } else {
    // Other error
    return {
      type: 'client',
      message: error.message || 'An unexpected error occurred',
      details: error
    }
  }
}

// Constants for the API
export const MODELS = {
  AUTOENCODER: 'autoencoder',
  DIFFUSION: 'diffusion',
  TRANSFORMER: 'transformer',
  GAN: 'gan'
}

export const STYLES = [
  'casual',
  'formal',
  'vintage',
  'modern',
  'streetwear',
  'luxury'
]

export const COLORS = [
  'red',
  'blue',
  'green',
  'black',
  'white',
  'brown',
  'gray',
  'pink',
  'yellow',
  'purple'
]

export const METRICS = [
  'fid',
  'bleu',
  'inception_score',
  'diversity_score'
]

export default api