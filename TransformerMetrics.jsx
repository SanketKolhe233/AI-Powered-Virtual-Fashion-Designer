import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Image as ImageIcon, Layers, Download, Play, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TransformerMetrics = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(() => {
    const saved = sessionStorage.getItem('transformerMetrics');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sampleImages, setSampleImages] = useState(() => {
    const saved = sessionStorage.getItem('transformerSampleImages');
    return saved ? JSON.parse(saved) : [];
  });
  const [numSamples, setNumSamples] = useState(20);

  // Persist metrics to sessionStorage whenever they change
  useEffect(() => {
    if (metrics) {
      sessionStorage.setItem('transformerMetrics', JSON.stringify(metrics));
    }
  }, [metrics]);

  useEffect(() => {
    if (sampleImages.length > 0) {
      sessionStorage.setItem('transformerSampleImages', JSON.stringify(sampleImages));
    }
  }, [sampleImages]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:8000/transformer/evaluate', {
        num_samples: numSamples
      });
      
      setMetrics(response.data);
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
      model: 'Transformer',
      timestamp: new Date().toISOString(),
      metrics: metrics
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transformer_metrics_report.json';
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transformer Metrics</h1>
              <p className="text-gray-600 dark:text-gray-400">Evaluating text-to-image generation quality</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="animate-spin h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300">Calculating metrics...</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">This may take a few moments</p>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transformer Metrics</h1>
              <p className="text-gray-600 dark:text-gray-400">Evaluating text-to-image generation quality</p>
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">About Transformer Evaluation</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This evaluation tests the transformer model's ability to generate fashion images from text descriptions.
              The model generates images from test set descriptions and compares them against original images.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-red-600 dark:text-red-400 font-medium mb-2 flex items-center gap-2">
                  <TrendingUp size={16} />
                  MSE (Mean Squared Error)
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Measures average pixel-wise squared difference. Lower values indicate better reconstruction quality (0 = perfect).
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-green-600 dark:text-green-400 font-medium mb-2 flex items-center gap-2">
                  <TrendingUp size={16} />
                  PSNR (Peak Signal-to-Noise Ratio)
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Measures reconstruction quality in decibels. Higher is better (typically 20-40 dB for good quality).
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center gap-2">
                  <Layers size={16} />
                  SSIM (Structural Similarity)
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Measures perceptual similarity between images. Closer to 1.0 means better structural preservation.
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transformer Metrics</h1>
              <p className="text-gray-600 dark:text-gray-400">Text-to-image generation quality evaluation</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* MSE Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Mean Squared Error (MSE)</h3>
              <TrendingUp className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {metrics?.mse?.toFixed(6) || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              σ = {metrics?.mse_std?.toFixed(6) || 'N/A'}
            </div>
          </div>

          {/* PSNR Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Peak Signal-to-Noise Ratio (PSNR)</h3>
              <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {metrics?.psnr?.toFixed(2) || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              {metrics?.psnr_min?.toFixed(2)} - {metrics?.psnr_max?.toFixed(2)} dB
            </div>
          </div>

          {/* SSIM Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Structural Similarity (SSIM)</h3>
              <Layers className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {metrics?.ssim?.toFixed(4) || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              σ = {metrics?.ssim_std?.toFixed(4) || 'N/A'}
            </div>
          </div>
        </div>

        {/* Statistics Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Detailed Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* MSE Stats */}
            <div>
              <h3 className="text-red-600 dark:text-red-400 font-medium mb-4">MSE Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mean:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{metrics?.mse?.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Std Dev:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{metrics?.mse_std?.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Min:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{metrics?.mse_min?.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{metrics?.mse_max?.toFixed(6)}</span>
                </div>
              </div>
            </div>

            {/* PSNR Stats */}
            <div>
              <h3 className="text-green-600 dark:text-green-400 font-medium mb-4">PSNR Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mean:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{metrics?.psnr?.toFixed(2)} dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Std Dev:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{metrics?.psnr_std?.toFixed(2)} dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Min:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{metrics?.psnr_min?.toFixed(2)} dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{metrics?.psnr_max?.toFixed(2)} dB</span>
                </div>
              </div>
            </div>

            {/* SSIM Stats */}
            <div>
              <h3 className="text-blue-600 dark:text-blue-400 font-medium mb-4">SSIM Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mean:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{metrics?.ssim?.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Std Dev:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{metrics?.ssim_std?.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Min:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{metrics?.ssim_min?.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{metrics?.ssim_max?.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Model Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Model Configuration</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Text Dimension</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">512</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Image Size</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">64×64</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Training Epochs</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">100</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Model Size</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">303.33 MB</div>
            </div>
          </div>
        </div>

        {/* Understanding the Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Understanding the Metrics</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-red-600 dark:text-red-400 font-medium mb-2">MSE (Mean Squared Error):</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Measures average pixel-wise squared difference. Lower is better (0 = perfect reconstruction).
              </p>
            </div>
            
            <div>
              <h3 className="text-green-600 dark:text-green-400 font-medium mb-2">PSNR (Peak Signal-to-Noise Ratio):</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Measures reconstruction quality in dB. Higher is better (typically 20-40 dB for good quality).
              </p>
            </div>
            
            <div>
              <h3 className="text-blue-600 dark:text-blue-400 font-medium mb-2">SSIM (Structural Similarity Index):</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Measures perceptual similarity between images. Closer to 1 is better (1 = identical structure).
              </p>
            </div>
          </div>
        </div>

        {/* Sample Images */}
        {sampleImages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm mt-8">
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

export default TransformerMetrics;
