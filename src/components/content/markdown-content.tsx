import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MarkdownContentProps = {
  content: string
  className?: string
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  if (!content.trim()) return null

  return (
    <div
      className={`prose prose-invert prose-green max-w-none prose-headings:font-barlow-condensed prose-headings:tracking-wide prose-a:text-green prose-strong:text-white ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
