'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import CharacterCount from '@tiptap/extension-character-count'
import { InlineMedia } from './extensions/inline-media'
import type { InlineMediaKind, InlineMediaLayout } from './extensions/inline-media'
import './rich-editor.css'

export interface RichEditorHandle {
  getHTML: () => string
  setHTML: (html: string) => void
  insertMedia: (attrs: {
    src: string
    kind: InlineMediaKind
    layout?: InlineMediaLayout
    caption?: string
    alt?: string
  }) => void
  focus: () => void
}

interface RichEditorProps {
  initialHTML?: string
  storageKey?: string
  placeholder?: string
  onChangeHTML?: (html: string) => void
  onWordCountChange?: (count: number) => void
  onOpenMedia?: () => void
}

export const RichEditor = forwardRef<RichEditorHandle, RichEditorProps>(
  function RichEditor({ initialHTML, storageKey, placeholder, onChangeHTML, onWordCountChange, onOpenMedia }, ref) {
    const [showLinkInput, setShowLinkInput] = useState(false)
    const [linkValue, setLinkValue] = useState('')

    const getInitialContent = () => {
      if (typeof window === 'undefined') return initialHTML || '<p></p>'
      if (storageKey) {
        const saved = window.localStorage.getItem(storageKey + ':html')
        if (saved) return saved
      }
      return initialHTML || '<p></p>'
    }

    const editor = useEditor({
      extensions: [
        StarterKit,
        Placeholder.configure({ placeholder: placeholder || 'Write your case study…' }),
        Link.configure({ autolink: true, openOnClick: false, linkOnPaste: true }),
        Underline,
        InlineMedia,
        CharacterCount.configure({ limit: 100_000 }),
      ],
      content: getInitialContent(),
      editorProps: {
        attributes: { class: 'tiptap focus:outline-none' },
      },
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        onChangeHTML?.(html)
        if (storageKey) {
          try { window.localStorage.setItem(storageKey + ':html', html) } catch {}
        }
        const text = editor.getText().trim()
        onWordCountChange?.(text ? text.split(/\s+/).length : 0)
      },
    })

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() ?? '',
      setHTML: (html: string) => { editor?.commands.setContent(html || '<p></p>') },
      insertMedia: (attrs) => { editor?.chain().focus().insertInlineMedia(attrs).run() },
      focus: () => { editor?.commands.focus() },
    }), [editor])

    if (!editor) return null

    const isActive = (type: string, opts?: Record<string, unknown>) =>
      editor.isActive(type, opts)

    const btn = (label: string, active: boolean, onClick: () => void) => (
      <button
        key={label}
        type="button"
        onClick={onClick}
        className={`inline-flex items-center justify-center min-h-9 min-w-9 px-2.5 rounded text-[11px] font-medium transition-colors
          ${active
            ? 'bg-green/20 text-green border border-green/40'
            : 'text-gray hover:bg-white/5 hover:text-white border border-transparent'
          }`}
      >
        {label}
      </button>
    )

    const handleLinkSet = () => {
      if (!linkValue.trim()) {
        editor.chain().focus().unsetLink().run()
      } else {
        const href = linkValue.startsWith('http') ? linkValue : `https://${linkValue}`
        editor.chain().focus().setLink({ href }).run()
      }
      setShowLinkInput(false)
      setLinkValue('')
    }

    return (
      <div className="flex flex-col h-full">
        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-navy-light border-b border-white/8 px-2 sm:px-3 py-2 flex flex-wrap gap-1.5 items-center">
          {btn('B', isActive('bold'), () => editor.chain().focus().toggleBold().run())}
          {btn('I', isActive('italic'), () => editor.chain().focus().toggleItalic().run())}
          {btn('U', isActive('underline'), () => editor.chain().focus().toggleUnderline().run())}
          <div className="w-px h-5 bg-white/10 mx-0.5" />
          {btn('H1', isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
          {btn('H2', isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
          {btn('H3', isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
          <div className="w-px h-5 bg-white/10 mx-0.5" />
          {btn('• List', isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run())}
          {btn('1. List', isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run())}
          {btn('" Quote', isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run())}
          {/* Link input */}
          {showLinkInput ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLinkSet()
                  if (e.key === 'Escape') { setShowLinkInput(false); setLinkValue('') }
                }}
                placeholder="https://"
                className="text-xs bg-navy border border-white/20 rounded px-1.5 py-0.5 w-36 text-white outline-none focus:border-green/50"
              />
              <button type="button" className="px-1.5 py-0.5 rounded text-xs bg-green text-navy font-semibold" onClick={handleLinkSet}>✓</button>
              <button type="button" className="px-1.5 py-0.5 rounded text-xs text-gray hover:text-white" onClick={() => { setShowLinkInput(false); setLinkValue('') }}>✕</button>
            </div>
          ) : (
            <button
              type="button"
              className={`inline-flex items-center justify-center min-h-9 px-2.5 rounded text-[11px] font-medium transition-colors border ${isActive('link') ? 'bg-green/20 text-green border-green/40' : 'text-gray hover:bg-white/5 hover:text-white border-transparent'}`}
              onClick={() => { setLinkValue((editor.getAttributes('link').href as string | undefined) ?? ''); setShowLinkInput(true) }}
            >
              🔗 Link
            </button>
          )}
          <div className="w-px h-5 bg-white/10 mx-0.5" />
          {btn('HR', false, () => editor.chain().focus().setHorizontalRule().run())}
          {onOpenMedia && (
            <button
              type="button"
              onClick={onOpenMedia}
              className="inline-flex items-center justify-center min-h-9 px-3 rounded text-[11px] font-semibold border border-green/50 text-green hover:bg-green/10 transition-colors"
            >
              + Media
            </button>
          )}
          <span className="ml-auto text-[10px] text-gray/60">
            {editor.storage.characterCount.characters()} chars
          </span>
        </div>

        {/* ── Editor content ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <EditorContent editor={editor} />
        </div>
      </div>
    )
  }
)
