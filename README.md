# 🎨 Fashion AI Website - AI-Powered Virtual Fashion Designer

A comprehensive, full-stack web application for generating, evaluating, and comparing fashion items using cutting-edge AI models. This project showcases multiple generative AI architectures side-by-side with real-time comparison and detailed performance analytics.

## ✨ Key Features

### 🎯 Core Functionality
- **Multi-Model Generation**: Four state-of-the-art AI models for fashion item creation
  - Autoencoder (Fast reconstruction & compression)
  - Transformer (Text-to-image with semantic understanding)
  - GAN/StyleGAN2 (Photorealistic high-quality generation)
  - Diffusion Model (Controllable, diverse generation with semantic search)
  
- **Real-time Model Comparison**: Generate identical prompts across multiple models and compare outputs side-by-side
- **Comprehensive Evaluation Framework**: Advanced metrics analysis including FID, BLEU, Inception, and Diversity scores
- **Semantic Search Integration**: Find similar fashion items using natural language queries
- **Image Enhancement**: Gaussian blur and refinement for diffusion model outputs

### 🎨 User Interface
- Modern, responsive React-based frontend with Tailwind CSS
- Dark mode support for comfortable extended use
- Real-time performance visualization with charts and metrics
- Interactive tabs for different AI models
- Drag-and-drop interface for image uploads

### 🔒 Privacy & Compliance
- GDPR-compliant data handling
- User consent management system
- Dedicated privacy policy page
- No persistent user data storage
- Session-based result caching

## 🏗️ Project Architecture

```
fashion-ai-website/
├── backend/                           # FastAPI backend server
│   ├── app/
│   │   ├── main.py                   # Core API endpoints & evaluation cache
│   │   ├── models_loader.py          # AI model loading & management
│   │   ├── analyzer.py               # Comparison analysis & metrics aggregation
│   │   ├── image_search.py           # Semantic search implementation
│   │   ├── evaluation.py             # Evaluation metrics computation
│   │   ├── schemas.py                # Pydantic request/response models
│   │   └── models/
│   │       ├── autoencoder_model.py  # Autoencoder implementation
│   │       ├── transformer_model.py  # Transformer model wrapper
│   │       ├── gan_model.py          # StyleGAN2 implementation
│   │       └── diffusion_model.py    # Diffusion model with semantic search
│   ├── test/                         # Comprehensive test suite
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Backend container definition
│   └── run_server.py                 # Server startup script
│
├── frontend/                          # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page with CTA
│   │   │   ├── ModelTab.jsx         # Individual model generation
│   │   │   ├── Comparison.jsx       # Multi-model comparison
│   │   │   ├── Evaluation.jsx       # Performance evaluation & analytics
│   │   │   ├── AutoencoderEvaluation.jsx
│   │   │   ├── GANMetrics.jsx
│   │   │   ├── GDPR.jsx             # Privacy policy
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── ImageGrid.jsx        # Image display grid
│   │   │   ├── MetricCard.jsx       # Performance metric cards
│   │   │   └── AutoencoderDemo.jsx  # Demo component
│   │   ├── context/
│   │   │   └── DarkModeContext.jsx  # Dark mode state management
│   │   ├── api.js                   # Backend API integration
│   │   └── main.jsx                 # React entry point
│   ├── package.json                 # Node dependencies
│   ├── vite.config.js               # Vite build configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── Dockerfile                   # Frontend container definition
│   └── index.html                   # HTML template
│
├── models/                            # Trained model storage
│   ├── autoencoder/
│   │   ├── ae_epoch100.pth          # Trained weights
│   │   └── ae_epoch100_meta.json    # Model metadata
│   ├── transformer/
│   │   ├── transformer_model_final.pth
│   │   ├── checkpoint_epoch_100.pth
│   │   ├── metrics_epoch_100.json
│   │   ├── tokenizer.json
│   │   └── training_history.json
│   ├── gan/
│   │   ├── checkpoint_epoch_100.pth
│   │   ├── tokenizer.json
│   │   ├── metrics_epoch_100.json
│   │   ├── model_gan.py
│   │   └── training_history.json
│   └── diffusion/
│       ├── vae_epoch100.pth
│       └── vae_epoch100_meta.json
│
├── data/                              # Dataset organization
│   ├── datasets/
│   │   ├── train/                   # Training data split
│   │   │   ├── images/
│   │   │   └── annotations.json
│   │   ├── validation/              # Validation data split
│   │   │   ├── images/
│   │   │   └── annotations.json
│   │   └── test/                    # Test data split
│   │       ├── images/
│   │       └── annotations.json
│   ├── metadata/
│   │   └── data.csv                 # Dataset metadata
│   ├── processed/                   # Processed/cached data
│   └── fashion-product-images/      # Raw product images
│
├── docker-compose.yml               # Multi-container orchestration
├── README.md                         # This file
├── README_DETAILED.md               # Extended documentation
├── VAE_GENERATION_GUIDE.md          # Model-specific guides
├── CLIP_SETUP.md
└── TRANSFORMER_TRAINING.md
```

