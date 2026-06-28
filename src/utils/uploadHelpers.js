/**
 * Uploads a single file using XMLHttpRequest to track byte-level progress.
 * 
 * @param {File} file - The file to upload.
 * @param {string} token - The auth token.
 * @param {Function} onProgress - Callback fired with progress percentage (0-100).
 * @returns {Promise<Object>} - The JSON response from the server containing the image URL.
 */
export const uploadFileWithProgress = (file, token, onProgress, folderPath = '') => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid JSON response from server'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(new Error(errorResponse.error || `Upload failed with status ${xhr.status}`));
        } catch (e) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during upload'));
    };

    const formData = new FormData();
    formData.append('image', file);
    if (folderPath) {
      formData.append('folderPath', folderPath);
    }

    xhr.send(formData);
  });
};
