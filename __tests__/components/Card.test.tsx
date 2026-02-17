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

    it('should have correct styling classes', () => {
      const { container } = render(
        <Card>
          <div>Test</div>
        </Card>
      )
      const card = container.querySelector('[class*="bg-white"]')
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'border')
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

    it('should have border styling', () => {
      const { container } = render(
        <CardHeader>
          <div>Header</div>
        </CardHeader>
      )
      const header = container.firstChild
      expect(header).toHaveClass('border-b', 'border-neutral-200')
    })
  })

  describe('CardTitle', () => {
    it('should render card title', () => {
      render(<CardTitle>My Title</CardTitle>)
      expect(screen.getByText('My Title')).toBeInTheDocument()
    })

    it('should have correct styling', () => {
      const { container } = render(<CardTitle>Title</CardTitle>)
      const title = container.querySelector('h2')
      expect(title).toHaveClass('text-xl', 'font-bold')
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

    it('should have footer styling with flex', () => {
      const { container } = render(
        <CardFooter>
          <div>Footer</div>
        </CardFooter>
      )
      const footer = container.firstChild
      expect(footer).toHaveClass('flex', 'justify-end')
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
  })
})
