"""
Trained Variational Autoencoder (VAE) Model
This module handles loading and using the trained VAE model for fashion image reconstruction.
"""

import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import json
import base64
from io import BytesIO
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class VAE(nn.Module):
    """Variational Autoencoder architecture"""
    
    def __init__(self, img_size=64, latent_dim=512):
        super().__init__()
        self.latent_dim = latent_dim
        self.img_size = img_size
        
        # Encoder
        self.encoder_conv = nn.Sequential(
            nn.Conv2d(3, 64, 4, 2, 1), nn.ReLU(),
            nn.Conv2d(64, 128, 4, 2, 1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.Conv2d(128, 256, 4, 2, 1), nn.BatchNorm2d(256), nn.ReLU()
        )
        
        # Flatten layer
        self.flatten = nn.Flatten()
        
        # Latent space (mean and log variance)
        self.fc_mu = nn.Linear(256 * (img_size // 8)**2, latent_dim)
        self.fc_logvar = nn.Linear(256 * (img_size // 8)**2, latent_dim)
        
        # Decoder input
        self.decoder_input = nn.Linear(latent_dim, 256 * (img_size // 8)**2)
        
        # Decoder
        self.decoder_conv = nn.Sequential(
            nn.Unflatten(1, (256, img_size // 8, img_size // 8)),
            nn.ConvTranspose2d(256, 128, 4, 2, 1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.ConvTranspose2d(128, 64, 4, 2, 1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.ConvTranspose2d(64, 3, 4, 2, 1), nn.Tanh()
        )

    def reparameterize(self, mu, logvar):
        """Reparameterization trick"""
        std = (0.5 * logvar).exp()
        eps = torch.randn_like(std)
        return mu + eps * std

    def forward(self, x):
        """Forward pass through VAE"""
        x = self.encoder_conv(x)
        x = self.flatten(x)
        mu, logvar = self.fc_mu(x), self.fc_logvar(x)
        z = self.reparameterize(mu, logvar)
        x_rec = self.decoder_input(z)
        x_rec = self.decoder_conv(x_rec)
        return x_rec, mu, logvar


class TrainedVAE:
    """Wrapper for trained VAE model"""
    
    def __init__(self, model_path: str, meta_path: str):
        self.model_path = Path(model_path)
        self.meta_path = Path(meta_path)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.metadata = None
        
        # Image preprocessing (will be updated after loading metadata)
        self.transform = None
        self.inverse_transform = None
    
    def load_model(self):
        """Load the trained VAE model from checkpoint"""
        # Load metadata
        with open(self.meta_path, 'r') as f:
            self.metadata = json.load(f)
        
        # Load checkpoint to get metadata from it
        checkpoint = torch.load(self.model_path, map_location=self.device, weights_only=False)
        checkpoint_meta = checkpoint.get('meta', {})
        
        # Get latent_dim and img_size from checkpoint metadata or file metadata
        latent_dim = checkpoint_meta.get('latent_dim', self.metadata.get('latent_dim', 512))
        img_size = checkpoint_meta.get('img_size', self.metadata.get('img_size', 64))
        
        # Update metadata with checkpoint info
        self.metadata['latent_dim'] = latent_dim
        self.metadata['img_size'] = img_size
        
        # Setup transforms based on actual image size
        self.transform = transforms.Compose([
            transforms.Resize((img_size, img_size)),
            transforms.ToTensor(),
            transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])  # Normalize to [-1, 1] for Tanh
        ])
        
        self.inverse_transform = transforms.Compose([
            transforms.Normalize([-1, -1, -1], [2, 2, 2]),  # Denormalize from [-1, 1] to [0, 1]
            transforms.ToPILImage(),
        ])
        
        # Initialize model
        self.model = VAE(img_size=img_size, latent_dim=latent_dim)
        
        # Load weights (checkpoint already loaded above)
        # Handle different checkpoint formats
        if 'model_state_dict' in checkpoint:
            self.model.load_state_dict(checkpoint['model_state_dict'])
        elif 'model_state' in checkpoint:
            self.model.load_state_dict(checkpoint['model_state'])
        else:
            # Assume the checkpoint is the state dict itself
            self.model.load_state_dict(checkpoint)
            
        self.model.to(self.device)
        self.model.eval()
        
        print(f"VAE model loaded from {self.model_path}")
        print(f"Latent dimension: {latent_dim}, Image size: {img_size}")
    
    def reconstruct_image(self, image_path: str) -> torch.Tensor:
        """Reconstruct an image using the VAE"""
        # Load and preprocess image
        image = Image.open(image_path).convert('RGB')
        image_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        # Reconstruct
        with torch.no_grad():
            reconstructed, _, _ = self.model(image_tensor)
        
        return reconstructed.squeeze(0).cpu()
    
    def reconstruct_image_to_base64(self, image_path: str) -> dict:
        """Reconstruct image and return as base64 encoded strings"""
        # Get reconstruction
        reconstructed_tensor = self.reconstruct_image(image_path)
        
        # Get image size from metadata (for model processing)
        img_size = self.metadata.get('img_size', 64)
        
        # Convert original to base64 (keep higher resolution for display)
        original_img = Image.open(image_path).convert('RGB')
        # Resize to a reasonable display size (e.g., 256x256) instead of model size
        display_size = 256
        original_img = original_img.resize((display_size, display_size), Image.LANCZOS)
        original_buffer = BytesIO()
        original_img.save(original_buffer, format='JPEG', quality=95)
        original_base64 = base64.b64encode(original_buffer.getvalue()).decode()
        
        # Convert reconstruction to base64 (upscale from model size to display size)
        reconstructed_img = self.inverse_transform(reconstructed_tensor)
        reconstructed_img = reconstructed_img.resize((display_size, display_size), Image.LANCZOS)
        reconstructed_buffer = BytesIO()
        reconstructed_img.save(reconstructed_buffer, format='JPEG', quality=95)
        reconstructed_base64 = base64.b64encode(reconstructed_buffer.getvalue()).decode()
        
        return {
            'original': f'data:image/jpeg;base64,{original_base64}',
            'reconstructed': f'data:image/jpeg;base64,{reconstructed_base64}'
        }
    
    def reconstruct_image_pil(self, image_path: str) -> Image.Image:
        """Reconstruct image and return as PIL Image"""
        reconstructed_tensor = self.reconstruct_image(image_path)
        return self.inverse_transform(reconstructed_tensor)
    
    def generate_from_latent(self, latent_vector: torch.Tensor) -> Image.Image:
        """Generate image from latent vector"""
        with torch.no_grad():
            latent_vector = latent_vector.to(self.device)
            generated = self.model.decoder_input(latent_vector)
            generated = self.model.decoder_conv(generated)
        
        return self.inverse_transform(generated.squeeze(0).cpu())
    
    def generate_from_prompt(self, prompt: str, image_searcher=None, num_samples: int = 5) -> dict:
        """
        Generate new images from a text prompt using VAE's latent space.
        
        Strategy:
        1. Find reference images matching the prompt
        2. Encode them to get latent vectors
        3. Sample from the latent distribution to generate variations
        
        Args:
            prompt: Text description of desired image
            image_searcher: ImageSearcher instance for finding reference images
            num_samples: Number of variations to generate
            
        Returns:
            dict with generated images as base64 strings
        """
        display_size = 256
        generated_images = []
        
        # Find reference images matching the prompt
        reference_paths = []
        if image_searcher:
            try:
                # Use search_by_text method which returns list of image info dicts
                search_results = image_searcher.search_by_text(prompt, split="train", num_results=3)
                # Extract file paths from results
                reference_paths = [img_info['path'] for img_info in search_results if 'path' in img_info]
            except Exception as e:
                logger.warning(f"Could not search for images: {e}")
                reference_paths = []
        
        # Get latent representations from reference images
        latent_vectors = []
        if reference_paths:
            for img_path in reference_paths:
                try:
                    image = Image.open(img_path).convert('RGB')
                    image_tensor = self.transform(image).unsqueeze(0).to(self.device)
                    
                    with torch.no_grad():
                        encoded = self.model.encoder_conv(image_tensor)
                        encoded = self.model.flatten(encoded)
                        mu, logvar = self.model.fc_mu(encoded), self.model.fc_logvar(encoded)
                        latent_vectors.append((mu, logvar))
                except Exception as e:
                    logger.info(f"Could not encode {img_path}: {e}")
                    continue
        
        # If we have reference latents, sample around them; otherwise sample from standard normal
        if latent_vectors:
            # Average the latent distributions
            mu_avg = torch.mean(torch.stack([m for m, _ in latent_vectors]), dim=0)
            logvar_avg = torch.mean(torch.stack([lv for _, lv in latent_vectors]), dim=0)
            
            # Generate variations by sampling from this distribution
            for i in range(num_samples):
                with torch.no_grad():
                    # Sample from the latent distribution
                    z = self.model.reparameterize(mu_avg, logvar_avg)
                    
                    # Add some extra variation
                    if i > 0:
                        noise = torch.randn_like(z) * 0.5
                        z = z + noise
                    
                    # Decode to image
                    generated = self.model.decoder_input(z)
                    generated = self.model.decoder_conv(generated)
                    
                    # Convert to PIL and resize
                    generated_img = self.inverse_transform(generated.squeeze(0).cpu())
                    generated_img = generated_img.resize((display_size, display_size), Image.LANCZOS)
                    
                    # Convert to base64
                    buffer = BytesIO()
                    generated_img.save(buffer, format='JPEG', quality=95)
                    img_base64 = base64.b64encode(buffer.getvalue()).decode()
                    generated_images.append(f'data:image/jpeg;base64,{img_base64}')
        else:
            # Generate from random samples in latent space
            latent_dim = self.metadata.get('latent_dim', 512)
            for i in range(num_samples):
                with torch.no_grad():
                    # Sample from standard normal distribution
                    z = torch.randn(1, latent_dim).to(self.device)
                    
                    # Decode to image
                    generated = self.model.decoder_input(z)
                    generated = self.model.decoder_conv(generated)
                    
                    # Convert to PIL and resize
                    generated_img = self.inverse_transform(generated.squeeze(0).cpu())
                    generated_img = generated_img.resize((display_size, display_size), Image.LANCZOS)
                    
                    # Convert to base64
                    buffer = BytesIO()
                    generated_img.save(buffer, format='JPEG', quality=95)
                    img_base64 = base64.b64encode(buffer.getvalue()).decode()
                    generated_images.append(f'data:image/jpeg;base64,{img_base64}')
        
        return {
            'prompt': prompt,
            'num_generated': len(generated_images),
            'images': generated_images,
            'strategy': 'latent_interpolation' if reference_paths else 'random_sampling'
        }
    
    def get_model_info(self) -> dict:
        """Get model information"""
        return {
            "model_type": "VAE",
            "latent_dim": self.metadata.get('latent_dim', 512) if self.metadata else 512,
            "image_size": self.metadata.get('img_size', 128) if self.metadata else 128,
            "epoch": self.metadata.get('epoch', 0) if self.metadata else 0,
            "device": str(self.device),
            "model_loaded": self.model is not None
        }
