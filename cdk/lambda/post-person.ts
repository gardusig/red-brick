import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.PERSON_TABLE_NAME!;

export const handler = async (event: any) => {
    const body = JSON.parse(event.body || '{}');
    const { personId, name, email } = body;

    if (!personId || !name) {
        return { statusCode: 400, body: 'Missing fields' };
    }

    await client.send(
        new PutItemCommand({
            TableName: TABLE_NAME,
            Item: {
                personId: { S: personId },
                name: { S: name },
                email: { S: email || '' },
            },
        })
    );

    return {
        statusCode: 201,
        body: JSON.stringify({ message: 'Person created' }),
    };
};
