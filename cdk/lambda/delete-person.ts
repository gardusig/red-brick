import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.PERSON_TABLE_NAME!;

export const handler = async (event: any) => {
    const personId = event.queryStringParameters?.personId;
    if (!personId) {
        return { statusCode: 400, body: 'Missing personId' };
    }

    await client.send(
        new DeleteItemCommand({
            TableName: TABLE_NAME,
            Key: { personId: { S: personId } },
        })
    );

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Person deleted' }),
    };
};
