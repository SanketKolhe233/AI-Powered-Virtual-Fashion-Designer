import os
import shutil
import random
from pathlib import Path
import json

def organize_dataset():
    """
    Organize fashion product images into train/validation/test splits
    """
    # Source directory
    source_dir = Path("c:/Users/sanch/Downloads/fashion/fashion-ai-website/data/fashion-product-images")
    
    # Target directories
    data_dir = Path("c:/Users/sanch/Downloads/fashion/fashion-ai-website/data/datasets")
    train_dir = data_dir / "train" / "images"
    val_dir = data_dir / "validation" / "images"
    test_dir = data_dir / "test" / "images"
    
    # Create directories
    train_dir.mkdir(parents=True, exist_ok=True)
    val_dir.mkdir(parents=True, exist_ok=True)
    test_dir.mkdir(parents=True, exist_ok=True)
    
    # Get all image files
    image_files = list(source_dir.glob("*.jpg"))
    print(f"Found {len(image_files)} images")
    
    # Shuffle for random distribution
    random.seed(42)  # For reproducible splits
    random.shuffle(image_files)
    
    # Calculate split sizes (70% train, 15% validation, 15% test)
    total_images = len(image_files)
    train_size = int(0.70 * total_images)
    val_size = int(0.15 * total_images)
    test_size = total_images - train_size - val_size
    
    print(f"Split sizes: Train={train_size}, Validation={val_size}, Test={test_size}")
    
    # Split and copy files
    train_files = image_files[:train_size]
    val_files = image_files[train_size:train_size + val_size]
    test_files = image_files[train_size + val_size:]
    
    # Copy training files
    print("Copying training files...")
    for i, file in enumerate(train_files):
        if i % 1000 == 0:
            print(f"  Progress: {i}/{len(train_files)}")
        shutil.copy2(file, train_dir / file.name)
    
    # Copy validation files
    print("Copying validation files...")
    for i, file in enumerate(val_files):
        if i % 500 == 0:
            print(f"  Progress: {i}/{len(val_files)}")
        shutil.copy2(file, val_dir / file.name)
    
    # Copy test files
    print("Copying test files...")
    for i, file in enumerate(test_files):
        if i % 500 == 0:
            print(f"  Progress: {i}/{len(test_files)}")
        shutil.copy2(file, test_dir / file.name)
    
    # Create basic annotations
    create_annotations(train_files, data_dir / "train" / "annotations.json", "train")
    create_annotations(val_files, data_dir / "validation" / "annotations.json", "validation")
    create_annotations(test_files, data_dir / "test" / "annotations.json", "test")
    
    print("Dataset organization complete!")
    return train_size, val_size, test_size

def create_annotations(image_files, annotation_path, split_name):
    """
    Create basic annotation files for the dataset
    """
    annotations = {
        "split": split_name,
        "total_images": len(image_files),
        "categories": {
            "fashion": {
                "id": 1,
                "name": "Fashion Products",
                "description": "Fashion and clothing items"
            }
        },
        "images": []
    }
    
    for i, image_file in enumerate(image_files):
        image_info = {
            "id": i + 1,
            "file_name": image_file.name,
            "width": None,  # Could be populated with actual image dimensions
            "height": None,
            "category_id": 1,  # Default to fashion category
            "category_name": "fashion"
        }
        annotations["images"].append(image_info)
    
    # Save annotations
    with open(annotation_path, 'w') as f:
        json.dump(annotations, f, indent=2)
    
    print(f"Created annotations for {len(image_files)} images in {annotation_path}")

if __name__ == "__main__":
    train_size, val_size, test_size = organize_dataset()
    print(f"\nFinal split: {train_size} train, {val_size} validation, {test_size} test images")