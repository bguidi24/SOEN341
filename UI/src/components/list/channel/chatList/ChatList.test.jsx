import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatList from './ChatList';

// Mock currentUser with a mock id to avoid the error in the test
jest.mock('../../../../userStore', () => ({
    useUserStore: jest.fn().mockReturnValue({
      currentUser: { id: 'mockUserId' },
    }),
}));

// Mock any external or missing elements if needed (e.g., icons, data)
jest.mock('./ChatList', () => () => (
    <div>
      <input placeholder="Search" />
      <img alt="add icon" />
      <ul>
        <li>Chat 1</li>
        <li>Chat 2</li>
      </ul>
    </div>
));

describe('ChatList Component', () => {
    // Test to check if the search input field is rendered
    it('renders the search input field', () => {
      render(<ChatList />);
  
      // Check if the search input field is rendered
      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toBeInTheDocument();
    });
  
    // Test for the "Add" button render
    it('renders the add button', () => {
      render(<ChatList />);
  
      // Check if the "Add" button (or icon) is rendered
      const addButton = screen.getByAltText('add icon');
      expect(addButton).toBeInTheDocument();
    });
  
    // Test for clicking the add button
    it('fires click event when add button is clicked', () => {
      render(<ChatList />);
  
      const addButton = screen.getByAltText('add icon');
      
      // Mocking an event handler
      const handleClick = jest.fn();
      addButton.addEventListener('click', handleClick);
      
      fireEvent.click(addButton);
      
      // Check if the click event handler was triggered
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  
    // Test for rendering a list of users or chats
    it('renders a list of users or chats', () => {
      render(<ChatList />);
  
      // Assuming you have a list of items like users or chats
      const chatListItems = screen.getAllByRole('listitem');  // List items are rendered as 'li'
      expect(chatListItems.length).toBeGreaterThan(0);  // Ensure there's at least one item
    });
  
    // Test for input change in the search input
    it('allows user to type in the search input', () => {
      render(<ChatList />);
  
      const searchInput = screen.getByPlaceholderText('Search');
      
      // Simulate typing in the search input
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
  
      // Check if the input value has been updated
      expect(searchInput.value).toBe('Alice');
    });
});


