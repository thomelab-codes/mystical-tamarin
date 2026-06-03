import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import type {
  IBackendService,
  User,
  AuthResponse,
  Profile,
  Note,
  Todo,
  Message,
  Habit,
  HabitLog,
  Event,
  Expense,
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  MarkdownDocument,
  UploadedFile,
  SubscriptionCallback,
  UnsubscribeFunction,
} from './types';

export class SupabaseBackendService implements IBackendService {
  type = 'supabase' as const;
  private client: SupabaseClient;

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey);
  }

  private mapUser(user: SupabaseUser | null): User | null {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || '',
      ...user,
    };
  }

  auth = {
    signIn: async (email: string, password: string): Promise<AuthResponse> => {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      });
      return {
        user: this.mapUser(data.user),
        error: error as Error | null,
      };
    },

    signUp: async (email: string, password: string): Promise<AuthResponse> => {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
      });
      return {
        user: this.mapUser(data.user),
        error: error as Error | null,
      };
    },

    signOut: async () => {
      const { error } = await this.client.auth.signOut();
      return { error: error as Error | null };
    },

    getCurrentUser: async (): Promise<User | null> => {
      const { data } = await this.client.auth.getUser();
      return this.mapUser(data.user);
    },

    onAuthStateChange: (callback: (user: User | null) => void): UnsubscribeFunction => {
      const { data: { subscription } } = this.client.auth.onAuthStateChange((_event, session) => {
        callback(this.mapUser(session?.user || null));
      });
      return () => subscription.unsubscribe();
    },
  };

  database = {
    // Profiles
    getProfile: async (userId: string): Promise<Profile | null> => {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    },

    updateProfile: async (userId: string, profileData: Partial<Profile>): Promise<Profile | null> => {
      const { data, error } = await this.client
        .from('profiles')
        .update(profileData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Notes
    getNotes: async (userId: string): Promise<Note[]> => {
      const { data, error } = await this.client
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    createNote: async (userId: string, noteData: Omit<Note, 'id' | 'user_id' | 'created_at'>): Promise<Note> => {
      const { data, error } = await this.client
        .from('notes')
        .insert([{ ...noteData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    updateNote: async (id: string, noteData: Partial<Note>): Promise<Note> => {
      const { data, error } = await this.client
        .from('notes')
        .update(noteData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    deleteNote: async (id: string): Promise<void> => {
      const { error } = await this.client
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    // Todos
    getTodos: async (userId: string): Promise<Todo[]> => {
      const { data, error } = await this.client
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    createTodo: async (userId: string, todoData: Omit<Todo, 'id' | 'user_id' | 'created_at'>): Promise<Todo> => {
      const { data, error } = await this.client
        .from('todos')
        .insert([{ ...todoData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    updateTodo: async (id: string, todoData: Partial<Todo>): Promise<Todo> => {
      const { data, error } = await this.client
        .from('todos')
        .update(todoData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    deleteTodo: async (id: string): Promise<void> => {
      const { error } = await this.client
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    // Messages
    getMessages: async (): Promise<Message[]> => {
      const { data, error } = await this.client
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    createMessage: async (userId: string, content: string): Promise<Message> => {
      const { data, error } = await this.client
        .from('messages')
        .insert([{ content, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    subscribeToMessages: (callback: SubscriptionCallback<Message>): UnsubscribeFunction => {
      const subscription = this.client
        .channel('messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          callback(payload.new as Message);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    },

    // Habits
    getHabits: async (userId: string): Promise<Habit[]> => {
      const { data, error } = await this.client
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    createHabit: async (userId: string, habitData: Omit<Habit, 'id' | 'user_id' | 'created_at'>): Promise<Habit> => {
      const { data, error } = await this.client
        .from('habits')
        .insert([{ ...habitData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    updateHabit: async (id: string, habitData: Partial<Habit>): Promise<Habit> => {
      const { data, error } = await this.client
        .from('habits')
        .update(habitData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    deleteHabit: async (id: string): Promise<void> => {
      const { error } = await this.client
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    // Habit Logs
    getHabitLogs: async (habitId: string): Promise<HabitLog[]> => {
      const { data, error } = await this.client
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    createHabitLog: async (userId: string, habitId: string, notes?: string): Promise<HabitLog> => {
      const { data, error } = await this.client
        .from('habit_logs')
        .insert([{ habit_id: habitId, user_id: userId, notes, completed_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    deleteHabitLog: async (id: string): Promise<void> => {
      const { error } = await this.client
        .from('habit_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    // Events
    getEvents: async (userId: string): Promise<Event[]> => {
      const { data, error } = await this.client
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    createEvent: async (userId: string, eventData: Omit<Event, 'id' | 'user_id' | 'created_at'>): Promise<Event> => {
      const { data, error } = await this.client
        .from('events')
        .insert([{ ...eventData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    updateEvent: async (id: string, eventData: Partial<Event>): Promise<Event> => {
      const { data, error } = await this.client
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    deleteEvent: async (id: string): Promise<void> => {
      const { error } = await this.client
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    // Expenses
    getExpenses: async (userId: string): Promise<Expense[]> => {
      const { data, error } = await this.client
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    createExpense: async (userId: string, expenseData: Omit<Expense, 'id' | 'user_id' | 'created_at'>): Promise<Expense> => {
      const { data, error } = await this.client
        .from('expenses')
        .insert([{ ...expenseData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    updateExpense: async (id: string, expenseData: Partial<Expense>): Promise<Expense> => {
      const { data, error } = await this.client
        .from('expenses')
        .update(expenseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    deleteExpense: async (id: string): Promise<void> => {
      const { error } = await this.client
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    // Kanban Boards
    getBoards: async (userId: string): Promise<KanbanBoard[]> => {
      const { data, error } = await this.client
        .from('kanban_boards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    createBoard: async (userId: string, boardData: Omit<KanbanBoard, 'id' | 'user_id' | 'created_at'>): Promise<KanbanBoard> => {
      const { data, error } = await this.client
        .from('kanban_boards')
        .insert([{ ...boardData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    updateBoard: async (id: string, boardData: Partial<KanbanBoard>): Promise<KanbanBoard> => {
      const { data, error } = await this.client
        .from('kanban_boards')
        .update(boardData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    deleteBoard: async (id: string): Promise<void> => {
      const { error } = await this.client
        .from('kanban_boards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    // Kanban Columns
    getColumns: async (boardId: string): Promise<KanbanColumn[]> => {
      const { data, error } = await this.client
        .from('kanban_columns')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    createColumn: async (userId: string, boardId: string, columnData: Omit<KanbanColumn, 'id' | 'user_id' | 'board_id' | 'created_at'>): Promise<KanbanColumn> => {
      const { data, error } = await this.client
        .from('kanban_columns')
        .insert([{ ...columnData, user_id: userId, board_id: boardId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    updateColumn: async (id: string, columnData: Partial<KanbanColumn>): Promise<KanbanColumn> => {
      const { data, error } = await this.client
        .from('kanban_columns')
        .update(columnData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    deleteColumn: async (id: string): Promise<void> => {
      const { error } = await this.client
        .from('kanban_columns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    // Kanban Cards
    getCards: async (boardId: string): Promise<KanbanCard[]> => {
      const { data, error } = await this.client
        .from('kanban_cards')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    createCard: async (userId: string, cardData: Omit<KanbanCard, 'id' | 'user_id' | 'created_at'>): Promise<KanbanCard> => {
      const { data, error } = await this.client
        .from('kanban_cards')
        .insert([{ ...cardData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    updateCard: async (id: string, cardData: Partial<KanbanCard>): Promise<KanbanCard> => {
      const { data, error } = await this.client
        .from('kanban_cards')
        .update(cardData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    deleteCard: async (id: string): Promise<void> => {
      const { error } = await this.client
        .from('kanban_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    // Markdown Documents
    getMarkdownDocs: async (userId: string): Promise<MarkdownDocument[]> => {
      const { data, error } = await this.client
        .from('markdown_docs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    createMarkdownDoc: async (userId: string, docData: Omit<MarkdownDocument, 'id' | 'user_id' | 'created_at'>): Promise<MarkdownDocument> => {
      const { data, error } = await this.client
        .from('markdown_docs')
        .insert([{ ...docData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    updateMarkdownDoc: async (id: string, docData: Partial<MarkdownDocument>): Promise<MarkdownDocument> => {
      const { data, error } = await this.client
        .from('markdown_docs')
        .update(docData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    deleteMarkdownDoc: async (id: string): Promise<void> => {
      const { error } = await this.client
        .from('markdown_docs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
  };

  storage = {
    uploadFile: async (bucket: string, path: string, file: File): Promise<UploadedFile> => {
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(path, file);

      if (error) throw error;

      const publicUrl = this.client.storage.from(bucket).getPublicUrl(path).data.publicUrl;

      return {
        path: data.path,
        url: publicUrl,
        name: file.name,
      };
    },

    deleteFile: async (bucket: string, path: string): Promise<void> => {
      const { error } = await this.client.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    },

    getPublicUrl: (bucket: string, path: string): string => {
      return this.client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    },

    listFiles: async (bucket: string, path: string = ''): Promise<UploadedFile[]> => {
      const { data, error } = await this.client.storage
        .from(bucket)
        .list(path);

      if (error) throw error;

      return (data || []).map((file) => ({
        path: `${path}/${file.name}`,
        url: this.client.storage.from(bucket).getPublicUrl(`${path}/${file.name}`).data.publicUrl,
        name: file.name,
      }));
    },
  };
}
