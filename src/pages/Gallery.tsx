import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Upload, Trash2 } from 'lucide-react'; // Import icons
import { User } from '@supabase/supabase-js';

interface ImageObject {
  name: string;
  id: string; // Supabase object ID
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: Record<string, unknown>;
  // Add other properties if needed
}

const Gallery = () => {
  const [images, setImages] = useState<ImageObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [uploading, setUploading] = useState(false);

  // Function to fetch images for the logged-in user
  const fetchImages = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from('images')
      .list(`${userId}/`, { // List objects within the user's folder
        limit: 100, // Adjust limit as needed
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Error fetching images:', error);
      showError('Failed to load images.');
      setImages([]); // Clear images on error
    } else if (data) {
      // Filter out any potential directory entries if necessary (list can return folders)
      const imageFiles = data.filter(item => item.id !== null);
      setImages(imageFiles);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchImages(user.id);
      } else {
        setLoading(false); // Stop loading if no user
      }
    };

    fetchUser();

    // Listen for auth state changes (e.g., logout) - optional, but good practice
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setImages([]); // Clear images on logout
      } else {
        setUser(session.user);
        fetchImages(session.user.id); // Re-fetch images on login
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      showError('Please select a file to upload.');
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`; // Generate a unique file name
    const filePath = `${user.id}/${fileName}`; // Store in user's folder

    setUploading(true);

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      showError('Failed to upload image.');
    } else {
      showSuccess('Image uploaded successfully!');
      // Re-fetch images to update the list
      fetchImages(user.id);
    }

    setUploading(false);
    // Clear the file input value so the same file can be uploaded again if needed
    event.target.value = '';
  };

  // Handle image deletion
  const handleDeleteImage = async (imageName: string) => {
    if (!user) {
      showError('You must be logged in to delete images.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this image?')) {
      const filePath = `${user.id}/${imageName}`; // Construct the full path

      const { error } = await supabase.storage
        .from('images')
        .remove([filePath]); // Remove expects an array of file paths

      if (error) {
        console.error('Error deleting image:', error);
        showError('Failed to delete image.');
      } else {
        showSuccess('Image deleted successfully!');
        // Remove the deleted image from the state
        setImages(images.filter(image => image.name !== imageName));
      }
    }
  };

  // Function to get the public URL of an image
  const getImageUrl = (imageName: string): string => {
     if (!user) return ''; // Cannot get URL without user ID
     const filePath = `${user.id}/${imageName}`;
     const { data } = supabase.storage.from('images').getPublicUrl(filePath);
     return data.publicUrl;
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading gallery...</div>;
  }

  if (!user) {
     return <div className="flex items-center justify-center min-h-screen">Please log in to view the gallery.</div>;
  }

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
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Image Gallery</h1>
          <p className="text-xl text-gray-600 mt-4">Upload and view your images.</p>
        </div>

        {/* Image Upload Section */}
        <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Upload Image</h2>
          <div className="flex items-center space-x-2">
            <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
            {uploading && <p>Uploading...</p>}
          </div>
        </div>

        {/* Image Gallery Display */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.length === 0 ? (
            <p className="col-span-full text-center text-gray-600">No images yet. Upload one above!</p>
          ) : (
            images.map((image) => (
              <Card key={image.id}>
                <CardContent className="p-2">
                  <img
                    src={getImageUrl(image.name)}
                    alt={image.name}
                    className="w-full h-48 object-cover rounded-md mb-2"
                  />
                  <div className="flex justify-between items-center">
                     <p className="text-sm text-gray-700 truncate">{image.name}</p>
                     <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteImage(image.name)}
                        aria-label="Delete image"
                        className="flex-shrink-0" // Prevent button from shrinking
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Gallery;