import { DynamoDBClient, BatchWriteItemCommand,
         DynamoDBClientConfig, BatchWriteItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { Batch } from './batch-item'


export async function writeBatch(obj: any, tableName: string): Promise<void> {
  const batch = Batch.getInstance();
  batch.add(obj);
  if (batch.isFull()) {
    const batchWriteItemInput = batch.getBatchWriteItemInput(tableName);
    return dbclient.send(new BatchWriteItemCommand(batchWriteItemInput))
    .then(
      (output: BatchWriteItemCommandOutput) => { 
        if (output.UnprocessedItems
          && output.UnprocessedItems[tableName]
          && output.UnprocessedItems[tableName].length > 0)
          console.warn('Some items did not write');
      },
      reason => console.error('Failed to batch write', reason)
    );
    // TODO: retry unprocessed items
  }
  else {
    return Promise.resolve();
  }
}

export function writeBatchRemains(tableName: string): Promise<void> {
  const batch = Batch.getInstance();
  if (batch.size() == 0) {
    return Promise.resolve();
  }
  else {
    const batchWriteItemInput = batch.getBatchWriteItemInput(tableName);
    return dbclient.send(new BatchWriteItemCommand(batchWriteItemInput))
    .then(
      (output: BatchWriteItemCommandOutput) => { 
        if (output.UnprocessedItems
          && output.UnprocessedItems[tableName]
          && output.UnprocessedItems[tableName].length > 0)
          console.warn('Some items did not write');
      },
      reason => console.error('Failed to batch write', reason)
    );
  }
  // TODO: retry unprocessed items
}

const config = {} as DynamoDBClientConfig;
config.region = process.env.REGION;
if (process.env.DYNAMO_DB_ENDPOINT) {
  config.endpoint = process.env.DYNAMO_DB_ENDPOINT;
}
const dbclient = new DynamoDBClient(config);