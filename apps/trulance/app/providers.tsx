'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30000 } } }))
  return (
    <QueryClientProvider client={qc}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#0a1628', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
          success: { iconTheme: { primary: '#14b8a6', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  )
}
