import { useState, useEffect } from 'react';
import { account, storage } from '@/integrations/appwrite/client';
import { appwriteConfig } from '@/integrations/appwrite/config';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Upload, Trash2 } from 'lucide-react';
import { ID, Models } from 'appwrite';

interface ImageFile {
  $id: string;
  name: string;
  $createdAt: string;
}

const Gallery = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [uploading, setUploading] = useState(false);

  // Function to fetch images for the logged-in user
  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await storage.listFiles(appwriteConfig.buckets.images);
      setImages(response.files as unknown as ImageFile[]);
    } catch (error: any) {
      console.error('Error fetching images:', error);
      showError('Failed to load images.');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        await fetchImages();
      } catch (error) {
        setUser(null);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      showError('Please select a file to upload.');
      return;
    }

    const file = event.target.files[0];
    setUploading(true);

    try {
      await storage.createFile(
        appwriteConfig.buckets.images,
        ID.unique(),
        file
      );

      showSuccess('Image uploaded successfully!');
      await fetchImages();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showError('Failed to upload image.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageId: string) => {
    if (!user) {
      showError('You must be logged in to delete images.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await storage.deleteFile(appwriteConfig.buckets.images, imageId);
        showSuccess('Image deleted successfully!');
        setImages(images.filter(image => image.$id !== imageId));
      } catch (error: any) {
        console.error('Error deleting image:', error);
        showError('Failed to delete image.');
      }
    }
  };

  // Function to get the public URL of an image
  const getImageUrl = (fileId: string): string => {
    if (!user) return '';
    const result = storage.getFilePreview(
      appwriteConfig.buckets.images,
      fileId,
      800, // width
      600, // height
      'center' as any, // gravity
      100, // quality
      0, // borderWidth
      '', // borderColor
      0, // borderRadius
      1, // opacity
      0, // rotation
      '', // background
      'webp' as any // output format
    );
    return result.href;
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
              <Card key={image.$id}>
                <CardContent className="p-2">
                  <img
                    src={getImageUrl(image.$id)}
                    alt={image.name}
                    className="w-full h-48 object-cover rounded-md mb-2"
                  />
                  <div className="flex justify-between items-center">
                     <p className="text-sm text-gray-700 truncate">{image.name}</p>
                     <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteImage(image.$id)}
                        aria-label="Delete image"
                        className="flex-shrink-0"
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