"""
Image search utilities for finding images matching text prompts.
Uses metadata CSV for keyword-based matching.
"""

import torch
import numpy as np
from pathlib import Path
from PIL import Image
import json
import logging
import csv
import re
from collections import Counter

logger = logging.getLogger(__name__)

class ImageSearcher:
    """Search for images matching text prompts using metadata CSV"""
    
    def __init__(self, dataset_path: str = None):
        """Initialize the image searcher"""
        self.dataset_path = Path(dataset_path) if dataset_path else None
        self.metadata = {}
        self.clip_available = False
        self.model = None
        self.preprocess = None
        
        # Load metadata CSV
        self._load_metadata()
        
        # Try to load CLIP as fallback (optional)
        try:
            import clip
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self.model, self.preprocess = clip.load("ViT-B/32", device=self.device)
            self.clip_available = True
            logger.info(f"CLIP model loaded successfully on {self.device}")
        except ImportError:
            logger.info("CLIP not available. Using metadata-based search.")
            self.clip_available = False
        except Exception as e:
            logger.info(f"CLIP not loaded: {e}. Using metadata-based search.")
            self.clip_available = False
    
    def _load_metadata(self):
        """Load metadata from CSV file"""
        if not self.dataset_path:
            return
        
        # Look for metadata CSV
        metadata_path = self.dataset_path.parent / "metadata" / "data.csv"
        if not metadata_path.exists():
            logger.warning(f"Metadata CSV not found at {metadata_path}")
            return
        
        try:
            with open(metadata_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    image_name = row.get('image', '')
                    if image_name:
                        self.metadata[image_name] = {
                            'description': row.get('description', '').lower(),
                            'display_name': row.get('display name', ''),
                            'category': row.get('category', '').lower()
                        }
            logger.info(f"Loaded metadata for {len(self.metadata)} images")
        except Exception as e:
            logger.error(f"Failed to load metadata CSV: {e}")
            self.metadata = {}
    
    def search_by_text(self, prompt: str, split: str = "test", num_results: int = 5) -> list:
        """
        Search for images matching the text prompt.
        Uses metadata CSV for keyword matching.
        
        Args:
            prompt: Text description to search for
            split: Dataset split to search in (train/validation/test)
            num_results: Number of images to return
            
        Returns:
            List of image dictionaries with file paths
        """
        # Primary method: metadata-based search
        if self.metadata:
            results = self._metadata_search(prompt, split, num_results)
            if results:
                return results
        
        # Fallback: CLIP search if available
        if self.clip_available and self.model:
            try:
                return self._clip_search(prompt, split, num_results)
            except Exception as e:
                logger.error(f"CLIP search failed: {e}")
        
        # Last resort: random selection
        logger.warning("Using random selection as fallback")
        return self._random_search(split, num_results)
    
    def _metadata_search(self, prompt: str, split: str, num_results: int) -> list:
        """Search using metadata CSV descriptions"""
        if not self.dataset_path:
            return []
        
        # Load annotations to get available images in this split
        annotations_path = self.dataset_path / split / "annotations.json"
        if not annotations_path.exists():
            logger.warning(f"Annotations not found: {annotations_path}")
            return []
        
        with open(annotations_path, 'r') as f:
            annotations = json.load(f)
        
        images_info = annotations.get("images", [])
        if not images_info:
            return []
        
        # Prepare search terms from prompt
        prompt_lower = prompt.lower()
        prompt_words = set(re.findall(r'\b\w+\b', prompt_lower))
        
        # Remove common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        prompt_words = prompt_words - stop_words
        
        # Score each image based on metadata match
        scored_images = []
        
        for img_info in images_info:
            filename = img_info['file_name']
            
            # Check if we have metadata for this image
            if filename not in self.metadata:
                continue
            
            metadata = self.metadata[filename]
            description = metadata['description']
            category = metadata['category']
            
            # Calculate match score
            score = 0
            
            # Exact phrase match in description (highest priority)
            if prompt_lower in description:
                score += 50
            
            # Word-by-word matching
            for word in prompt_words:
                if len(word) <= 2:  # Skip very short words
                    continue
                
                # Check description
                if word in description:
                    score += 10
                
                # Check category (higher weight)
                if word in category:
                    score += 15
                
                # Partial word matching for better flexibility
                if any(word in desc_word for desc_word in description.split()):
                    score += 3
            
            if score > 0:
                img_path = self.dataset_path / split / "images" / filename
                if img_path.exists():
                    scored_images.append({
                        'score': score,
                        'info': {
                            **img_info,
                            'path': str(img_path),
                            'url': f"/api/images/{split}/{filename}",
                            'description': metadata['description'][:100] + '...' if len(metadata['description']) > 100 else metadata['description'],
                            'match_score': score
                        }
                    })
        
        # Sort by score (highest first) and return top results
        scored_images.sort(key=lambda x: x['score'], reverse=True)
        top_results = [item['info'] for item in scored_images[:num_results]]
        
        if top_results:
            logger.info(f"Metadata search for '{prompt}': found {len(top_results)} images, "
                       f"top score: {scored_images[0]['score']}")
        else:
            logger.info(f"Metadata search for '{prompt}': no matches found, falling back")
        
        return top_results
    
    def _clip_search(self, prompt: str, split: str, num_results: int) -> list:
        """Search using CLIP embeddings for semantic matching"""
        import clip
        
        if not self.dataset_path:
            logger.warning("Dataset path not set")
            return []
        
        # Load annotations
        annotations_path = self.dataset_path / split / "annotations.json"
        if not annotations_path.exists():
            logger.warning(f"Annotations not found: {annotations_path}")
            return []
        
        with open(annotations_path, 'r') as f:
            annotations = json.load(f)
        
        images_info = annotations.get("images", [])
        if not images_info:
            return []
        
        # Encode the text prompt
        text_tokens = clip.tokenize([prompt]).to(self.device)
        with torch.no_grad():
            text_features = self.model.encode_text(text_tokens)
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)
        
        # Sample a subset of images to search (for performance)
        # Searching all 30k+ images would be slow
        max_search_images = min(500, len(images_info))
        import random
        sampled_images = random.sample(images_info, max_search_images)
        
        # Compute image embeddings and similarities
        similarities = []
        valid_images = []
        
        for img_info in sampled_images:
            img_path = self.dataset_path / split / "images" / img_info["file_name"]
            if not img_path.exists():
                continue
            
            try:
                # Load and preprocess image
                image = Image.open(img_path).convert("RGB")
                image_input = self.preprocess(image).unsqueeze(0).to(self.device)
                
                # Encode image
                with torch.no_grad():
                    image_features = self.model.encode_image(image_input)
                    image_features = image_features / image_features.norm(dim=-1, keepdim=True)
                
                # Compute similarity
                similarity = (text_features @ image_features.T).item()
                similarities.append(similarity)
                valid_images.append({
                    **img_info,
                    "path": str(img_path),
                    "url": f"/api/images/{split}/{img_info['file_name']}"
                })
                
            except Exception as e:
                logger.warning(f"Failed to process image {img_path}: {e}")
                continue
        
        if not similarities:
            logger.warning("No valid images found for CLIP search")
            return []
        
        # Sort by similarity and return top results
        sorted_indices = np.argsort(similarities)[::-1]
        top_results = [valid_images[i] for i in sorted_indices[:num_results]]
        
        logger.info(f"CLIP search for '{prompt}': found {len(top_results)} images, "
                   f"top similarity: {similarities[sorted_indices[0]]:.3f}")
        
        return top_results
    
    def _random_search(self, split: str, num_results: int) -> list:
        """
        Random selection fallback when no matches found.
        """
        if not self.dataset_path:
            return []
        
        annotations_path = self.dataset_path / split / "annotations.json"
        if not annotations_path.exists():
            return []
        
        with open(annotations_path, 'r') as f:
            annotations = json.load(f)
        
        images_info = annotations.get("images", [])
        if not images_info:
            return []
        
        # Random selection
        import random
        random.shuffle(images_info)
        selected = images_info[:min(num_results, len(images_info))]
        
        for img in selected:
            img_path = self.dataset_path / split / "images" / img["file_name"]
            img["path"] = str(img_path)
            img["url"] = f"/api/images/{split}/{img['file_name']}"
        
        logger.info(f"Random search: returning {len(selected)} images")
        return selected