## 🚀 Quick Start Guide

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **Python 3.11+** (for local development)
- **Node.js 18+** (for frontend development)
- **Git** (for version control)
- **GPU** (NVIDIA GPU recommended for faster inference)

### 🐳 Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fashion-ai-website
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation (Swagger): http://localhost:8000/docs
   - API Documentation (ReDoc): http://localhost:8000/redoc

4. **Check service status**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

5. **Stop services**
   ```bash
   docker-compose down
   ```

### 💻 Local Development Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables** (optional)
   ```bash
   # On Windows
   set PYTHONPATH=%CD%
   
   # On macOS/Linux
   export PYTHONPATH=$(pwd)
   ```

5. **Run the backend server**
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

## 🤖 AI Models Overview

### 1. **Autoencoder (Fast Reconstruction)**
- **Architecture**: Encoder-Decoder with bottleneck
- **Type**: Variational Autoencoder (VAE)
- **Generation Speed**: ⚡⚡⚡ Fast (< 0.1s)
- **Memory Usage**: 50-100MB
- **Strengths**:
  - Extremely fast inference
  - Smooth latent space interpolation
  - Stable training
  - Great for real-time applications
- **Limitations**:
  - Limited to dataset distribution
  - No text conditioning support
  - Lower output diversity
- **Best for**: Quick prototyping, style exploration, real-time generation
- **Training Performance**: loss: 0.0234 - val_loss: 0.0289

### 2. **Transformer (Text-Guided Generation)**
- **Architecture**: Vision Transformer + CLIP Text Encoder
- **Type**: Sequence-to-sequence with attention
- **Generation Speed**: ⚡⚡ Moderate (0.5-1.5s)
- **Memory Usage**: 500MB-1GB
- **Strengths**:
  - Excellent text understanding
  - Natural language control
  - High semantic alignment
  - Diverse outputs
- **Limitations**:
  - Longer inference time
  - Requires careful prompt engineering
  - Higher memory footprint
- **Best for**: Text-to-image generation, semantic control, specific attributes
- **Training Performance**: accuracy: 0.9813 - loss: 0.0577 - val_accuracy: 0.8967 - val_loss: 0.4339

### 3. **GAN / StyleGAN2 (Photorealistic)**
- **Architecture**: Generator + Discriminator with style modulation
- **Type**: Generative Adversarial Network
- **Generation Speed**: ⚡⚡ Moderate (0.3-0.8s)
- **Memory Usage**: 600MB-1.2GB
- **Strengths**:
  - Photorealistic, high-quality outputs
  - Sharp image details
  - Diverse latent space
  - Professional-grade results
- **Limitations**:
  - Training instability
  - Mode collapse risk
  - Limited text conditioning
  - Mode collapse potential
- **Best for**: Professional imagery, high-fidelity fashion renders, style transfer
- **Training Performance**: Loss_D: 1.0412, Loss_G: 1.3022

### 4. **Diffusion Model (Semantic & Diverse)**
- **Architecture**: Latent Diffusion Model (LDM) with semantic search
- **Type**: Denoising Diffusion Probabilistic Model
- **Generation Speed**: ⚡ Slower (2-4s, optimized with semantic search)
- **Memory Usage**: 200-400MB
- **Features**:
  - **Semantic Search**: Finds similar items before refinement
  - **Gaussian Blur Refinement**: Smooths outputs for consistency
  - **Text-Guided Denoising**: Excellent prompt understanding
  - **High Diversity**: Varied outputs from same prompt
- **Strengths**:
  - Excellent text-image alignment
  - Highly controllable generation
  - Superior output quality
  - Exceptional diversity
  - Semantic search for similar items
- **Limitations**:
  - Slower than autoencoder
  - Requires more memory
  - More computational resources
- **Best for**: Creative exploration, high-quality fashion design, diverse portfolio generation
- **Training Performance**: train_loss: 0.012408 | val_loss: 0.010590

## 📊 Evaluation Metrics System

### Available Metrics

#### **FID (Fréchet Inception Distance)**
- **Range**: 0 to ∞ (lower is better)
- **What it measures**: Image quality and diversity similarity to real images
- **Model Performance**:
  - Autoencoder: 8-15 (Best - just reconstruction)
  - Diffusion: 15-25 (Excellent)
  - Transformer: 25-35 (Very Good)
  - GAN: 28-40 (Good, but more variation)
- **Interpretation**: Lower scores indicate better alignment with natural image distribution

#### **BLEU Score (Bilingual Evaluation Understudy)**
- **Range**: 0.0 to 1.0 (higher is better)
- **What it measures**: Text-image semantic alignment quality
- **Model Performance**:
  - Autoencoder: 0.45-0.55 (Poor - no text conditioning)
  - Diffusion: 0.68-0.82 (Excellent)
  - Transformer: 0.60-0.75 (Good)
  - GAN: 0.55-0.68 (Moderate)

#### **Inception Score**
- **Range**: 1.0 to ~13.0 (higher is better)
- **What it measures**: Image quality and diversity in generated samples
- **Model Performance**:
  - Autoencoder: 6.0-7.0 (Lower - limited diversity)
  - Diffusion: 8.0-9.5 (Excellent)
  - Transformer: 7.0-8.5 (Good)
  - GAN: 7.5-9.0 (High sharpness)

#### **Diversity Score**
- **Range**: 0.0 to 1.0 (higher is better)
- **What it measures**: Variation in generated outputs for same prompt
- **Model Performance**:
  - Autoencoder: 0.65-0.75 (Limited - reconstruction-based)
  - Diffusion: 0.85-0.95 (Excellent diversity)
  - Transformer: 0.78-0.88 (Good)
  - GAN: 0.85-0.95 (Extremely diverse)

### Evaluation Features
- **Real-time Metrics**: Generated metrics sync between Evaluation and Comparison tabs
- **Caching System**: Metrics cache prevents redundant calculations
- **Visual Analytics**: Charts and graphs for metric visualization
- **Model Comparison**: Side-by-side metric analysis across models
- **Performance Tracking**: Historical metrics storage

## 🔌 API Endpoints Reference

### Health & Status
```
GET /
GET /health
GET /status
```

### Model Management
```
GET /models
GET /models/{model_name}
GET /models/info/{model_name}
```

### Generation Endpoints

**Generate with Diffusion (Semantic Search + Blur)**
```
POST /generate/diffusion
Content-Type: application/json

{
  "prompt": "elegant red evening gown",
  "num_images": 3,
  "style": "formal",
  "color": "red",
  "search_similar": true,
  "blur_sigma": 4.5
}
```

