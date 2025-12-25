import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path
from app.models_loader import FashionDatasetLoader

# Debug the dataset loader
loader = FashionDatasetLoader()
print(f"Dataset path: {loader.dataset_path}")
print(f"Dataset path exists: {loader.dataset_path.exists()}")

train_path = loader.dataset_path / "train" / "annotations.json"
print(f"Train annotations path: {train_path}")
print(f"Train annotations exists: {train_path.exists()}")

if train_path.exists():
    print(f"Train annotations content preview:")
    with open(train_path, 'r') as f:
        import json
        data = json.load(f)
        print(f"  Total images: {len(data.get('images', []))}")
        print(f"  Split: {data.get('split', 'unknown')}")

stats = loader.get_dataset_stats()
print(f"Dataset stats: {stats}")