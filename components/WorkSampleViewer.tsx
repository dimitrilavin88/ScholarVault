'use client'

import { useState } from 'react'
import { X, Download, FileText, Calendar, School, User, Eye, EyeOff } from 'lucide-react'

interface WorkSample {
  id: string
  title: string
  subject: string
  gradeLevel: string
  uploadDate: string
  fileType: string
  fileSize: string
  fileUrl: string
  description: string
}

interface WorkSampleViewerProps {
  sample: WorkSample
  onClose: () => void
}

export default function WorkSampleViewer({ sample, onClose }: WorkSampleViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  const handleDownload = async () => {
    setIsDownloading(true)
    
    // Simulate download delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // In a real app, this would trigger the actual file download
    const link = document.createElement('a')
    link.href = sample.fileUrl
    link.download = `${sample.title}.${sample.fileType.toLowerCase()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setIsDownloading(false)
  }

  const handleClose = () => {
    onClose()
  }

  // Mock preview content based on file type
  const renderPreview = () => {
    if (sample.fileType === 'PDF') {
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Preview</h3>
          <p className="text-gray-600 mb-4">This is a preview of the PDF document</p>
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto text-left">
            <h4 className="font-semibold text-gray-900 mb-2">Sample Content</h4>
            <p className="text-sm text-gray-600 mb-2">
              This document contains {sample.description.toLowerCase()}. 
              The full content would be displayed here in a real PDF viewer.
            </p>
            <p className="text-sm text-gray-600">
              File size: {sample.fileSize} | Uploaded: {new Date(sample.uploadDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      )
    } else if (sample.fileType === 'DOCX') {
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Document Preview</h3>
          <p className="text-gray-600 mb-4">This is a preview of the Word document</p>
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto text-left">
            <h4 className="font-semibold text-gray-900 mb-2">Sample Content</h4>
            <p className="text-sm text-gray-600 mb-2">
              This document contains {sample.description.toLowerCase()}. 
              The full content would be displayed here in a real document viewer.
            </p>
            <p className="text-sm text-gray-600">
              File size: {sample.fileSize} | Uploaded: {new Date(sample.uploadDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      )
    } else {
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">File Preview</h3>
          <p className="text-gray-600 mb-4">Preview not available for this file type</p>
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto text-left">
            <h4 className="font-semibold text-gray-900 mb-2">File Information</h4>
            <p className="text-sm text-gray-600 mb-2">
              This file contains {sample.description.toLowerCase()}.
            </p>
            <p className="text-sm text-gray-600">
              File size: {sample.fileSize} | Uploaded: {new Date(sample.uploadDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-secondary-200">
          <div>
            <h2 className="text-xl font-bold text-secondary-900">{sample.title}</h2>
            <div className="flex items-center space-x-4 mt-1 text-sm text-secondary-500">
              <span className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>{sample.subject}</span>
              </span>
              <span className="flex items-center space-x-1">
                <School className="h-4 w-4" />
                <span>{sample.gradeLevel}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(sample.uploadDate).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary flex items-center space-x-2"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
            </button>
            <button
              onClick={handleClose}
              className="text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">Description</h3>
            <p className="text-secondary-600">{sample.description}</p>
          </div>

          {/* File Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-secondary-50 rounded-lg p-4">
              <h4 className="font-medium text-secondary-900 mb-1">File Type</h4>
              <p className="text-secondary-600">{sample.fileType}</p>
            </div>
            <div className="bg-secondary-50 rounded-lg p-4">
              <h4 className="font-medium text-secondary-900 mb-1">File Size</h4>
              <p className="text-secondary-600">{sample.fileSize}</p>
            </div>
            <div className="bg-secondary-50 rounded-lg p-4">
              <h4 className="font-medium text-secondary-900 mb-1">Upload Date</h4>
              <p className="text-secondary-600">{new Date(sample.uploadDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Preview</h3>
              {renderPreview()}
            </div>
          )}

          {/* Access Log */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Access Information</h4>
            <p className="text-sm text-blue-700">
              This access has been logged for compliance purposes. Your viewing of this student work sample 
              is being tracked according to FERPA requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
