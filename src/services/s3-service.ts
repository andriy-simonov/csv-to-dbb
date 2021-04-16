import { Upload } from '@aws-sdk/lib-storage';
import { S3ClientConfig, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';


const config = {} as S3ClientConfig;
config.region = process.env.REGION;
if (process.env.S3_ENDPOINT) {
  config.endpoint = process.env.S3_ENDPOINT;
  config.forcePathStyle = true;
}
const s3Client = new S3Client(config);

async function readFromStream(bucket: string, objectKey: string): Promise<Readable> {
  console.info(`Start reading data from ${bucket}/${objectKey}`);
  const objectParams = { Bucket: bucket, Key: objectKey };
  // Get the name of the object from the Amazon S3 bucket.
  const data = await s3Client.send(new GetObjectCommand(objectParams));

  // Extract the body contents, a readable stream, from the returned data.
  return data.Body as Readable;
}


async function writeToStream(bucket: string, objectKey: string, transformedStream: Readable): Promise<void> {
  try {
    const options = {
      client: s3Client,
      queueSize: 4,
      params: { Bucket: bucket, Key: objectKey, Body: transformedStream }
    };
    const uploads = new Upload(options);
    await uploads.done();
    console.log(`Successfully uploaded data to ${bucket}/${objectKey}`);
  }
  catch (err) {
    console.error('Failed to upload transformed CSV', err);
  }
}

export { readFromStream, writeToStream };