import { useState, useEffect } from 'react';
import { account, databases } from '@/integrations/appwrite/client';
import { appwriteConfig } from '@/integrations/appwrite/config';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ID, Query, Models } from 'appwrite';

// Define the schema for the note form (used for both create and edit)
const noteFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  content: z.string().optional(),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

interface Note {
  $id: string;
  user_id: string;
  title: string;
  content: string | null;
  $createdAt: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const editForm = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: '',
      content: '',
    },
    values: editingNote ? { title: editingNote.title, content: editingNote.content || '' } : undefined, // Populate edit form when editingNote changes
  });

  // Fetch user and notes on component mount
  useEffect(() => {
    const fetchUserAndNotes = async () => {
      setLoading(true);
      try {
        const currentUser = await account.get();
        setUser(currentUser);

        if (currentUser) {
          const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.notes,
            [
              Query.equal('user_id', currentUser.$id),
              Query.orderDesc('$createdAt')
            ]
          );

          setNotes(response.documents as unknown as Note[]);
        }
      } catch (error: any) {
        console.error('Error fetching notes:', error);
        showError('Failed to load notes.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndNotes();
  }, []);

  // Handle new note submission
  async function onSubmit(values: NoteFormValues) {
    if (!user) {
      showError('You must be logged in to create notes.');
      return;
    }

    try {
      const newNote = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.notes,
        ID.unique(),
        {
          user_id: user.$id,
          title: values.title,
          content: values.content || null,
        }
      );

      showSuccess('Note created successfully!');
      setNotes([newNote as unknown as Note, ...notes]);
      form.reset();
    } catch (error: any) {
      console.error('Error creating note:', error);
      showError('Failed to create note.');
    }
  }

  // Handle note deletion
  const handleDeleteNote = async (noteId: string) => {
    if (!user) {
      showError('You must be logged in to delete notes.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.notes,
          noteId
        );

        showSuccess('Note deleted successfully!');
        setNotes(notes.filter(note => note.$id !== noteId));
      } catch (error: any) {
        console.error('Error deleting note:', error);
        showError('Failed to delete note.');
      }
    }
  };

  // Open edit dialog and set the note to be edited
  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setIsEditDialogOpen(true);
  };

  // Handle edit form submission
  async function onEditSubmit(values: NoteFormValues) {
    if (!user || !editingNote) {
      showError('Cannot update note.');
      return;
    }

    try {
      const updatedNote = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.notes,
        editingNote.$id,
        {
          title: values.title,
          content: values.content || null,
        }
      );

      showSuccess('Note updated successfully!');
      setNotes(notes.map(note => note.$id === updatedNote.$id ? updatedNote as unknown as Note : note));
      setIsEditDialogOpen(false);
      setEditingNote(null);
    } catch (error: any) {
      console.error('Error updating note:', error);
      showError('Failed to update note.');
    }
  }

  // Close edit dialog and clear editing state
  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingNote(null);
    editForm.reset(); // Reset the edit form
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading notes...</div>;
  }

  if (!user) {
     return <div className="flex items-center justify-center min-h-screen">Please log in to view notes.</div>;
  }


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Mini Apps</h3>
        <ul className="flex-grow space-y-2"> {/* Added space-y for spacing between buttons */}
          <li>
            <Link
              to="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/notes"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Notes
            </Link>
          </li>
           <li>
            <Link
              to="/gallery"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Gallery
            </Link>
          </li>
           <li>
            <Link
              to="/messaging"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Messaging
            </Link>
          </li>
           <li>
            <Link
              to="/calculator"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Calculator
            </Link>
          </li>
           <li>
            <Link
              to="/todo"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              To-Do List
            </Link>
          </li>
          {/* Add links for future mini-apps here */}
        </ul>
        {/* Logout button can be added here or in a shared layout */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Notes</h1>
          <p className="text-xl text-gray-600 mt-4">Create and manage your personal notes.</p>
        </div>

        {/* New Note Form */}
        <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Create New Note</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Note Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Note content..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Save Note</Button>
            </form>
          </Form>
        </div>

        {/* Notes List */}
        <div className="max-w-md mx-auto space-y-4">
          {notes.length === 0 ? (
            <p className="text-center text-gray-600">No notes yet. Create one above!</p>
          ) : (
            notes.map((note) => (
              <Card key={note.$id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{note.title}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditClick(note)}
                      aria-label="Edit note"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteNote(note.$id)}
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{note.content}</p>
                  <p className="text-sm text-gray-500 mt-2">Created: {new Date(note.$createdAt).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Note Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Note Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Note content..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleEditDialogClose}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default Notes;