import GithubSlugger from 'github-slugger'
import { type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

import type { PublishedInstructionSection } from '../api/published-instructions.mapper'

type HeadingEntry = {
  id: string
  level: number
  text: string
}

type ArticleSection = PublishedInstructionSection & {
  sectionId: string
  headings: HeadingEntry[]
}

type InstructionsArticleProps = {
  sections: PublishedInstructionSection[]
}

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), 'target', 'rel'],
  },
}

function cleanMarkdownHeadingText(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/\s+#+\s*$/, '')
    .trim()
}

function extractMarkdownHeadings(markdown: string) {
  const headings: Array<{ level: number; text: string }> = []
  let insideFence = false

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      insideFence = !insideFence
      continue
    }

    if (insideFence) {
      continue
    }

    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line)

    if (match) {
      const text = cleanMarkdownHeadingText(match[2])

      if (text) {
        headings.push({ level: match[1].length, text })
      }
    }
  }

  return headings
}

function buildArticleSections(sections: PublishedInstructionSection[]) {
  const slugger = new GithubSlugger()

  return sections.map<ArticleSection>((section) => ({
    ...section,
    sectionId: slugger.slug(section.title),
    headings: extractMarkdownHeadings(section.content).map((heading) => ({
      ...heading,
      id: slugger.slug(heading.text),
    })),
  }))
}

function createHeadingComponent(
  Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
  ids: string[],
  index: { current: number },
) {
  return function Heading({ children }: { children?: ReactNode }) {
    const id = ids[index.current]
    index.current += 1

    return (
      <Tag
        id={id}
        className="scroll-mt-24 text-balance font-semibold text-slate-950"
      >
        {children}
      </Tag>
    )
  }
}

function MarkdownSection({ section }: { section: ArticleSection }) {
  const headingIndex = { current: 0 }
  const headingIds = section.headings.map(({ id }) => id)
  const components: Components = {
    h1: createHeadingComponent('h1', headingIds, headingIndex),
    h2: createHeadingComponent('h2', headingIds, headingIndex),
    h3: createHeadingComponent('h3', headingIds, headingIndex),
    h4: createHeadingComponent('h4', headingIds, headingIndex),
    h5: createHeadingComponent('h5', headingIds, headingIndex),
    h6: createHeadingComponent('h6', headingIds, headingIndex),
    a: ({ children, href }) => {
      const isExternal = href?.startsWith('https://') || href?.startsWith('http://')

      return (
        <a
          className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-900"
          href={href}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          target={isExternal ? '_blank' : undefined}
        >
          {children}
        </a>
      )
    },
    table: ({ children }) => (
      <div className="my-5 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    ),
  }

  return (
    <section
      aria-labelledby={section.sectionId}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <header className="border-b border-slate-200 pb-5">
        <p className="text-sm font-medium text-slate-500">
          {section.academicYear} 學年度 · 第 {section.revisionNumber} 版
        </p>
        <h2
          className="mt-2 scroll-mt-24 text-2xl font-bold text-slate-950"
          id={section.sectionId}
        >
          {section.title}
        </h2>
      </header>

      <div className="mt-6 space-y-4 break-words text-base leading-8 text-slate-700 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-200 [&_blockquote]:pl-4 [&_code]:break-words [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:mt-8 [&_h1]:text-2xl [&_h2]:mt-8 [&_h2]:text-xl [&_h3]:mt-6 [&_h3]:text-lg [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:text-slate-50 [&_table_td]:border [&_table_td]:border-slate-200 [&_table_td]:p-2 [&_table_th]:border [&_table_th]:border-slate-200 [&_table_th]:bg-slate-50 [&_table_th]:p-2 [&_ul]:list-disc">
        <ReactMarkdown
          components={components}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
          remarkPlugins={[remarkGfm]}
        >
          {section.content}
        </ReactMarkdown>
      </div>
    </section>
  )
}

export function InstructionsArticle({ sections }: InstructionsArticleProps) {
  const articleSections = buildArticleSections(sections)
  const tableOfContents = articleSections.flatMap((section) => [
    { id: section.sectionId, level: 0, text: section.title },
    ...section.headings.map((heading) => ({
      ...heading,
      level: heading.level + 1,
    })),
  ])

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
      <nav
        aria-label="辦法目錄"
        className="self-start rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:sticky lg:top-24"
      >
        <h2 className="text-base font-bold text-slate-950">辦法目錄</h2>
        <ol className="mt-4 space-y-2 text-sm">
          {tableOfContents.map((heading) => (
            <li
              className={heading.level > 1 ? 'pl-4' : undefined}
              key={heading.id}
            >
              <a
                className="inline-flex min-h-11 items-center rounded-lg px-2 py-2 text-slate-700 hover:bg-white hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                href={`#${heading.id}`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <article className="min-w-0 space-y-8">
        {articleSections.map((section) => (
          <MarkdownSection key={section.sectionKey} section={section} />
        ))}
      </article>
    </div>
  )
}