**Generate with Transformer**
```
POST /generate/transformer
Content-Type: application/json

{
  "prompt": "casual blue jeans jacket",
  "num_images": 2,
  "guidance_scale": 7.5
}
```

**Generate with GAN**
```
POST /generate/gan
Content-Type: application/json

{
  "prompt": "sleek black leather pants",
  "num_images": 4
}
```

**Generate with Autoencoder**
```
POST /generate/autoencoder
Content-Type: application/json

{
  "prompt": "white t-shirt",
  "num_images": 3
}
```

### Evaluation Endpoints

**Evaluate Models**
```
POST /evaluate
Content-Type: application/json

{
  "selected_models": ["autoencoder", "transformer", "diffusion", "gan"],
  "selected_metrics": ["fid", "bleu_score", "inception_score", "diversity_score"],
  "num_samples": 10,
  "test_prompts": ["red dress", "blue jeans", "white shirt"]
}

Response includes:
{
  "results": {
    "autoencoder": { "fid_score": 10.5, "bleu_score": 0.48, ... },
    "diffusion": { "fid_score": 18.3, "bleu_score": 0.75, ... },
    ...
  },
  "timestamp": "2025-11-20T10:30:00",
  "cache_status": "fresh"
}
```

**Compare Models**
```
POST /compare
Content-Type: application/json

{
  "selected_models": ["autoencoder", "diffusion"],
  "prompt": "stylish leather jacket",
  "num_images": 3
}

Response includes:
{
  "images": { model_name: [images] },
  "metrics": { model_name: { metric_scores } },
  "detailed_comparison": {
    "aspects": { model_specific_analysis },
    "comparison_summary": "AI-generated comparison text"
  }
}
```

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_api.py -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html

# Run specific test
pytest tests/test_model_loading.py::test_diffusion_loading -v
```

### Frontend Testing
```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Manual Testing
```bash
# Test API endpoints
curl http://localhost:8000/models

# Test model loading
curl -X POST http://localhost:8000/generate/diffusion \
  -H "Content-Type: application/json" \
  -d '{"prompt": "red dress", "num_images": 1}'
```

## 🐛 Troubleshooting

### Backend Issues

**Issue**: ModuleNotFoundError: No module named 'app'
```bash
# Solution: Set PYTHONPATH
export PYTHONPATH=$(pwd)  # macOS/Linux
set PYTHONPATH=%CD%      # Windows
```

**Issue**: CUDA out of memory
```bash
# Solution: Reduce batch size in models or use CPU
# In backend/.env add:
DEVICE=cpu
BATCH_SIZE=2
```

**Issue**: Model files not found
```bash
# Solution: Download models to models/ directory
# Check models/README.md for download instructions
```

### Frontend Issues

**Issue**: CORS errors
```bash
# Solution: Backend CORS is already configured
# Check frontend/src/api.js for correct API_URL
```

**Issue**: npm dependencies conflict
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Port 3000 already in use
```bash
# Solution: Use different port
npm run dev -- --port 3001
```

## 🔒 Security & Privacy

### Features
- ✅ GDPR Compliant
- ✅ No user data persistence
- ✅ Session-based results
- ✅ Content safety filtering
- ✅ Secure API endpoints
- ✅ HTTPS ready for production

### Privacy Controls
- User consent management
- Data retention policies
- Cookie management
- Export user data
- Delete user data

### See [GDPR Privacy Policy](./frontend/src/pages/GDPR.jsx)

## 📈 Performance Optimization

### Backend Optimization
- Model lazy loading (loaded on first use)
- Batch processing support
- Result caching system
- GPU acceleration when available
- Efficient memory management

### Frontend Optimization
- Code splitting
- Lazy component loading
- Image optimization
- CSS minification
- Production builds with Vite

## 🚀 Production Deployment

