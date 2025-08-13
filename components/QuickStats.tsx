'use client'

import { Users, FileText, School, Clock } from 'lucide-react'
import { demoStats } from '@/data/demoData'

export default function QuickStats() {
  const stats = [
    {
      title: 'Students Viewed',
      value: '47',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      description: 'This month'
    },
    {
      title: 'Work Samples',
      value: demoStats.totalWorkSamples.toLocaleString(),
      change: '+8%',
      changeType: 'positive',
      icon: FileText,
      description: 'Total accessed'
    },
    {
      title: 'Schools Connected',
      value: demoStats.connectedSchools.toString(),
      change: '+2',
      changeType: 'positive',
      icon: School,
      description: 'Districts'
    },
    {
      title: 'Last Access',
      value: '2 hours',
      change: '',
      changeType: 'neutral',
      icon: Clock,
      description: 'Ago'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
            <div className={`p-3 rounded-lg ${
              stat.icon === Users ? 'bg-blue-100' :
              stat.icon === FileText ? 'bg-green-100' :
              stat.icon === School ? 'bg-purple-100' :
              'bg-orange-100'
            }`}>
              <stat.icon className={`h-6 w-6 ${
                stat.icon === Users ? 'text-blue-600' :
                stat.icon === FileText ? 'text-green-600' :
                stat.icon === School ? 'text-purple-600' :
                'text-orange-600'
              }`} />
            </div>
          </div>
          {stat.change && (
            <div className="mt-2">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' :
                stat.changeType === 'negative' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-500 ml-1">from last month</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
