import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ExternalLink, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

interface MarkdownRendererProps {
  content: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Code copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  return (
    <ReactMarkdown
      components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="text-xl font-bold text-text-primary mb-4 pb-2 border-b border-border-secondary">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold text-text-primary mb-3 mt-6">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold text-text-primary mb-2 mt-4">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-semibold text-text-primary mb-2 mt-3">
            {children}
          </h4>
        ),

        // Paragraphs
        p: ({ children }) => (
          <p className="text-text-primary mb-3 leading-relaxed">
            {children}
          </p>
        ),

        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside text-text-primary mb-3 space-y-1 ml-4">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside text-text-primary mb-3 space-y-1 ml-4">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-text-primary">
            {children}
          </li>
        ),

        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-medical-primary hover:text-medical-secondary underline inline-flex items-center space-x-1 transition-colors"
          >
            <span>{children}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ),

        // Code blocks
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '')
          const codeString = String(children).replace(/\n$/, '')

          if (!inline && match) {
            return (
              <div className="relative group mb-4">
                <div className="flex items-center justify-between bg-code-bg border border-code-border rounded-t-lg px-4 py-2">
                  <span className="text-xs text-text-secondary font-mono">
                    {match[1]}
                  </span>
                  <button
                    onClick={() => handleCopyCode(codeString)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-input-bg"
                    title="Copy code"
                  >
                    <Copy className="w-3 h-3 text-text-secondary" />
                  </button>
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="!mt-0 !rounded-t-none"
                  customStyle={{
                    margin: 0,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    backgroundColor: '#0d1117',
                    border: '1px solid #30363d',
                    borderTop: 'none',
                  }}
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            )
          }

          return (
            <code
              className="bg-code-bg text-medical-primary px-1.5 py-0.5 rounded text-sm font-mono border border-code-border"
              {...props}
            >
              {children}
            </code>
          )
        },

        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-medical-primary bg-medical-primary bg-opacity-10 pl-4 py-2 mb-4 italic">
            <div className="text-text-primary">
              {children}
            </div>
          </blockquote>
        ),

        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-border-secondary rounded-lg">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-input-bg">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-border-secondary">
            {children}
          </tbody>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-input-bg transition-colors">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left text-sm font-semibold text-text-primary border-b border-border-secondary">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-sm text-text-primary">
            {children}
          </td>
        ),

        // Horizontal rule
        hr: () => (
          <hr className="border-border-secondary my-6" />
        ),

        // Strong/Bold
        strong: ({ children }) => (
          <strong className="font-semibold text-text-primary">
            {children}
          </strong>
        ),

        // Emphasis/Italic
        em: ({ children }) => (
          <em className="italic text-text-primary">
            {children}
          </em>
        ),

        // Images
        img: ({ src, alt }) => (
          <div className="mb-4">
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg border border-border-secondary"
              loading="lazy"
            />
            {alt && (
              <p className="text-xs text-text-secondary mt-2 text-center italic">
                {alt}
              </p>
            )}
          </div>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownRenderer

