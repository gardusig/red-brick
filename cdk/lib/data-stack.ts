import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DataStack extends Stack {
    public readonly personTable: dynamodb.Table;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.personTable = new dynamodb.Table(this, 'PersonTable', {
            partitionKey: { name: 'personId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });
    }
}
