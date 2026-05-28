/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import PageHeader from '../index';

describe('PageHeader Component', () => {
  describe('Rendering', () => {
    it('should render title correctly', () => {
      render(<PageHeader title='Test Title' />);
      expect(screen.getByText('Test Title')).toBeTruthy();
    });

    it('should render description when provided', () => {
      render(<PageHeader title='Test Title' description='Test Description' />);
      expect(screen.getByText('Test Description')).toBeTruthy();
    });

    it('should not render description when not provided', () => {
      const { container } = render(<PageHeader title='Test Title' />);
      expect(container.querySelector('p')).toBeNull();
    });
  });

  describe('Props', () => {
    it('should render actions when provided', () => {
      render(<PageHeader title='Test Title' actions={<button data-testid='action-btn'>Action</button>} />);
      expect(screen.getByTestId('action-btn')).toBeTruthy();
    });

    it('should not render actions div when not provided', () => {
      const { container } = render(<PageHeader title='Test Title' />);
      const actionsDiv = container.querySelector('div.flex.items-center');
      expect(actionsDiv?.children.length).toBe(0);
    });
  });

  describe('Typography', () => {
    it('should render title with correct font size', () => {
      render(<PageHeader title='Test Title' />);
      const title = screen.getByText('Test Title');
      expect(title).toHaveStyle({ fontSize: '24px' });
    });

    it('should render title with semibold weight', () => {
      render(<PageHeader title='Test Title' />);
      const title = screen.getByText('Test Title');
      expect(title).toHaveStyle({ fontWeight: '600' });
    });

    it('should render description with helper text size', () => {
      render(<PageHeader title='Test Title' description='Description' />);
      const description = screen.getByText('Description');
      expect(description).toHaveStyle({ fontSize: '13px' });
    });
  });

  describe('Layout', () => {
    it('should apply flex layout with space-between', () => {
      const { container } = render(<PageHeader title='Test Title' />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('items-start');
      expect(wrapper).toHaveClass('justify-between');
    });
  });
});
