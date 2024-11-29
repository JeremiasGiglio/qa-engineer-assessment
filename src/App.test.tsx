import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from './App';

// Ignore the React warning about missing "key" prop in lists for cleaner test output.
jest.spyOn(console, 'error').mockImplementation((message) => {
  if (message.includes('Each child in a list should have a unique "key" prop')) {
    return;
  }
  console.error(message);
});

describe('App Component', () => {
  test('renders the app header', () => {
    // Ensure the header is rendered properly
    render(<App />);
    const header = screen.getByText(/Todo List/i);
    expect(header).toBeInTheDocument();
  });

  test('adds a new task to the list', () => {
    // Test that new tasks can be added and rendered in the list
    render(<App />);

    const input = screen.getByPlaceholderText(/add a new todo item here/i);
    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.submit(input.closest('form'));

    const newTask = screen.getByText('New Task');
    expect(newTask).toBeInTheDocument();

    // Confirm the input field is cleared after submission
    expect(input).toHaveValue('');
  });

  test('toggles the checked state of a task', () => {
    // Validate that clicking a checkbox toggles the completed state
    render(<App />);

    const checkbox = screen.getByLabelText('Buy groceries');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test('tasks persist in Local Storage', () => {
    // Ensure tasks persist across component re-renders
    render(<App />);

    const input = screen.getByPlaceholderText(/add a new todo item here/i);
    fireEvent.change(input, { target: { value: 'Persistent Task' } });
    fireEvent.submit(input.closest('form'));

    const task = screen.getByText('Persistent Task');
    expect(task).toBeInTheDocument();

    // Simulate reloading the application
    cleanup();
    render(<App />);
    expect(screen.getByText('Persistent Task')).toBeInTheDocument();
  });

  test('renders initial tasks', () => {
    // Verify that initial tasks are displayed correctly
    render(<App />);

    const initialTasks = ['Buy groceries', 'Reboot computer', 'Ace CoderPad interview'];
    initialTasks.forEach((task) => {
      expect(screen.getByText(task)).toBeInTheDocument();
    });

    // Confirm the order of tasks in the list
    const tasks = screen.getAllByRole('checkbox');
    expect(tasks[0]).toHaveAccessibleName('Buy groceries');
    expect(tasks[1]).toHaveAccessibleName('Reboot computer');
    expect(tasks[2]).toHaveAccessibleName('Ace CoderPad interview');
  });

  test('does not reorder tasks when marked as completed', () => {
    // Confirm that marking a task as completed does not change the order
    render(<App />);

    const groceryCheckbox = screen.getByLabelText('Buy groceries');
    fireEvent.click(groceryCheckbox);

    const tasks = screen.getAllByText(/Buy groceries|Reboot computer|Ace CoderPad interview/i);
    expect(tasks[0]).toHaveTextContent('Buy groceries');
  });
});