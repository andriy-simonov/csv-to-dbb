import { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'csv-to-ddb',
  frameworkVersion: '2',
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    lambdaHashingVersion: 20201221,
    stage: '${opt:stage, "local"}',
    profile: 's3local',
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
  },
  resources: {
    Resources: {
      csvBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: 'csv-bucket'
        }
      },
      inventoryTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'inventory',
          KeySchema: [{
            AttributeName: 'itemNo',
            KeyType: 'HASH'
          }],
          AttributeDefinitions: [{
            AttributeName: 'itemNo',
            AttributeType: 'N'
          }],
          ProvisionedThroughput: {
              ReadCapacityUnits: 1,
              WriteCapacityUnits: 1
          }
        }
      }
    }
  },
  functions: {
    transformCsv: {
      handler: 'src/handler.transformCsv'
    },
    importCsvToDynamoDb: {
      handler: 'src/handler.importCsvToDynamoDb'
    }
  },
  custom: {
    s3: {
      host: 'localhost',
      port: 4569,
      serviceEndpoint: 'amazonaws.com',
      directory: './buckets',
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER'
    },
    dynamodb: {
      stages: ['local'],
      start: {
        port: 4570,
        inMemory: true,
        // dbPath                   The directory where DynamoDB will write its database file. If you do not specify this option, the file will be written to the current directory. Note that you cannot specify both -dbPath and -inMemory at once. For the path, current working directory is <projectroot>/node_modules/serverless-dynamodb-local/dynamob. For example to create <projectroot>/node_modules/serverless-dynamodb-local/dynamob/<mypath> you should specify -d <mypath>/ or --dbPath <mypath>/ with a forwardslash at the end.
        heapInitial: '200m',
        heapMax: '1g',
        migrate: true,           // After starting DynamoDB local, create DynamoDB tables from the Serverless configuration.
        seed: true,              // After starting and migrating dynamodb local, injects seed data into your tables. The --seed option determines which data categories to onload.
        convertEmptyValues: true // Set to true if you would like the document client to convert empty values (0-length strings, binary buffers, and sets) to be converted to NULL types when persisting to DynamoDB.
      }
    }
  },
  plugins: [
    'serverless-plugin-typescript',
    'serverless-plugin-tree-shake',
    'serverless-dynamodb-local',
    'serverless-s3-local',
    'serverless-offline'
  ],
  package: {
    excludeDevDependencies: false
  }
};

module.exports = serverlessConfiguration