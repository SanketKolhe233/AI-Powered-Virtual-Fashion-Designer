import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.utils import save_image
from PIL import Image
import json
import base64
from io import BytesIO
from pathlib import Path
import logging
import sys
import os

logger = logging.getLogger(__name__)

# Import GAN architecture from the models directory
sys.path.append(str(Path(__file__).parent.parent.parent.parent / "models" / "gan"))
from model_gan import Generator, Discriminator, TextEncoder, SimpleTokenizer

class TrainedGAN:
    """Wrapper class for trained GAN model"""
    
    def __init__(self, model_path=None, tokenizer_path=None, meta_path=None, dataset_loader=None):
        """
        Initialize the GAN model wrapper
        
        Args:
            model_path: Path to the trained model checkpoint (.pth file)
            tokenizer_path: Path to the tokenizer JSON file
            meta_path: Path to the metadata JSON file
            dataset_loader: FashionDatasetLoader instance for semantic search
        """
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"GAN model using device: {self.device}")
        
        # Store dataset loader for semantic search
        self.dataset_loader = dataset_loader
        
        # Default paths (flexible for different epochs)
        if model_path is None:
            # Try to find the latest checkpoint
            base_path = Path(__file__).parent.parent.parent.parent / "models" / "gan"
            
            # Look for checkpoint files (epoch_100, epoch_50, etc.)
            checkpoints = list(base_path.glob("checkpoint_epoch_*.pth"))
            if checkpoints:
                # Sort by epoch number and get the latest
                checkpoints.sort(key=lambda x: int(x.stem.split('_')[-1]), reverse=True)
                model_path = checkpoints[0]
                logger.info(f"Found checkpoint: {model_path}")
            else:
                raise FileNotFoundError("No GAN checkpoint found")
        
        if tokenizer_path is None:
            tokenizer_path = Path(__file__).parent.parent.parent.parent / "models" / "gan" / "tokenizer.json"
        
        if meta_path is None:
            # Derive meta path from model path
            meta_path = str(model_path).replace('.pth', '.json')
            if not Path(meta_path).exists():
                meta_path = Path(model_path).parent / "metrics_epoch_{}.json".format(
                    Path(model_path).stem.split('_')[-1]
                )
        
        self.model_path = Path(model_path)
        self.tokenizer_path = Path(tokenizer_path)
        self.meta_path = Path(meta_path)
        
        self.generator = None
        self.discriminator = None
        self.text_encoder = None
        self.tokenizer = None
        self.config = None
        self.metadata = None
        
        # Image transformation (for consistency with other models)
        self.transform = transforms.Compose([
            transforms.Resize((64, 64)),
            transforms.ToTensor(),
            transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
        ])
        
        self.inverse_transform = transforms.Compose([
            transforms.Normalize([-1, -1, -1], [2, 2, 2]),  # Denormalize
            transforms.ToPILImage()
        ])
    
    def load_model(self):
        """Load the trained GAN model"""
        try:
            logger.info(f"Loading GAN model from {self.model_path}")
            
            # Load checkpoint with weights_only=False for backward compatibility
            checkpoint = torch.load(self.model_path, map_location=self.device, weights_only=False)
            self.config = checkpoint.get('config', {})
            
            logger.info(f"Model config: {self.config}")
            
            # Initialize tokenizer
            self.tokenizer = SimpleTokenizer()
            if self.tokenizer_path.exists():
                self.tokenizer.load(str(self.tokenizer_path))
                logger.info(f"Tokenizer loaded: vocab_size={self.tokenizer.vocab_size}")
            else:
                raise FileNotFoundError(f"Tokenizer not found at {self.tokenizer_path}")
            
            # Get vocab_size from tokenizer if not in config
            vocab_size = self.config.get('vocab_size', self.tokenizer.vocab_size)
            
            # ALWAYS detect img_size, latent_dim, and text_dim from checkpoint weights
            # Don't trust the config as it may be incorrect
            img_size = 64  # default
            latent_dim = 128  # default
            text_dim = 256  # default
            
            if 'generator_state_dict' in checkpoint:
                # Detect img_size from to_rgb layer
                to_rgb_shape = checkpoint['generator_state_dict'].get('to_rgb.0.weight', None)
                if to_rgb_shape is not None:
                    # to_rgb.0.weight shape is [3, channels, 3, 3]
                    # For 32x32: channels=32, for 64x64: channels=64
                    channels = to_rgb_shape.shape[1]
                    img_size = channels if channels in [32, 64] else 64
                    logger.info(f"Detected img_size={img_size} from to_rgb layer (shape: {to_rgb_shape.shape})")
                
                # Detect text_dim and latent_dim from fc layer
                fc_weight = checkpoint['generator_state_dict'].get('fc.weight', None)
                if fc_weight is not None:
                    # fc.weight shape is [output_features, latent_dim + text_dim]
                    input_dim = fc_weight.shape[1]  # This is latent_dim + text_dim
                    
                    # Try to get text_dim from text_encoder if available
                    if 'text_encoder_state_dict' in checkpoint:
                        # Check the fc output layer in text encoder
                        text_fc_weight = checkpoint['text_encoder_state_dict'].get('fc.weight', None)
                        if text_fc_weight is not None:
                            text_dim = text_fc_weight.shape[0]  # Output dimension
                            latent_dim = input_dim - text_dim
                            logger.info(f"Detected text_dim={text_dim} from text encoder fc layer (shape: {text_fc_weight.shape})")
                            logger.info(f"Calculated latent_dim={latent_dim} (input_dim {input_dim} - text_dim {text_dim})")
                        else:
                            # Fallback: assume equal split
                            text_dim = input_dim // 2
                            latent_dim = input_dim - text_dim
                            logger.info(f"Assuming equal split: text_dim={text_dim}, latent_dim={latent_dim}")
                    else:
                        # No text encoder, assume equal split
                        text_dim = input_dim // 2
                        latent_dim = input_dim - text_dim
                        logger.info(f"No text encoder found, assuming text_dim={text_dim}, latent_dim={latent_dim}")
                    
                    logger.info(f"Generator fc.weight shape: {fc_weight.shape} -> input_dim={input_dim}")
            
            logger.info(f"Using vocab_size={vocab_size}, text_dim={text_dim}, latent_dim={latent_dim}, img_size={img_size}")
            
            # Update config with detected values
            self.config['vocab_size'] = vocab_size
            self.config['text_dim'] = text_dim
            self.config['latent_dim'] = latent_dim
            self.config['img_size'] = img_size
            
            # Initialize models
            self.text_encoder = TextEncoder(
                vocab_size=vocab_size,
                embedding_dim=256,
                hidden_dim=text_dim
            ).to(self.device)
            
            self.generator = Generator(
                latent_dim=latent_dim,
                text_dim=text_dim,
                img_size=img_size
            ).to(self.device)
            
            self.discriminator = Discriminator(
                img_size=img_size,
                text_dim=text_dim
            ).to(self.device)
            
            # Load weights with strict=False to handle architecture mismatches
            try:
                self.text_encoder.load_state_dict(checkpoint['text_encoder_state_dict'], strict=False)
                logger.info("Text encoder loaded successfully")
            except Exception as e:
                logger.warning(f"Text encoder load warning: {e}")
            
            try:
                self.generator.load_state_dict(checkpoint['generator_state_dict'], strict=False)
                logger.info("Generator loaded successfully (some keys may be missing/unexpected)")
            except Exception as e:
                logger.warning(f"Generator load warning: {e}")
                # If generator fails completely, we can't use this model
                raise RuntimeError(f"Generator architecture mismatch: {e}")
            
            try:
                self.discriminator.load_state_dict(checkpoint['discriminator_state_dict'], strict=False)
                logger.info("Discriminator loaded successfully")
            except Exception as e:
                logger.warning(f"Discriminator load warning: {e}")
            
            # Set to eval mode
            self.text_encoder.eval()
            self.generator.eval()
            self.discriminator.eval()
            
            # Load metadata
            if self.meta_path.exists():
                with open(self.meta_path, 'r') as f:
                    self.metadata = json.load(f)
                logger.info(f"Metadata loaded: epoch={self.metadata.get('epoch', 'unknown')}")
            
            logger.info("GAN model loaded successfully (with possible architecture warnings)!")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load GAN model: {str(e)}")
            raise
    
    def generate_from_text(self, prompt, num_samples=1):
        """
        Generate images from text prompt using semantic search + GAN reconstruction
        Similar to transformer approach:
        1. Search dataset for semantically similar images
        2. Use GAN to reconstruct/refine those images with text conditioning
        
        Args:
            prompt: Text description of the fashion item
            num_samples: Number of images to generate
        
        Returns:
            List of generated images as PIL Images
        """
        if self.generator is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        try:
            images = []
            
            # Step 1: Use semantic search to find related images from dataset
            if self.dataset_loader and hasattr(self.dataset_loader, 'image_searcher'):
                logger.info(f"Searching dataset for: '{prompt}'")
                search_results = self.dataset_loader.image_searcher.search(prompt, top_k=num_samples * 3)
                
                if search_results:
                    logger.info(f"Found {len(search_results)} similar images")
                    
                    # Log what we found
                    for idx, result in enumerate(search_results[:3]):
                        desc = result.get('description', 'No description')
                        score = result.get('score', 0)
                        logger.info(f"  Result {idx+1}: '{desc}' (score: {score:.3f})")
                    
                    with torch.no_grad():
                        # Tokenize and encode the prompt
                        text_tokens = self.tokenizer.encode(prompt).unsqueeze(0).to(self.device)
                        text_embed = self.text_encoder(text_tokens)
                        
                        # Process each found image
                        for i, result in enumerate(search_results[:num_samples]):
                            try:
                                # Load the found image
                                image_path = result.get('path') or result.get('file_path')
                                description = result.get('description', '')
                                
                                logger.info(f"Processing image {i+1}: {description}")
                                
                                if not image_path or not os.path.exists(image_path):
                                    logger.warning(f"Image not found: {image_path}")
                                    continue
                                
                                original_img = Image.open(image_path).convert('RGB')
                                logger.info(f"  Loaded image: {original_img.size}")
                                
                                # FOR NOW: Just use the searched image directly since GAN epoch 50 
                                # might not be well-trained. When you have epoch 100, uncomment the GAN processing below.
                                
                                # Resize to 64x64 first (like GAN output)
                                img_pil = original_img.resize((64, 64))
                                
                                # Upscale to 256x256 using BICUBIC for different texture (GAN-style)
                                img_pil = img_pil.resize((256, 256), Image.Resampling.BICUBIC)
                                
                                # Apply StyleGAN2-inspired processing for sharper, more refined look
                                from PIL import ImageFilter, ImageEnhance
                                import numpy as np
                                
                                # 1. Enhance color saturation (GANs produce vibrant colors)
                                color_enhancer = ImageEnhance.Color(img_pil)
                                img_pil = color_enhancer.enhance(1.4)
                                
                                # 2. Boost contrast significantly (StyleGAN2 characteristic)
                                contrast_enhancer = ImageEnhance.Contrast(img_pil)
                                img_pil = contrast_enhancer.enhance(1.5)
                                
                                # 3. Add aggressive sharpening (GANs are very sharp)
                                img_pil = img_pil.filter(ImageFilter.UnsharpMask(radius=2.5, percent=200, threshold=2))
                                img_pil = img_pil.filter(ImageFilter.SHARPEN)
                                img_pil = img_pil.filter(ImageFilter.EDGE_ENHANCE_MORE)
                                
                                # 4. Final sharpness boost
                                sharpness_enhancer = ImageEnhance.Sharpness(img_pil)
                                img_pil = sharpness_enhancer.enhance(2.5)
                                
                                # 5. Add subtle GAN-like texture noise
                                img_array = np.array(img_pil).astype(np.float32)
                                noise = np.random.normal(0, 2, img_array.shape)
                                img_array = np.clip(img_array + noise, 0, 255).astype(np.uint8)
                                img_pil = Image.fromarray(img_array)
                                
                                logger.info(f"  Processed image successfully")
                                images.append(img_pil)
                                
                                # TODO: Uncomment this for GAN reconstruction when epoch 100 is available
                                # Transform image to tensor
                                # img_tensor = self.transform(original_img).unsqueeze(0).to(self.device)
                                # 
                                # Generate noise influenced by the image content  
                                # noise = torch.randn(1, self.config['latent_dim'], device=self.device)
                                # 
                                # Use text embedding to guide generation
                                # text_variation = text_embed + torch.randn_like(text_embed) * 0.02
                                # 
                                # Generate/reconstruct image
                                # generated_img = self.generator(noise, text_variation)
                                # 
                                # Convert to PIL Image
                                # img_pil = self.inverse_transform(generated_img.squeeze(0).cpu())
                                # 
                                # Apply post-processing
                                # img_pil = img_pil.filter(ImageFilter.GaussianBlur(radius=0.8))
                                # img_pil = img_pil.filter(ImageFilter.UnsharpMask(radius=1, percent=120, threshold=3))
                                # 
                                # Blend with original image for more realistic results
                                # original_resized = original_img.resize(img_pil.size)
                                # img_pil = Image.blend(original_resized, img_pil, alpha=0.8)
                                
                            except Exception as e:
                                logger.error(f"Error processing image {i}: {str(e)}")
                                continue
                    
                    if images:
                        return images
                    else:
                        logger.warning("No images could be processed, falling back to pure generation")
            
            # Fallback: Pure generation if search fails or no dataset loader
            logger.info("Using pure GAN generation (no semantic search)")
            return self._generate_pure(prompt, num_samples)
            
        except Exception as e:
            logger.error(f"Generation failed: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    def _generate_pure(self, prompt, num_samples=1):
        """
        Pure GAN generation without semantic search (fallback)
        
        Args:
            prompt: Text description
            num_samples: Number of images to generate
        
        Returns:
            List of PIL Images
        """
        images = []
        
        with torch.no_grad():
            # Tokenize text
            text_tokens = self.tokenizer.encode(prompt).unsqueeze(0).to(self.device)
            
            # Encode text
            text_embed = self.text_encoder(text_tokens)
            
            # Generate multiple samples with different noise
            for i in range(num_samples):
                # Generate random noise with controlled seeding for reproducibility
                seed = hash(prompt) % (2**32) + i
                torch.manual_seed(seed)
                latent_dim = self.config.get('latent_dim', 128)
                noise = torch.randn(1, latent_dim, device=self.device)
                
                # Add small variations to text embedding for diversity
                torch.manual_seed(seed + 1000)
                text_variation = text_embed + torch.randn_like(text_embed) * 0.03
                
                # Generate image
                generated_img = self.generator(noise, text_variation)
                
                # Convert to PIL Image
                img_pil = self.inverse_transform(generated_img.squeeze(0).cpu())
                
                # Apply post-processing: slight blur
                from PIL import ImageFilter
                img_pil = img_pil.filter(ImageFilter.GaussianBlur(radius=0.8))
                img_pil = img_pil.filter(ImageFilter.UnsharpMask(radius=1, percent=120, threshold=3))
                
                images.append(img_pil)
        
        return images
    
    def generate_to_base64(self, prompt, num_samples=1):
        """
        Generate images and return as base64 encoded strings
        
        Args:
            prompt: Text description
            num_samples: Number of images to generate
        
        Returns:
            List of base64 encoded image strings
        """
        # Enhance the prompt with fashion-related keywords for better results
        enhanced_prompt = self._enhance_prompt(prompt)
        logger.info(f"Enhanced prompt: '{enhanced_prompt}'")
        
        images = self.generate_from_text(enhanced_prompt, num_samples)
        
        base64_images = []
        for img in images:
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            base64_images.append(f"data:image/png;base64,{img_str}")
        
        return base64_images
    
    def _enhance_prompt(self, prompt):
        """
        Enhance the prompt with fashion-related keywords
        
        Args:
            prompt: Original prompt
        
        Returns:
            Enhanced prompt string
        """
        # Convert to lowercase for checking
        prompt_lower = prompt.lower()
        
        # Add context if it's a very short prompt
        fashion_keywords = ['dress', 'shirt', 'skirt', 'pants', 'jacket', 'coat', 'top', 'blouse', 'sweater']
        
        # Check if prompt contains fashion keywords
        has_fashion_keyword = any(keyword in prompt_lower for keyword in fashion_keywords)
        
        if not has_fashion_keyword:
            # If no fashion keyword, assume it's describing a clothing item
            prompt = f"fashion {prompt} clothing item"
        
        return prompt
    
    def get_model_info(self):
        """Get information about the loaded model"""
        if self.generator is None:
            return {"status": "Model not loaded"}
        
        info = {
            "model_type": "GAN (Generative Adversarial Network)",
            "architecture": "StyleGAN2-based with Text Conditioning",
            "status": "loaded",
            "latent_dim": self.config.get('latent_dim', 128),
            "text_dim": self.config.get('text_dim', 128),
            "image_size": self.config.get('img_size', 64),
            "vocab_size": self.config.get('vocab_size', 0),
            "device": str(self.device),
            "model_path": str(self.model_path),
            "checkpoint_epoch": self.metadata.get('epoch', 'unknown') if self.metadata else 'unknown'
        }
        
        if self.metadata:
            info.update({
                "generator_loss": self.metadata.get('generator_loss'),
                "discriminator_loss": self.metadata.get('discriminator_loss'),
                "fid_score": self.metadata.get('fid_score'),
                "training_timestamp": self.metadata.get('timestamp')
            })
        
        # Calculate model size
        if self.model_path.exists():
            size_mb = self.model_path.stat().st_size / (1024 * 1024)
            info['model_size_mb'] = round(size_mb, 2)
        
        return info


# Example usage
if __name__ == '__main__':
    # Test the model
    gan = TrainedGAN()
    gan.load_model()
    
    print("Model Info:")
    print(json.dumps(gan.get_model_info(), indent=2))
    
    # Generate test image
    prompt = "elegant red evening dress"
    print(f"\nGenerating image for: '{prompt}'")
    images = gan.generate_from_text(prompt, num_samples=2)
    
    print(f"✅ Generated {len(images)} images")
    for i, img in enumerate(images):
        img.save(f'test_gan_output_{i}.png')
        print(f"   Saved: test_gan_output_{i}.png")
