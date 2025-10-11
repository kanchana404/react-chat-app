export const uploadImageToCloudinary = async (fileUri: string): Promise<string> => {
  try {
    console.log('Uploading image to Cloudinary:', fileUri);
    
    // Create FormData for the upload
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: `chat_image_${Date.now()}.jpg`,
    } as any);
    formData.append('upload_preset', 'react-app'); // Using your created upload preset
    formData.append('cloud_name', 'duk4vykat');

    // Upload to Cloudinary using their API
    const response = await fetch(`https://api.cloudinary.com/v1_1/duk4vykat/image/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload error:', errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Cloudinary upload successful:', result.secure_url);
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Alternative method using base64 encoding (if FormData doesn't work)
export const uploadImageToCloudinaryBase64 = async (fileUri: string): Promise<string> => {
  try {
    console.log('Uploading image to Cloudinary (base64):', fileUri);
    
    // Convert image to base64
    const response = await fetch(fileUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          
          const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/duk4vykat/image/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file: base64Data,
              upload_preset: 'react-app',
              cloud_name: 'duk4vykat',
            }),
          });

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status}`);
          }

          const result = await uploadResponse.json();
          console.log('Cloudinary upload successful (base64):', result.secure_url);
          resolve(result.secure_url);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary (base64):', error);
    throw error;
  }
};