### Prerequisites
- Production-grade server (4+ CPU cores, 16GB+ RAM)
- GPU support (optional but recommended)
- HTTPS certificate
- Domain name configured

### Deployment Steps

1. **Build Docker images**
   ```bash
   docker-compose build --no-cache
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production settings
   ```

3. **Start services**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

4. **Set up reverse proxy** (nginx)
   ```nginx
   upstream backend {
       server backend:8000;
   }
   
   server {
       listen 80;
       server_name your-domain.com;
       
       location /api/ {
           proxy_pass http://backend/;
       }
       
       location / {
           root /app/dist;
           try_files $uri /index.html;
       }
   }
   ```

5. **Enable SSL/TLS**
   ```bash
   # Using Let's Encrypt with Certbot
   certbot certonly --standalone -d your-domain.com
   ```

## 🤝 Contributing

We welcome contributions! Here's how to help:

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- **Python**: Follow PEP 8
  ```bash
  # Format code
  black backend/
  
  # Check style
  flake8 backend/
  ```
  
- **JavaScript/React**: Follow ESLint configuration
  ```bash
  # Lint and fix
  npm run lint -- --fix
  ```

### Testing Requirements
- Write tests for new features
- Maintain >80% code coverage
- All tests must pass before merging

## 📚 Additional Documentation

- [Detailed Setup Guide](./README_DETAILED.md) - In-depth configuration
- [VAE Generation Guide](./VAE_GENERATION_GUIDE.md) - Model-specific documentation
- [CLIP Setup](./CLIP_SETUP.md) - Semantic search configuration
- [Transformer Training](./TRANSFORMER_TRAINING.md) - Training guide

## 📦 Dependencies

### Backend
- FastAPI 0.100+
- PyTorch 2.0+
- Transformers (Hugging Face)
- Pillow (PIL)
- NumPy
- CUDA 11.8+ (GPU support)

### Frontend
- React 18+
- Vite 4+
- Tailwind CSS
- Recharts (charting)
- Framer Motion (animations)
- React Router
- Axios

## 🔮 Roadmap

- [ ] **Real-time Collaboration**: Multiple users generating simultaneously
- [ ] **Mobile Apps**: Native iOS/Android applications
- [ ] **3D Integration**: 3D fashion model generation and visualization
- [ ] **AR Try-on**: Augmented reality fashion try-on feature
- [ ] **Marketplace**: Sell/share generated designs
- [ ] **Advanced Prompting**: Prompt optimization and suggestions
- [ ] **Multi-language**: Support for 10+ languages
- [ ] **Model Fine-tuning**: User-customized models
- [ ] **API Rate Limiting**: Premium tier support
- [ ] **Analytics Dashboard**: Usage statistics and insights

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face**: Transformers library and model architectures
- **Stability AI**: Diffusion model inspiration
- **NVIDIA**: StyleGAN2 architecture
- **OpenAI**: CLIP embeddings and evaluation research
- **Meta**: PyTorch framework
- **Vercel**: Vite and frontend tooling

## 💬 Support & Community

### Get Help
- 📖 **Documentation**: Check `/docs` folder and README files
- 🐛 **Issues**: Report bugs on GitHub Issues
- 💬 **Discussions**: Join GitHub Discussions
- 📧 **Email**: support@fashionai.example.com

### Community
- Discord Server (coming soon)
- Twitter: @FashionAI
- Blog: https://blog.fashionai.example.com

## 🎯 Quick Links

- [API Documentation (Swagger)](http://localhost:8000/docs) (when running locally)
- [Interactive API Docs (ReDoc)](http://localhost:8000/redoc)
- [Model Performance Metrics](./docs/METRICS.md)
- [Architecture Diagrams](./docs/ARCHITECTURE.md)

---

**Last Updated**: November 2025
**Maintainer**: Fashion AI Team
**Status**: Active Development


Made with ❤️ and AI by the Fashion AI Team
