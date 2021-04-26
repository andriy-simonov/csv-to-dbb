import { DynamoDBClient, BatchWriteItemCommand,
  DynamoDBClientConfig, BatchWriteItemCommandInput,
  BatchWriteItemInput, BatchWriteItemCommandOutput,
  WriteRequest } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

class Batch {
  private static readonly BATCH_SIZE = 25;
  private readonly writeRequests;
  
  constructor() {
    this.writeRequests = [] as Array<WriteRequest>;
  }
  
  public getBatchWriteItemInput(tableName: string): BatchWriteItemInput {
    const batchWriteItemInput = { RequestItems: {} } as BatchWriteItemCommandInput;
    batchWriteItemInput.RequestItems![tableName] = this.writeRequests.splice(0, Batch.BATCH_SIZE);
    return batchWriteItemInput;
  }

  public add(obj: { [key: string]: unknown }): void {
    const request = {
      PutRequest: { 
        Item: marshall(obj)
      }
    } as WriteRequest;
    this.writeRequests.push(request);
  }

  public isFull(): boolean {
    return this.writeRequests.length >= Batch.BATCH_SIZE;
  }

  public size(): number {
    return this.writeRequests.length;
  }
}
const batch = new Batch();

export async function writeBatch(obj: { [key: string]: unknown }, tableName: string): Promise<void> {
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

export async function writeBatchRemains(tableName: string): Promise<void> {
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