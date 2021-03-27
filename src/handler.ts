import { Readable } from 'node:stream';
import parse from 'csv-parse';
import transform from 'stream-transform';
import stringify from 'csv-stringify';

import * as s3 from './s3-service';
import { rotateColumns } from './csv-transformer';

import * as ddb from './dynamo-db-service';


export async function transformCsv(event, context, callback) {
  try {
    const stream = await s3.readFromStream('test.csv');

    const transformedStream = stream
      .pipe(parse())
      .pipe(transform(rotateColumns))
      .pipe(stringify());

    await s3.writeToStream(transformedStream);

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'CSV file transformed successfully',
        input: event,
      }),
    };

    callback(null, response);
  }
  catch (error) {
    console.error('Failed to transform CSV file\n', error);
  }
}

export async function importCsvToDynamoDb(event, context, callback) {
  try {
    const stream = await s3.readFromStream('test.csv');

    stream
      .pipe(parse({
        trim: true,
        skip_empty_lines: true,
        columns: true,
        ignore_last_delimiters: true
      }))
      .on('readable', writeBatchToDdb)
      .on('end', writeBatchRemainsToDdb)
      .on('error', (error) => console.error('Failed to parse CSV input', error));
  }
  catch (error) {
    console.error('Failed to open stream from S3\n', error);
  }

  async function writeBatchToDdb() {
    try {
      (this! as Readable).pause();
      let record;
      while (record = this.read()) {
        await ddb.writeBatch(record);
      }
    }
    catch (error) {
      console.error(`Failed to write butch to DynamoDB. ${(this! as parse.Parser).info.lines} processed`, error);
    }
    finally {
      (this! as Readable).resume();
    }
  }

  async function writeBatchRemainsToDdb(arg0: string, writeBatchRemainsToDdb: any) {
    try {
      await ddb.writeBatchRemains();
    }
    catch (error) {
      console.log(`Failed to write butch to DynamoDB after input sream had closed.`, error);
    }
  }
}
