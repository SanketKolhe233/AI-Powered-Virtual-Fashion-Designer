"""
Pydantic models for request/response schemas in the Fashion AI API.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

class ModelType(str, Enum):
    """Available AI model types"""
    AUTOENCODER = "autoencoder"
    VAE = "vae"
    TRANSFORMER = "transformer"
    GAN = "gan"
    DIFFUSION = "diffusion"

class FashionStyle(str, Enum):
    """Fashion style categories"""
    CASUAL = "casual"
    FORMAL = "formal"
    VINTAGE = "vintage"
    MODERN = "modern"
    STREETWEAR = "streetwear"
    LUXURY = "luxury"

class ColorCategory(str, Enum):
    """Color categories for fashion items"""
    RED = "red"
    BLUE = "blue"
    GREEN = "green"
    BLACK = "black"
    WHITE = "white"
    BROWN = "brown"
    GRAY = "gray"
    PINK = "pink"
    YELLOW = "yellow"
    PURPLE = "purple"

# Request Models
class GenerationRequest(BaseModel):
    """Request model for fashion item generation"""
    prompt: str = Field(..., description="Text description of the fashion item to generate")
    num_images: int = Field(default=1, ge=1, le=10, description="Number of images to generate")
    style: Optional[FashionStyle] = Field(None, description="Fashion style preference")
    color: Optional[ColorCategory] = Field(None, description="Primary color preference")
    size: Optional[str] = Field(None, description="Size specification (S, M, L, XL, etc.)")
    material: Optional[str] = Field(None, description="Material preference (cotton, silk, leather, etc.)")
    season: Optional[str] = Field(None, description="Season (spring, summer, fall, winter)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "elegant red evening dress",
                "num_images": 2,
                "style": "formal",
                "color": "red",
                "material": "silk",
                "season": "summer"
            }
        }

class EvaluationRequest(BaseModel):
    """Request model for model evaluation"""
    models: List[ModelType] = Field(..., description="List of models to evaluate")
    test_prompts: Optional[List[str]] = Field(None, description="Custom test prompts")
    metrics: Optional[List[str]] = Field(
        default=["fid", "bleu", "inception_score"], 
        description="Metrics to calculate"
    )
    num_samples: int = Field(default=10, ge=1, le=100, description="Number of samples per model")
    
    class Config:
        json_schema_extra = {
            "example": {
                "models": ["gan", "diffusion"],
                "test_prompts": ["blue jeans", "white t-shirt"],
                "metrics": ["fid", "inception_score"],
                "num_samples": 5
            }
        }

class ComparisonRequest(BaseModel):
    """Request model for model comparison"""
    models: List[ModelType] = Field(..., min_items=2, description="Models to compare")
    prompt: str = Field(..., description="Same prompt for all models")
    num_images_per_model: int = Field(default=3, ge=1, le=5, description="Images per model")
    
    class Config:
        json_schema_extra = {
            "example": {
                "models": ["gan", "diffusion", "transformer"],
                "prompt": "black leather jacket",
                "num_images_per_model": 3
            }
        }

# Response Models
class GenerationResponse(BaseModel):
    """Response model for fashion item generation"""
    model_used: str = Field(..., description="Name of the model used for generation")
    generated_images: List[str] = Field(..., description="List of generated image URLs or base64 data")
    generation_time: float = Field(..., description="Time taken for generation in seconds")
    prompt_used: str = Field(..., description="Original prompt used")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional generation metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "model_used": "diffusion",
                "generated_images": ["data:image/jpeg;base64,/9j/4AAQ..."],
                "generation_time": 2.5,
                "prompt_used": "elegant red evening dress",
                "metadata": {"seed": 12345, "steps": 50}
            }
        }

class ModelInfo(BaseModel):
    """Information about an AI model"""
    name: str = Field(..., description="Model name")
    description: str = Field(..., description="Model description")
    status: str = Field(..., description="Model status (available, loading, error)")
    version: Optional[str] = Field(None, description="Model version")
    capabilities: Optional[List[str]] = Field(None, description="Model capabilities")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "diffusion",
                "description": "Diffusion model for controllable fashion generation",
                "status": "available",
                "version": "1.0.0",
                "capabilities": ["text-to-image", "style-control", "color-control"]
            }
        }

class EvaluationMetrics(BaseModel):
    """Evaluation metrics for a model"""
    fid_score: Optional[float] = Field(None, description="Fréchet Inception Distance (lower is better)")
    bleu_score: Optional[float] = Field(None, description="BLEU score for text similarity (higher is better)")
    inception_score: Optional[float] = Field(None, description="Inception Score (higher is better)")
    diversity_score: Optional[float] = Field(None, description="Diversity score (higher is better)")
    style_consistency: Optional[float] = Field(None, description="Style consistency score")
    color_accuracy: Optional[float] = Field(None, description="Color accuracy score")
    texture_quality: Optional[float] = Field(None, description="Texture quality score")

class EvaluationResponse(BaseModel):
    """Response model for model evaluation"""
    evaluation_results: Dict[str, EvaluationMetrics] = Field(..., description="Results per model")
    evaluation_time: float = Field(..., description="Total evaluation time in seconds")
    metrics_used: List[str] = Field(..., description="List of metrics calculated")
    test_info: Optional[Dict[str, Any]] = Field(None, description="Information about test data")
    analysis: Optional[Dict[str, Any]] = Field(None, description="AI-powered analysis of results")
    
    class Config:
        json_schema_extra = {
            "example": {
                "evaluation_results": {
                    "gan": {
                        "fid_score": 25.3,
                        "inception_score": 8.2,
                        "diversity_score": 0.85
                    }
                },
                "evaluation_time": 45.2,
                "metrics_used": ["FID", "Inception Score", "Diversity"],
                "test_info": {"num_samples": 100, "test_prompts": 10},
                "analysis": {
                    "summary": "Overall strong performance across models",
                    "model_insights": {}
                }
            }
        }

class ComparisonResult(BaseModel):
    """Result for a single model in comparison"""
    model_name: str = Field(..., description="Name of the model")
    generated_images: List[str] = Field(..., description="Generated images")
    generation_time: float = Field(..., description="Generation time in seconds")
    quality_score: Optional[float] = Field(None, description="Estimated quality score")

class ComparisonResponse(BaseModel):
    """Response model for model comparison"""
    prompt: str = Field(..., description="Prompt used for comparison")
    results: Dict[str, ComparisonResult] = Field(..., description="Results per model")
    comparison_time: float = Field(..., description="Total comparison time")
    winner: Optional[str] = Field(None, description="Best performing model (if determined)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "black leather jacket",
                "results": {
                    "gan": {
                        "model_name": "gan",
                        "generated_images": ["data:image/jpeg;base64,/9j/4AAQ..."],
                        "generation_time": 1.2,
                        "quality_score": 8.5
                    }
                },
                "comparison_time": 3.8,
                "winner": "diffusion"
            }
        }

# Error Models
class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
    
    class Config:
        json_schema_extra = {
            "example": {
                "error": "ModelNotFound",
                "message": "The specified model is not available",
                "details": {"available_models": ["gan", "diffusion", "transformer", "autoencoder"]}
            }
        }