import { S3Client } from '@aws-sdk/client-s3';

export function createS3Client() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'ap-northeast-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing AWS credentials. Please check your environment variables.');
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function getS3BucketName() {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('Missing S3_BUCKET_NAME environment variable.');
  }
  return bucketName;
}

export function getS3PublicUrl(key: string): string {
  const bucketName = getS3BucketName();
  const region = process.env.AWS_REGION || 'ap-northeast-1';
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}
