import { render, screen } from '@testing-library/react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Container, Section } from '../components/ui'

describe('Shadcn UI Components', () => {
  describe('Button', () => {
    it('renders button with default variant', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-primary')
    })

    it('renders button with gradient variant', () => {
      render(<Button variant="gradient">Gradient Button</Button>)
      const button = screen.getByRole('button', { name: 'Gradient Button' })
      expect(button).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-purple-600')
    })

    it('renders button with custom size', () => {
      render(<Button size="xl">Large Button</Button>)
      const button = screen.getByRole('button', { name: 'Large Button' })
      expect(button).toHaveClass('h-14', 'px-12', 'py-5', 'text-xl')
    })

    it('renders as child when asChild prop is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      const link = screen.getByRole('link', { name: 'Link Button' })
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
    })
  })

  describe('Card', () => {
    it('renders card with content', () => {
      render(
        <Card>
          <CardContent>Card content</CardContent>
        </Card>
      )
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('renders card with header and title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Card content</CardContent>
        </Card>
      )
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <Card className="custom-class">
          <CardContent>Content</CardContent>
        </Card>
      )
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('Badge', () => {
    it('renders badge with default variant', () => {
      render(<Badge>Default Badge</Badge>)
      const badge = screen.getByText('Default Badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-primary')
    })

    it('renders badge with blue variant', () => {
      render(<Badge variant="blue">Blue Badge</Badge>)
      const badge = screen.getByText('Blue Badge')
      expect(badge).toHaveClass('bg-blue-50', 'text-blue-700')
    })

    it('applies custom className', () => {
      render(<Badge className="custom-badge">Custom</Badge>)
      const badge = screen.getByText('Custom')
      expect(badge).toHaveClass('custom-badge')
    })
  })

  describe('Container', () => {
    it('renders container with default size', () => {
      render(<Container>Container content</Container>)
      const container = screen.getByText('Container content').closest('div')
      expect(container).toHaveClass('max-w-6xl')
    })

    it('renders container with custom size', () => {
      render(<Container size="xl">XL Container</Container>)
      const container = screen.getByText('XL Container').closest('div')
      expect(container).toHaveClass('max-w-7xl')
    })

    it('applies custom className', () => {
      render(<Container className="custom-container">Content</Container>)
      const container = screen.getByText('Content').closest('div')
      expect(container).toHaveClass('custom-container')
    })
  })

  describe('Section', () => {
    it('renders section with default variant', () => {
      render(<Section>Section content</Section>)
      const section = screen.getByText('Section content').closest('section')
      expect(section).toHaveClass('bg-white')
    })

    it('renders section with gradient variant', () => {
      render(<Section variant="gradient">Gradient Section</Section>)
      const section = screen.getByText('Gradient Section').closest('section')
      expect(section).toHaveClass('bg-gradient-to-r', 'from-blue-50', 'via-indigo-50', 'to-purple-50')
    })

    it('renders section with dark variant', () => {
      render(<Section variant="dark">Dark Section</Section>)
      const section = screen.getByText('Dark Section').closest('section')
      expect(section).toHaveClass('bg-gradient-to-br', 'from-gray-800', 'via-gray-900', 'to-indigo-900', 'text-white')
    })

    it('applies custom className', () => {
      render(<Section className="custom-section">Content</Section>)
      const section = screen.getByText('Content').closest('section')
      expect(section).toHaveClass('custom-section')
    })
  })
}) 