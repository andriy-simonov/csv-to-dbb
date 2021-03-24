import parse from 'csv-parse';
import transform from 'stream-transform';
import stringify from 'csv-stringify';

import * as s3 from './s3-service'
import { rotateColumns } from './csv-transformer'


export async function transformCsv(event, context, callback) {
  try {
    // dependencies work as expected
    const stream = await s3.readFromStream();

    const transformedStream = stream
      .pipe(parse())
      .pipe(transform(rotateColumns))
      .pipe(stringify());

    s3.writeToStream(transformedStream);

    // async/await also works out of the box
    // await new Promise((resolve, reject) => setTimeout(resolve, 500))

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

export async function exportCsvToDynamoDb(event, context, callback) {
  
}