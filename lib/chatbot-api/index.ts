import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sns from "aws-cdk-lib/aws-sns";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";
import * as path from "path";




import { WebsocketBackendAPI } from "./gateway/websocket-api"
import { RestBackendAPI } from "./gateway/rest-api"
import { LambdaFunctionStack } from "./functions/functions"
import { TableStack } from "./tables/tables"
import { KendraIndexStack } from "./kendra/kendra"
import { S3BucketStack } from "./buckets/buckets"

import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { aws_apigatewayv2 as apigwv2 } from "aws-cdk-lib";
import { Construct } from "constructs";

// import { NagSuppressions } from "cdk-nag";

export interface ChatBotApiProps {
  // readonly shared: Shared;
  // readonly config: SystemConfig;
  // readonly ragEngines?: RagEngines;
  // readonly userPool: cognito.UserPool;
  // readonly modelsParameter: ssm.StringParameter;
  // readonly models: SageMakerModelEndpoint[];
}

export class ChatBotApi extends Construct {
  // public readonly messagesTopic: sns.Topic;
  // public readonly sessionsTable: dynamodb.Table;
  // public readonly byUserIdIndex: string;
  // public readonly filesBucket: s3.Bucket;
  // public readonly userFeedbackBucket: s3.Bucket;
  // public readonly wsAPI: apigwv2.WebSocketApi;

  constructor(scope: Construct, id: string, props: ChatBotApiProps) {
    super(scope, id);

    const tables = new TableStack(this, "TableStack");
    const buckets = new S3BucketStack(this, "BucketStack");
    const kendra = new KendraIndexStack(this, "KendraStack", { s3Bucket: buckets.kendraBucket });

    const restBackend = new RestBackendAPI(this, "RestBackend", {})
    const websocketBackend = new WebsocketBackendAPI(this, "WebsocketBackend", {})

    const lambdaFunctions = new LambdaFunctionStack(this, "LambdaFunctions",
      {
        wsApiEndpoint: websocketBackend.wsAPIStage.url,
        sessionTable: tables.historyTable,
        kendraIndex: kendra.kendraIndex,
        feedbackTable: tables.feedbackTable,
        feedbackBucket: buckets.feedbackBucket
      })

    websocketBackend.wsAPI.addRoute('getChatbotResponse', {
      integration: new WebSocketLambdaIntegration('chatbotResponseIntegration', lambdaFunctions.chatFunction),
    });
    websocketBackend.wsAPI.addRoute('$connect', {
      integration: new WebSocketLambdaIntegration('chatbotConnectionIntegration', lambdaFunctions.chatFunction),
    });
    websocketBackend.wsAPI.addRoute('$default', {
      integration: new WebSocketLambdaIntegration('chatbotConnectionIntegration', lambdaFunctions.chatFunction),
    });
    websocketBackend.wsAPI.addRoute('$disconnect', {
      integration: new WebSocketLambdaIntegration('chatbotDisconnectionIntegration', lambdaFunctions.chatFunction),
    });
    websocketBackend.wsAPI.addRoute('generateEmail', {
      integration: new WebSocketLambdaIntegration('emailIntegration', lambdaFunctions.chatFunction),
    });

    websocketBackend.wsAPI.grantManageConnections(lambdaFunctions.chatFunction);


    const sessionAPIIntegration = new HttpLambdaIntegration('SessionAPIIntegration', lambdaFunctions.sessionFunction);
    restBackend.restAPI.addRoutes({
      path: "/user-sessions",
      methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.POST, apigwv2.HttpMethod.DELETE],
      integration: sessionAPIIntegration
    })
    lambdaFunctions.chatFunction.addEnvironment(
      "mvp_user_session_handler_api_gateway_endpoint", restBackend.restAPI.apiEndpoint + "/user-sessions")
    

    const feedbackAPIIntegration = new HttpLambdaIntegration('FeedbackAPIIntegration', lambdaFunctions.feedbackFunction);
    restBackend.restAPI.addRoutes({
      path: "/user-feedback",
      methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.POST, apigwv2.HttpMethod.DELETE],
      integration: feedbackAPIIntegration,
    })

    const feedbackAPIDownloadIntegration = new HttpLambdaIntegration('FeedbackAPIIntegration', lambdaFunctions.feedbackFunction);
    restBackend.restAPI.addRoutes({
      path: "/user-feedback/download-feedback",
      methods: [apigwv2.HttpMethod.POST],
      integration: feedbackAPIDownloadIntegration
    })
    
      // this.wsAPI = websocketBackend.wsAPI;




    // const api = new appsync.GraphqlApi(this, "ChatbotApi", {
    //   name: "ChatbotGraphqlApi",
    //   definition: appsync.Definition.fromFile(
    //     path.join(__dirname, "schema/schema.graphql")
    //   ),
    //   authorizationConfig: {
    //     additionalAuthorizationModes: [
    //       {
    //         authorizationType: appsync.AuthorizationType.IAM,
    //       },
    //       {
    //         authorizationType: appsync.AuthorizationType.USER_POOL,
    //         userPoolConfig: {
    //           userPool: props.userPool,
    //         },
    //       },
    //     ],
    //   },
    //   logConfig: {
    //     fieldLogLevel: appsync.FieldLogLevel.ALL,
    //     retention: RetentionDays.ONE_WEEK,
    //     role: loggingRole,
    //   },
    //   xrayEnabled: true,
    //   visibility: props.config.privateWebsite ? appsync.Visibility.PRIVATE : appsync.Visibility.GLOBAL
    // });

    // new ApiResolvers(this, "RestApi", {
    //   ...props,
    //   sessionsTable: chatTables.sessionsTable,
    //   byUserIdIndex: chatTables.byUserIdIndex,
    //   api,
    //   userFeedbackBucket: chatBuckets.userFeedbackBucket,
    // });

    // const realtimeBackend = new RealtimeGraphqlApiBackend(this, "Realtime", {
    //   ...props,
    //   api,
    // });

    // realtimeBackend.resolvers.outgoingMessageHandler.addEnvironment(
    //   "GRAPHQL_ENDPOINT",
    //   api.graphqlUrl
    // );

    // api.grantMutation(realtimeBackend.resolvers.outgoingMessageHandler);

    // // Prints out URL
    // new cdk.CfnOutput(this, "GraphqlAPIURL", {
    //   value: api.graphqlUrl,
    // });

    // // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "wsAPI - apiEndpoint", {
      value: websocketBackend.wsAPI.apiEndpoint || "",
    });

    // this.messagesTopic = realtimeBackend.messagesTopic;
    // this.sessionsTable = chatTables.sessionsTable;
    // this.byUserIdIndex = chatTables.byUserIdIndex;
    // this.userFeedbackBucket = chatBuckets.userFeedbackBucket;
    // this.filesBucket = chatBuckets.filesBucket;
    // this.graphqlApi = api;

    /**
     * CDK NAG suppression
     */
    // NagSuppressions.addResourceSuppressions(loggingRole, [
    //   {
    //     id: "AwsSolutions-IAM5",
    //     reason:
    //       "Access to all log groups required for CloudWatch log group creation.",
    //   },
    // ]);
  }
}
