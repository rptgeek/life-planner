'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import type { FranklinPlannerData } from './FranklinPlannerPDF'

export default function PDFDownloadButton({ data }: { data: FranklinPlannerData }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    if (isGenerating) return
    setIsGenerating(true)
    try {
      const [{ pdf }, { FranklinPlannerPDF }, React] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./FranklinPlannerPDF'),
        import('react'),
      ])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(
        React.createElement(FranklinPlannerPDF, { data }) as any
      ).toBlob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-60"
        title="Download daily plan as PDF"
      >
        {isGenerating
          ? <Loader2 size={14} className="animate-spin" />
          : <Download size={14} />
        }
        {isGenerating ? 'Generating…' : 'Download PDF'}
      </button>
  )
}
