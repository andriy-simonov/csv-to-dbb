import { Serverless } from 'serverless/aws';
import resources from './configuration/resources'

const serverlessConfiguration: Serverless = {
  service: 'csv-to-ddb',
  frameworkVersion: '2',
  variablesResolutionMode: '20210219',
  configValidationMode: 'warn',
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    lambdaHashingVersion: 20201221,
    logRetentionInDays: 3,
    deploymentBucket: {
      name: '${self:custom.deployment.bucket}',
      maxPreviousDeploymentArtifacts: 1
    },
    profile: 's3local',
    stage: '${opt:stage, "local"}',
    region: '${self:provider.environment.REGION}',
    stackName: '${self:service}-${opt:stage, self:provider.stage, "dev"}',
    environment: '${file(configuration/environment-${self:provider.stage}.json)}',
    versionFunctions: false,
    // @ts-expect-error
    eventBridge: { useCloudFormation: true }
  },
  functions: {
    transformCsv: {
      handler: 'src/handler.transformCsv',
      // @ts-expect-error
      maximumRetryAttempts: 1,
      role: 'TransformCsvLambdaExecutionRole',
      events: [
        {
          eventBridge: {
            schedule: 'cron(0 2 * * ? *)'
          }
        }
      ],
      timeout: 240,
      memorySize: 256
    },
    importCsvToDynamoDb: {
      handler: 'src/handler.importCsvToDynamoDb',
      role: 'ImportCsvToDynamoDbLambdaExecutionRole',
      memorySize: 256
    }
  },
  // @ts-expect-error
  custom: '${file(configuration/custom.json)}',
  resources: resources,
  plugins: [
    'serverless-plugin-typescript',
    'serverless-plugin-tree-shake',
    'serverless-dynamodb-local',
    'serverless-s3-local',
    'serverless-offline'
  ]
};

module.exports = serverlessConfiguration;