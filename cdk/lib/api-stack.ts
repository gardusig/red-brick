import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';


interface ApiStackProps extends StackProps {
    userPool: cognito.UserPool;
    personTable: dynamodb.ITable;
    domainName: string;
    certificate: certificatemanager.ICertificate;
    hostedZone: route53.IHostedZone;
}

export class ApiStack extends Stack {
    public readonly apiUrl: string;

    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);
        const { personTable } = props;

        const makeLambda = (name: string, file: string) => {
            const fn = new lambda.Function(this, `${name}Fn`, {
                runtime: lambda.Runtime.NODEJS_20_X,
                handler: `${file}.handler`,
                code: lambda.Code.fromAsset('lambda'),
                environment: {
                    PERSON_TABLE_NAME: personTable.tableName,
                },
            });
            personTable.grantReadWriteData(fn);
            return fn;
        };

        const postFn = makeLambda('PostPerson', 'post-person');
        const getFn = makeLambda('GetPerson', 'get-person');
        const putFn = makeLambda('UpdatePerson', 'update-person');
        const delFn = makeLambda('DeletePerson', 'delete-person');

        const authorizer = new authorizers.HttpUserPoolAuthorizer('PersonAuthorizer', props.userPool, {
            userPoolClients: [],
        });

        const domain = new apigatewayv2.DomainName(this, 'CustomDomain', {
            domainName: props.domainName,
            certificate: props.certificate,
        });

        new route53.ARecord(this, 'ApiAliasRecord', {
            zone: props.hostedZone,
            recordName: props.domainName,
            target: route53.RecordTarget.fromAlias(new route53targets.ApiGatewayv2DomainProperties(
                domain.regionalDomainName,
                domain.regionalHostedZoneId
            )),
        });

        const httpApi = new apigatewayv2.HttpApi(this, 'PersonHttpApi', {
            corsPreflight: {
                allowHeaders: ['Authorization', 'Content-Type'],
                allowMethods: [
                    apigatewayv2.CorsHttpMethod.GET,
                    apigatewayv2.CorsHttpMethod.POST,
                    apigatewayv2.CorsHttpMethod.PUT,
                    apigatewayv2.CorsHttpMethod.DELETE
                ],
                allowOrigins: ['*'],
            }
        });

        httpApi.addRoutes({
            path: '/person',
            methods: [apigatewayv2.HttpMethod.POST],
            integration: new integrations.HttpLambdaIntegration('PostPersonIntegration', postFn),
            authorizer,
        });

        httpApi.addRoutes({
            path: '/person',
            methods: [apigatewayv2.HttpMethod.GET],
            integration: new integrations.HttpLambdaIntegration('GetPersonIntegration', getFn),
            authorizer,
        });

        httpApi.addRoutes({
            path: '/person',
            methods: [apigatewayv2.HttpMethod.PUT],
            integration: new integrations.HttpLambdaIntegration('PutPersonIntegration', putFn),
            authorizer,
        });

        httpApi.addRoutes({
            path: '/person',
            methods: [apigatewayv2.HttpMethod.DELETE],
            integration: new integrations.HttpLambdaIntegration('DelPersonIntegration', delFn),
            authorizer,
        });

        this.apiUrl = httpApi.apiEndpoint;
    }
}
