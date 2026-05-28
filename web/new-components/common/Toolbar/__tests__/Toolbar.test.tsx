/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import Toolbar from '../index';

describe('Toolbar Component', () => {
  describe('Search', () => {
    it('should render search input with placeholder', () => {
      render(<Toolbar searchPlaceholder='Search items...' />);
      expect(screen.getByPlaceholderText('Search items...')).toBeTruthy();
    });

    it('should call onSearch when typing in search input', () => {
      const onSearch = jest.fn();
      render(<Toolbar onSearch={onSearch} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(onSearch).toHaveBeenCalledWith('test');
    });

    it('should render search icon', () => {
      const { container } = render(<Toolbar />);
      expect(container.querySelector('.anticon-search')).toBeTruthy();
    });
  });

  describe('Filters', () => {
    it('should render filter tabs when filters provided', () => {
      const filters = [
        { label: 'All', key: 'all' },
        { label: 'Active', key: 'active' },
      ];
      render(<Toolbar filters={filters} />);
      expect(screen.getByText('All')).toBeTruthy();
      expect(screen.getByText('Active')).toBeTruthy();
    });

    it('should call onFilterChange when filter is clicked', () => {
      const onFilterChange = jest.fn();
      const filters = [
        { label: 'All', key: 'all' },
        { label: 'Active', key: 'active' },
      ];
      render(<Toolbar filters={filters} onFilterChange={onFilterChange} />);
      fireEvent.click(screen.getByText('Active'));
      expect(onFilterChange).toHaveBeenCalledWith('active');
    });

    it('should apply active style to selected filter', () => {
      const filters = [
        { label: 'All', key: 'all' },
        { label: 'Active', key: 'active' },
      ];
      const { container } = render(<Toolbar filters={filters} selectedFilter='active' />);
      const activeButton = container.querySelector('button.bg-\\[\\#1677ff\\]');
      expect(activeButton?.textContent).toBe('Active');
    });

    it('should not render filters when empty array', () => {
      const { container } = render(<Toolbar filters={[]} />);
      expect(container.querySelector('button')).toBeNull();
    });
  });

  describe('Styling', () => {
    it('should apply correct layout classes', () => {
      const { container } = render(<Toolbar />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('gap-4');
    });

    it('should apply pill shape to filter buttons', () => {
      const filters = [{ label: 'Test', key: 'test' }];
      const { container } = render(<Toolbar filters={filters} />);
      const button = container.querySelector('button.rounded-\\[20px\\]');
      expect(button).toBeTruthy();
    });
  });
});
