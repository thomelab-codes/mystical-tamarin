// Backend abstraction layer types
export interface User {
  id: string;
  email: string;
  [key: string]: any;
}

export interface AuthResponse {
  user: User | null;
  error: Error | null;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface Todo {
  id: string;
  user_id: string;
  task: string;
  is_completed: boolean;
  due_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  notes?: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  all_day: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description?: string;
  type: 'income' | 'expense';
  date: string;
  created_at: string;
}

export interface KanbanCard {
  id: string;
  user_id: string;
  board_id: string;
  column_id: string;
  title: string;
  description?: string;
  position: number;
  created_at: string;
}

export interface KanbanColumn {
  id: string;
  user_id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface KanbanBoard {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface MarkdownDocument {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface UploadedFile {
  path: string;
  url: string;
  name: string;
}

export type SubscriptionCallback<T> = (payload: T) => void;
export type UnsubscribeFunction = () => void;

// Main backend interface
export interface IBackendService {
  // Backend type
  type: 'supabase' | 'firebase' | 'appwrite';

  // Authentication
  auth: {
    signIn(email: string, password: string): Promise<AuthResponse>;
    signUp(email: string, password: string): Promise<AuthResponse>;
    signOut(): Promise<{ error: Error | null }>;
    getCurrentUser(): Promise<User | null>;
    onAuthStateChange(callback: (user: User | null) => void): UnsubscribeFunction;
  };

  // Database operations
  database: {
    // Profiles
    getProfile(userId: string): Promise<Profile | null>;
    updateProfile(userId: string, data: Partial<Profile>): Promise<Profile | null>;

    // Notes
    getNotes(userId: string): Promise<Note[]>;
    createNote(userId: string, data: Omit<Note, 'id' | 'user_id' | 'created_at'>): Promise<Note>;
    updateNote(id: string, data: Partial<Note>): Promise<Note>;
    deleteNote(id: string): Promise<void>;

    // Todos
    getTodos(userId: string): Promise<Todo[]>;
    createTodo(userId: string, data: Omit<Todo, 'id' | 'user_id' | 'created_at'>): Promise<Todo>;
    updateTodo(id: string, data: Partial<Todo>): Promise<Todo>;
    deleteTodo(id: string): Promise<void>;

    // Messages
    getMessages(): Promise<Message[]>;
    createMessage(userId: string, content: string): Promise<Message>;
    subscribeToMessages(callback: SubscriptionCallback<Message>): UnsubscribeFunction;

    // Habits
    getHabits(userId: string): Promise<Habit[]>;
    createHabit(userId: string, data: Omit<Habit, 'id' | 'user_id' | 'created_at'>): Promise<Habit>;
    updateHabit(id: string, data: Partial<Habit>): Promise<Habit>;
    deleteHabit(id: string): Promise<void>;

    // Habit Logs
    getHabitLogs(habitId: string): Promise<HabitLog[]>;
    createHabitLog(userId: string, habitId: string, notes?: string): Promise<HabitLog>;
    deleteHabitLog(id: string): Promise<void>;

    // Events
    getEvents(userId: string): Promise<Event[]>;
    createEvent(userId: string, data: Omit<Event, 'id' | 'user_id' | 'created_at'>): Promise<Event>;
    updateEvent(id: string, data: Partial<Event>): Promise<Event>;
    deleteEvent(id: string): Promise<void>;

    // Expenses
    getExpenses(userId: string): Promise<Expense[]>;
    createExpense(userId: string, data: Omit<Expense, 'id' | 'user_id' | 'created_at'>): Promise<Expense>;
    updateExpense(id: string, data: Partial<Expense>): Promise<Expense>;
    deleteExpense(id: string): Promise<void>;

    // Kanban Boards
    getBoards(userId: string): Promise<KanbanBoard[]>;
    createBoard(userId: string, data: Omit<KanbanBoard, 'id' | 'user_id' | 'created_at'>): Promise<KanbanBoard>;
    updateBoard(id: string, data: Partial<KanbanBoard>): Promise<KanbanBoard>;
    deleteBoard(id: string): Promise<void>;

    // Kanban Columns
    getColumns(boardId: string): Promise<KanbanColumn[]>;
    createColumn(userId: string, boardId: string, data: Omit<KanbanColumn, 'id' | 'user_id' | 'board_id' | 'created_at'>): Promise<KanbanColumn>;
    updateColumn(id: string, data: Partial<KanbanColumn>): Promise<KanbanColumn>;
    deleteColumn(id: string): Promise<void>;

    // Kanban Cards
    getCards(boardId: string): Promise<KanbanCard[]>;
    createCard(userId: string, data: Omit<KanbanCard, 'id' | 'user_id' | 'created_at'>): Promise<KanbanCard>;
    updateCard(id: string, data: Partial<KanbanCard>): Promise<KanbanCard>;
    deleteCard(id: string): Promise<void>;

    // Markdown Documents
    getMarkdownDocs(userId: string): Promise<MarkdownDocument[]>;
    createMarkdownDoc(userId: string, data: Omit<MarkdownDocument, 'id' | 'user_id' | 'created_at'>): Promise<MarkdownDocument>;
    updateMarkdownDoc(id: string, data: Partial<MarkdownDocument>): Promise<MarkdownDocument>;
    deleteMarkdownDoc(id: string): Promise<void>;
  };

  // Storage operations
  storage: {
    uploadFile(bucket: string, path: string, file: File): Promise<UploadedFile>;
    deleteFile(bucket: string, path: string): Promise<void>;
    getPublicUrl(bucket: string, path: string): string;
    listFiles(bucket: string, path?: string): Promise<UploadedFile[]>;
  };
}
