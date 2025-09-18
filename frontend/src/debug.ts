

export const response = {
  sdkHttpResponse: {
    headers: {
      "alt-svc": "h3=\":443\"; ma=2592000,h3-29=\":443\"; ma=2592000",
      "content-encoding": "gzip",
      "content-type": "application/json; charset=UTF-8",
      date: "Wed, 17 Sep 2025 17:05:33 GMT",
      server: "scaffolding on HTTPServer2",
      "server-timing": "gfet4t7; dur=32324",
      "transfer-encoding": "chunked",
      vary: "Origin, X-Origin, Referer",
      "x-content-type-options": "nosniff",
      "x-frame-options": "SAMEORIGIN",
      "x-xss-protection": "0",
    },
  },
  candidates: [
    {
      content: {
        parts: [
          {
            text: `We set up a beautiful and functional Todo application using React, TypeScript, Tailwind CSS, and Lucide React for icons. This application includes features like adding, toggling, and deleting todos, with persistence handled by \`localStorage\`.

<boltArtifact id="todo-app" title="React Todo App">
  <boltAction type="file" filePath="index.html">
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Todo App</title>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/src/main.tsx"></script>
      </body>
    </html>
  </boltAction>

  <boltAction type="file" filePath="src/types/todo.ts">
    export interface Todo {
      id: string;
      text: string;
      completed: boolean;
    }
  </boltAction>

  <boltAction type="file" filePath="src/hooks/useTodos.ts">
    import { useState, useEffect } from 'react';
    import { Todo } from '../types/todo';

    const LOCAL_STORAGE_KEY = 'react-todo-app-todos';

    export const useTodos = () => {
      const [todos, setTodos] = useState<Todo[]>(() => {
        try {
          const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
          return storedTodos ? JSON.parse(storedTodos) : [];
        } catch (error) {
          console.error("Failed to parse todos from localStorage", error);
          return [];
        }
      });

      useEffect(() => {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
        } catch (error) {
          console.error("Failed to save todos to localStorage", error);
        }
      }, [todos]);

      const addTodo = (text: string) => {
        if (text.trim()) {
          setTodos((prevTodos) => [
            ...prevTodos,
            { id: crypto.randomUUID(), text, completed: false },
          ]);
        }
      };

      const toggleTodo = (id: string) => {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          )
        );
      };

      const deleteTodo = (id: string) => {
        setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      };

      return { todos, addTodo, toggleTodo, deleteTodo };
    };
  </boltAction>

  <boltAction type="file" filePath="src/components/Header.tsx">
    import React from 'react';
    import { ClipboardList } from 'lucide-react';

    const Header: React.FC = () => {
      return (
        <header className="mb-8 flex items-center justify-center space-x-3">
          <ClipboardList className="h-10 w-10 text-indigo-600" />
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            Todo App
          </h1>
        </header>
      );
    };

    export default Header;
  </boltAction>

  <boltAction type="file" filePath="src/components/TodoForm.tsx">
    import React, { useState } from 'react';
    import { Plus } from 'lucide-react';

    interface TodoFormProps {
      onAddTodo: (text: string) => void;
    }

    const TodoForm: React.FC<TodoFormProps> = ({ onAddTodo }) => {
      const [inputValue, setInputValue] = useState('');

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddTodo(inputValue);
        setInputValue('');
      };

      return (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg shadow-sm"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center shadow-md"
            aria-label="Add todo"
          >
            <Plus className="h-6 w-6" />
          </button>
        </form>
      );
    };

    export default TodoForm;
  </boltAction>

  <boltAction type="file" filePath="src/components/TodoItem.tsx">
    import React from 'react';
    import { Trash2 } from 'lucide-react';
    import { Todo } from '../types/todo';

    interface TodoItemProps {
      todo: Todo;
      onToggle: (id: string) => void;
      onDelete: (id: string) => void;
    }

    const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
      return (
        <li className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-3 transition-all duration-200 ease-in-out hover:shadow-md">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
              className="form-checkbox h-6 w-6 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <span
              className={\`ml-4 text-lg \${
                todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
              }\`}
            >
              {todo.text}
            </span>
          </div>
          <button
            onClick={() => onDelete(todo.id)}
            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
            aria-label={\`Delete todo: \${todo.text}\`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </li>
      );
    };

    export default TodoItem;
  </boltAction>

  <boltAction type="file" filePath="src/components/TodoList.tsx">
    import React from 'react';
    import { Todo } from '../types/todo';
    import TodoItem from './TodoItem';

    interface TodoListProps {
      todos: Todo[];
      onToggleTodo: (id: string) => void;
      onDeleteTodo: (id: string) => void;
    }

    const TodoList: React.FC<TodoListProps> = ({
      todos,
      onToggleTodo,
      onDeleteTodo,
    }) => {
      if (todos.length === 0) {
        return (
          <p className="text-center text-gray-500 text-xl mt-10">
            No todos yet! Add some above.
          </p>
        );
      }

      return (
        <ul className="space-y-3">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggleTodo}
              onDelete={onDeleteTodo}
            />
          ))}
        </ul>
      );
    };

    export default TodoList;
  </boltAction>

  <boltAction type="file" filePath="src/App.tsx">
    import React from 'react';
    import { useTodos } from './hooks/useTodos';
    import Header from './components/Header';
    import TodoForm from './components/TodoForm';
    import TodoList from './components/TodoList';

    function App() {
      const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-100">
            <Header />
            <TodoForm onAddTodo={addTodo} />
            <TodoList
              todos={todos}
              onToggleTodo={toggleTodo}
              onDeleteTodo={deleteTodo}
            />
          </div>
        </div>
      );
    }

    export default App;
  </boltAction>

  <boltAction type="shell">
    npm run dev
  </boltAction>
</boltArtifact>`,
          },
        ],
        role: "model",
      },
      finishReason: "STOP",
      index: 0,
    },
  ],
  modelVersion: "gemini-2.5-flash",
  responseId: "XerKaM__AZi5qtsP4-Dy2A0",
  usageMetadata: {
    promptTokenCount: 5171,
    candidatesTokenCount: 2227,
    totalTokenCount: 8303,
    cachedContentTokenCount: 5097,
    promptTokensDetails: [
      {
        modality: "TEXT",
        tokenCount: 5171,
      },
    ],
    cacheTokensDetails: [
      {
        modality: "TEXT",
        tokenCount: 5097,
      },
    ],
    thoughtsTokenCount: 905,
  },
};