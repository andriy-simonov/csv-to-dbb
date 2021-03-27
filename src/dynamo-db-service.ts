import { DynamoDBClient, BatchWriteItemCommand, DynamoDBClientConfig, BatchWriteItemInput, AttributeValue, PutRequest } from "@aws-sdk/client-dynamodb";
import { WriteRequest } from "@aws-sdk/client-dynamodb/types/models/models_0";

  
// Set the parameters
const params: BatchWriteItemInput = {
  RequestItems: {
    TABLE_NAME: [
      {
        PutRequest: {
          Item: {
            KEY: { N: "KEY_VALUE" },
            ATTRIBUTE_1: { S: "ATTRIBUTE_1_VALUE" },
            ATTRIBUTE_2: { N: "ATTRIBUTE_2_VALUE" },
          },
        },
      },
      {
        PutRequest: {
          Item: {
            KEY: { N: "KEY_VALUE" },
            ATTRIBUTE_1: { S: "ATTRIBUTE_1_VALUE" },
            ATTRIBUTE_2: { N: "ATTRIBUTE_2_VALUE" },
          },
        },
      },
    ],
  },
};

// TODO: separate records marshalling
class NumberItemColumn implements AttributeValue.NMember{
  readonly N: string;

  constructor(N: string) {
      this.N = N;
  }
}

class StringItemColumn implements AttributeValue.SMember {
  readonly S: string;

  constructor(S: string) {
      this.S = S;
  }
}

class InventoryItem {
  [key: string]: AttributeValue;

  constructor(itemNo: string, itemSku: string) {
    this.itemNo = new NumberItemColumn(itemNo);
    this.itemSku = new StringItemColumn(itemSku);
  }
}

class InventoryPutRequest implements WriteRequest {
  readonly PutRequest: PutRequest;

  constructor(itemNo: string, itemSku: string) {
    this.PutRequest = { Item: new InventoryItem(itemNo, itemSku) };
  }
}

class InventoryPutRequestItems {
  [key: string]: WriteRequest[];
  
  constructor(requests = [] as Array<WriteRequest>) {
      this.inventory = requests;
  }
}

export class InventoryBatchWriteItemInput implements BatchWriteItemInput {
  readonly RequestItems: InventoryPutRequestItems;

  constructor(requestItems: { [key: string]: WriteRequest[] }) {
    this.RequestItems = requestItems;
  }
}

export class Batch {
  private static readonly BATCH_SIZE = 5;
  private static readonly writeRequests = [] as Array<WriteRequest>;

  public getBatchWriteItemInput(): BatchWriteItemInput {
    const requestItems = new InventoryPutRequestItems(Batch.writeRequests.splice(0, 5));

    return new InventoryBatchWriteItemInput(requestItems);
  }

  public add(request: InventoryPutRequest): void {
    Batch.writeRequests.push(request);
  }

  public isFull(): boolean {
    return Batch.writeRequests.length >= Batch.BATCH_SIZE;
  }

  public size(): number {
    return Batch.writeRequests.length;
  }
}

export async function writeBatch(item: {itemNo: string, partNumber: string}): Promise<void> {
  const request = new InventoryPutRequest(item.itemNo, item.partNumber);
  const batch = new Batch();
  batch.add(request);
  console.log(`add: batch size ${batch.size()}; [${item.itemNo}]`);
  if (batch.isFull()) {
    const batchWriteItemInput = batch.getBatchWriteItemInput();
    console.log(`write: buffer size ${batch.size()}; batch size ${batchWriteItemInput.RequestItems!.inventory.length}, [${batchWriteItemInput.RequestItems!.inventory[0].PutRequest?.Item?.itemNo.N},${batchWriteItemInput.RequestItems!.inventory[batchWriteItemInput.RequestItems!.inventory.length - 1].PutRequest?.Item?.itemNo.N}]`);
    await dbclient.send(new BatchWriteItemCommand(batchWriteItemInput));
    // TODO: retry unprocessed items
  }
}

export async function writeBatchRemains(): Promise<void> {
  const batch = new Batch();
  const batchWriteItemInput = batch.getBatchWriteItemInput();
  console.log(`write remains: buffer size ${batch.size()}; batch size ${batchWriteItemInput.RequestItems!.inventory.length}, [${batchWriteItemInput.RequestItems!.inventory[0].PutRequest?.Item?.itemNo.N},${batchWriteItemInput.RequestItems!.inventory[batchWriteItemInput.RequestItems!.inventory.length - 1].PutRequest?.Item?.itemNo.N}]`);
  await dbclient.send(new BatchWriteItemCommand(batchWriteItemInput));
  // TODO: retry unprocessed items
}

const config: DynamoDBClientConfig = { region: 'us-east-1', endpoint: 'http://localhost:4570',
credentials: { accessKeyId: 'S3RVER', secretAccessKey: 'S3RVER' }};
const dbclient = new DynamoDBClient(config);