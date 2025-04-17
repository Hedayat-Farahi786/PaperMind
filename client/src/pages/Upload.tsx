// pages/Upload.tsx
import { useState, useEffect } from 'react'; // Need useEffect for loading state
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { useUploadDocument } from '@/hooks/use-document'; // Your upload hook
import Sidebar from '@/components/app/Sidebar'; // Assuming these are standard layout components
import TopBar from '@/components/app/TopBar';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button'; // Your button component
import { Progress } from '@/components/ui/progress'; // Your progress component
import { useToast } from '@/hooks/use-toast'; // Your toast hook
import { UploadCloud, XCircle, Check, ArrowLeft } from 'lucide-react'; // Icon imports
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Your card components

const Upload = () => {
  // *** GET isAuthenticated and isLoading from useAuth ***
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { mutate: uploadDocument, isPending: isUploading } = useUploadDocument(); // isPending is correct for mutations

  // Determine if the upload functionality should be disabled
  // Disable if auth is loading, not authenticated, or already uploading
  const isUploadDisabled = authLoading || !isAuthenticated || isUploading;


  const onDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
       setUploadProgress(0); // Reset progress on new file selection
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      // Add TIFF if needed, although not explicitly listed in react-dropzone docs for accept,
      // your backend fileFilter allows it. You might need to add 'image/tiff': ['.tif', '.tiff']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    // *** Disable dropzone based on authentication state ***
     disabled: isUploadDisabled || isUploading, // Disable if auth isn't ready or already uploading
  });

  const handleUpload = () => {
    // Add a check here too, although the button should be disabled
    if (!file || !user?.id || !isAuthenticated || isUploading) return;


    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    // The backend uses the userId from the JWT payload, not body for auth,
    // but you might keep this for other processing logic if needed on the backend,
    // though it's safer if the backend *only* trusts the token for the user ID.
    formData.append('userId', user.id.toString());
    formData.append('title', file.name.split('.')[0]);

    // Start fake progress bar
    setUploadProgress(0); // Ensure progress starts at 0
    const simulateProgress = setInterval(() => {
      setUploadProgress(prev => {
        // Cap at 90% during upload, reach 100% on success
        if (prev < 90) return prev + 5; // Adjusted step for smoother simulation
        clearInterval(simulateProgress);
        return prev;
      });
    }, 250); // Faster updates

    uploadDocument(
      { formData },
      {
        onSuccess: (data) => {
          clearInterval(simulateProgress);
          setUploadProgress(100); // Ensure it hits 100%
          toast({
            title: 'Upload successful',
            description: 'Your document has been uploaded and processed.',
          });

          // Redirect to the document page after a short delay
          setTimeout(() => {
            navigate(`/documents/${data.id}`);
          }, 1000);
        },
        onError: (error: any) => { // Use 'any' or define a more specific error type if possible
          clearInterval(simulateProgress);
          setUploadProgress(0); // Reset progress on error
          console.error("Upload mutation error:", error); // Log the full error
          toast({
            title: 'Upload failed',
            // Use the error message from the API response if available
            description: error.data?.message || error.message || 'An unknown error occurred.',
            variant: 'destructive',
          });
        }
      }
    );
  };

  const cancelUpload = () => {
    setFile(null);
    setUploadProgress(0);
    // Note: This doesn't cancel the actual ongoing mutation request.
    // Cancelling fetch requests requires AbortController, which is more complex.
  };

  // *** Show loading/auth state before rendering upload form ***
  if (authLoading) {
      return (
          <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
               <span className="ml-4 text-neutral-700 dark:text-neutral-300">Loading authentication...</span>
          </div>
      );
  }

  if (!isAuthenticated) {
       // If not authenticated, render a message or redirect
       return (
           <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
               Please sign in to upload documents.
           </div>
       );
  }


  // *** Render upload form only when authenticated and not loading auth ***
  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user || undefined} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate('/dashboard')}
              disabled={isUploading} // Prevent navigation during upload
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Upload a Document</CardTitle>
                <CardDescription>
                  Upload any document including PDF, image, or scanned letter to analyze.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                      : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10'
                  } ${isUploadDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} // *** Apply disabled styles ***
                >
                  <input {...getInputProps()} />

                  {file ? (
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-4">
                            <UploadCloud className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                              {file.name}
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        {!isUploading && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelUpload();
                            }}
                             disabled={isUploadDisabled} // *** Disable cancel when loading/not authenticated ***
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-6">
                         {isUploading && ( // Show progress only during upload
                            <div className="flex justify-between mb-2 text-sm">
                                <span className="text-neutral-600 dark:text-neutral-400">
                                    Uploading...
                                </span>
                                <span className="text-neutral-600 dark:text-neutral-400">
                                    {uploadProgress}%
                                </span>
                            </div>
                         )}
                         {/* Always render progress bar, but value reflects state */}
                         <Progress value={uploadProgress} className="h-2" />

                         {uploadProgress === 100 && !isUploading && ( // Show processing complete after upload succeeds
                           <div className="mt-4 text-center text-green-600 dark:text-green-400 flex items-center justify-center">
                             <Check className="mr-2 h-4 w-4" />
                             Processing complete!
                           </div>
                         )}
                       </div>

                      {!isUploading && ( // Show upload button only if not uploading
                        <Button
                          className="bg-primary-600 hover:bg-primary-700 text-white w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpload();
                          }}
                           disabled={isUploadDisabled} // *** Disable upload button based on auth/loading ***
                        >
                          <UploadCloud className="mr-2 h-4 w-4" />
                          Upload Document
                        </Button>
                      )}
                    </div>
                  ) : (
                    // Initial state - no file selected
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                        <UploadCloud className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                        Drop your PDF, image, or doc here
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                        or click to browse from your computer
                      </p>
                      {/* The button inside the dropzone also gets disabled */}
                       <Button className="bg-primary-600 hover:bg-primary-700 text-white" disabled={isUploadDisabled}>
                         <UploadCloud className="mr-2 h-4 w-4" />
                         Browse Files
                       </Button>
                      <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                        Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Alternative Upload Methods - Also should likely be disabled if not authenticated */}
             <Card>
              <CardHeader>
                <CardTitle>Alternative Upload Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" className="flex items-center" disabled={isUploadDisabled}> {/* Disable */}
                    <svg
                      className="mr-2 h-4 w-4 text-red-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 22L3 17.17V6.83L12 2L21 6.83V17.17L12 22Z M7.32 14.44L7.95 12.12H10.09L9.46 14.44H12.32L12.96 12.12H15.09L14.46 14.44H16.59L15.95 16.83H13.83L13.2 19.17H10.34L10.97 16.83H7.83L7.2 19.17H4.34L4.96 16.83H2.83L3.47 14.44H7.32Z" />
                    </svg>
                    Connect Gmail
                  </Button>
                  <Button variant="outline" className="flex items-center" disabled={isUploadDisabled}> {/* Disable */}
                    <svg
                      className="mr-2 h-4 w-4 text-yellow-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.23 10H19.75V11.44L21 12.15V7.2L19.75 7.91V9.33H19.23L18.24 8.34L13.54 8.32L19.23 10M12.46 8.29L17.15 8.31L12.46 6.61V8.29M21 14.76L19.75 14.05V15.44H12.66V17.21L10.21 15.46L12.66 13.7V15.46H19.75V14.07L21 14.76M12.08 19.91L5 16.39V11.86L8 13.16V15.5L12.08 17.67V19.91M12.08 13.94L9.5 12.47L12.08 11V13.94M10.94 10.75L8.5 9.75L12.08 8.05V9.2L10.94 10.75M13.04 11.47L14.5 10.03L21 13.54V15.15L15.04 12.03L13.04 14.04V11.47Z" />
                    </svg>
                    Connect Google Drive
                  </Button>
                  <Button variant="outline" className="flex items-center" disabled={isUploadDisabled}> {/* Disable */}
                    <svg
                      className="mr-2 h-4 w-4 text-blue-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z" />
                    </svg>
                    Take Photo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Upload;