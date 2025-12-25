# Fashion AI Website

A comprehensive web application for generating fashion items using multiple AI models including Autoencoders, Transformers, GANs, and Diffusion models.

## 🎨 Features

- **Multi-Model Generation**: Choose from 4 different AI models for fashion generation
- **Real-time Comparison**: Compare different models side-by-side with the same prompt
- **Comprehensive Evaluation**: Analyze model performance with metrics like FID, BLEU, and Inception Score
- **Interactive UI**: Modern React-based interface with responsive design
- **Privacy Compliant**: GDPR-compliant data handling and user privacy controls

## 🏗️ Architecture

```
fashion-ai-website/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py      # API endpoints
│   │   ├── models_loader.py # AI model management
│   │   ├── evaluation.py    # Performance metrics
│   │   └── schemas.py   # Pydantic models
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/            # React frontend
│   ├── src/
│   │   ├── pages/      # Main application pages
│   │   ├── components/ # Reusable UI components
│   │   └── api.js      # Backend integration
│   ├── package.json
│   └── Dockerfile
├── models/             # AI model storage
│   ├── autoencoder/
│   ├── transformer/
│   ├── gan/
│   └── diffusion/
└── docker-compose.yml  # Container orchestration
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Using Docker (Recommended)

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
   - API Documentation: http://localhost:8000/docs

### Local Development

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

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

## 🤖 AI Models

### 1. Autoencoder (VAE)
- **Type**: Variational Autoencoder
- **Strengths**: Fast generation, smooth interpolation
- **Best for**: Style exploration, quick prototyping

### 2. Transformer
- **Type**: Vision Transformer + Text Encoder
- **Strengths**: Natural language understanding, fine control
- **Best for**: Text-guided generation, specific attributes

### 3. GAN (StyleGAN2)
- **Type**: Generative Adversarial Network
- **Strengths**: High quality, photorealistic output
- **Best for**: Professional-grade fashion imagery

### 4. Diffusion Model
- **Type**: Latent Diffusion Model
- **Strengths**: Controllable generation, high diversity
- **Best for**: Creative exploration, varied outputs

## 📊 Evaluation Metrics

- **FID (Fréchet Inception Distance)**: Measures image quality and diversity (lower is better)
- **BLEU Score**: Text-image alignment quality (higher is better)
- **Inception Score**: Image quality and diversity (higher is better)
- **Diversity Score**: Output variation measure (higher is better)

## 🛠️ API Endpoints

### Core Endpoints

- `GET /`: Health check
- `GET /models`: List available models
- `POST /generate/{model_name}`: Generate fashion items
- `POST /evaluate`: Evaluate model performance
- `POST /compare`: Compare multiple models

### Example API Usage

```python
import requests

# Generate fashion item
response = requests.post(
    "http://localhost:8000/generate/diffusion",
    json={
        "prompt": "elegant black evening dress",
        "num_images": 2,
        "style": "formal",
        "color": "black"
    }
)

result = response.json()
print(f"Generated {len(result['generated_images'])} images")
```

## 🔧 Configuration

### Environment Variables

#### Backend
- `PYTHONPATH`: Python module path
- `ENVIRONMENT`: development/production
- `MODEL_CACHE_SIZE`: Model caching limit

#### Frontend
- `VITE_API_URL`: Backend API URL
- `NODE_ENV`: development/production

### Model Configuration

Models can be configured via JSON files in each model directory:

```json
{
  "model_name": "diffusion",
  "inference_steps": 50,
  "guidance_scale": 7.5,
  "resolution": 512
}
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

### End-to-End Tests
```bash
npm run e2e
```

## 📦 Deployment

### Production Deployment

1. **Build production images**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
   ```

2. **Deploy with nginx**
   ```bash
   docker-compose --profile production up -d
   ```

### Cloud Deployment

The application supports deployment on:
- AWS (ECS, EKS)
- Google Cloud (GKE, Cloud Run)
- Azure (ACI, AKS)
- DigitalOcean App Platform

## 🔒 Privacy & Security

- GDPR compliant data handling
- User consent management
- Data retention policies
- Secure API endpoints
- Content safety filtering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Hugging Face for model architectures and transformers
- Stability AI for Stable Diffusion inspiration
- NVIDIA for StyleGAN2 architecture
- OpenAI for evaluation metrics research

## 📞 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Open GitHub issues for bugs and feature requests
- **Email**: support@fashionai.com
- **Discord**: Join our community server

## 🔮 Roadmap

- [ ] Real-time collaboration features
- [ ] Mobile app development
- [ ] 3D fashion model integration
- [ ] Augmented reality try-on
- [ ] Marketplace for generated designs
- [ ] Advanced prompt engineering tools
- [ ] Multi-language support
- [ ] API rate limiting and premium tiers

---

**Made with ❤️ by the Fashion AI Team**