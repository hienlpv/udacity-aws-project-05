import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

import { getUserTodos } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    createLogger('Processing event: ' + event);
    const userId = getUserId(event);
    const deleted = event.queryStringParameters.deleted === 'true';
    const result = await getUserTodos(userId, deleted);

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ items: result }),
    };
};
