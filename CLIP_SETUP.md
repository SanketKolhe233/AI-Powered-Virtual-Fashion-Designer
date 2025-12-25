# CLIP Setup for Semantic Image Search

## What is CLIP?

CLIP (Contrastive Language-Image Pre-training) is an AI model that understands both images and text. It enables semantic search - finding images that match text descriptions.

## Current Status

The comparison feature currently uses a **fallback search** that returns varied sample images. To enable true semantic search (finding images that actually match your prompt like "red dress" or "blue jacket"), you need to install CLIP.

## Installation

### Prerequisites
- Git must be installed on your system
- PyTorch must be installed (already included in requirements.txt)

### Install CLIP

```bash
pip install git+https://github.com/openai/CLIP.git
```

Or manually:
```bash
git clone https://github.com/openai/CLIP.git
cd CLIP
pip install -e .
```

## How It Works

### Without CLIP (Current):
- Comparison uses random sample images from the dataset
- Prompt is acknowledged but doesn't affect which images are selected
- Still shows reconstruction quality, just with random images

### With CLIP (Enhanced):
- System finds images that semantically match your prompt
- "red dress" → finds actual red dresses in dataset
- "blue jacket" → finds actual blue jackets
- More meaningful comparisons between models

## Performance Notes

- CLIP search processes 500 images (sampled from 30k+ dataset) for performance
- First run downloads the ViT-B/32 model (~350MB)
- Subsequent runs are faster as the model is cached
- Search adds ~2-3 seconds to comparison time

## Verification

After installing CLIP, check the server logs. You should see:
```
INFO: CLIP model loaded successfully on cpu
```

Or if using GPU:
```
INFO: CLIP model loaded successfully on cuda
```

## Fallback Behavior

If CLIP is not installed or fails to load, the system automatically falls back to randomized search. This ensures the comparison feature always works, even without CLIP.
