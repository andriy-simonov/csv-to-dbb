import { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'csv-to-ddb',
  frameworkVersion: '2',
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    lambdaHashingVersion: 20201221,
    stage: 'dev',
    profile: 's3local'
  },
  resources: {
    Resources: {
      NewResource: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: 'csv-bucket'
        }
      }
    }
  },
  functions: {
    transformCsv: {
      handler: 'src/handler.transformCsv'
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
    }
  },
  plugins: [
    'serverless-plugin-typescript',
    'serverless-plugin-tree-shake',
    'serverless-s3-local',
    'serverless-offline'
  ],
  package: {
    excludeDevDependencies: false
  }
};

module.exports = serverlessConfiguration