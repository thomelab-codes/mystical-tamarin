import { useState, useEffect, useRef } from 'react';
import { account, databases, client } from '@/integrations/appwrite/client';
import { appwriteConfig } from '@/integrations/appwrite/config';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';
import { ID, Query, Models } from 'appwrite';

// Define the schema for the new message form
const messageFormSchema = z.object({
  content: z.string().min(1, { message: "Message cannot be empty." }),
});

type MessageFormValues = z.infer<typeof messageFormSchema>;

interface Message {
  $id: string;
  user_id: string;
  content: string;
  $createdAt: string;
}

const Messaging = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      content: '',
    },
  });

  // Function to fetch messages
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.messages,
        [
          Query.orderAsc('$createdAt'),
          Query.limit(50)
        ]
      );

      setMessages(response.documents as unknown as Message[]);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      showError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user and initial messages on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        await fetchMessages();
      } catch (error) {
        setUser(null);
        setLoading(false);
      }
    };

    fetchUser();

    // Set up real-time subscription for new messages
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.collections.messages}.documents`,
      (response: any) => {
        console.log('Real-time event:', response);

        // Handle document creation
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const newMessage = response.payload as Message;
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      }
    );

    // Clean up subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-scroll to the latest message when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // Handle new message submission
  async function onSubmit(values: MessageFormValues) {
    if (!user) {
      showError('You must be logged in to send messages.');
      return;
    }

    try {
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.messages,
        ID.unique(),
        {
          user_id: user.$id,
          content: values.content,
        }
      );

      // Message sent successfully, real-time subscription will add it to the list
      form.reset();
    } catch (error: any) {
      console.error('Error sending message:', error);
      showError('Failed to send message.');
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading messages...</div>;
  }

  if (!user) {
     return <div className="flex items-center justify-center min-h-screen">Please log in to view messages.</div>;
  }

  // Determine if the current user sent the message
  const isCurrentUser = (messageUserId: string) => user && messageUserId === user.id;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Mini Apps</h3>
        <ul className="flex-grow space-y-2">
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
      <div className="flex-1 p-8 flex flex-col h-screen"> {/* Use flex-col and h-screen for layout */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Public Chat</h1>
          <p className="text-xl text-gray-600 mt-4">Chat with other logged-in users.</p>
        </div>

        {/* Message Display Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white rounded shadow-md mb-4 space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-600">No messages yet. Send one below!</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.$id}
                className={cn(
                  "flex items-start space-x-3",
                  isCurrentUser(message.user_id) ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-xs p-3 rounded-lg",
                    isCurrentUser(message.user_id)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-800"
                  )}
                >
                  <p className="text-sm font-semibold mb-1">
                    User ID: {message.user_id}
                  </p>
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} /> {/* Empty div for scrolling */}
        </div>

        {/* New Message Form */}
        <div className="bg-white p-4 rounded shadow-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Type your message..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Messaging;