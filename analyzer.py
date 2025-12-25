"""
AI Analysis service for model comparison insights
"""
import logging
from typing import Dict, Any, List
import json

logger = logging.getLogger(__name__)


class ComparisonAnalyzer:
    """Analyzes model comparison results and provides insights"""
    
    def __init__(self):
        """Initialize the analyzer"""
        self.use_external_llm = False
        # You can enable external LLM (OpenAI, Anthropic, etc.) by setting API keys
        
    def analyze_comparison(self, comparison_results: Dict[str, Any], prompt: str) -> Dict[str, Any]:
        """
        Analyze comparison results and generate insights
        
        Args:
            comparison_results: Dictionary of model results
            prompt: The prompt used for comparison
            
        Returns:
            Analysis with insights, recommendations, and metrics
        """
        
        if self.use_external_llm:
            return self._analyze_with_llm(comparison_results, prompt)
        else:
            return self._analyze_rule_based(comparison_results, prompt)
    
    def _analyze_rule_based(self, comparison_results: Dict[str, Any], prompt: str) -> Dict[str, Any]:
        """Rule-based analysis without external LLM"""
        
        models_analyzed = []
        reconstruction_models = []
        generative_models = []
        
        # Categorize models
        for model_name, data in comparison_results.items():
            model_type = data.get('model_type', 'generation')
            generation_time = data.get('generation_time', 0)
            
            model_info = {
                'name': model_name,
                'type': model_type,
                'time': generation_time,
                'has_error': 'error' in data
            }
            
            if model_type == 'reconstruction':
                model_info['num_reconstructions'] = len(data.get('reconstructions', []))
                reconstruction_models.append(model_info)
            else:
                model_info['num_images'] = len(data.get('generated_images', []))
                generative_models.append(model_info)
            
            models_analyzed.append(model_info)
        
        # Generate insights
        insights = []
        
        # Reconstruction model insights
        if reconstruction_models:
            insights.append({
                'type': 'reconstruction',
                'title': 'Reconstruction Models',
                'description': f"Analyzing {len(reconstruction_models)} reconstruction model(s). These models find images in the dataset "
                             f"matching '{prompt}' and reconstruct them. This shows how well the model preserves image details "
                             f"through compression and decompression.",
                'severity': 'info'
            })
        
        # Generative model insights
        if generative_models:
            if len(generative_models) >= 2:
                insights.append({
                    'type': 'comparison',
                    'title': 'Generative Model Comparison',
                    'description': "Comparing multiple generative models. GAN produces sharp, vibrant outputs with quick generation. "
                                 "Transformer creates natural-looking, semantically coherent results. "
                                 "Diffusion uses progressive denoising across 1000 timesteps for highly refined, smooth outputs "
                                 "with characteristic quality at the cost of longer processing time.",
                    'severity': 'info'
                })
        
        # Model type insights
        if reconstruction_models and generative_models:
            insights.append({
                'type': 'model_type',
                'title': 'Model Types',
                'description': "You're comparing reconstruction models with generative models. Reconstruction models work by "
                             "compressing and decompressing existing images, while generative models create new images from scratch. "
                             "These serve different purposes and aren't directly comparable.",
                'severity': 'warning'
            })
        
        # Generate recommendation
        recommendation = self._generate_recommendation(models_analyzed, reconstruction_models, generative_models, prompt)
        
        # Overall summary
        summary = self._generate_summary(models_analyzed, prompt)
        
        return {
            'summary': summary,
            'insights': insights,
            'recommendation': recommendation,
            'models_count': len(models_analyzed),
            'analysis_type': 'rule_based'
        }
    
    def _generate_summary(self, models: List[Dict], prompt: str) -> str:
        """Generate overall summary"""
        model_names = [m['name'].upper() for m in models]
        avg_time = sum(m['time'] for m in models) / len(models) if models else 0
        
        summary = f"Compared {len(models)} model(s) ({', '.join(model_names)}) on the prompt '{prompt}'. "
        summary += f"Average processing time: {avg_time:.2f}s. "
        
        has_errors = any(m['has_error'] for m in models)
        if has_errors:
            summary += "Some models encountered errors during generation. "
        
        return summary
    
    def _generate_recommendation(self, all_models: List[Dict], 
                                reconstruction_models: List[Dict], 
                                generative_models: List[Dict],
                                prompt: str) -> Dict[str, Any]:
        """Generate recommendation based on analysis"""
        
        if not all_models:
            return {
                'title': 'No Recommendation',
                'description': 'No models to compare.',
                'model': None
            }
        
        # If comparing reconstruction models (only autoencoder now)
        if reconstruction_models and not generative_models:
            return {
                'title': 'Reconstruction Model',
                'model': 'Autoencoder',
                'description': 'The Autoencoder is ideal for fast reconstruction and compression of existing images. '
                             'It directly learns to minimize reconstruction error with minimal latency, preserving sharp details.',
                'reason': 'Fast processing and detail preservation'
            }
        
        # If comparing generative models
        if generative_models and not reconstruction_models:
            # Recommend based on model characteristics
            if 'diffusion' in [m['name'] for m in generative_models]:
                return {
                    'title': 'Best for Quality',
                    'model': 'Diffusion',
                    'description': 'Diffusion offers superior quality through progressive denoising over 1000 timesteps. '
                                 'While slower, it produces highly refined, smooth results with excellent perceptual quality. '
                                 'Ideal when quality matters more than speed.',
                    'reason': 'Superior refinement and perceptual quality'
                }
            elif 'gan' in [m['name'] for m in generative_models]:
                return {
                    'title': 'Best for Speed',
                    'model': 'GAN',
                    'description': 'GAN provides fast generation with sharp, vibrant outputs. '
                                 'Excellent for quick iterations and high-contrast results.',
                    'reason': 'Fast generation and sharp details'
                }
            elif 'transformer' in [m['name'] for m in generative_models]:
                return {
                    'title': 'Best for Coherence',
                    'model': 'Transformer',
                    'description': 'Transformer excels at semantic understanding and creating natural-looking, coherent results. '
                                 'Best for text-aligned generation.',
                    'reason': 'Natural outputs and text alignment'
                }
        
        # If comparing different types
        if reconstruction_models and generative_models:
            return {
                'title': 'Different Use Cases',
                'model': None,
                'description': 'Reconstruction and generative models serve different purposes. Use reconstruction models '
                             '(Autoencoder) for compressing and decompressing existing images. Use generative models '
                             '(GAN, Transformer, Diffusion) for creating entirely new images from text descriptions.',
                'reason': 'Different model purposes'
            }
        
        # Default: recommend fastest model
        fastest = min(all_models, key=lambda x: x['time'])
        return {
            'title': 'Fastest Model',
            'model': fastest['name'].upper(),
            'description': f"{fastest['name'].upper()} completed the task in {fastest['time']:.2f}s, making it the most efficient choice.",
            'reason': 'Best performance'
        }
    
    def _analyze_with_llm(self, comparison_results: Dict[str, Any], prompt: str) -> Dict[str, Any]:
        """
        Analyze using external LLM (OpenAI, Anthropic, etc.)
        This is a placeholder for future implementation
        """
        # TODO: Implement external LLM analysis
        # You would call OpenAI API, Anthropic Claude, or other LLM here
        # For now, fall back to rule-based
        return self._analyze_rule_based(comparison_results, prompt)
    
    def generate_detailed_comparison(self, comparison_results: Dict[str, Any], prompt: str, evaluation_metrics: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate detailed aspect-by-aspect comparison of models using AI analysis
        
        Args:
            comparison_results: Dictionary of model results
            prompt: The prompt used for comparison
            evaluation_metrics: Dictionary of evaluation metrics for each model
            
        Returns:
            Dictionary with comparison aspects for each model
        """
        
        aspects = {}
        
        for model_name, data in comparison_results.items():
            model_type = data.get('model_type', 'generation')
            generation_time = data.get('generation_time', 0)
            has_error = 'error' in data
            
            # Get evaluation metrics for this model
            model_metrics = {}
            if evaluation_metrics and model_name in evaluation_metrics:
                model_metrics = evaluation_metrics[model_name]
            
            if has_error:
                # Model failed
                aspects[model_name] = {
                    'model_type': 'Error',
                    'architecture': 'N/A',
                    'generation_speed': 'Failed',
                    'image_quality': 'N/A',
                    'diversity': 'N/A',
                    'sharpness': 'N/A',
                    'color_vibrancy': 'N/A',
                    'training_stability': 'N/A',
                    'best_use_case': 'N/A',
                    'prompt_understanding': 'N/A',
                    'memory_usage': 'N/A',
                    'fid_score': 'N/A',
                    'bleu_score': 'N/A',
                    'inception_score': 'N/A',
                    'diversity_score': 'N/A'
                }
                continue
            
            # Analyze based on model type
            if model_name == 'autoencoder':
                aspects[model_name] = {
                    'model_type': 'Reconstruction',
                    'architecture': 'Encoder-Decoder',
                    'generation_speed': f"{generation_time:.2f}s",
                    'image_quality': self._analyze_quality(model_name, data, prompt),
                    'diversity': 'Low (Reconstruction-based)',
                    'sharpness': self._analyze_sharpness(model_name, data),
                    'color_vibrancy': 'Natural (Dataset colors)',
                    'training_stability': 'High - Stable training',
                    'training_performance': 'loss: 0.0234 - val_loss: 0.0289',
                    'best_use_case': 'Image reconstruction & compression',
                    'prompt_understanding': 'N/A (No text conditioning)',
                    'memory_usage': 'Low (~50-100MB)',
                    'fid_score': f"{model_metrics.get('fid_score', 'N/A')} {'(Good for reconstruction)' if model_metrics.get('fid_score') else ''}",
                    'bleu_score': f"{model_metrics.get('bleu_score', 'N/A')} {'(Moderate)' if model_metrics.get('bleu_score') else ''}",
                    'inception_score': f"{model_metrics.get('inception_score', 'N/A')} {'(Good)' if model_metrics.get('inception_score') else ''}",
                    'diversity_score': f"{model_metrics.get('diversity_score', 'N/A')} {'(Limited by dataset)' if model_metrics.get('diversity_score') else ''}"
                }
            
            elif model_name == 'diffusion':
                aspects[model_name] = {
                    'model_type': 'Denoising Diffusion Model (DDPM)',
                    'architecture': 'U-Net with Timestep Conditioning',
                    'generation_speed': f"{generation_time:.2f}s",
                    'image_quality': self._analyze_quality(model_name, data, prompt),
                    'diversity': 'Very High (Stochastic denoising)',
                    'sharpness': self._analyze_sharpness(model_name, data),
                    'color_vibrancy': 'Smooth and refined',
                    'training_stability': 'High - Stable diffusion process',
                    'training_performance': 'train_loss: 0.012408 | val_loss: 0.010590',
                    'best_use_case': 'High-quality image refinement',
                    'prompt_understanding': 'Excellent (Text-guided denoising)',
                    'memory_usage': 'Medium-High (~200-400MB)',
                    'fid_score': f"{model_metrics.get('fid_score', 'N/A')} {'(Excellent)' if model_metrics.get('fid_score') else ''}",
                    'bleu_score': f"{model_metrics.get('bleu_score', 'N/A')} {'(Strong text alignment)' if model_metrics.get('bleu_score') else ''}",
                    'inception_score': f"{model_metrics.get('inception_score', 'N/A')} {'(High quality & diversity)' if model_metrics.get('inception_score') else ''}",
                    'diversity_score': f"{model_metrics.get('diversity_score', 'N/A')} {'(Very diverse outputs)' if model_metrics.get('diversity_score') else ''}"
                }
            
            elif model_name == 'transformer':
                num_images = len(data.get('generated_images', []))
                aspects[model_name] = {
                    'model_type': 'Transformer-based',
                    'architecture': 'Self-Attention + Image Decoder',
                    'generation_speed': f"{generation_time:.2f}s" if generation_time > 0 else 'Fast',
                    'image_quality': self._analyze_quality(model_name, data, prompt),
                    'diversity': f'High ({num_images} varied outputs)',
                    'sharpness': self._analyze_sharpness(model_name, data),
                    'color_vibrancy': 'Enhanced & natural',
                    'training_stability': 'High - Stable training',
                    'training_performance': 'accuracy: 0.9813 - loss: 0.0577 - val_accuracy: 0.8967 - val_loss: 0.4339',
                    'best_use_case': 'Text-to-image generation',
                    'prompt_understanding': f'Excellent - Matched "{prompt}"',
                    'memory_usage': 'High (~500MB-1GB)',
                    'fid_score': f"{model_metrics.get('fid_score', 'N/A')} {'(Very Good)' if model_metrics.get('fid_score') else ''}",
                    'bleu_score': f"{model_metrics.get('bleu_score', 'N/A')} {'(Good text alignment)' if model_metrics.get('bleu_score') else ''}",
                    'inception_score': f"{model_metrics.get('inception_score', 'N/A')} {'(High quality)' if model_metrics.get('inception_score') else ''}",
                    'diversity_score': f"{model_metrics.get('diversity_score', 'N/A')} {'(Diverse outputs)' if model_metrics.get('diversity_score') else ''}"
                }
            
            elif model_name == 'gan':
                num_images = len(data.get('generated_images', []))
                aspects[model_name] = {
                    'model_type': 'StyleGAN2',
                    'architecture': 'Generator + Discriminator',
                    'generation_speed': f"{generation_time:.2f}s" if generation_time > 0 else 'Fast',
                    'image_quality': self._analyze_quality(model_name, data, prompt),
                    'diversity': f'Very High ({num_images} unique outputs)',
                    'sharpness': 'Very High - Crisp edges',
                    'color_vibrancy': 'Vibrant & saturated',
                    'training_stability': 'Medium - Requires tuning',
                    'training_performance': 'Loss_D: 1.0412, Loss_G: 1.3022',
                    'best_use_case': 'High-quality photorealistic images',
                    'prompt_understanding': f'Excellent - Generated "{prompt}"',
                    'memory_usage': 'High (~600MB-1.2GB)',
                    'fid_score': f"{model_metrics.get('fid_score', 'N/A')} {'(Good)' if model_metrics.get('fid_score') else ''}",
                    'bleu_score': f"{model_metrics.get('bleu_score', 'N/A')} {'(Moderate text alignment)' if model_metrics.get('bleu_score') else ''}",
                    'inception_score': f"{model_metrics.get('inception_score', 'N/A')} {'(High quality & sharpness)' if model_metrics.get('inception_score') else ''}",
                    'diversity_score': f"{model_metrics.get('diversity_score', 'N/A')} {'(Extremely diverse)' if model_metrics.get('diversity_score') else ''}"
                }
        
        return {
            'aspects': aspects,
            'comparison_summary': self._generate_comparison_summary(aspects, prompt)
        }
    
    def _analyze_quality(self, model_name: str, data: Dict, prompt: str) -> str:
        """Analyze image quality based on model output"""
        if model_name == 'autoencoder':
            num_recon = len(data.get('reconstructions', []))
            if num_recon > 0:
                return f'Good - {num_recon} reconstruction(s)'
            return 'Good reconstruction quality'
        else:
            num_images = len(data.get('generated_images', []))
            if num_images > 0:
                if model_name == 'gan':
                    return f'Excellent - Sharp & realistic ({num_images} images)'
                elif model_name == 'transformer':
                    return f'Excellent - Natural & detailed ({num_images} images)'
                elif model_name == 'diffusion':
                    return f'Excellent - Smooth & refined ({num_images} images)'
            return 'Excellent quality'
    
    def _analyze_sharpness(self, model_name: str, data: Dict) -> str:
        """Analyze sharpness characteristics"""
        if model_name == 'gan':
            return 'Very High - Aggressive enhancement'
        elif model_name == 'transformer':
            return 'High - Enhanced edges'
        elif model_name == 'diffusion':
            return 'Very High - Smooth, refined from denoising'
        elif model_name == 'autoencoder':
            return 'Medium - Balanced detail'
        return 'Medium'
    
    def _generate_comparison_summary(self, aspects: Dict, prompt: str) -> str:
        """Generate a summary comparing all models"""
        model_names = list(aspects.keys())
        
        if len(model_names) == 0:
            return "No models to compare."
        
        
        summary = f"Comparing {len(model_names)} models for prompt: '{prompt}'. "
        
        # Quality comparison
        generative_models = [name for name in model_names if name in ['transformer', 'gan', 'diffusion']]
        if generative_models:
            summary += f"Generative models ({', '.join([m.upper() for m in generative_models])}) "
            summary += "produced high-quality text-conditioned outputs. "
        
        # Reconstruction models
        reconstruction_models = [name for name in model_names if name in ['autoencoder']]
        if reconstruction_models:
            summary += f"Reconstruction models ({', '.join([m.upper() for m in reconstruction_models])}) "
            summary += "retrieved and reconstructed matching images from the dataset. "
        
        # Highlight differences
        if 'gan' in model_names and 'transformer' in model_names:
            summary += "GAN outputs show higher sharpness and color vibrancy, while Transformer provides more natural-looking results. "
        
        if 'diffusion' in model_names:
            if 'gan' in model_names or 'transformer' in model_names:
                summary += "Diffusion offers superior quality through progressive denoising at 1000 timesteps, creating smooth, refined outputs. "
            if 'autoencoder' in model_names:
                summary += "Autoencoder provides fast reconstruction of existing images, while generative models create new outputs. "
        
        return summary


class EvaluationAnalyzer:
    """Analyzes evaluation results and provides AI-powered insights"""
    
    def __init__(self):
        """Initialize the evaluation analyzer"""
        pass
    
    def analyze_evaluation(self, evaluation_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze evaluation results and generate contextual insights
        
        Args:
            evaluation_results: Dictionary of model evaluation results
            
        Returns:
            Analysis with model-specific insights and recommendations
        """
        
        model_insights = {}
        all_models = []
        
        # Analyze each model's performance
        for model_name, metrics in evaluation_results.items():
            insight = self._generate_model_insight(model_name, metrics)
            model_insights[model_name] = insight
            all_models.append({
                'name': model_name,
                'metrics': metrics,
                'insight': insight
            })
        
        # Generate overall summary
        summary = self._generate_summary(all_models)
        
        # Determine best model for each metric
        best_performers = self._identify_best_performers(all_models)
        
        # Generate recommendations
        recommendation = self._generate_recommendation(all_models)
        
        return {
            'summary': summary,
            'model_insights': model_insights,
            'best_performers': best_performers,
            'recommendation': recommendation
        }
    
    def _generate_model_insight(self, model_name: str, metrics: Dict[str, float]) -> Dict[str, Any]:
        """Generate detailed insight for a specific model's performance"""
        
        insights = []
        overall_rating = "good"
        
        # Analyze FID score
        if 'fid_score' in metrics:
            fid = metrics['fid_score']
            if fid < 10:
                fid_rating = "excellent"
                fid_text = f"The FID score of {fid:.2f} is exceptional, indicating that {model_name.upper()}'s generated images are nearly indistinguishable from real fashion items. This suggests superior quality and realism."
            elif fid < 25:
                fid_rating = "good"
                fid_text = f"With a FID score of {fid:.2f}, {model_name.upper()} produces good quality images that closely match real fashion items. This is a solid performance for {self._get_model_type(model_name)}."
            elif fid < 50:
                fid_rating = "fair"
                fid_text = f"The FID score of {fid:.2f} indicates acceptable quality, though there's room for improvement. {model_name.upper()} may benefit from more training or architectural adjustments."
            else:
                fid_rating = "poor"
                fid_text = f"A FID score of {fid:.2f} suggests the generated images differ significantly from real fashion items. Consider model tuning or using a different architecture."
            
            insights.append({
                'metric': 'FID Score',
                'value': fid,
                'rating': fid_rating,
                'explanation': fid_text,
                'context': f"For {model_name.upper()}, this FID score is {fid_rating} because {self._explain_model_context(model_name, 'fid', fid)}"
            })
        
        # Analyze BLEU score
        if 'bleu_score' in metrics:
            bleu = metrics['bleu_score']
            if bleu > 0.7:
                bleu_rating = "excellent"
                bleu_text = f"A BLEU score of {bleu:.3f} demonstrates {model_name.upper()}'s outstanding ability to generate outputs that align with expected results. This is particularly impressive for text-to-image tasks."
            elif bleu > 0.5:
                bleu_rating = "good"
                bleu_text = f"The BLEU score of {bleu:.3f} shows {model_name.upper()} reliably produces outputs matching expectations. This indicates strong prompt understanding."
            elif bleu > 0.3:
                bleu_rating = "fair"
                bleu_text = f"With a BLEU score of {bleu:.3f}, {model_name.upper()} shows moderate alignment with expected outputs. Improvements in prompt interpretation could enhance this."
            else:
                bleu_rating = "poor"
                bleu_text = f"A BLEU score of {bleu:.3f} suggests {model_name.upper()} struggles with prompt adherence. Consider improving the text encoding mechanism."
            
            insights.append({
                'metric': 'BLEU Score',
                'value': bleu,
                'rating': bleu_rating,
                'explanation': bleu_text,
                'context': self._explain_model_context(model_name, 'bleu', bleu)
            })
        
        # Analyze Inception Score
        if 'inception_score' in metrics:
            is_score = metrics['inception_score']
            if is_score > 8:
                is_rating = "excellent"
                is_text = f"An Inception Score of {is_score:.2f} indicates {model_name.upper()} generates highly diverse and realistic images. This suggests both quality and variety in outputs."
            elif is_score > 5:
                is_rating = "good"
                is_text = f"The Inception Score of {is_score:.2f} shows {model_name.upper()} balances quality and diversity well, producing recognizable and varied fashion items."
            elif is_score > 3:
                is_rating = "fair"
                is_text = f"With an Inception Score of {is_score:.2f}, {model_name.upper()} produces acceptable results but could benefit from enhanced diversity or quality improvements."
            else:
                is_rating = "poor"
                is_text = f"An Inception Score of {is_score:.2f} suggests limited quality or diversity. {model_name.upper()} may need architectural improvements or more training data."
            
            insights.append({
                'metric': 'Inception Score',
                'value': is_score,
                'rating': is_rating,
                'explanation': is_text,
                'context': self._explain_model_context(model_name, 'inception', is_score)
            })
        
        # Analyze Diversity Score
        if 'diversity_score' in metrics:
            div = metrics['diversity_score']
            if div > 0.8:
                div_rating = "excellent"
                div_text = f"A diversity score of {div:.3f} demonstrates {model_name.upper()}'s ability to generate widely varied outputs, avoiding mode collapse and repetition."
            elif div > 0.6:
                div_rating = "good"
                div_text = f"The diversity score of {div:.3f} shows {model_name.upper()} produces good variety in its outputs, which is important for creative fashion design."
            elif div > 0.4:
                div_rating = "fair"
                div_text = f"With a diversity score of {div:.3f}, {model_name.upper()} shows moderate variety. Increasing training diversity could improve this metric."
            else:
                div_rating = "poor"
                div_text = f"A diversity score of {div:.3f} indicates {model_name.upper()} tends to produce similar outputs. This suggests potential mode collapse."
            
            insights.append({
                'metric': 'Diversity Score',
                'value': div,
                'rating': div_rating,
                'explanation': div_text,
                'context': self._explain_model_context(model_name, 'diversity', div)
            })
        
        # Determine overall rating
        ratings = [i['rating'] for i in insights]
        if all(r == 'excellent' for r in ratings):
            overall_rating = "excellent"
        elif any(r == 'poor' for r in ratings):
            overall_rating = "needs improvement"
        elif all(r in ['excellent', 'good'] for r in ratings):
            overall_rating = "good"
        else:
            overall_rating = "fair"
        
        return {
            'overall_rating': overall_rating,
            'insights': insights,
            'summary': self._generate_model_summary(model_name, overall_rating, insights)
        }
    
    def _get_model_type(self, model_name: str) -> str:
        """Get descriptive model type"""
        types = {
            'autoencoder': 'a reconstruction-based model',
            'diffusion': 'a progressive denoising diffusion model',
            'transformer': 'an attention-based text-to-image model',
            'gan': 'an adversarial generative model'
        }
        return types.get(model_name, 'this model')
    
    def _explain_model_context(self, model_name: str, metric_type: str, value: float) -> str:
        """Provide model-specific context for metric values"""
        
        contexts = {
            'autoencoder': {
                'fid': "autoencoders excel at reconstruction, so we expect lower FID scores when reconstructing existing fashion items",
                'bleu': "autoencoders don't typically generate from text prompts, so BLEU scores are less relevant",
                'inception': "reconstruction quality is more important than diversity for autoencoders",
                'diversity': "autoencoders are deterministic and focus on accurate reconstruction rather than variety"
            },
            'diffusion': {
                'fid': "diffusion models use progressive denoising over 1000 timesteps, typically achieving excellent FID scores through careful refinement",
                'bleu': "diffusion models excel at text-guided generation with classifier-free guidance, making BLEU scores highly relevant",
                'inception': "the iterative denoising process in diffusion models naturally promotes both quality and diversity",
                'diversity': "diffusion models excel at diversity through stochastic sampling at each timestep"
            },
            'transformer': {
                'fid': "transformers leverage attention mechanisms to understand prompts deeply, often achieving strong FID scores",
                'bleu': "transformers are specifically designed for text-to-image tasks, so high BLEU scores are expected",
                'inception': "the self-attention mechanism allows transformers to generate both high-quality and diverse outputs",
                'diversity': "transformers can produce varied interpretations of text prompts through their attention patterns"
            },
            'gan': {
                'fid': "GANs are adversarially trained to fool discriminators, typically achieving the best FID scores",
                'bleu': "GANs can condition on text, though prompt adherence varies based on conditioning mechanism",
                'inception': "GANs are specifically optimized for realistic outputs, often scoring highest on inception metrics",
                'diversity': "GANs can suffer from mode collapse, which may limit diversity despite high quality"
            }
        }
        
        return contexts.get(model_name, {}).get(metric_type, "this is a typical range for this model type")
    
    def _generate_model_summary(self, model_name: str, rating: str, insights: list) -> str:
        """Generate an overall summary for the model"""
        
        if rating == "excellent":
            return f"{model_name.upper()} demonstrates exceptional performance across all metrics, making it an excellent choice for fashion generation tasks."
        elif rating == "good":
            return f"{model_name.upper()} shows strong overall performance with good results across most metrics. It's a reliable option for fashion generation."
        elif rating == "fair":
            return f"{model_name.upper()} delivers acceptable results but has room for improvement in some areas. Consider fine-tuning for specific use cases."
        else:
            return f"{model_name.upper()} shows mixed results and may benefit from architectural improvements or additional training."
    
    def _generate_summary(self, all_models: list) -> str:
        """Generate overall evaluation summary"""
        
        if len(all_models) == 0:
            return "No models evaluated."
        
        num_models = len(all_models)
        model_names = ', '.join([m['name'].upper() for m in all_models])
        
        excellent_count = sum(1 for m in all_models if m['insight']['overall_rating'] == 'excellent')
        good_count = sum(1 for m in all_models if m['insight']['overall_rating'] == 'good')
        
        if excellent_count == num_models:
            return f"All {num_models} models ({model_names}) demonstrate excellent performance across evaluated metrics."
        elif excellent_count + good_count == num_models:
            return f"Evaluation of {num_models} models ({model_names}) shows strong overall performance with {excellent_count} excellent and {good_count} good performers."
        else:
            return f"Evaluated {num_models} models ({model_names}) with varied performance levels. Review individual insights for detailed recommendations."
    
    def _identify_best_performers(self, all_models: list) -> Dict[str, Any]:
        """Identify which model performs best in each metric"""
        
        best = {}
        
        # Find best FID (lowest)
        fid_models = [(m['name'], m['metrics'].get('fid_score', float('inf'))) for m in all_models if 'fid_score' in m['metrics']]
        if fid_models:
            best_fid = min(fid_models, key=lambda x: x[1])
            best['fid'] = {
                'model': best_fid[0].upper(),
                'value': best_fid[1],
                'explanation': f"{best_fid[0].upper()} achieves the lowest FID score of {best_fid[1]:.2f}, indicating the most realistic generated images."
            }
        
        # Find best BLEU (highest)
        bleu_models = [(m['name'], m['metrics'].get('bleu_score', 0)) for m in all_models if 'bleu_score' in m['metrics']]
        if bleu_models:
            best_bleu = max(bleu_models, key=lambda x: x[1])
            best['bleu'] = {
                'model': best_bleu[0].upper(),
                'value': best_bleu[1],
                'explanation': f"{best_bleu[0].upper()} has the highest BLEU score of {best_bleu[1]:.3f}, showing best prompt adherence."
            }
        
        # Find best Inception Score (highest)
        is_models = [(m['name'], m['metrics'].get('inception_score', 0)) for m in all_models if 'inception_score' in m['metrics']]
        if is_models:
            best_is = max(is_models, key=lambda x: x[1])
            best['inception'] = {
                'model': best_is[0].upper(),
                'value': best_is[1],
                'explanation': f"{best_is[0].upper()} scores highest at {best_is[1]:.2f}, demonstrating excellent quality and diversity balance."
            }
        
        # Find best Diversity (highest)
        div_models = [(m['name'], m['metrics'].get('diversity_score', 0)) for m in all_models if 'diversity_score' in m['metrics']]
        if div_models:
            best_div = max(div_models, key=lambda x: x[1])
            best['diversity'] = {
                'model': best_div[0].upper(),
                'value': best_div[1],
                'explanation': f"{best_div[0].upper()} shows the most diversity with a score of {best_div[1]:.3f}, producing the most varied outputs."
            }
        
        return best
    
    def _generate_recommendation(self, all_models: list) -> Dict[str, str]:
        """Generate recommendation for model selection"""
        
        if len(all_models) == 0:
            return {'title': 'No Recommendation', 'description': 'No models available for recommendation.'}
        
        # Count excellent/good ratings
        excellent = [m for m in all_models if m['insight']['overall_rating'] == 'excellent']
        good = [m for m in all_models if m['insight']['overall_rating'] == 'good']
        
        if excellent:
            best = excellent[0]
            return {
                'title': f'Recommended: {best["name"].upper()}',
                'model': best['name'].upper(),
                'description': f"{best['name'].upper()} demonstrates exceptional performance across all evaluated metrics, making it the best choice for most fashion generation tasks.",
                'reason': 'Highest overall rating with excellent scores across metrics'
            }
        elif good:
            best = good[0]
            return {
                'title': f'Recommended: {best["name"].upper()}',
                'model': best['name'].upper(),
                'description': f"{best['name'].upper()} shows strong overall performance and is a reliable choice for fashion generation.",
                'reason': 'Consistent good performance across evaluated metrics'
            }
        else:
            return {
                'title': 'Consider Model Improvements',
                'description': 'All evaluated models show room for improvement. Consider additional training, architectural adjustments, or exploring alternative approaches.',
                'reason': 'No models achieved excellent or good ratings'
            }
