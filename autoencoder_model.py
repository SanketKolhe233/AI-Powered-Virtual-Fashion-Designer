import torch
import torch.nn as nn
import json
import os
from pathlib import Path
from PIL import Image
import torchvision.transforms as transforms
from typing import Optional, Tuple, List
import numpy as np
import base64
import io

class AutoEncoder(nn.Module):
    def __init__(self, img_size=128, latent_dim=256):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 64, 4, 2, 1), nn.ReLU(),
            nn.Conv2d(64, 128, 4, 2, 1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.Conv2d(128, 256, 4, 2, 1), nn.BatchNorm2d(256), nn.ReLU(),
            nn.Flatten(),
            nn.Linear(256 * (img_size // 8)**2, latent_dim)
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 256 * (img_size // 8)**2),
            nn.ReLU(),
            nn.Unflatten(1, (256, img_size // 8, img_size // 8)),
            nn.ConvTranspose2d(256, 128, 4, 2, 1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.ConvTranspose2d(128, 64, 4, 2, 1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.ConvTranspose2d(64, 3, 4, 2, 1), nn.Tanh()
        )

    def forward(self, x):
        z = self.encoder(x)
        x_rec = self.decoder(z)
        return x_rec

class TrainedAutoEncoder:
    """Wrapper for the trained autoencoder model with proper loading and inference"""
    
    def __init__(self, model_path: str, meta_path: str):
        self.model_path = Path(model_path)
        self.meta_path = Path(meta_path)
        self.model = None
        self.meta = None
        self.transform = None
        self.inverse_transform = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
    def load_model(self):
        """Load the trained model and metadata"""
        # Load metadata
        with open(self.meta_path, 'r') as f:
            self.meta = json.load(f)
        
        # Get model parameters from metadata
        img_size = self.meta.get('img_size', 64)
        
        # Load checkpoint first to get architecture details
        checkpoint = torch.load(self.model_path, map_location=self.device, weights_only=False)
        
        # Check if this is a training checkpoint with multiple components
        if 'model_state' in checkpoint:
            # This is a training checkpoint, extract just the model state
            model_state_dict = checkpoint['model_state']
            print("Loading from training checkpoint format")
        else:
            # This is a direct model state dict
            model_state_dict = checkpoint
            print("Loading from direct model state format")
        
        # Detect latent_dim from the model state dict
        # The encoder's final layer weight shape gives us the latent dimension
        if 'encoder.9.weight' in model_state_dict:
            latent_dim = model_state_dict['encoder.9.weight'].shape[0]
            print(f"Detected latent_dim: {latent_dim}")
        else:
            latent_dim = 256  # Default fallback
            print(f"Using default latent_dim: {latent_dim}")
        
        # Initialize model with correct parameters
        self.model = AutoEncoder(img_size=img_size, latent_dim=latent_dim)
        
        # Load the state dict
        self.model.load_state_dict(model_state_dict)
        self.model.to(self.device)
        self.model.eval()
        
        # Setup transforms based on metadata
        mean = self.meta.get('mean', [0.5, 0.5, 0.5])
        std = self.meta.get('std', [0.5, 0.5, 0.5])
        
        self.transform = transforms.Compose([
            transforms.Resize((img_size, img_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=mean, std=std)
        ])
        
        self.inverse_transform = transforms.Compose([
            transforms.Normalize(mean=[-m/s for m, s in zip(mean, std)], 
                               std=[1/s for s in std]),
            transforms.ToPILImage()
        ])
        
        print(f"Loaded autoencoder model with image size {img_size}x{img_size}")
        return True
        
    def reconstruct_image(self, image_path: str) -> Tuple[Image.Image, Image.Image]:
        """Reconstruct an image using the autoencoder"""
        if self.model is None:
            self.load_model()
            
        # Load and preprocess image
        image = Image.open(image_path).convert('RGB')
        
        # Use consistent display size
        display_size = 256
        display_image = image.resize((display_size, display_size), Image.LANCZOS)
        
        # Transform for model
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        # Reconstruct
        with torch.no_grad():
            reconstructed_tensor = self.model(input_tensor)
            
        # Convert back to PIL Image
        reconstructed_tensor = reconstructed_tensor.squeeze(0).cpu()
        reconstructed_image = self.inverse_transform(reconstructed_tensor)
        
        # Resize to display size for consistent comparison
        reconstructed_image = reconstructed_image.resize((display_size, display_size), Image.LANCZOS)
        
        return display_image, reconstructed_image
    
    def reconstruct_image_to_base64(self, image_path: str) -> dict:
        """Reconstruct an image and return both original and reconstructed as base64"""
        original, reconstructed = self.reconstruct_image(image_path)
        
        # Convert to base64
        def pil_to_base64(img):
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=95)
            img_str = base64.b64encode(buffer.getvalue()).decode()
            return f"data:image/jpeg;base64,{img_str}"
        
        return {
            "original": pil_to_base64(original),
            "reconstructed": pil_to_base64(reconstructed)
        }
    
    def encode_image(self, image_path: str) -> np.ndarray:
        """Encode an image to latent space"""
        if self.model is None:
            self.load_model()
            
        image = Image.open(image_path).convert('RGB')
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            latent = self.model.encoder(input_tensor)
            
        return latent.squeeze(0).cpu().numpy()
    
    def decode_latent(self, latent_vector: np.ndarray) -> Image.Image:
        """Decode a latent vector to an image"""
        if self.model is None:
            self.load_model()
            
        latent_tensor = torch.from_numpy(latent_vector).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            reconstructed_tensor = self.model.decoder(latent_tensor)
            
        reconstructed_tensor = reconstructed_tensor.squeeze(0).cpu()
        return self.inverse_transform(reconstructed_tensor)
    
    def interpolate_images(self, image1_path: str, image2_path: str, steps: int = 5) -> List[str]:
        """Interpolate between two images in latent space"""
        if self.model is None:
            self.load_model()
            
        # Encode both images
        latent1 = self.encode_image(image1_path)
        latent2 = self.encode_image(image2_path)
        
        # Interpolate in latent space
        interpolated_images = []
        for i in range(steps):
            alpha = i / (steps - 1)
            interpolated_latent = (1 - alpha) * latent1 + alpha * latent2
            
            # Decode interpolated latent
            interpolated_image = self.decode_latent(interpolated_latent)
            
            # Convert to base64
            buffer = io.BytesIO()
            interpolated_image.save(buffer, format='JPEG', quality=95)
            img_str = base64.b64encode(buffer.getvalue()).decode()
            interpolated_images.append(f"data:image/jpeg;base64,{img_str}")
            
        return interpolated_images
    
    def get_model_info(self) -> dict:
        """Get information about the loaded model"""
        if self.meta is None:
            with open(self.meta_path, 'r') as f:
                self.meta = json.load(f)
                
        return {
            "model_type": "AutoEncoder",
            "img_size": self.meta.get('img_size', 64),
            "mean": self.meta.get('mean', [0.5, 0.5, 0.5]),
            "std": self.meta.get('std', [0.5, 0.5, 0.5]),
            "torch_version": self.meta.get('torch_version', 'unknown'),
            "device": str(self.device),
            "model_loaded": self.model is not None
        }