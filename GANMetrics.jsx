import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Image as ImageIcon, Layers, Download, Play, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GANMetrics = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(() => {
    const saved = sessionStorage.getItem('ganMetrics');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sampleImages, setSampleImages] = useState(() => {
    const saved = sessionStorage.getItem('ganSampleImages');
    return saved ? JSON.parse(saved) : [];
  });
  const [numSamples, setNumSamples] = useState(20);

  // Persist metrics to sessionStorage whenever they change
  useEffect(() => {
    if (metrics) {
      sessionStorage.setItem('ganMetrics', JSON.stringify(metrics));
    }
  }, [metrics]);

  useEffect(() => {
    if (sampleImages.length > 0) {
      sessionStorage.setItem('ganSampleImages', JSON.stringify(sampleImages));
    }
  }, [sampleImages]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`http://localhost:8000/gan/evaluate?num_samples=${numSamples}`);
      
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
      model: 'GAN (StyleGAN2)',
      timestamp: new Date().toISOString(),
      metrics: metrics
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gan_metrics_report.json';
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GAN Metrics</h1>
              <p className="text-gray-600 dark:text-gray-400">Evaluating StyleGAN2 generation quality</p>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GAN Metrics</h1>
              <p className="text-gray-600 dark:text-gray-400">Evaluating StyleGAN2 generation quality</p>
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">About GAN Evaluation</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This evaluation tests the GAN model's ability to generate high-quality fashion images from text descriptions.
              The StyleGAN2 architecture generates images at epoch 100 and measures quality metrics.
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
            
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-500">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
                <h3 className="text-purple-900 dark:text-purple-300 font-medium">StyleGAN2 Features</h3>
              </div>
              <p className="text-purple-700 dark:text-purple-400 text-sm">
                Our GAN uses StyleGAN2 architecture with text conditioning, trained on 44k fashion items. 
                Currently at epoch 100 for optimal accuracy and quality.
              </p>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GAN Evaluation Results</h1>
              <p className="text-gray-600 dark:text-gray-400">StyleGAN2 Performance Metrics</p>
            </div>
          </div>
          
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
          >
            <Download size={18} />
            Download Report
          </button>
        </div>

        {/* Main Metrics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* MSE Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">MSE</h3>
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingUp className="text-red-600 dark:text-red-400" size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metrics.metrics.mse.mean.toFixed(4)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-500">mean</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Min:</span>
                  <span className="font-medium">{metrics.metrics.mse.min.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Max:</span>
                  <span className="font-medium">{metrics.metrics.mse.max.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Std Dev:</span>
                  <span className="font-medium">{metrics.metrics.mse.std.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PSNR Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">PSNR</h3>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metrics.metrics.psnr.mean.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-500">dB</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Min:</span>
                  <span className="font-medium">{metrics.metrics.psnr.min.toFixed(2)} dB</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Max:</span>
                  <span className="font-medium">{metrics.metrics.psnr.max.toFixed(2)} dB</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Std Dev:</span>
                  <span className="font-medium">{metrics.metrics.psnr.std.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SSIM Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SSIM</h3>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Layers className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metrics.metrics.ssim.mean.toFixed(3)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-500">score</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Min:</span>
                  <span className="font-medium">{metrics.metrics.ssim.min.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Max:</span>
                  <span className="font-medium">{metrics.metrics.ssim.max.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Std Dev:</span>
                  <span className="font-medium">{metrics.metrics.ssim.std.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Model Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Model Information</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Architecture</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {metrics.model_info.model_type || 'StyleGAN2'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Latent Dimension</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {metrics.model_info.latent_dim || 128}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Training Epochs</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {metrics.model_info.training_epochs || 50}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Samples Evaluated</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {metrics.num_samples}
              </p>
            </div>
          </div>
        </div>

        {/* Sample Images */}
        {sampleImages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sample Generations</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <ImageIcon size={16} />
                <span>{sampleImages.length} samples</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sampleImages.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src={img}
                    alt={`Sample ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reevaluate Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 rounded-lg transition-colors font-medium text-white"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Re-evaluating...
              </>
            ) : (
              <>
                <Play size={20} />
                Re-evaluate Model
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GANMetrics;
