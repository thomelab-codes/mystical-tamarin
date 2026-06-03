import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Firestore,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
  listAll,
  FirebaseStorage,
} from 'firebase/storage';
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

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export class FirebaseBackendService implements IBackendService {
  type = 'firebase' as const;
  private app: FirebaseApp;
  private auth: Auth;
  private db: Firestore;
  private storage: FirebaseStorage;

  constructor(config: FirebaseConfig) {
    this.app = initializeApp(config);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);
  }

  private mapUser(user: FirebaseUser | null): User | null {
    if (!user) return null;
    return {
      id: user.uid,
      email: user.email || '',
    };
  }

  private toDate(timestamp: any): string {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }
    if (timestamp?.toDate) {
      return timestamp.toDate().toISOString();
    }
    return timestamp || new Date().toISOString();
  }

  auth = {
    signIn: async (email: string, password: string): Promise<AuthResponse> => {
      try {
        const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
        return {
          user: this.mapUser(userCredential.user),
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
        const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
        // Create profile document
        await addDoc(collection(this.db, 'profiles'), {
          user_id: userCredential.user.uid,
          created_at: serverTimestamp(),
        });
        return {
          user: this.mapUser(userCredential.user),
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
        await firebaseSignOut(this.auth);
        return { error: null };
      } catch (error) {
        return { error: error as Error };
      }
    },

    getCurrentUser: async (): Promise<User | null> => {
      return this.mapUser(this.auth.currentUser);
    },

    onAuthStateChange: (callback: (user: User | null) => void): UnsubscribeFunction => {
      return onAuthStateChanged(this.auth, (user) => {
        callback(this.mapUser(user));
      });
    },
  };

  database = {
    // Profiles
    getProfile: async (userId: string): Promise<Profile | null> => {
      const q = query(collection(this.db, 'profiles'), where('user_id', '==', userId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const data = snapshot.docs[0].data();
      return {
        id: snapshot.docs[0].id,
        user_id: data.user_id,
        first_name: data.first_name,
        last_name: data.last_name,
        created_at: this.toDate(data.created_at),
        updated_at: this.toDate(data.updated_at),
      };
    },

    updateProfile: async (userId: string, profileData: Partial<Profile>): Promise<Profile | null> => {
      const q = query(collection(this.db, 'profiles'), where('user_id', '==', userId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, { ...profileData, updated_at: serverTimestamp() });
      const updatedDoc = await getDoc(docRef);
      const data = updatedDoc.data()!;
      return {
        id: updatedDoc.id,
        user_id: data.user_id,
        first_name: data.first_name,
        last_name: data.last_name,
        created_at: this.toDate(data.created_at),
        updated_at: this.toDate(data.updated_at),
      };
    },

    // Notes
    getNotes: async (userId: string): Promise<Note[]> => {
      const q = query(
        collection(this.db, 'notes'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          user_id: data.user_id,
          title: data.title,
          content: data.content,
          created_at: this.toDate(data.created_at),
          updated_at: this.toDate(data.updated_at),
        };
      });
    },

    createNote: async (userId: string, noteData: Omit<Note, 'id' | 'user_id' | 'created_at'>): Promise<Note> => {
      const docRef = await addDoc(collection(this.db, 'notes'), {
        ...noteData,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      const doc = await getDoc(docRef);
      const data = doc.data()!;
      return {
        id: doc.id,
        user_id: data.user_id,
        title: data.title,
        content: data.content,
        created_at: this.toDate(data.created_at),
        updated_at: this.toDate(data.updated_at),
      };
    },

    updateNote: async (id: string, noteData: Partial<Note>): Promise<Note> => {
      const docRef = doc(this.db, 'notes', id);
      await updateDoc(docRef, { ...noteData, updated_at: serverTimestamp() });
      const updatedDoc = await getDoc(docRef);
      const data = updatedDoc.data()!;
      return {
        id: updatedDoc.id,
        user_id: data.user_id,
        title: data.title,
        content: data.content,
        created_at: this.toDate(data.created_at),
        updated_at: this.toDate(data.updated_at),
      };
    },

    deleteNote: async (id: string): Promise<void> => {
      await deleteDoc(doc(this.db, 'notes', id));
    },

    // Todos
    getTodos: async (userId: string): Promise<Todo[]> => {
      const q = query(
        collection(this.db, 'todos'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          user_id: data.user_id,
          task: data.task,
          is_completed: data.is_completed,
          due_date: data.due_date,
          created_at: this.toDate(data.created_at),
          updated_at: this.toDate(data.updated_at),
        };
      });
    },

    createTodo: async (userId: string, todoData: Omit<Todo, 'id' | 'user_id' | 'created_at'>): Promise<Todo> => {
      const docRef = await addDoc(collection(this.db, 'todos'), {
        ...todoData,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      const doc = await getDoc(docRef);
      const data = doc.data()!;
      return {
        id: doc.id,
        user_id: data.user_id,
        task: data.task,
        is_completed: data.is_completed,
        due_date: data.due_date,
        created_at: this.toDate(data.created_at),
        updated_at: this.toDate(data.updated_at),
      };
    },

    updateTodo: async (id: string, todoData: Partial<Todo>): Promise<Todo> => {
      const docRef = doc(this.db, 'todos', id);
      await updateDoc(docRef, { ...todoData, updated_at: serverTimestamp() });
      const updatedDoc = await getDoc(docRef);
      const data = updatedDoc.data()!;
      return {
        id: updatedDoc.id,
        user_id: data.user_id,
        task: data.task,
        is_completed: data.is_completed,
        due_date: data.due_date,
        created_at: this.toDate(data.created_at),
        updated_at: this.toDate(data.updated_at),
      };
    },

    deleteTodo: async (id: string): Promise<void> => {
      await deleteDoc(doc(this.db, 'todos', id));
    },

    // Messages
    getMessages: async (): Promise<Message[]> => {
      const q = query(collection(this.db, 'messages'), orderBy('created_at', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          user_id: data.user_id,
          content: data.content,
          created_at: this.toDate(data.created_at),
        };
      });
    },

    createMessage: async (userId: string, content: string): Promise<Message> => {
      const docRef = await addDoc(collection(this.db, 'messages'), {
        content,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      const doc = await getDoc(docRef);
      const data = doc.data()!;
      return {
        id: doc.id,
        user_id: data.user_id,
        content: data.content,
        created_at: this.toDate(data.created_at),
      };
    },

    subscribeToMessages: (callback: SubscriptionCallback<Message>): UnsubscribeFunction => {
      const q = query(collection(this.db, 'messages'), orderBy('created_at', 'asc'));
      return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            callback({
              id: change.doc.id,
              user_id: data.user_id,
              content: data.content,
              created_at: this.toDate(data.created_at),
            });
          }
        });
      });
    },

    // Habits
    getHabits: async (userId: string): Promise<Habit[]> => {
      const q = query(
        collection(this.db, 'habits'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: this.toDate(doc.data().created_at),
      })) as Habit[];
    },

    createHabit: async (userId: string, habitData: Omit<Habit, 'id' | 'user_id' | 'created_at'>): Promise<Habit> => {
      const docRef = await addDoc(collection(this.db, 'habits'), {
        ...habitData,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      const doc = await getDoc(docRef);
      return {
        id: doc.id,
        ...doc.data(),
        created_at: this.toDate(doc.data()!.created_at),
      } as Habit;
    },

    updateHabit: async (id: string, habitData: Partial<Habit>): Promise<Habit> => {
      const docRef = doc(this.db, 'habits', id);
      await updateDoc(docRef, habitData);
      const updatedDoc = await getDoc(docRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        created_at: this.toDate(updatedDoc.data()!.created_at),
      } as Habit;
    },

    deleteHabit: async (id: string): Promise<void> => {
      await deleteDoc(doc(this.db, 'habits', id));
    },

    // Habit Logs
    getHabitLogs: async (habitId: string): Promise<HabitLog[]> => {
      const q = query(
        collection(this.db, 'habit_logs'),
        where('habit_id', '==', habitId),
        orderBy('completed_at', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        completed_at: this.toDate(doc.data().completed_at),
      })) as HabitLog[];
    },

    createHabitLog: async (userId: string, habitId: string, notes?: string): Promise<HabitLog> => {
      const docRef = await addDoc(collection(this.db, 'habit_logs'), {
        habit_id: habitId,
        user_id: userId,
        notes,
        completed_at: serverTimestamp(),
      });
      const doc = await getDoc(docRef);
      return {
        id: doc.id,
        ...doc.data(),
        completed_at: this.toDate(doc.data()!.completed_at),
      } as HabitLog;
    },

    deleteHabitLog: async (id: string): Promise<void> => {
      await deleteDoc(doc(this.db, 'habit_logs', id));
    },

    // Events
    getEvents: async (userId: string): Promise<Event[]> => {
      const q = query(
        collection(this.db, 'events'),
        where('user_id', '==', userId),
        orderBy('start_date', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: this.toDate(doc.data().created_at),
      })) as Event[];
    },

    createEvent: async (userId: string, eventData: Omit<Event, 'id' | 'user_id' | 'created_at'>): Promise<Event> => {
      const docRef = await addDoc(collection(this.db, 'events'), {
        ...eventData,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      const doc = await getDoc(docRef);
      return {
        id: doc.id,
        ...doc.data(),
        created_at: this.toDate(doc.data()!.created_at),
      } as Event;
    },

    updateEvent: async (id: string, eventData: Partial<Event>): Promise<Event> => {
      const docRef = doc(this.db, 'events', id);
      await updateDoc(docRef, eventData);
      const updatedDoc = await getDoc(docRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        created_at: this.toDate(updatedDoc.data()!.created_at),
      } as Event;
    },

    deleteEvent: async (id: string): Promise<void> => {
      await deleteDoc(doc(this.db, 'events', id));
    },

    // Expenses
    getExpenses: async (userId: string): Promise<Expense[]> => {
      const q = query(
        collection(this.db, 'expenses'),
        where('user_id', '==', userId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: this.toDate(doc.data().created_at),
      })) as Expense[];
    },

    createExpense: async (userId: string, expenseData: Omit<Expense, 'id' | 'user_id' | 'created_at'>): Promise<Expense> => {
      const docRef = await addDoc(collection(this.db, 'expenses'), {
        ...expenseData,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      const doc = await getDoc(docRef);
      return {
        id: doc.id,
        ...doc.data(),
        created_at: this.toDate(doc.data()!.created_at),
      } as Expense;
    },

    updateExpense: async (id: string, expenseData: Partial<Expense>): Promise<Expense> => {
      const docRef = doc(this.db, 'expenses', id);
      await updateDoc(docRef, expenseData);
      const updatedDoc = await getDoc(docRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        created_at: this.toDate(updatedDoc.data()!.created_at),
      } as Expense;
    },

    deleteExpense: async (id: string): Promise<void> => {
      await deleteDoc(doc(this.db, 'expenses', id));
    },

    // Kanban Boards
    getBoards: async (userId: string): Promise<KanbanBoard[]> => {
      const q = query(
        collection(this.db, 'kanban_boards'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: this.toDate(doc.data().created_at),
      })) as KanbanBoard[];
    },

    createBoard: async (userId: string, boardData: Omit<KanbanBoard, 'id' | 'user_id' | 'created_at'>): Promise<KanbanBoard> => {
      const docRef = await addDoc(collection(this.db, 'kanban_boards'), {
        ...boardData,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      const doc = await getDoc(docRef);
      return {
        id: doc.id,
        ...doc.data(),
        created_at: this.toDate(doc.data()!.created_at),
      } as KanbanBoard;
    },

    updateBoard: async (id: string, boardData: Partial<KanbanBoard>): Promise<KanbanBoard> => {
      const docRef = doc(this.db, 'kanban_boards', id);
      await updateDoc(docRef, boardData);
      const updatedDoc = await getDoc(docRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        created_at: this.toDate(updatedDoc.data()!.created_at),
      } as KanbanBoard;
    },

    deleteBoard: async (id: string): Promise<void> => {
      await deleteDoc(doc(this.db, 'kanban_boards', id));
    },

    // Kanban Columns
    getColumns: async (boardId: string): Promise<KanbanColumn[]> => {
      const q = query(
        collection(this.db, 'kanban_columns'),
        where('board_id', '==', boardId),
        orderBy('position', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: this.toDate(doc.data().created_at),
      })) as KanbanColumn[];
    },

    createColumn: async (userId: string, boardId: string, columnData: Omit<KanbanColumn, 'id' | 'user_id' | 'board_id' | 'created_at'>): Promise<KanbanColumn> => {
      const docRef = await addDoc(collection(this.db, 'kanban_columns'), {
        ...columnData,
        user_id: userId,
        board_id: boardId,
        created_at: serverTimestamp(),
      });
      const doc = await getDoc(docRef);
      return {
        id: doc.id,
        ...doc.data(),
        created_at: this.toDate(doc.data()!.created_at),
      } as KanbanColumn;
    },

    updateColumn: async (id: string, columnData: Partial<KanbanColumn>): Promise<KanbanColumn> => {
      const docRef = doc(this.db, 'kanban_columns', id);
      await updateDoc(docRef, columnData);
      const updatedDoc = await getDoc(docRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        created_at: this.toDate(updatedDoc.data()!.created_at),
      } as KanbanColumn;
    },

    deleteColumn: async (id: string): Promise<void> => {
      await deleteDoc(doc(this.db, 'kanban_columns', id));
    },

    // Kanban Cards
    getCards: async (boardId: string): Promise<KanbanCard[]> => {
      const q = query(
        collection(this.db, 'kanban_cards'),
        where('board_id', '==', boardId),
        orderBy('position', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: this.toDate(doc.data().created_at),
      })) as KanbanCard[];
    },

    createCard: async (userId: string, cardData: Omit<KanbanCard, 'id' | 'user_id' | 'created_at'>): Promise<KanbanCard> => {
      const docRef = await addDoc(collection(this.db, 'kanban_cards'), {
        ...cardData,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      const doc = await getDoc(docRef);
      return {
        id: doc.id,
        ...doc.data(),
        created_at: this.toDate(doc.data()!.created_at),
      } as KanbanCard;
    },

    updateCard: async (id: string, cardData: Partial<KanbanCard>): Promise<KanbanCard> => {
      const docRef = doc(this.db, 'kanban_cards', id);
      await updateDoc(docRef, cardData);
      const updatedDoc = await getDoc(docRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        created_at: this.toDate(updatedDoc.data()!.created_at),
      } as KanbanCard;
    },

    deleteCard: async (id: string): Promise<void> => {
      await deleteDoc(doc(this.db, 'kanban_cards', id));
    },

    // Markdown Documents
    getMarkdownDocs: async (userId: string): Promise<MarkdownDocument[]> => {
      const q = query(
        collection(this.db, 'markdown_docs'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: this.toDate(doc.data().created_at),
        updated_at: this.toDate(doc.data().updated_at),
      })) as MarkdownDocument[];
    },

    createMarkdownDoc: async (userId: string, docData: Omit<MarkdownDocument, 'id' | 'user_id' | 'created_at'>): Promise<MarkdownDocument> => {
      const docRef = await addDoc(collection(this.db, 'markdown_docs'), {
        ...docData,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      const doc = await getDoc(docRef);
      return {
        id: doc.id,
        ...doc.data(),
        created_at: this.toDate(doc.data()!.created_at),
        updated_at: this.toDate(doc.data()!.updated_at),
      } as MarkdownDocument;
    },

    updateMarkdownDoc: async (id: string, docData: Partial<MarkdownDocument>): Promise<MarkdownDocument> => {
      const docRef = doc(this.db, 'markdown_docs', id);
      await updateDoc(docRef, { ...docData, updated_at: serverTimestamp() });
      const updatedDoc = await getDoc(docRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        created_at: this.toDate(updatedDoc.data()!.created_at),
        updated_at: this.toDate(updatedDoc.data()!.updated_at),
      } as MarkdownDocument;
    },

    deleteMarkdownDoc: async (id: string): Promise<void> => {
      await deleteDoc(doc(this.db, 'markdown_docs', id));
    },
  };

  storage = {
    uploadFile: async (bucket: string, path: string, file: File): Promise<UploadedFile> => {
      const storageRef = ref(this.storage, `${bucket}/${path}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return {
        path,
        url,
        name: file.name,
      };
    },

    deleteFile: async (bucket: string, path: string): Promise<void> => {
      const storageRef = ref(this.storage, `${bucket}/${path}`);
      await deleteObject(storageRef);
    },

    getPublicUrl: (bucket: string, path: string): string => {
      // Firebase requires async call to get download URL
      // This is a placeholder - actual URL should be fetched async
      return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
    },

    listFiles: async (bucket: string, path: string = ''): Promise<UploadedFile[]> => {
      const storageRef = ref(this.storage, `${bucket}/${path}`);
      const result = await listAll(storageRef);
      const files = await Promise.all(
        result.items.map(async (item) => ({
          path: item.fullPath,
          url: await getDownloadURL(item),
          name: item.name,
        }))
      );
      return files;
    },
  };
}
