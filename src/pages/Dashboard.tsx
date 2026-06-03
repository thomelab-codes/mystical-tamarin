import { account, databases } from '@/integrations/appwrite/client';
import { appwriteConfig } from '@/integrations/appwrite/config';
import { Button, buttonVariants } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { ID, Query, Models } from 'appwrite';

// Define the schema for the profile update form
const profileFormSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface Profile {
  first_name: string | null;
  last_name: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileDocId, setProfileDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.profiles,
        [Query.equal('user_id', userId)]
      );

      if (response.documents.length > 0) {
        const doc = response.documents[0];
        setProfileDocId(doc.$id);
        setProfile({
          first_name: doc.first_name || null,
          last_name: doc.last_name || null,
        });
      } else {
        // No profile exists, create one
        const newProfile = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.profiles,
          ID.unique(),
          {
            user_id: userId,
            first_name: null,
            last_name: null,
          }
        );
        setProfileDocId(newProfile.$id);
        setProfile({
          first_name: null,
          last_name: null,
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      showError('Failed to load profile data.');
      setProfile(null);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        await fetchProfile(currentUser.$id);
      } catch (error) {
        // If no session, redirect to login
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Initialize form with profile data once loaded
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
    },
    values: { // Keep form values synced with profile state
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
    },
  });

  // Handle profile update form submission
  async function onSubmit(values: ProfileFormValues) {
    if (!user || !profileDocId) return;

    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.profiles,
        profileDocId,
        {
          first_name: values.first_name || null,
          last_name: values.last_name || null,
        }
      );

      showSuccess('Profile updated successfully!');
      await fetchProfile(user.$id);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile.');
    }
  }

  // Handle user logout
  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      showSuccess('Logged out successfully!');
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      showError('Failed to log out.');
    }
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
        <div className="mt-auto">
           <Button onClick={handleLogout} className="w-full">Logout</Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome to Your Portal, {profile?.first_name || user.name || user.email}!
          </h1>
          {profile && profile.first_name && profile.last_name && (
             <p className="text-lg text-gray-700">({user.email})</p>
          )}
           {!profile?.first_name && !profile?.last_name && (
             <p className="text-lg text-gray-700">({user.email})</p>
          )}
          <p className="text-xl text-gray-600 mt-4">This is your central dashboard.</p>
        </div>

        {/* Profile Update Form */}
        <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Update Profile</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Update Profile</Button>
            </form>
          </Form>
        </div>

        {/* Placeholder for other dashboard content or mini-apps */}
        <div className="mt-8 bg-white p-6 rounded shadow-md max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Mini App Content Area</h2>
            <p className="text-gray-600">This is where content for your mini-apps will appear.</p>
            {/* Add components for mini-apps here */}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;