import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Import both updated helpers from lib/api
import { apiRequest, uploadFile } from '@/lib/api';
import { Document } from '@shared/schema'; // Assuming Document type is defined here
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

// Assuming your Document type looks something like this based on your backend
// interface Document {
//   id: number;
//   userId: number; // The user ID the document belongs to
//   title: string;
//   originalFilename: string;
//   fileType: string;
//   filePath: string;
//   uploadedAt: string;
//   summary?: string;
//   actionItems?: any[]; // Adjust type based on your schema
//   tags?: string[];
//   status: 'pending' | 'processing' | 'processed' | 'failed';
// }


export function useDocument(id?: number) {
    const { isAuthenticated, getAuthHeaders } = useAuth(); // Get auth state and headers

    return useQuery<Document>({
        // Query key depends on doc ID, does NOT need user ID directly as the document ID implies ownership checked by the backend
        queryKey: id ? [`/api/documents`, id] : [],
        // Enabled only if authenticated and ID is provided
        enabled: !!id && isAuthenticated,
        queryFn: async () => {
            const headers = getAuthHeaders();
            if (!headers.Authorization) {
                 // This case should ideally not be hit due to `enabled`, but is a safeguard
                throw new Error("Authentication required to fetch document");
            }

            // This call is already correct assuming apiRequest is updated
            return await apiRequest<Document>('GET', `/api/documents/${id}`, null, { headers });
        }
    });
}

export function useDocuments(userId?: number) {
    const { isAuthenticated, getAuthHeaders } = useAuth(); // Get auth state and headers

    return useQuery<Document[]>({
        // Query key should include userId IF you expect the list of documents to change per user
        queryKey: userId ? [`/api/documents`, { userId }] : [`/api/documents`],
        // Enabled only if authenticated and userId is provided
        enabled: isAuthenticated && userId !== undefined,

        queryFn: async () => {
            const headers = getAuthHeaders();
            if (!headers.Authorization) {
                throw new Error("Authentication required to fetch documents");
            }

            // *** USE apiRequest helper for GET request and pass headers ***
            return await apiRequest<Document[]>('GET', `/api/documents`, null, { headers });

            // Original fetch call removed:
            // const response = await fetch(`/api/documents`, { headers: { ...headers, 'Content-Type': 'application/json', }, });
            // ... rest of original fetch logic ...
        },
    });
}


export function useUploadDocument() {
    const queryClient = useQueryClient();
    const { isAuthenticated, getAuthHeaders } = useAuth(); // Get auth state and headers

    return useMutation({
        mutationFn: async ({ formData }: { formData: FormData }) => {
            const headers = getAuthHeaders();
            if (!headers.Authorization) {
                throw new Error("Authentication required to upload document");
            }

            // Remove userId from FormData body if it was there for auth (backend uses token)
            // formData.delete('userId');

            // *** USE uploadFile helper for file upload and pass headers ***
            return await uploadFile<Document>('/api/documents', formData, { headers }); // Pass headers in the options object

            // Original fetch call removed:
            // const response = await fetch('/api/documents', { method: 'POST', headers: headers, body: formData });
            // ... rest of original fetch logic ...
        },
        onSuccess: (newDocument) => {
            // Invalidate documents query to refetch the list
            queryClient.invalidateQueries({ queryKey: [`/api/documents`] });
             // Optionally add the new document to the cache
             // queryClient.setQueryData([`/api/documents`], (oldData: Document[] | undefined) => {
             //    return oldData ? [newDocument, ...oldData] : [newDocument];
             // });
        },
        onError: (error) => {
            console.error("Upload failed:", error);
             // The improved error handling in lib/api.ts provides error.status and error.data
             // if (error.status === 401 || error.status === 403) { /* handle auth errors */ }
        }
    });
}

export function useAskDocument(documentId: number) {
    const { isAuthenticated, getAuthHeaders } = useAuth(); // Get auth state and headers

    // Enabled only if authenticated and documentId is valid
    // const enabled = isAuthenticated && documentId !== undefined && documentId > 0; // Mutate doesn't have an `enabled` option


    return useMutation({
        mutationFn: async ({ question }: { question: string }) => {
            const headers = getAuthHeaders();
            if (!headers.Authorization) {
                throw new Error("Authentication required to ask document question");
            }

            // This call is already correct assuming apiRequest is updated
            return await apiRequest<{ answer: string }>('POST', `/api/documents/${documentId}/ask`, { question }, { headers });
        },
        onError: (error) => {
            console.error("Ask Document failed:", error);
            // Handle specific error codes if needed
        }
    });
}