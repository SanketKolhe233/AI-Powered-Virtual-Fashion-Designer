# Fashion AI Website - Complete Project Documentation

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Existing Models](#existing-models)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [Training New Models](#training-new-models)
- [API Documentation](#api-documentation)
- [Frontend Features](#frontend-features)
- [Deployment](#deployment)

---

## 🎯 Project Overview

This is a full-stack web application for AI-powered fashion image generation and analysis. The project includes multiple deep learning models for fashion image manipulation, generation, and evaluation.

**Live Features:**
- ✅ **Autoencoder**: Image reconstruction and compression (64x64 images)
- ✅ **VAE (Variational Autoencoder)**: Probabilistic image generation (64x64 images)
- 🔄 **Transformer**: Text-to-image generation (needs training)
- 🔄 **Diffusion Model**: High-quality image generation (needs training)
- ✅ **Model Comparison**: Side-by-side evaluation
- ✅ **GDPR Compliance**: Privacy policy and data protection
- ✅ **Dark Mode**: Full UI dark mode support

---

## 🏗️ Architecture

```
fashion-ai-website/
├── backend/                      # FastAPI Python backend
│   ├── app/
│   │   ├── main.py              # Main FastAPI application
│   │   ├── models_loader.py     # Model loading and management
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── evaluation.py        # Model evaluation logic
│   │   ├── analyzer.py          # Image analysis
│   │   ├── image_search.py      # CLIP-based search
│   │   └── models/
│   │       ├── autoencoder_model.py  # ✅ Trained & Working
│   │       ├── vae_model.py          # ✅ Trained & Working
│   │       ├── transformer_model.py  # 🔄 NEEDS IMPLEMENTATION
│   │       └── diffusion_model.py    # 🔄 NEEDS IMPLEMENTATION
│   ├── trained_models/          # Model weights directory
│   │   ├── autoencoder_64x64.pth     # ✅ Available
│   │   ├── vae_fashion_64x64.pth     # ✅ Available
│   │   ├── transformer_model.h5      # 📦 Uploaded (needs integration)
│   │   └── diffusion_model.pth       # ❌ Not trained yet
│   ├── data/                    # Fashion dataset
│   │   └── fashion_images/      # Fashion-MNIST or custom dataset
│   ├── requirements.txt         # Python dependencies
│   └── run_server.py           # Server startup script
│
└── frontend/                    # React + Vite frontend
    ├── src/
    │   ├── App.jsx              # Main app with routing
    │   ├── api.js               # Backend API client
    │   ├── components/          # Reusable components
    │   │   ├── Navbar.jsx       # Navigation with dark mode
    │   │   ├── ImageGrid.jsx    # Image display grid
    │   │   ├── MetricCard.jsx   # Metrics display
    │   │   └── AutoencoderDemo.jsx
    │   ├── context/
    │   │   └── DarkModeContext.jsx  # Dark mode state
    │   ├── pages/
    │   │   ├── Home.jsx              # Landing page
    │   │   ├── VAEEvaluation.jsx     # ✅ VAE interface
    │   │   ├── AutoencoderEvaluation.jsx  # ✅ Autoencoder interface
    │   │   ├── Evaluation.jsx        # Model evaluation
    │   │   ├── Comparison.jsx        # Model comparison
    │   │   ├── ModelTab.jsx          # Individual model pages
    │   │   └── GDPR.jsx              # Privacy policy
    │   ├── index.css            # Global styles + dark mode
    │   └── tailwind.config.js   # Tailwind configuration
    ├── package.json
    └── vite.config.js

```

---

## 🤖 Existing Models

### 1. ✅ Autoencoder (WORKING)
**Framework:** PyTorch  
**Architecture:** Convolutional Autoencoder  
**File:** `backend/app/models/autoencoder_model.py`  
**Weights:** `backend/trained_models/autoencoder_64x64.pth`  
**Input:** 64x64 RGB images  
**Output:** 64x64 reconstructed images  

**Architecture Details:**
```python
Encoder:
  - Conv2d(3, 32, 3, 2, 1) + ReLU
  - Conv2d(32, 64, 3, 2, 1) + ReLU
  - Conv2d(64, 128, 3, 2, 1) + ReLU
  - Flatten + Linear(128*8*8, 256) -> Latent Space

Decoder:
  - Linear(256, 128*8*8) + ReLU
  - Unflatten to (128, 8, 8)
  - ConvTranspose2d(128, 64, 3, 2, 1) + ReLU
  - ConvTranspose2d(64, 32, 3, 2, 1) + ReLU
  - ConvTranspose2d(32, 3, 3, 2, 1) + Sigmoid
```

**Training Info:**
- Dataset: Fashion-MNIST or custom fashion images
- Image size: 64x64 pixels
- Normalization: Mean [0.5, 0.5, 0.5], Std [0.5, 0.5, 0.5]
- Loss: MSE (Mean Squared Error)
- Device: CPU (can use CUDA if available)

---

### 2. ✅ VAE - Variational Autoencoder (WORKING)
**Framework:** PyTorch  
**Architecture:** Convolutional VAE with reparameterization trick  
**File:** `backend/app/models/vae_model.py`  
**Weights:** `backend/trained_models/vae_fashion_64x64.pth`  
**Input:** 64x64 RGB images  
**Output:** 64x64 generated images  
**Latent Dimension:** 512  

**Architecture Details:**
```python
Encoder:
  - Conv2d(3, 64, 4, 2, 1) + ReLU
  - Conv2d(64, 128, 4, 2, 1) + BatchNorm2d + ReLU
  - Conv2d(128, 256, 4, 2, 1) + BatchNorm2d + ReLU
  - Flatten
  - fc_mu: Linear(256*8*8, 512) -> Mean
  - fc_logvar: Linear(256*8*8, 512) -> Log Variance

Decoder:
  - Linear(512, 256*8*8) + ReLU
  - Unflatten to (256, 8, 8)
  - ConvTranspose2d(256, 128, 4, 2, 1) + BatchNorm2d + ReLU
  - ConvTranspose2d(128, 64, 4, 2, 1) + BatchNorm2d + ReLU
  - ConvTranspose2d(64, 3, 4, 2, 1) + Tanh
```

**Training Info:**
- Dataset: Fashion-MNIST or custom fashion images
- Image size: 64x64 pixels
- Normalization: Mean [0.5, 0.5, 0.5], Std [0.5, 0.5, 0.5]
- Loss: VAE loss (reconstruction + KL divergence)
- Latent space: 512 dimensions
- Output range: [-1, 1] (Tanh activation)

---

### 3. 🔄 Transformer Model (NEEDS TRAINING)
**Status:** Model file uploaded but not integrated  
**File:** `transformer_model.h5` (uploaded, needs architecture code)  
**Framework:** TensorFlow/Keras (based on .h5 extension)  
**Purpose:** Text-to-image generation for fashion items  

**⚠️ CRITICAL REQUIREMENTS FOR TRAINING:**

For detailed training instructions, see [TRANSFORMER_TRAINING.md](./docs/TRANSFORMER_TRAINING.md)

**Quick Summary:**
- Input: Text descriptions (e.g., "red dress", "blue jeans")
- Output: 64x64 or 128x128 RGB fashion images
- Required files after training:
  - `transformer_model.h5` (full model)
  - `transformer_architecture.json` (architecture)
  - `tokenizer.json` (vocabulary)
  - `training_config.json` (hyperparameters)

---

### 4. 🔄 Diffusion Model (NEEDS TRAINING)
**Status:** Not trained yet  
**Framework:** PyTorch (to match other models)  
**Purpose:** High-quality fashion image generation  
**Recommended:** DDPM (Denoising Diffusion Probabilistic Model)  

For detailed training instructions, see [DIFFUSION_TRAINING.md](./docs/DIFFUSION_TRAINING.md)

**Quick Summary:**
- Input: Random noise (optional text conditioning)
- Output: 128x128 RGB fashion images
- Architecture: U-Net with attention layers
- Training: 50,000+ images, 200+ epochs

---

## 💻 Technology Stack

### Backend
- **Framework:** FastAPI 0.104.1
- **ML Frameworks:** 
  - PyTorch 2.0+ (Autoencoder, VAE, Diffusion)
  - TensorFlow/Keras (Transformer)
- **Image Processing:** Pillow, torchvision
- **Other:** OpenCLIP, numpy, pydantic

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS 3.x
- **UI Libraries:** 
  - framer-motion (animations)
  - lucide-react (icons)
  - react-hot-toast (notifications)
  - recharts (charts)
- **Routing:** react-router-dom
- **State:** React Context API

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- CUDA (optional, for GPU acceleration)

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python run_server.py
# Server runs on http://localhost:8000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
# Server runs on http://localhost:3001
```

### Access the Application
- Frontend: http://localhost:3001
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🎓 Training New Models

### General Guidelines for ALL Models

#### 1. Image Preprocessing Standards
```python
# ALL MODELS MUST USE THIS PREPROCESSING
from torchvision import transforms

# For PyTorch models
transform = transforms.Compose([
    transforms.Resize((img_size, img_size)),  # 64 or 128
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.5, 0.5, 0.5],
        std=[0.5, 0.5, 0.5]
    )  # Normalize to [-1, 1]
])
```

#### 2. Files to Provide After Training

**For PyTorch Models (Diffusion):**
```python
checkpoint = {
    'model_state_dict': model.state_dict(),
    'config': {...},  # All hyperparameters
    'normalization': {'mean': [0.5, 0.5, 0.5], 'std': [0.5, 0.5, 0.5]},
    'training_info': {...}
}
torch.save(checkpoint, 'model_name.pth')
```

**For TensorFlow Models (Transformer):**
```python
# Save architecture + weights separately
with open('model_architecture.json', 'w') as f:
    f.write(model.to_json())
model.save_weights('model_weights.h5')
```

#### 3. Required Documentation

Create a `TRAINING_LOG.md` with:
- Training date and hardware
- Dataset details
- Hyperparameters
- Training results (loss curves)
- Model architecture code
- Usage examples

See [docs/TRAINING_TEMPLATE.md](./docs/TRAINING_TEMPLATE.md) for template.

---

## 📡 API Documentation

### Key Endpoints

```http
# Health check
GET /health

# List models
GET /models

# Load specific model
POST /models/{model_name}/load

# Generate with VAE
POST /models/vae/generate
{
  "prompt": "red dress",
  "num_samples": 4
}

# Reconstruct with Autoencoder
POST /models/autoencoder/reconstruct
{
  "image_path": "path/to/image"
}

# Evaluate model
POST /evaluate/{model_name}
{
  "num_samples": 20
}
```

Full API documentation: http://localhost:8000/docs

---

## 🎨 Frontend Features

### Current Pages

1. **Home** (`/`) - Landing page with model showcase
2. **VAE Metrics** (`/vae-evaluation`) - VAE generation interface
3. **Autoencoder Metrics** (`/autoencoder-evaluation`) - Reconstruction demo
4. **Evaluation** (`/evaluation`) - Multi-model evaluation
5. **Comparison** (`/comparison`) - Side-by-side model comparison
6. **Privacy** (`/privacy`) - GDPR compliance information

### UI Features

- ✅ **Dark Mode**: Full dark mode with toggle
- ✅ **Responsive Design**: Mobile, tablet, desktop
- ✅ **Animations**: Framer Motion
- ✅ **Toast Notifications**: Real-time feedback
- ✅ **Loading States**: Spinners and skeletons

---

## 🔧 Integration Checklist

### Transformer Model
- [ ] Train model with text-to-image architecture
- [ ] Provide architecture code + weights + tokenizer
- [ ] Create `backend/app/models/transformer_model.py`
- [ ] Update model loader
- [ ] Create frontend page
- [ ] Add to navigation

### Diffusion Model
- [ ] Train DDPM model
- [ ] Provide architecture + checkpoint
- [ ] Create `backend/app/models/diffusion_model.py`
- [ ] Update model loader
- [ ] Create frontend page
- [ ] Add to navigation

---

## 📊 Model Performance

| Model | Input | Output | Latency | Quality |
|-------|-------|--------|---------|---------|
| Autoencoder | 64x64 | 64x64 | ~0.1s | SSIM: 0.89 |
| VAE | text | 64x64 | ~2.3s | FID: TBD |
| Transformer | text | TBD | TBD | TBD |
| Diffusion | - | TBD | TBD | TBD |

---

## 🚢 Deployment

### Backend
```bash
docker build -t fashion-ai-backend .
docker run -p 8000:8000 fashion-ai-backend
```

### Frontend
```bash
npm run build
# Deploy dist/ folder to Vercel/Netlify
```

---

## 🎯 Quick Start for Chatbot

When training transformer or diffusion models, provide:

**Essential Files:**
- ✅ Model weights (.pth or .h5)
- ✅ Model architecture code (Python file)
- ✅ Training config (JSON with hyperparameters)
- ✅ Tokenizer/vocabulary (for text models)

**Critical Information:**
- ✅ Framework (PyTorch/TensorFlow)
- ✅ Input/output dimensions
- ✅ Normalization parameters
- ✅ Any special preprocessing

**See detailed guides:**
- [TRANSFORMER_TRAINING.md](./docs/TRANSFORMER_TRAINING.md)
- [DIFFUSION_TRAINING.md](./docs/DIFFUSION_TRAINING.md)
- [TRAINING_TEMPLATE.md](./docs/TRAINING_TEMPLATE.md)

---

## 📝 License

[Add license information]

---

**Built with ❤️ for Fashion AI Research**
