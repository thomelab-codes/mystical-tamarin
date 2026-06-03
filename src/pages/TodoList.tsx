import { useState, useEffect } from 'react';
import { account, databases } from '@/integrations/appwrite/client';
import { appwriteConfig } from '@/integrations/appwrite/config';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Trash2, CheckCircle, Circle, Edit, CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ID, Query, Models } from 'appwrite';

// Define the schema for the todo form (used for both create and edit)
const todoFormSchema = z.object({
  task: z.string().min(1, { message: "Task cannot be empty." }),
  due_date: z.date().nullable().optional(), // Add due_date as optional Date or null
});

type TodoFormValues = z.infer<typeof todoFormSchema>;

interface Todo {
  $id: string;
  user_id: string;
  task: string;
  is_completed: boolean;
  $createdAt: string;
  due_date: string | null;
}

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      task: '',
      due_date: undefined, // Use undefined for initial state of optional date
    },
  });

  const editForm = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      task: '',
      due_date: undefined,
    },
    values: editingTodo ? {
      task: editingTodo.task,
      due_date: editingTodo.due_date ? new Date(editingTodo.due_date) : undefined, // Convert string date to Date object
    } : undefined, // Populate edit form when editingTodo changes
  });

  // Fetch user and todos on component mount
  useEffect(() => {
    const fetchUserAndTodos = async () => {
      setLoading(true);
      try {
        const currentUser = await account.get();
        setUser(currentUser);

        if (currentUser) {
          const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.todos,
            [
              Query.equal('user_id', currentUser.$id),
              Query.orderDesc('$createdAt')
            ]
          );

          setTodos(response.documents as unknown as Todo[]);
        }
      } catch (error: any) {
        console.error('Error fetching todos:', error);
        showError('Failed to load todos.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndTodos();
  }, []);

  // Handle new todo submission
  async function onSubmit(values: TodoFormValues) {
    if (!user) {
      showError('You must be logged in to create todos.');
      return;
    }

    try {
      const newTodo = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.todos,
        ID.unique(),
        {
          user_id: user.$id,
          task: values.task,
          is_completed: false,
          due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : null,
        }
      );

      showSuccess('Todo created successfully!');
      setTodos([newTodo as unknown as Todo, ...todos]);
      form.reset();
    } catch (error: any) {
      console.error('Error creating todo:', error);
      showError('Failed to create todo.');
    }
  }

  // Handle todo deletion
  const handleDeleteTodo = async (todoId: string) => {
    if (!user) {
      showError('You must be logged in to delete todos.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.todos,
          todoId
        );

        showSuccess('Todo deleted successfully!');
        setTodos(todos.filter(todo => todo.$id !== todoId));
      } catch (error: any) {
        console.error('Error deleting todo:', error);
        showError('Failed to delete todo.');
      }
    }
  };

  // Handle toggling todo completion status
  const handleToggleComplete = async (todo: Todo) => {
    if (!user) {
      showError('You must be logged in to update todos.');
      return;
    }

    try {
      const updatedTodo = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.todos,
        todo.$id,
        { is_completed: !todo.is_completed }
      );

      showSuccess(`Todo marked as ${updatedTodo.is_completed ? 'completed' : 'incomplete'}!`);
      setTodos(todos.map(t => t.$id === updatedTodo.$id ? updatedTodo as unknown as Todo : t));
    } catch (error: any) {
      console.error('Error updating todo:', error);
      showError('Failed to update todo.');
    }
  };

  // Open edit dialog and set the todo to be edited
  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setIsEditDialogOpen(true);
  };

  // Handle edit form submission
  async function onEditSubmit(values: TodoFormValues) {
    if (!user || !editingTodo) {
      showError('Cannot update todo.');
      return;
    }

    try {
      const updatedTodo = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.todos,
        editingTodo.$id,
        {
          task: values.task,
          due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : null,
        }
      );

      showSuccess('Todo updated successfully!');
      setTodos(todos.map(t => t.$id === updatedTodo.$id ? updatedTodo as unknown as Todo : t));
      setIsEditDialogOpen(false);
      setEditingTodo(null);
    } catch (error: any) {
      console.error('Error updating todo:', error);
      showError('Failed to update todo.');
    }
  }

  // Close edit dialog and clear editing state
  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingTodo(null);
    editForm.reset(); // Reset the edit form
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading todos...</div>;
  }

  if (!user) {
     return <div className="flex items-center justify-center min-h-screen">Please log in to view your todos.</div>;
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
          <h1 className="text-4xl font-bold mb-2">Your To-Do List</h1>
          <p className="text-xl text-gray-600 mt-4">Manage your tasks.</p>
        </div>

        {/* New Todo Form */}
        <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Add New Task</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="task"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a new task..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined} // Handle null/undefined
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Add Task</Button>
            </form>
          </Form>
        </div>

        {/* Todo List */}
        <div className="max-w-md mx-auto space-y-4">
          {todos.length === 0 ? (
            <p className="text-center text-gray-600">No tasks yet. Add one above!</p>
          ) : (
            todos.map((todo) => (
              <Card key={todo.$id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3 flex-grow">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleComplete(todo)}
                      aria-label={todo.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {todo.is_completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-500" />
                      )}
                    </Button>
                    <div className="flex flex-col">
                       <span className={cn(todo.is_completed ? 'line-through text-gray-500' : '')}>
                         {todo.task}
                       </span>
                       {todo.due_date && (
                         <span className="text-xs text-gray-500 mt-1">
                           Due: {format(new Date(todo.due_date), 'PPP')}
                         </span>
                       )}
                    </div>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                     <Button
                       variant="outline"
                       size="icon"
                       onClick={() => handleEditClick(todo)}
                       aria-label="Edit todo"
                     >
                       <Edit className="h-4 w-4" />
                     </Button>
                     <Button
                       variant="destructive"
                       size="icon"
                       onClick={() => handleDeleteTodo(todo.$id)}
                       aria-label="Delete todo"
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Todo Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit To-Do</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="task"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task</FormLabel>
                      <FormControl>
                        <Input placeholder="Edit task..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={editForm.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined} // Handle null/undefined
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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

export default TodoList;