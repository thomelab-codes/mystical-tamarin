import { Client, Account, Databases, Storage, Query, ID, Models } from 'appwrite';
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

export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  databaseId: string;
  bucketsId: string;
}

export class AppwriteBackendService implements IBackendService {
  type = 'appwrite' as const;
  private client: Client;
  private account: Account;
  private databases: Databases;
  private storage: Storage;
  private databaseId: string;
  private bucketsId: string;

  constructor(config: AppwriteConfig) {
    this.client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.projectId);

    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.databaseId = config.databaseId;
    this.bucketsId = config.bucketsId;
  }

  private mapUser(user: Models.User<Models.Preferences> | null): User | null {
    if (!user) return null;
    return {
      id: user.$id,
      email: user.email,
    };
  }

  auth = {
    signIn: async (email: string, password: string): Promise<AuthResponse> => {
      try {
        await this.account.createEmailPasswordSession(email, password);
        const user = await this.account.get();
        return {
          user: this.mapUser(user),
          error: null,
        };
      } catch (error) {
        return {
          user: null,
          error: error as Error,
        };
      }
    },

    signUp: async (email: string, password: string): Promise<AuthResponse> => {
      try {
        const user = await this.account.create(ID.unique(), email, password);
        // Create profile document
        await this.databases.createDocument(
          this.databaseId,
          'profiles',
          ID.unique(),
          {
            user_id: user.$id,
            created_at: new Date().toISOString(),
          }
        );
        await this.account.createEmailPasswordSession(email, password);
        return {
          user: this.mapUser(user),
          error: null,
        };
      } catch (error) {
        return {
          user: null,
          error: error as Error,
        };
      }
    },

    signOut: async () => {
      try {
        await this.account.deleteSession('current');
        return { error: null };
      } catch (error) {
        return { error: error as Error };
      }
    },

    getCurrentUser: async (): Promise<User | null> => {
      try {
        const user = await this.account.get();
        return this.mapUser(user);
      } catch {
        return null;
      }
    },

    onAuthStateChange: (callback: (user: User | null) => void): UnsubscribeFunction => {
      // Appwrite doesn't have real-time auth state change listener
      // We'll implement a polling mechanism
      let intervalId: NodeJS.Timeout | null = null;
      let currentUserId: string | null = null;

      const checkAuth = async () => {
        try {
          const user = await this.account.get();
          if (user.$id !== currentUserId) {
            currentUserId = user.$id;
            callback(this.mapUser(user));
          }
        } catch {
          if (currentUserId !== null) {
            currentUserId = null;
            callback(null);
          }
        }
      };

      checkAuth();
      intervalId = setInterval(checkAuth, 5000); // Check every 5 seconds

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    },
  };

  database = {
    // Profiles
    getProfile: async (userId: string): Promise<Profile | null> => {
      try {
        const response = await this.databases.listDocuments(
          this.databaseId,
          'profiles',
          [Query.equal('user_id', userId)]
        );
        if (response.documents.length === 0) return null;
        const doc = response.documents[0];
        return {
          id: doc.$id,
          user_id: doc.user_id,
          first_name: doc.first_name,
          last_name: doc.last_name,
          created_at: doc.created_at,
          updated_at: doc.updated_at,
        };
      } catch (error) {
        throw error;
      }
    },

    updateProfile: async (userId: string, profileData: Partial<Profile>): Promise<Profile | null> => {
      const response = await this.databases.listDocuments(
        this.databaseId,
        'profiles',
        [Query.equal('user_id', userId)]
      );
      if (response.documents.length === 0) return null;
      const docId = response.documents[0].$id;
      const updated = await this.databases.updateDocument(
        this.databaseId,
        'profiles',
        docId,
        { ...profileData, updated_at: new Date().toISOString() }
      );
      return {
        id: updated.$id,
        user_id: updated.user_id,
        first_name: updated.first_name,
        last_name: updated.last_name,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
      };
    },

    // Notes
    getNotes: async (userId: string): Promise<Note[]> => {
      const response = await this.databases.listDocuments(
        this.databaseId,
        'notes',
        [Query.equal('user_id', userId), Query.orderDesc('created_at')]
      );
      return response.documents.map((doc) => ({
        id: doc.$id,
        user_id: doc.user_id,
        title: doc.title,
        content: doc.content,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      }));
    },

    createNote: async (userId: string, noteData: Omit<Note, 'id' | 'user_id' | 'created_at'>): Promise<Note> => {
      const doc = await this.databases.createDocument(
        this.databaseId,
        'notes',
        ID.unique(),
        {
          ...noteData,
          user_id: userId,
          created_at: new Date().toISOString(),
        }
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        title: doc.title,
        content: doc.content,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      };
    },

    updateNote: async (id: string, noteData: Partial<Note>): Promise<Note> => {
      const doc = await this.databases.updateDocument(
        this.databaseId,
        'notes',
        id,
        { ...noteData, updated_at: new Date().toISOString() }
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        title: doc.title,
        content: doc.content,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      };
    },

    deleteNote: async (id: string): Promise<void> => {
      await this.databases.deleteDocument(this.databaseId, 'notes', id);
    },

    // Todos
    getTodos: async (userId: string): Promise<Todo[]> => {
      const response = await this.databases.listDocuments(
        this.databaseId,
        'todos',
        [Query.equal('user_id', userId), Query.orderDesc('created_at')]
      );
      return response.documents.map((doc) => ({
        id: doc.$id,
        user_id: doc.user_id,
        task: doc.task,
        is_completed: doc.is_completed,
        due_date: doc.due_date,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      }));
    },

    createTodo: async (userId: string, todoData: Omit<Todo, 'id' | 'user_id' | 'created_at'>): Promise<Todo> => {
      const doc = await this.databases.createDocument(
        this.databaseId,
        'todos',
        ID.unique(),
        {
          ...todoData,
          user_id: userId,
          created_at: new Date().toISOString(),
        }
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        task: doc.task,
        is_completed: doc.is_completed,
        due_date: doc.due_date,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      };
    },

    updateTodo: async (id: string, todoData: Partial<Todo>): Promise<Todo> => {
      const doc = await this.databases.updateDocument(
        this.databaseId,
        'todos',
        id,
        { ...todoData, updated_at: new Date().toISOString() }
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        task: doc.task,
        is_completed: doc.is_completed,
        due_date: doc.due_date,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      };
    },

    deleteTodo: async (id: string): Promise<void> => {
      await this.databases.deleteDocument(this.databaseId, 'todos', id);
    },

    // Messages
    getMessages: async (): Promise<Message[]> => {
      const response = await this.databases.listDocuments(
        this.databaseId,
        'messages',
        [Query.orderAsc('created_at')]
      );
      return response.documents.map((doc) => ({
        id: doc.$id,
        user_id: doc.user_id,
        content: doc.content,
        created_at: doc.created_at,
      }));
    },

    createMessage: async (userId: string, content: string): Promise<Message> => {
      const doc = await this.databases.createDocument(
        this.databaseId,
        'messages',
        ID.unique(),
        {
          content,
          user_id: userId,
          created_at: new Date().toISOString(),
        }
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        content: doc.content,
        created_at: doc.created_at,
      };
    },

    subscribeToMessages: (callback: SubscriptionCallback<Message>): UnsubscribeFunction => {
      // Appwrite real-time subscription
      const unsubscribe = this.client.subscribe(
        `databases.${this.databaseId}.collections.messages.documents`,
        (response: any) => {
          if (response.events.includes('databases.*.collections.*.documents.*.create')) {
            const doc = response.payload;
            callback({
              id: doc.$id,
              user_id: doc.user_id,
              content: doc.content,
              created_at: doc.created_at,
            });
          }
        }
      );
      return unsubscribe;
    },

    // Habits
    getHabits: async (userId: string): Promise<Habit[]> => {
      const response = await this.databases.listDocuments(
        this.databaseId,
        'habits',
        [Query.equal('user_id', userId), Query.orderDesc('created_at')]
      );
      return response.documents.map((doc) => ({
        id: doc.$id,
        user_id: doc.user_id,
        name: doc.name,
        description: doc.description,
        frequency: doc.frequency,
        created_at: doc.created_at,
      }));
    },

    createHabit: async (userId: string, habitData: Omit<Habit, 'id' | 'user_id' | 'created_at'>): Promise<Habit> => {
      const doc = await this.databases.createDocument(
        this.databaseId,
        'habits',
        ID.unique(),
        {
          ...habitData,
          user_id: userId,
          created_at: new Date().toISOString(),
        }
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        name: doc.name,
        description: doc.description,
        frequency: doc.frequency,
        created_at: doc.created_at,
      };
    },

    updateHabit: async (id: string, habitData: Partial<Habit>): Promise<Habit> => {
      const doc = await this.databases.updateDocument(
        this.databaseId,
        'habits',
        id,
        habitData
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        name: doc.name,
        description: doc.description,
        frequency: doc.frequency,
        created_at: doc.created_at,
      };
    },

    deleteHabit: async (id: string): Promise<void> => {
      await this.databases.deleteDocument(this.databaseId, 'habits', id);
    },

    // Habit Logs
    getHabitLogs: async (habitId: string): Promise<HabitLog[]> => {
      const response = await this.databases.listDocuments(
        this.databaseId,
        'habit_logs',
        [Query.equal('habit_id', habitId), Query.orderDesc('completed_at')]
      );
      return response.documents.map((doc) => ({
        id: doc.$id,
        habit_id: doc.habit_id,
        user_id: doc.user_id,
        completed_at: doc.completed_at,
        notes: doc.notes,
      }));
    },

    createHabitLog: async (userId: string, habitId: string, notes?: string): Promise<HabitLog> => {
      const doc = await this.databases.createDocument(
        this.databaseId,
        'habit_logs',
        ID.unique(),
        {
          habit_id: habitId,
          user_id: userId,
          notes,
          completed_at: new Date().toISOString(),
        }
      );
      return {
        id: doc.$id,
        habit_id: doc.habit_id,
        user_id: doc.user_id,
        completed_at: doc.completed_at,
        notes: doc.notes,
      };
    },

    deleteHabitLog: async (id: string): Promise<void> => {
      await this.databases.deleteDocument(this.databaseId, 'habit_logs', id);
    },

    // Events
    getEvents: async (userId: string): Promise<Event[]> => {
      const response = await this.databases.listDocuments(
        this.databaseId,
        'events',
        [Query.equal('user_id', userId), Query.orderAsc('start_date')]
      );
      return response.documents.map((doc) => ({
        id: doc.$id,
        user_id: doc.user_id,
        title: doc.title,
        description: doc.description,
        start_date: doc.start_date,
        end_date: doc.end_date,
        all_day: doc.all_day,
        created_at: doc.created_at,
      }));
    },

    createEvent: async (userId: string, eventData: Omit<Event, 'id' | 'user_id' | 'created_at'>): Promise<Event> => {
      const doc = await this.databases.createDocument(
        this.databaseId,
        'events',
        ID.unique(),
        {
          ...eventData,
          user_id: userId,
          created_at: new Date().toISOString(),
        }
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        title: doc.title,
        description: doc.description,
        start_date: doc.start_date,
        end_date: doc.end_date,
        all_day: doc.all_day,
        created_at: doc.created_at,
      };
    },

    updateEvent: async (id: string, eventData: Partial<Event>): Promise<Event> => {
      const doc = await this.databases.updateDocument(
        this.databaseId,
        'events',
        id,
        eventData
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        title: doc.title,
        description: doc.description,
        start_date: doc.start_date,
        end_date: doc.end_date,
        all_day: doc.all_day,
        created_at: doc.created_at,
      };
    },

    deleteEvent: async (id: string): Promise<void> => {
      await this.databases.deleteDocument(this.databaseId, 'events', id);
    },

    // Expenses
    getExpenses: async (userId: string): Promise<Expense[]> => {
      const response = await this.databases.listDocuments(
        this.databaseId,
        'expenses',
        [Query.equal('user_id', userId), Query.orderDesc('date')]
      );
      return response.documents.map((doc) => ({
        id: doc.$id,
        user_id: doc.user_id,
        amount: doc.amount,
        category: doc.category,
        description: doc.description,
        type: doc.type,
        date: doc.date,
        created_at: doc.created_at,
      }));
    },

    createExpense: async (userId: string, expenseData: Omit<Expense, 'id' | 'user_id' | 'created_at'>): Promise<Expense> => {
      const doc = await this.databases.createDocument(
        this.databaseId,
        'expenses',
        ID.unique(),
        {
          ...expenseData,
          user_id: userId,
          created_at: new Date().toISOString(),
        }
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        amount: doc.amount,
        category: doc.category,
        description: doc.description,
        type: doc.type,
        date: doc.date,
        created_at: doc.created_at,
      };
    },

    updateExpense: async (id: string, expenseData: Partial<Expense>): Promise<Expense> => {
      const doc = await this.databases.updateDocument(
        this.databaseId,
        'expenses',
        id,
        expenseData
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        amount: doc.amount,
        category: doc.category,
        description: doc.description,
        type: doc.type,
        date: doc.date,
        created_at: doc.created_at,
      };
    },

    deleteExpense: async (id: string): Promise<void> => {
      await this.databases.deleteDocument(this.databaseId, 'expenses', id);
    },

    // Kanban Boards
    getBoards: async (userId: string): Promise<KanbanBoard[]> => {
      const response = await this.databases.listDocuments(
        this.databaseId,
        'kanban_boards',
        [Query.equal('user_id', userId), Query.orderDesc('created_at')]
      );
      return response.documents.map((doc) => ({
        id: doc.$id,
        user_id: doc.user_id,
        name: doc.name,
        description: doc.description,
        created_at: doc.created_at,
      }));
    },

    createBoard: async (userId: string, boardData: Omit<KanbanBoard, 'id' | 'user_id' | 'created_at'>): Promise<KanbanBoard> => {
      const doc = await this.databases.createDocument(
        this.databaseId,
        'kanban_boards',
        ID.unique(),
        {
          ...boardData,
          user_id: userId,
          created_at: new Date().toISOString(),
        }
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        name: doc.name,
        description: doc.description,
        created_at: doc.created_at,
      };
    },

    updateBoard: async (id: string, boardData: Partial<KanbanBoard>): Promise<KanbanBoard> => {
      const doc = await this.databases.updateDocument(
        this.databaseId,
        'kanban_boards',
        id,
        boardData
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        name: doc.name,
        description: doc.description,
        created_at: doc.created_at,
      };
    },

    deleteBoard: async (id: string): Promise<void> => {
      await this.databases.deleteDocument(this.databaseId, 'kanban_boards', id);
    },

    // Kanban Columns
    getColumns: async (boardId: string): Promise<KanbanColumn[]> => {
      const response = await this.databases.listDocuments(
        this.databaseId,
        'kanban_columns',
        [Query.equal('board_id', boardId), Query.orderAsc('position')]
      );
      return response.documents.map((doc) => ({
        id: doc.$id,
        user_id: doc.user_id,
        board_id: doc.board_id,
        name: doc.name,
        position: doc.position,
        created_at: doc.created_at,
      }));
    },

    createColumn: async (userId: string, boardId: string, columnData: Omit<KanbanColumn, 'id' | 'user_id' | 'board_id' | 'created_at'>): Promise<KanbanColumn> => {
      const doc = await this.databases.createDocument(
        this.databaseId,
        'kanban_columns',
        ID.unique(),
        {
          ...columnData,
          user_id: userId,
          board_id: boardId,
          created_at: new Date().toISOString(),
        }
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        board_id: doc.board_id,
        name: doc.name,
        position: doc.position,
        created_at: doc.created_at,
      };
    },

    updateColumn: async (id: string, columnData: Partial<KanbanColumn>): Promise<KanbanColumn> => {
      const doc = await this.databases.updateDocument(
        this.databaseId,
        'kanban_columns',
        id,
        columnData
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        board_id: doc.board_id,
        name: doc.name,
        position: doc.position,
        created_at: doc.created_at,
      };
    },

    deleteColumn: async (id: string): Promise<void> => {
      await this.databases.deleteDocument(this.databaseId, 'kanban_columns', id);
    },

    // Kanban Cards
    getCards: async (boardId: string): Promise<KanbanCard[]> => {
      const response = await this.databases.listDocuments(
        this.databaseId,
        'kanban_cards',
        [Query.equal('board_id', boardId), Query.orderAsc('position')]
      );
      return response.documents.map((doc) => ({
        id: doc.$id,
        user_id: doc.user_id,
        board_id: doc.board_id,
        column_id: doc.column_id,
        title: doc.title,
        description: doc.description,
        position: doc.position,
        created_at: doc.created_at,
      }));
    },

    createCard: async (userId: string, cardData: Omit<KanbanCard, 'id' | 'user_id' | 'created_at'>): Promise<KanbanCard> => {
      const doc = await this.databases.createDocument(
        this.databaseId,
        'kanban_cards',
        ID.unique(),
        {
          ...cardData,
          user_id: userId,
          created_at: new Date().toISOString(),
        }
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        board_id: doc.board_id,
        column_id: doc.column_id,
        title: doc.title,
        description: doc.description,
        position: doc.position,
        created_at: doc.created_at,
      };
    },

    updateCard: async (id: string, cardData: Partial<KanbanCard>): Promise<KanbanCard> => {
      const doc = await this.databases.updateDocument(
        this.databaseId,
        'kanban_cards',
        id,
        cardData
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        board_id: doc.board_id,
        column_id: doc.column_id,
        title: doc.title,
        description: doc.description,
        position: doc.position,
        created_at: doc.created_at,
      };
    },

    deleteCard: async (id: string): Promise<void> => {
      await this.databases.deleteDocument(this.databaseId, 'kanban_cards', id);
    },

    // Markdown Documents
    getMarkdownDocs: async (userId: string): Promise<MarkdownDocument[]> => {
      const response = await this.databases.listDocuments(
        this.databaseId,
        'markdown_docs',
        [Query.equal('user_id', userId), Query.orderDesc('created_at')]
      );
      return response.documents.map((doc) => ({
        id: doc.$id,
        user_id: doc.user_id,
        title: doc.title,
        content: doc.content,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      }));
    },

    createMarkdownDoc: async (userId: string, docData: Omit<MarkdownDocument, 'id' | 'user_id' | 'created_at'>): Promise<MarkdownDocument> => {
      const doc = await this.databases.createDocument(
        this.databaseId,
        'markdown_docs',
        ID.unique(),
        {
          ...docData,
          user_id: userId,
          created_at: new Date().toISOString(),
        }
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        title: doc.title,
        content: doc.content,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      };
    },

    updateMarkdownDoc: async (id: string, docData: Partial<MarkdownDocument>): Promise<MarkdownDocument> => {
      const doc = await this.databases.updateDocument(
        this.databaseId,
        'markdown_docs',
        id,
        { ...docData, updated_at: new Date().toISOString() }
      );
      return {
        id: doc.$id,
        user_id: doc.user_id,
        title: doc.title,
        content: doc.content,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      };
    },

    deleteMarkdownDoc: async (id: string): Promise<void> => {
      await this.databases.deleteDocument(this.databaseId, 'markdown_docs', id);
    },
  };

  storage = {
    uploadFile: async (bucket: string, path: string, file: File): Promise<UploadedFile> => {
      const uploadedFile = await this.storage.createFile(
        this.bucketsId,
        ID.unique(),
        file
      );
      const url = `${this.client.config.endpoint}/storage/buckets/${this.bucketsId}/files/${uploadedFile.$id}/view?project=${this.client.config.project}`;
      return {
        path: uploadedFile.$id,
        url,
        name: file.name,
      };
    },

    deleteFile: async (bucket: string, path: string): Promise<void> => {
      await this.storage.deleteFile(this.bucketsId, path);
    },

    getPublicUrl: (bucket: string, path: string): string => {
      return `${this.client.config.endpoint}/storage/buckets/${this.bucketsId}/files/${path}/view?project=${this.client.config.project}`;
    },

    listFiles: async (bucket: string, path: string = ''): Promise<UploadedFile[]> => {
      const response = await this.storage.listFiles(this.bucketsId);
      return response.files.map((file) => ({
        path: file.$id,
        url: `${this.client.config.endpoint}/storage/buckets/${this.bucketsId}/files/${file.$id}/view?project=${this.client.config.project}`,
        name: file.name,
      }));
    },
  };
}
