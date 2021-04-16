import { BatchWriteItemCommandInput, BatchWriteItemInput, WriteRequest } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

export class Batch {
  private static readonly BATCH_SIZE = 25;
  private static readonly instance = new Batch();
  private readonly writeRequests = [] as Array<WriteRequest>;

  private constructor() {}

  public static getInstance(): Batch {
    return this.instance;
  }

  public getBatchWriteItemInput(tableName: string): BatchWriteItemInput {
    let batchWriteItemInput = { RequestItems: {} } as BatchWriteItemCommandInput;
    batchWriteItemInput.RequestItems![tableName] = this.writeRequests.splice(0, Batch.BATCH_SIZE);
    return batchWriteItemInput;
  }

  public add(obj: any): void {
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