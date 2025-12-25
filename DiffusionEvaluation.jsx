import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Sparkles, Download, Play, Loader2, Activity, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DiffusionEvaluation = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(() => {
    const saved = sessionStorage.getItem('diffusionMetrics');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sampleImages, setSampleImages] = useState(() => {
    const saved = sessionStorage.getItem('diffusionSampleImages');
    return saved ? JSON.parse(saved) : [];
  });
  const [numSamples, setNumSamples] = useState(20);

  // Persist metrics to sessionStorage whenever they change
  useEffect(() => {
    if (metrics) {
      sessionStorage.setItem('diffusionMetrics', JSON.stringify(metrics));
    }
  }, [metrics]);

  useEffect(() => {
    if (sampleImages.length > 0) {
      sessionStorage.setItem('diffusionSampleImages', JSON.stringify(sampleImages));
    }
  }, [sampleImages]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:8000/diffusion/evaluate', null, {
        params: { num_samples: numSamples }
      });
      
      setMetrics(response.data.metrics);
      setSampleImages(response.data.sample_images || []);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Failed to fetch metrics. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!metrics) return;
    
    const report = {
      model: 'Diffusion',
      timestamp: new Date().toISOString(),
      metrics: metrics
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diffusion_metrics_report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Diffusion Metrics</h1>
              <p className="text-gray-600 dark:text-gray-400">Evaluating diffusion-based image generation quality</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="animate-spin h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300">Calculating metrics...</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Running diffusion timesteps</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Diffusion Metrics</h1>
              <p className="text-gray-600 dark:text-gray-400">Evaluating diffusion-based image generation quality</p>
            </div>
          </div>

          {/* Evaluation Control */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Test Samples
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={numSamples}
                  onChange={(e) => setNumSamples(parseInt(e.target.value) || 20)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  More samples = more accurate metrics but slower evaluation
                </p>
              </div>
              
              <button
                onClick={fetchMetrics}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Start Evaluation
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500 rounded-lg p-6 text-center mb-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchMetrics}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">About Diffusion Evaluation</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This evaluation tests the diffusion model's ability to generate high-quality fashion images through progressive denoising.
              The model uses 1000 timesteps and classifier-free guidance for superior results.
            </p>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-green-600 dark:text-green-400 font-medium mb-2 flex items-center gap-2">
                  <TrendingUp size={16} />
                  FID Score
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Fréchet Inception Distance measures how close generated images are to real ones. Lower is better (0 = identical).
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-purple-600 dark:text-purple-400 font-medium mb-2 flex items-center gap-2">
                  <Sparkles size={16} />
                  Inception Score
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Measures quality and diversity of generated images. Higher is better (typically 5-15 for good models).
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center gap-2">
                  <Activity size={16} />
                  CLIP Score
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Measures text-image semantic alignment. Higher is better (0.2-0.4 typical range).
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-indigo-600 dark:text-indigo-400 font-medium mb-2 flex items-center gap-2">
                  <BarChart3 size={16} />
                  BLEU Score
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Text-image correspondence quality. Higher is better (0.6-0.8 indicates strong alignment).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Diffusion Metrics</h1>
              <p className="text-gray-600 dark:text-gray-400">Diffusion-based image generation quality evaluation</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setMetrics(null)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-colors text-gray-700 dark:text-gray-300"
            >
              <Play size={20} />
              Re-evaluate
            </button>
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
            >
              <Download size={20} />
              Download Report
            </button>
          </div>
        </div>

        {/* Main Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* FID Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">FID Score</h3>
              <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {metrics?.fid_score?.toFixed(2) || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              Lower is better
            </div>
          </div>

          {/* Inception Score Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Inception Score</h3>
              <Sparkles className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {metrics?.inception_score?.toFixed(2) || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              Higher is better
            </div>
          </div>

          {/* CLIP Score Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">CLIP Score</h3>
              <Activity className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {metrics?.clip_score?.toFixed(3) || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              Text-image alignment
            </div>
          </div>

          {/* BLEU Score Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">BLEU Score</h3>
              <BarChart3 className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              {metrics?.bleu_score?.toFixed(3) || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              Correspondence quality
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Additional Quality Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Precision</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{(metrics.precision * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-500 mt-1">Sample quality</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Recall</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{(metrics.recall * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-500 mt-1">Distribution coverage</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">LPIPS Distance</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.lpips_distance.toFixed(3)}</div>
              <div className="text-xs text-gray-500 mt-1">Perceptual similarity</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Diversity Score</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.diversity_score.toFixed(3)}</div>
              <div className="text-xs text-gray-500 mt-1">Sample variety</div>
            </div>
          </div>
        </div>

        {/* Model Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Model Configuration</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Architecture</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">U-Net DDPM</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Timesteps</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1000</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Training Epochs</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">100</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Guidance Scale</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">7.5</div>
            </div>
          </div>
        </div>

        {/* Understanding the Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Understanding the Metrics</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-green-600 dark:text-green-400 font-medium mb-2">FID (Fréchet Inception Distance):</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Measures how close generated images are to real ones in feature space. Lower is better (15-30 = excellent).
              </p>
            </div>
            
            <div>
              <h3 className="text-purple-600 dark:text-purple-400 font-medium mb-2">Inception Score:</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Measures quality and diversity of generated images. Higher is better (7-10 = very good for fashion).
              </p>
            </div>
            
            <div>
              <h3 className="text-blue-600 dark:text-blue-400 font-medium mb-2">CLIP Score:</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Measures semantic alignment between text and images. Higher is better (0.25-0.35 = good alignment).
              </p>
            </div>

            <div>
              <h3 className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">BLEU Score:</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Measures text-image correspondence quality. Higher is better (0.65-0.80 = strong correspondence).
              </p>
            </div>

            <div>
              <h3 className="text-orange-600 dark:text-orange-400 font-medium mb-2">Diversity Score:</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Measures variety in generated samples. Higher is better (0.85-0.95 = excellent diversity).
              </p>
            </div>
          </div>
        </div>

        {/* Sample Images */}
        {sampleImages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Sample Generations</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sampleImages.slice(0, 8).map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <img 
                    src={img} 
                    alt={`Generated Sample ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffusionEvaluation;
