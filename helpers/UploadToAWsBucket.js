import { S3 } from 'aws-sdk';
import Constants from 'expo-constants';

// Get AWS credentials from app.config.js
const awsConfig = {
  accessKeyId: Constants.expoConfig.extra.awsAccessKey,
  secretAccessKey: Constants.expoConfig.extra.awsSecretKey,
  region: Constants.expoConfig.extra.awsRegion,
  bucketName: Constants.expoConfig.extra.awsBucketName,
};

// Initialize S3 client
const s3 = new S3({
  accessKeyId: "AKIATCKAQBP2JVRODB5X",
  secretAccessKey: "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",
  region: "us-east-1",
  signatureVersion: 'v4',
});

/**
 * Uploads an image to AWS S3 and returns the public URL
 * @param {string} imageUri - The local URI of the image to upload
 * @returns {Promise<{success: boolean, url: string, key: string}>}
 */
export const uploadImageToS3 = async (imageUri) => {
  try {
    // Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Generate unique filename with timestamp and random string
    const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

    // Prepare upload parameters
    const params = {
      Bucket: "awsaipoc",
      Key: fileName,
      Body: blob,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    };

    // Upload to S3
    const uploadResult = await s3.upload(params).promise();

    return {
      success: true,
      url: uploadResult.Location,
      key: uploadResult.Key
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload image to S3');
  }
};
