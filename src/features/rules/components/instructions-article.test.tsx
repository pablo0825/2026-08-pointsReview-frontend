import { render, screen } from '@testing-library/react'

import type { PublishedInstructionSection } from '../api/published-instructions.mapper'
import { InstructionsArticle } from './instructions-article'

function createSection(
  overrides: Partial<PublishedInstructionSection> = {},
): PublishedInstructionSection {
  return {
    academicYear: '115',
    revisionNumber: 1,
    sectionKey: 'competition-rules',
    title: '競賽成果申請辦法',
    content: '# 申請資格\n\n內容\n\n## 應備資料\n\n說明',
    displayOrder: 1,
    effectiveFrom: '2026-08-01',
    effectiveTo: null,
    ...overrides,
  }
}

describe('InstructionsArticle', () => {
  it('renders section titles, headings, and matching table-of-contents links', () => {
    render(<InstructionsArticle sections={[createSection()]} />)

    expect(
      screen.getByRole('navigation', { name: '辦法目錄' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '競賽成果申請辦法' }),
    ).toHaveAttribute('href', '#競賽成果申請辦法')
    expect(screen.getByRole('link', { name: '申請資格' })).toHaveAttribute(
      'href',
      '#申請資格',
    )
    expect(screen.getByRole('heading', { name: '申請資格' })).toHaveAttribute(
      'id',
      '申請資格',
    )
  })

  it('creates deterministic unique anchors for duplicate non-ASCII headings', () => {
    render(
      <InstructionsArticle
        sections={[
          createSection({
            content: '# 申請資格\n\n第一段\n\n# 申請資格\n\n第二段',
          }),
        ]}
      />,
    )

    const headings = screen.getAllByRole('heading', { name: '申請資格' })
    const links = screen.getAllByRole('link', { name: '申請資格' })

    expect(headings.map((heading) => heading.id)).toEqual([
      '申請資格',
      '申請資格-1',
    ])
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#申請資格',
      '#申請資格-1',
    ])
  })

  it('removes executable HTML and unsafe URLs', () => {
    const { container } = render(
      <InstructionsArticle
        sections={[
          createSection({
            content:
              '# 安全內容\n\n<script>window.__unsafe = true</script>\n\n<img src="x" onerror="window.__unsafe = true">\n\n[危險連結](javascript:alert(1))',
          }),
        ]}
      />,
    )

    expect(container.querySelector('script')).not.toBeInTheDocument()
    expect(container.querySelector('[onerror]')).not.toBeInTheDocument()
    expect(screen.getByText('危險連結').closest('a')).not.toHaveAttribute('href')
  })

  it('opens external links with safe relationship attributes', () => {
    render(
      <InstructionsArticle
        sections={[
          createSection({
            content: '[外部網站](https://example.com/rules)',
          }),
        ]}
      />,
    )

    expect(screen.getByRole('link', { name: '外部網站' })).toHaveAttribute(
      'target',
      '_blank',
    )
    expect(screen.getByRole('link', { name: '外部網站' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    )
  })
})
