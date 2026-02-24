import React from 'react'
import { render, screen } from '@testing-library/react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card with children', () => {
      render(
        <Card>
          <div>Card Content</div>
        </Card>
      )
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('should accept custom className', () => {
      const { container } = render(
        <Card className="custom-class">
          <div>Test</div>
        </Card>
      )
      const card = container.firstChild
      expect(card).toHaveClass('custom-class')
    })

    it('should accept event handlers', () => {
      const handleClick = jest.fn()
      render(
        <Card onClick={handleClick}>
          <div>Test</div>
        </Card>
      )
      const card = screen.getByText('Test').parentElement
      if (card) {
        card.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(handleClick).toHaveBeenCalled()
      }
    })

    it('should render as a div element', () => {
      const { container } = render(
        <Card>
          <div>Test</div>
        </Card>
      )
      expect(container.firstChild?.nodeName).toBe('DIV')
    })
  })

  describe('CardHeader', () => {
    it('should render card header', () => {
      render(
        <CardHeader>
          <div>Header</div>
        </CardHeader>
      )
      expect(screen.getByText('Header')).toBeInTheDocument()
    })

    it('should render as a div', () => {
      const { container } = render(
        <CardHeader>
          <div>Header</div>
        </CardHeader>
      )
      expect(container.firstChild?.nodeName).toBe('DIV')
    })
  })

  describe('CardTitle', () => {
    it('should render card title', () => {
      render(<CardTitle>My Title</CardTitle>)
      expect(screen.getByText('My Title')).toBeInTheDocument()
    })

    it('should render as h2 element', () => {
      render(<CardTitle>Title</CardTitle>)
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })

    it('should accept custom className', () => {
      render(<CardTitle className="custom">Title</CardTitle>)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.className).toContain('custom')
    })
  })

  describe('CardContent', () => {
    it('should render card content', () => {
      render(
        <CardContent>
          <div>Content</div>
        </CardContent>
      )
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should accept custom className', () => {
      const { container } = render(
        <CardContent className="extra">
          <div>Content</div>
        </CardContent>
      )
      expect(container.firstChild).toHaveClass('extra')
    })
  })

  describe('CardFooter', () => {
    it('should render card footer', () => {
      render(
        <CardFooter>
          <button>Save</button>
        </CardFooter>
      )
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    it('should render as a div', () => {
      const { container } = render(
        <CardFooter>
          <div>Footer</div>
        </CardFooter>
      )
      expect(container.firstChild?.nodeName).toBe('DIV')
    })
  })

  describe('Complete Card Structure', () => {
    it('should render complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Body content here</CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Body content here')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('should render card with only header and content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Just content</CardContent>
        </Card>
      )
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Just content')).toBeInTheDocument()
    })
  })
})
