import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { storage, db, auth } from '../firebase';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} folderPath - The folder path in storage
 * @returns {Promise<Object>} - Object containing download URL and metadata
 */
export const uploadFile = async (file, folderPath = 'training_materials') => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Create a storage reference
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const filePath = `${folderPath}/${user.uid}/${fileName}`;
    const storageRef = ref(storage, filePath);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Save metadata to Firestore
    const docRef = await addDoc(collection(db, 'training_materials'), {
      userId: user.uid,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      filePath,
      downloadURL,
      uploadedAt: Timestamp.now(),
      tags: [],
      description: ''
    });
    
    return {
      id: docRef.id,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      downloadURL,
      filePath
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Get all files uploaded by the current user
 * @param {string} folderPath - The folder path in storage
 * @returns {Promise<Array>} - Array of file metadata
 */
export const getUserFiles = async (folderPath = 'training_materials') => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Query Firestore for file metadata
    const q = query(
      collection(db, 'training_materials'),
      where('userId', '==', user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const files = [];
    
    querySnapshot.forEach((doc) => {
      files.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return files;
  } catch (error) {
    console.error('Error getting user files:', error);
    throw error;
  }
};

/**
 * Get file content as text
 * @param {string} downloadURL - The download URL of the file
 * @returns {Promise<string>} - The file content as text
 */
export const getFileContent = async (downloadURL) => {
  try {
    const response = await fetch(downloadURL);
    
    // Check if the file is a PDF
    if (downloadURL.toLowerCase().endsWith('.pdf')) {
      // For PDFs, we would normally use a PDF.js library
      // For simplicity, we'll just return a placeholder
      return `[PDF Content] - This is a placeholder for PDF content extraction.`;
    }
    
    // For text files, return the text content
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error getting file content:', error);
    throw error;
  }
};

/**
 * Update file metadata in Firestore
 * @param {string} fileId - The Firestore document ID
 * @param {Object} metadata - The metadata to update
 * @returns {Promise<void>}
 */
export const updateFileMetadata = async (fileId, metadata) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    await db.collection('training_materials').doc(fileId).update({
      ...metadata,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating file metadata:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage and Firestore
 * @param {string} fileId - The Firestore document ID
 * @param {string} filePath - The storage file path
 * @returns {Promise<void>}
 */
export const deleteFile = async (fileId, filePath) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Delete from Storage
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    
    // Delete from Firestore
    await db.collection('training_materials').doc(fileId).delete();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
