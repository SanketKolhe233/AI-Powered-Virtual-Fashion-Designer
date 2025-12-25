import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Eye, Lock, Trash2, Download, AlertTriangle, CheckCircle } from 'lucide-react'

function GDPR() {
  const handleDataDownload = () => {
    // In a real app, this would trigger data export
    alert('Data export feature coming soon!')
  }

  const handleDataDeletion = () => {
    // In a real app, this would trigger account deletion process
    if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      alert('Data deletion request submitted. You will receive confirmation within 24 hours.')
    }
  }

  const dataTypes = [
    {
      category: 'Generated Images',
      description: 'Fashion items generated using our AI models',
      retention: '30 days',
      purpose: 'Service delivery and improvement',
      icon: Eye
    },
    {
      category: 'Usage Analytics',
      description: 'How you interact with our models and features',
      retention: '12 months',
      purpose: 'Performance optimization',
      icon: CheckCircle
    },
    {
      category: 'Account Data',
      description: 'Basic account information and preferences',
      retention: 'Until account deletion',
      purpose: 'Account management',
      icon: Lock
    },
    {
      category: 'Technical Logs',
      description: 'Error logs and performance metrics',
      retention: '90 days',
      purpose: 'Security and debugging',
      icon: Shield
    }
  ]

  const rights = [
    {
      title: 'Right to Access',
      description: 'You can request a copy of all personal data we hold about you.',
      action: 'Download My Data',
      onClick: handleDataDownload,
      icon: Download
    },
    {
      title: 'Right to Rectification',
      description: 'You can request corrections to inaccurate personal data.',
      action: 'Contact Support',
      onClick: () => window.location.href = 'mailto:privacy@fashionai.com',
      icon: CheckCircle
    },
    {
      title: 'Right to Erasure',
      description: 'You can request deletion of your personal data.',
      action: 'Delete My Data',
      onClick: handleDataDeletion,
      icon: Trash2,
      dangerous: true
    },
    {
      title: 'Right to Portability',
      description: 'You can receive your data in a machine-readable format.',
      action: 'Export Data',
      onClick: handleDataDownload,
      icon: Download
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-primary-500" />
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-white">
            Privacy & Data Protection
          </h1>
        </div>
        <p className="text-lg text-secondary-600 dark:text-gray-300 max-w-2xl mx-auto">
          Your privacy matters to us. This page explains how we handle your data in compliance with GDPR regulations.
        </p>
      </motion.div>

      {/* Privacy Notice */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
      >
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-blue-500 dark:text-blue-400 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">Important Notice</h2>
            <p className="text-blue-800 dark:text-blue-300">
              Fashion AI is designed with privacy in mind. We only collect data necessary to provide our AI-powered 
              fashion generation services. All generated images are processed locally when possible, and we do not 
              use your creations to train our models without explicit consent.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Data We Collect */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Data We Collect</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dataTypes.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div key={index} className="card">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <IconComponent className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">{item.category}</h3>
                    <p className="text-sm text-secondary-600 dark:text-gray-400 mb-3">{item.description}</p>
                    <div className="space-y-1 text-xs text-secondary-500 dark:text-gray-500">
                      <div><strong>Retention:</strong> {item.retention}</div>
                      <div><strong>Purpose:</strong> {item.purpose}</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.section>

      {/* Your Rights */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Your Rights Under GDPR</h2>
        
        <div className="space-y-4">
          {rights.map((right, index) => {
            const IconComponent = right.icon
            return (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-secondary-100 dark:bg-gray-700 rounded-lg">
                      <IconComponent className="w-5 h-5 text-secondary-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">{right.title}</h3>
                      <p className="text-sm text-secondary-600 dark:text-gray-400">{right.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={right.onClick}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      right.dangerous
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                        : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50'
                    }`}
                  >
                    {right.action}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </motion.section>

      {/* Data Processing Lawful Basis */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lawful Basis for Processing</h2>
        
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Legitimate Interest</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Service improvement and optimization</li>
                <li>• Security and fraud prevention</li>
                <li>• Analytics and performance monitoring</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contractual Necessity</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Providing AI generation services</li>
                <li>• Account management</li>
                <li>• Customer support</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Contact Information */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Our Data Protection Officer</h2>
        
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Privacy Inquiries</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div><strong>Email:</strong> privacy@fashionai.com</div>
                <div><strong>Response Time:</strong> Within 72 hours</div>
                <div><strong>Available:</strong> Monday - Friday, 9 AM - 6 PM CET</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Data Subject Requests</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div><strong>Email:</strong> data-requests@fashionai.com</div>
                <div><strong>Processing Time:</strong> Up to 30 days</div>
                <div><strong>Required:</strong> Identity verification</div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Last Updated */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center text-sm text-gray-500 dark:text-gray-400 pt-8 border-t border-gray-200 dark:border-gray-700"
      >
        <p>Last updated: October 27, 2025</p>
        <p>This privacy notice is compliant with GDPR (EU) 2016/679</p>
      </motion.div>
    </div>
  )
}

export default GDPR