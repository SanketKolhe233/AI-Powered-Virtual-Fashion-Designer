"""Quick test of fixed transformer architecture"""
import sys
from pathlib import Path
sys.path.insert(0, '.')

import torch
from app.models.model_transformer import load_transformer_model, SimpleTokenizer
from torchvision.utils import save_image

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}\n")

# Setup paths
backend_dir = Path(__file__).parent
project_root = backend_dir.parent
models_dir = project_root / "models" / "transformer"

# Load tokenizer
print("Loading tokenizer...")
tokenizer = SimpleTokenizer()
tokenizer.load(str(models_dir / "tokenizer.json"))

# Load model
print("Loading model...")
model, config = load_transformer_model(str(models_dir / "checkpoint_epoch_80.pth"), device=device)
print(f"✅ Model loaded\n")

# Test generation
prompt = "black dress"
print(f"Generating: '{prompt}'")

with torch.no_grad():
    text_tokens = tokenizer.encode(prompt).unsqueeze(0).to(device)
    img = model(text_tokens)
    
    print(f"Output shape: {img.shape}")
    print(f"Output range: [{img.min():.3f}, {img.max():.3f}]")
    
    # Save with normalize=True (same as training)
    save_image(img, 'fixed_arch_test.png', normalize=True)
    print(f"\n✅ Saved to: fixed_arch_test.png")
    print("\nThis should now match the training quality!")
