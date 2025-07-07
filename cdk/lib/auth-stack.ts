import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class AuthStack extends Stack {
    readonly userPool: cognito.UserPool;
    readonly userPoolClient: cognito.UserPoolClient;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.userPool = new cognito.UserPool(this, 'PersonUserPool', {
            selfSignUpEnabled: true,
            signInAliases: { email: true },
            autoVerify: { email: true },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireDigits: true,
            },
        });

        this.userPoolClient = new cognito.UserPoolClient(this, 'PersonUserPoolClient', {
            userPool: this.userPool,
            generateSecret: false,
            authFlows: {
                userPassword: true,
                userSrp: true,
            },
        });

        this.userPool.addDomain('CognitoDomain', {
            cognitoDomain: {
                domainPrefix: 'person-app-example',
            },
        });
    }
}
