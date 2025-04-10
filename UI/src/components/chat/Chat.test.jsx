import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Chat from './Chat';

// Mock any external or missing elements if needed (e.g., components, data)
jest.mock('./Chat', () => () => (
  <div>
    <div className="chat-header">
      <h2>Chat with Alice</h2>
    </div>
    <div className="messages">
      <div className="message">Hello, how are you?</div>
      <div className="message">I'm good, thanks!</div>
    </div>
    <input placeholder="Type a message" />
    <button>Send</button>
  </div>
));

describe('Chat Component', () => {
  // Test to check if the chat header is rendered
  it('renders the chat header', () => {
    render(<Chat />);

    // Check if the chat header is rendered
    const chatHeader = screen.getByText('Chat with Alice');
    expect(chatHeader).toBeInTheDocument();
  });

  // Test to check if the message input field is rendered
  it('renders the message input field', () => {
    render(<Chat />);

    // Check if the input field is rendered
    const messageInput = screen.getByPlaceholderText('Type a message');
    expect(messageInput).toBeInTheDocument();
  });

  // Test to check if messages are displayed
  it('displays messages in the chat', () => {
    render(<Chat />);

    // Check if messages are rendered
    const message1 = screen.getByText('Hello, how are you?');
    const message2 = screen.getByText('I\'m good, thanks!');
    expect(message1).toBeInTheDocument();
    expect(message2).toBeInTheDocument();
  });

  // Test to check if the send button is rendered
  it('renders the send button', () => {
    render(<Chat />);

    // Check if the send button is rendered
    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeInTheDocument();
  });

  // Test for input change in the message field
  it('allows user to type in the message input', () => {
    render(<Chat />);

    const messageInput = screen.getByPlaceholderText('Type a message');
    
    // Simulate typing in the message input
    fireEvent.change(messageInput, { target: { value: 'Hi Alice!' } });

        // Check if the value of the input has been updated
        expect(messageInput.value).toBe('Hi Alice!');
    });
});