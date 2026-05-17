import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { BookOpen, Sparkles, FileText, Compass, ChevronRight, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
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

const CATEGORY_ICONS = {
  features: Sparkles,
  specs: FileText,
  guides: Compass,
}

const CATEGORY_COLORS = {
  features: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  specs: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  guides: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
}

const CATEGORY_TEXT_COLORS = {
  features: 'text-amber-400',
  specs: 'text-blue-400',
  guides: 'text-emerald-400',
}

export function DocsView({ activeTab, onTabChange }: DocsViewProps) {
  const [docs, setDocs] = useState<DocMetadata[]>([])
  const [selectedDoc, setSelectedDoc] = useState<DocMetadata | null>(null)
  const [docContent, setDocContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<'all' | 'features' | 'specs' | 'guides'>('all')
  const [searchQuery, setSearchQuery] = useState('')

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
    guides: docs.filter(doc => doc.category === 'guides'),
  }

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const CategoryBadge = ({ category }: { category: string }) => {
    const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]} border`}>
        <Icon className="w-3 h-3" />
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    )
  }

  return (
    <div className="docs-container">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-dream-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative p-6 border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative">
              <ThothLogo className="w-14 h-14" />
              <div className="absolute inset-0 bg-dream-accent/20 rounded-full blur-xl animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-serif italic dream-text-gradient">Documentation</h1>
              <p className="text-sm text-white/40 mt-1">Explore Thoth's features and guides</p>
            </div>
          </motion.div>
          
          {/* Search */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-dream-accent/50 focus:bg-white/10 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        </div>
      </header>

      <div className="docs-layout relative">
        {/* Sidebar */}
        <aside className="docs-sidebar">
          {/* Category tabs */}
          <div className="category-tabs">
            {[
              { id: 'all', label: 'All Docs', icon: BookOpen },
              { id: 'guides', label: 'Guides', icon: Compass },
              { id: 'features', label: 'Features', icon: Sparkles },
              { id: 'specs', label: 'Specs', icon: FileText },
            ].map((cat, i) => {
              const Icon = cat.icon
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={activeCategory === cat.id ? 'active' : ''}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                  {cat.id !== 'all' && (
                    <span className="ml-auto text-xs text-white/30">
                      {groupedDocs[cat.id as keyof typeof groupedDocs]?.length || 0}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Doc list */}
          <div className="docs-list">
            {loading ? (
              <div className="loading">
                <div className="animate-spin w-6 h-6 border-2 border-dream-accent border-t-transparent rounded-full" />
                <span>Loading docs...</span>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No docs found</p>
              </div>
            ) : (
              <>
                {activeCategory === 'all' ? (
                  <>
                    {['guides', 'features', 'specs'].map(cat => {
                      const items = groupedDocs[cat]
                      if (!items || items.length === 0) return null
                      const Icon = CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]
                      return (
                        <motion.div 
                          key={cat} 
                          className="docs-group"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <h3 className={CATEGORY_TEXT_COLORS[cat as keyof typeof CATEGORY_TEXT_COLORS]}>
                            <Icon className="w-3.5 h-3.5 inline mr-2" />
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </h3>
                          {items.map((doc, i) => (
                            <motion.button
                              key={doc.id}
                              onClick={() => setSelectedDoc(doc)}
                              className={selectedDoc?.id === doc.id ? 'active' : ''}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              whileHover={{ x: 4 }}
                            >
                              <span className="truncate">{doc.title}</span>
                              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                          ))}
                        </motion.div>
                      )
                    })}
                  </>
                ) : (
                  filteredDocs.map((doc, i) => (
                    <motion.button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={selectedDoc?.id === doc.id ? 'active' : ''}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ x: 4 }}
                    >
                      <span className="truncate">{doc.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  ))
                )}
              </>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="docs-main">
          <AnimatePresence mode="wait">
            {selectedDoc ? (
              <motion.div
                key={selectedDoc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="doc-content"
              >
                {/* Doc header card */}
                <div className="doc-header-card mb-8">
                  <CategoryBadge category={selectedDoc.category} />
                  <h2 className="text-4xl font-serif italic mt-4 mb-3">{selectedDoc.title}</h2>
                  <p className="text-lg text-white/50">{selectedDoc.description}</p>
                </div>

                {/* Markdown content */}
                <div className="prose-custom">
                  <ReactMarkdown>{docContent}</ReactMarkdown>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="doc-placeholder"
              >
                <div className="placeholder-icon">
                  <BookOpen className="w-16 h-16" />
                </div>
                <h3>Select a document to read</h3>
                <p>Choose from the sidebar to explore Thoth documentation</p>
                
                {/* Quick links */}
                <div className="quick-links">
                  {docs.slice(0, 3).map((doc, i) => (
                    <motion.button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className="quick-link-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <CategoryBadge category={doc.category} />
                      <h4>{doc.title}</h4>
                      <p>{doc.description}</p>
                      <ChevronRight className="w-5 h-5 mt-auto" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
