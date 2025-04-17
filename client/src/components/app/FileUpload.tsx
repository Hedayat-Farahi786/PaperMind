import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, XCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Assuming you have this component
import { toast, useToast } from '@/hooks/use-toast'; // Assuming you have this hook
// import { apiRequest } from '@/lib/queryClient'; // <-- REMOVE: Not needed here

// *** Import useUploadDocument hook ***
import { useUploadDocument } from '@/hooks/use-document';
// *** Import useAuth to get auth state for disabling UI ***
import { useAuth } from '@/contexts/AuthContext';


interface FileUploadProps {
  userId: number | undefined; // Pass userId, but hook uses token
  onUploadSuccess?: (document: any) => void;
  // Optional: Prop to control if the component is externally disabled
  disabled?: boolean;
}

// Remove internal upload state management, rely on the hook's state
const FileUpload = ({ userId, onUploadSuccess, disabled = false }: FileUploadProps) => {
  // *** Use the upload mutation hook ***
  const { mutate: uploadDocument, isPending: isUploading, isSuccess, isError, error, reset } = useUploadDocument();

  // *** Get auth state to disable UI if not authenticated ***
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Combine external disabled prop, hook's pending state, and auth state
  const isComponentDisabled = disabled || isUploading || authLoading || !isAuthenticated;

   // Manage local file state before upload starts
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [uploadProgress, setUploadProgress] = useState(0); // Keep progress for UI simulation


   // Reset file and progress when mutation finishes (success or error)
   // You could use useEffect here if needed for more complex reset logic after mutation completion
   // useEffect(() => {
   //    if (isSuccess || isError) {
   //       // Optional: Add a timeout before resetting file/progress
   //       const timer = setTimeout(() => {
   //         setSelectedFile(null);
   //         setUploadProgress(0);
   //         reset(); // Reset mutation state
   //       }, 2000); // Wait 2 seconds

   //       return () => clearTimeout(timer);
   //    }
   // }, [isSuccess, isError, reset]);


  const handleUpload = useCallback(async () => {
    // Ensure a file is selected and user is authenticated before proceeding
    if (!selectedFile || !user?.id || !isAuthenticated || isUploading) {
         console.log("Upload blocked: No file, no user ID, not authenticated, or already uploading.");
         return;
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', selectedFile);
    // Remove userId from FormData body - backend gets it from token
    // formData.append('userId', user.id.toString());
    formData.append('title', selectedFile.name.split('.')[0] || 'Untitled Document');


    // *** Trigger the mutation from the hook ***
    // Pass formData to the mutate function
     uploadDocument(
       { formData },
       {
          onSuccess: (data) => {
             // Mutation onSuccess is handled in useUploadDocument hook (e.g., invalidating queries)
             // This onSuccess here is for *component-specific* side effects like showing toast
             setUploadProgress(100); // Finalize progress bar simulation
             toast({
               title: 'Upload successful',
               description: 'Your document has been uploaded and processed.',
             });
             if (onUploadSuccess) {
                onUploadSuccess(data);
             }
             // You might want to reset file/progress here or use the useEffect pattern above
              setTimeout(() => {
                 setSelectedFile(null);
                 setUploadProgress(0);
                 reset(); // Reset the mutation state
              }, 2000); // Reset after 2 seconds
          },
          onError: (uploadError: any) => { // Use the error from the mutation
             setUploadProgress(0); // Reset progress
             console.error('Upload failed:', uploadError);
             toast({
               title: 'Upload failed',
               // Use the more detailed error message from the updated api helper
               description: uploadError.data?.message || uploadError.message || 'An unknown error occurred',
               variant: 'destructive',
             });
             // Optional: reset state after error
             setTimeout(() => {
                 // setSelectedFile(null); // Keep file selected on error? Or clear?
                 // setUploadProgress(0); // Already done
                 reset(); // Reset the mutation state
             }, 3000); // Reset after 3 seconds
          }
       }
     );

      // --- Progress Simulation (Optional) ---
      // You can add back a simulated progress here that runs until the mutation finishes
       setUploadProgress(0);
       const simulateProgress = setInterval(() => {
         setUploadProgress(prev => {
            // Simulate progress up to ~90-95% before success/error
            if (isUploading && prev < 95) return prev + 2; // Smaller steps
            if (!isUploading && prev < 95) { // Keep simulating a bit if not pending anymore but not >= 95
               return prev + 1;
            }
             clearInterval(simulateProgress); // Stop simulation when pending state changes or >= 95
             return prev; // Return current value
         });
       }, 100); // Adjust interval speed

       // Clear interval when component unmounts or upload finishes (handled by effect below)
       // Store interval ID to clear it later
       (handleUpload as any).progressIntervalId = simulateProgress;

  }, [selectedFile, user?.id, isAuthenticated, isUploading, uploadDocument, toast, onUploadSuccess, reset]); // Dependencies

    // Effect to clear the progress simulation interval
    useEffect(() => {
        return () => {
            // Clear interval if it exists when component unmounts
            if ((handleUpload as any).progressIntervalId) {
                clearInterval((handleUpload as any).progressIntervalId);
            }
        };
    }, [handleUpload]); // Dependency on handleUpload ensures it runs when handleUpload changes


  const onDrop = useCallback((acceptedFiles: File[]) => {
     // Do not accept files if component is disabled
     if (isComponentDisabled) return;

    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0); // Reset progress
      // Optionally trigger upload automatically after drop
      // setTimeout(() => { handleUpload(); }, 500); // Call handleUpload (now uses the hook)
    }
    // Reset mutation state if dropping a new file after error/success
     if (isSuccess || isError) {
         reset();
     }

  }, [isComponentDisabled, isSuccess, isError, reset]); // Dependencies

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      // Add TIFF if your backend supports it and you need client-side restriction
      // 'image/tiff': ['.tif', '.tiff'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    // *** Disable dropzone based on combined state ***
    disabled: isComponentDisabled,
  });


  const cancelUpload = () => {
    // This only clears local state, doesn't stop an ongoing fetch/mutation
    // Cancelling mutations is more advanced (using AbortController)
    if (isUploading) {
        // Optional: Show a message that it can't be cancelled mid-upload
        console.log("Cannot cancel upload mid-flight with current implementation.");
        return;
    }
    setSelectedFile(null);
    setUploadProgress(0);
    reset(); // Reset mutation state if needed
  };

  // Determine UI status based on hook state
  const uiStatus = isUploading ? 'uploading' : (isSuccess ? 'success' : (isError ? 'error' : (selectedFile ? 'selected' : 'idle')));


  const renderUploadStatusText = () => {
    if (isUploading) {
        return "Uploading document...";
    }
    if (isSuccess) {
        return "Document processed successfully!";
    }
    if (isError) {
         // Use the detailed error message from the hook
         return error?.data?.message || error?.message || "Error processing document";
    }
    return null; // Or "File selected" if you want
  };


  // Render based on UI state
  return (
    // Apply disabled class to the container if needed for visual feedback
    <div className={`bg-white dark:bg-neutral-800 rounded-xl p-6 mb-8 shadow-sm ${isComponentDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Upload a Document</h2>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
            : uiStatus !== 'idle' // Apply different style if file selected/uploading/status shown
              ? 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900'
              : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10'
        } ${isComponentDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} // *** Apply disabled styles ***
      >
        {/* Input is disabled via getRootProps/getInputProps disabled prop */}
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          {/* Icon based on status */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
             uiStatus === 'success'
              ? 'bg-green-100 dark:bg-green-900/30'
              : uiStatus === 'error'
                ? 'bg-red-100 dark:bg-red-900/30'
                : uiStatus === 'uploading' || uiStatus === 'selected' || uiStatus === 'processing' // Use processing state if needed
                  ? 'bg-primary-100 dark:bg-primary-900/30'
                  : 'bg-primary-100 dark:bg-primary-900/30' // Default idle
          }`}>
            {isUploading ? ( // Use isUploading from hook
               <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin" />
            ) : uiStatus === 'success' ? (
               <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            ) : uiStatus === 'error' ? (
               <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            ) : (
               <UploadCloud className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            )}
          </div>

          {/* File name and progress/status */}
          {selectedFile && (
              <div className="w-full mb-4">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                       {selectedFile.name}
                    </span>
                     {/* Show cancel button only when a file is selected and not uploading */}
                    {!isUploading && (
                       <Button variant="ghost" size="sm" onClick={cancelUpload} disabled={isComponentDisabled}>
                          <XCircle className="h-4 w-4" />
                       </Button>
                    )}
                 </div>
                 {/* Progress bar */}
                 {isUploading && (
                    <div className="w-full mb-2">
                       <Progress value={uploadProgress} className="h-2" />
                    </div>
                 )}

                 {/* Status Text */}
                 {uiStatus !== 'idle' && uiStatus !== 'selected' && (
                     <div className={`mt-2 text-center text-sm ${uiStatus === 'success' ? 'text-green-600 dark:text-green-400' : uiStatus === 'error' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-500'}`}>
                        {renderUploadStatusText()}
                     </div>
                 )}

              </div>
          )}

          {/* Initial state or Upload button */}
          {!selectedFile ? (
             // Initial state
             <>
               <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                 Drop your PDF, image, or doc here
               </h3>
               <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                 or click to browse from your computer
               </p>
                {/* Button inside dropzone */}
               <Button className="bg-primary-600 hover:bg-primary-700 text-white" disabled={isComponentDisabled}>
                 <UploadCloud className="mr-2 h-4 w-4" />
                 Browse Files
               </Button>
               <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                 Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
               </p>
             </>
          ) : (
              // File selected, show Upload button if not uploading
              !isUploading && (
                 <Button
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                    onClick={handleUpload} // Use the updated handleUpload
                    disabled={isComponentDisabled} // Disable based on auth/loading/isUploading
                 >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Document
                 </Button>
              )
          )}
        </div>
      </div>

      {/* Alternate upload options - Also should be disabled */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="flex items-center" disabled={isComponentDisabled}> {/* Disable */}
          <svg
            className="mr-2 h-4 w-4 text-red-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 22L3 17.17V6.83L12 2L21 6.83V17.17L12 22Z M7.32 14.44L7.95 12.12H10.09L9.46 14.44H12.32L12.96 12.12H15.09L14.46 14.44H16.59L15.95 16.83H13.83L13.2 19.17H10.34L10.97 16.83H7.83L7.2 19.17H4.34L4.96 16.83H2.83L3.47 14.44H7.32Z" />
          </svg>
          Connect Gmail
        </Button>
        <Button variant="outline" size="sm" className="flex items-center" disabled={isComponentDisabled}> {/* Disable */}
          <svg
            className="mr-2 h-4 w-4 text-yellow-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M19.23 10H19.75V11.44L21 12.15V7.2L19.75 7.91V9.33H19.23L18.24 8.34L13.54 8.32L19.23 10M12.46 8.29L17.15 8.31L12.46 6.61V8.29M21 14.76L19.75 14.05V15.44H12.66V17.21L10.21 15.46L12.66 13.7V15.46H19.75V14.07L21 14.76M12.08 19.91L5 16.39V11.86L8 13.16V15.5L12.08 17.67V19.91M12.08 13.94L9.5 12.47L12.08 11V13.94M10.94 10.75L8.5 9.75L12.08 8.05V9.2L10.94 10.75M13.04 11.47L14.5 10.03L21 13.54V15.15L15.04 12.03L13.04 14.04V11.47Z" />
          </svg>
          Connect Google Drive
        </Button>
        <Button variant="outline" size="sm" className="flex items-center" disabled={isComponentDisabled}> {/* Disable */}
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
    </div>
  );
};

export default FileUpload;