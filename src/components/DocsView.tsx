import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { ThothLogo } from './Logo'
import { TabBar } from './TabBar'

interface DocMetadata {
  id: string
  title: string
  description: string
  category: 'features' | 'specs' | 'guides'
}

interface DocsViewProps {
  activeTab: string
  onTabChange: (tab: 'record' | 'history' | 'global' | 'settings' | 'docs') => void
}

export function DocsView({ activeTab, onTabChange }: DocsViewProps) {
  const [docs, setDocs] = useState<DocMetadata[]>([])
  const [selectedDoc, setSelectedDoc] = useState<DocMetadata | null>(null)
  const [docContent, setDocContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<'all' | 'features' | 'specs' | 'guides'>('all')

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => {
        setDocs(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load docs:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (selectedDoc) {
      fetch(`/api/docs/${selectedDoc.id}`)
        .then(res => res.text())
        .then(setDocContent)
        .catch(err => console.error('Failed to load doc:', err))
    }
  }, [selectedDoc])

  const groupedDocs: Record<string, DocMetadata[]> = {
    features: docs.filter(doc => doc.category === 'features'),
    specs: docs.filter(doc => doc.category === 'specs'),
    guides: docs.filter(doc => doc.category === 'guides')
  }

  return (
    <div className="docs-container">
      <header className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <ThothLogo />
          <h1 className="text-2xl font-bold">Documentation</h1>
        </div>
      </header>

      <div className="docs-layout">
        <aside className="docs-sidebar">
          <div className="category-tabs">
            <button 
              onClick={() => setActiveCategory('all')}
              className={activeCategory === 'all' ? 'active' : ''}
            >
              All
            </button>
            <button 
              onClick={() => setActiveCategory('guides')}
              className={activeCategory === 'guides' ? 'active' : ''}
            >
              Guides
            </button>
            <button 
              onClick={() => setActiveCategory('features')}
              className={activeCategory === 'features' ? 'active' : ''}
            >
              Features
            </button>
            <button 
              onClick={() => setActiveCategory('specs')}
              className={activeCategory === 'specs' ? 'active' : ''}
            >
              Specs
            </button>
          </div>

          <div className="docs-list">
            {loading ? (
              <div className="loading text-zinc-500">Loading docs...</div>
            ) : (
              <>
                {activeCategory === 'all' ? (
                  <>
                    {groupedDocs.guides.length > 0 && (
                      <div className="docs-group">
                        <h3>Guides</h3>
                        {groupedDocs.guides.map(doc => (
                          <button
                            key={doc.id}
                            onClick={() => setSelectedDoc(doc)}
                            className={selectedDoc?.id === doc.id ? 'active' : ''}
                          >
                            {doc.title}
                          </button>
                        ))}
                      </div>
                    )}
                    {groupedDocs.features.length > 0 && (
                      <div className="docs-group">
                        <h3>Features</h3>
                        {groupedDocs.features.map(doc => (
                          <button
                            key={doc.id}
                            onClick={() => setSelectedDoc(doc)}
                            className={selectedDoc?.id === doc.id ? 'active' : ''}
                          >
                            {doc.title}
                          </button>
                        ))}
                      </div>
                    )}
                    {groupedDocs.specs.length > 0 && (
                      <div className="docs-group">
                        <h3>Specs</h3>
                        {groupedDocs.specs.map(doc => (
                          <button
                            key={doc.id}
                            onClick={() => setSelectedDoc(doc)}
                            className={selectedDoc?.id === doc.id ? 'active' : ''}
                          >
                            {doc.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  docs.filter(doc => doc.category === activeCategory).map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={selectedDoc?.id === doc.id ? 'active' : ''}
                    >
                      {doc.title}
                    </button>
                  ))
                )}
              </>
            )}
          </div>
        </aside>

        <main className="docs-main">
          {selectedDoc ? (
            <div className="doc-content">
              <h2>{selectedDoc.title}</h2>
              <p className="doc-description">{selectedDoc.description}</p>
              <ReactMarkdown>{docContent}</ReactMarkdown>
            </div>
          ) : (
            <div className="doc-placeholder">
              <h3>Select a document to read</h3>
              <p>Choose from the sidebar to explore Thoth docs</p>
            </div>
          )}
        </main>
      </div>

      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
