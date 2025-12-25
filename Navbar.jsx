import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Menu, X, Home, BarChart3, GitCompare, Shield, Moon, Sun } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Evaluation', href: '/evaluation', icon: BarChart3 },
    { name: 'Autoencoder Metrics', href: '/autoencoder-evaluation', icon: BarChart3 },
    { name: 'Diffusion Metrics', href: '/diffusion-evaluation', icon: BarChart3 },
    { name: 'Transformer Metrics', href: '/transformer-metrics', icon: BarChart3 },
    { name: 'GAN Metrics', href: '/gan-metrics', icon: BarChart3 },
    { name: 'Comparison', href: '/comparison', icon: GitCompare },
    { name: 'Privacy', href: '/gdpr', icon: Shield },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Fashion AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-end">
            {navigation.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    isActive(item.href)
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs lg:text-sm">{item.name}</span>
                </Link>
              )
            })}
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="ml-2 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}
    </nav>
  )
}

export default Navbar