import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.PERSON_TABLE_NAME!;

export const handler = async (event: any) => {
    const body = JSON.parse(event.body || '{}');
    const { personId, name, email } = body;

    if (!personId) {
        return { statusCode: 400, body: 'Missing personId' };
    }

    const updateExpr: string[] = [];
    const exprAttrNames: Record<string, string> = {};
    const exprAttrValues: Record<string, any> = {};

    if (name) {
        updateExpr.push('#name = :name');
        exprAttrNames['#name'] = 'name';
        exprAttrValues[':name'] = { S: name };
    }
    if (email) {
        updateExpr.push('#email = :email');
        exprAttrNames['#email'] = 'email';
        exprAttrValues[':email'] = { S: email };
    }

    if (updateExpr.length === 0) {
        return { statusCode: 400, body: 'No fields to update' };
    }

    await client.send(
        new UpdateItemCommand({
            TableName: TABLE_NAME,
            Key: { personId: { S: personId } },
            UpdateExpression: `SET ${updateExpr.join(', ')}`,
            ExpressionAttributeNames: exprAttrNames,
            ExpressionAttributeValues: exprAttrValues,
        })
    );

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Person updated' }),
    };
};
