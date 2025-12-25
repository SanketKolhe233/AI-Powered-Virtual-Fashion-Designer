import React from 'react'
import { motion } from 'framer-motion'

function MetricCard({ title, value, subtitle, icon: Icon, color = 'blue', trend = null }) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      value: 'text-blue-900 dark:text-blue-300',
      trend: {
        positive: 'text-green-600 dark:text-green-400',
        negative: 'text-red-600 dark:text-red-400',
        neutral: 'text-secondary-600 dark:text-gray-400'
      }
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      value: 'text-green-900 dark:text-green-300',
      trend: {
        positive: 'text-green-600 dark:text-green-400',
        negative: 'text-red-600 dark:text-red-400',
        neutral: 'text-secondary-600 dark:text-gray-400'
      }
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      value: 'text-purple-900 dark:text-purple-300',
      trend: {
        positive: 'text-green-600 dark:text-green-400',
        negative: 'text-red-600 dark:text-red-400',
        neutral: 'text-secondary-600 dark:text-gray-400'
      }
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'text-orange-600 dark:text-orange-400',
      value: 'text-orange-900 dark:text-orange-300',
      trend: {
        positive: 'text-green-600 dark:text-green-400',
        negative: 'text-red-600 dark:text-red-400',
        neutral: 'text-secondary-600 dark:text-gray-400'
      }
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      value: 'text-red-900 dark:text-red-300',
      trend: {
        positive: 'text-green-600 dark:text-green-400',
        negative: 'text-red-600 dark:text-red-400',
        neutral: 'text-secondary-600 dark:text-gray-400'
      }
    }
  }

  const colors = colorClasses[color] || colorClasses.blue

  const getTrendIcon = (trend) => {
    if (!trend) return null
    
    if (trend.direction === 'up') {
      return <span className="text-green-600 dark:text-green-400">↗</span>
    } else if (trend.direction === 'down') {
      return <span className="text-red-600 dark:text-red-400">↘</span>
    }
    return <span className="text-secondary-600 dark:text-gray-400">→</span>
  }

  const getTrendColor = (trend) => {
    if (!trend) return colors.trend.neutral
    
    if (trend.direction === 'up' && trend.isGood) return colors.trend.positive
    if (trend.direction === 'down' && !trend.isGood) return colors.trend.positive
    if (trend.direction === 'up' && !trend.isGood) return colors.trend.negative
    if (trend.direction === 'down' && trend.isGood) return colors.trend.negative
    
    return colors.trend.neutral
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
            )}
            <h3 className="text-sm font-medium text-secondary-600 dark:text-gray-400">{title}</h3>
          </div>
          
          <div className="flex items-end gap-2">
            <div className={`text-2xl font-bold ${colors.value}`}>
              {value}
            </div>
            
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${getTrendColor(trend)}`}>
                {getTrendIcon(trend)}
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          
          {subtitle && (
            <p className="text-sm text-secondary-500 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MetricCard