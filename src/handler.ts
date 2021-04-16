import parse from 'csv-parse';
import transform from 'stream-transform';
import stringify from 'csv-stringify';

import * as s3 from './services/s3-service';
import * as ddb from './services/dynamo-db-service';

import { rotateColumns } from './csv-transformer';


export async function transformCsv(event, context) {
  const BUCKET = process.env.CSV_S3_BUCKET as string;
  const OBJECT_KEY = process.env.OBJECT_TO_REFORMAT as string;
  const stream = await s3.readFromStream(BUCKET, OBJECT_KEY);

  const transformedStream = stream
  .pipe(parse())
  .pipe(transform(rotateColumns))
  .pipe(stringify());

  const TRANSFORMED_OBJECT_PREFIX = process.env.TRANSFORMED_OBJECT_PREFIX as string;
  await s3.writeToStream(BUCKET, `${TRANSFORMED_OBJECT_PREFIX}/${OBJECT_KEY}`, transformedStream);
}

export async function importCsvToDynamoDb(event, context) {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  const tableName = process.env.DYNAMODB_TABLE_NAME as string;
  const stream = await s3.readFromStream(bucket, key);

  const objectStream = stream.pipe(
    parse({
      cast: true,
      columns: true,
      ignore_last_delimiters: true,
      skip_empty_lines: true,
      trim: true
    })
  );
  for await (const chunk of objectStream) {
    await ddb.writeBatch(chunk, tableName);
  }
  await ddb.writeBatchRemains(tableName);
}
