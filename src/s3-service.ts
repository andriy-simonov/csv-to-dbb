import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from 'stream';



const s3Client = new S3Client({ region: 'us-east-1', endpoint: 'http://localhost:4569', forcePathStyle: true, bucketEndpoint: false, maxAttempts: 3 });

async function readFromStream(): Promise<Readable> {
    const objectParams = { Bucket: 'csv-bucket', Key: 'test.csv' };
    // Get the name of the object from the Amazon S3 bucket.
    const data = await s3Client.send(new GetObjectCommand(objectParams));

    // Extract the body contents, a readable stream, from the returned data.
    return data.Body as Readable;
}


async function writeToStream(transformedStream: Readable): Promise<void> {
  try {
    const objectParams = { Bucket: 'csv-bucket', Key: 'transformed.csv', Body: transformedStream };
    await s3Client.send(new PutObjectCommand(objectParams));
    console.log(`Successfully uploaded data to ${objectParams.Bucket}/${objectParams.Key}`);
  }
  catch (err) {
    console.error("Failed to upload transformed CSV", err);
  }
}

export { readFromStream, writeToStream }