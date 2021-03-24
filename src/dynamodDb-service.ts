// import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
// import parse from 'csv-parse';
const parse = require('csv-parse');

  
  // Set the AWS Region
  const REGION = "region"; //e.g. "us-east-1"
  
  // Set the parameters
  const params = {
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
  
/*
  const dbclient = new DynamoDBClient({ region: REGION });
  
  const run = async () => {
    try {
      const data = await dbclient.send(new BatchWriteItemCommand(params));
      console.log("Success, items inserted", data);
    } catch (err) {
      console.log("Error", err);
    }
  };
  */

  parse(`
  "key_1","key_2"
  "value 1","value 2"
  "value 3","value 4"
  "value 5","value 6"
  `, {
  trim: true,
  skip_empty_lines: true,
  columns: true
})
// Use the readable stream api
// .on('readable', function(){
//   let record
//   while (record = this.read()) {
//     console.log(`on record: ${JSON.stringify(record)}`);
//   }
// })
.on('data', function(record) {
  console.log(`line: ${this.info.lines}; on data: ${JSON.stringify(record)}`);
})
// When we are done, test that the parsed output matched what expected
.on('end', function(p1, p2) {
  console.log(`par1: ${p1}, par2: ${p2}`)
})