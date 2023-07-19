import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('TodosAccess');
const attachment = new AttachmentUtils();

// TODO: Implement the dataLayer logic
export class TodosAccess {
    docClient = new XAWS.DynamoDB.DocumentClient() as DocumentClient;
    todosTable = process.env.TODOS_TABLE;
    todosIndex = process.env.INDEX_NAME;

    async getTodos(userId: string, deleted = false): Promise<TodoItem[]> {
        logger.info('Getting all todos function called');

        const result = await this.docClient
            .query({
                TableName: this.todosTable,
                IndexName: this.todosIndex,
                FilterExpression: "deleted = :deleted",
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                    ':deleted': deleted
                },
            })
            .promise();

        const items = result.Items;
        return items as TodoItem[];
    }

    // Create todo
    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Creating todo item function called');
        const result = await this.docClient
            .put({
                TableName: this.todosTable,
                Item: todoItem,
            })
            .promise();
        logger.info('Todo item created', result);
        return todoItem as TodoItem;
    }

    // Delete todo
    async deleteTodo(userId: string, todoId: string): Promise<boolean> {
        await this.docClient
            .delete({
                TableName: this.todosTable,
                Key: {
                    userId: userId,
                    todoId: todoId,
                },
            })
            .promise();
        return true;
    }

    // Soft delete todo
    async softDeleteTodo(userId: string, todoId: string): Promise<boolean> {
        await this.docClient
            .update({
                TableName: this.todosTable,
                Key: {
                    userId: userId,
                    todoId: todoId,
                },
                UpdateExpression: "set deleted = :deleted",
                ExpressionAttributeValues: { ':deleted': true },
            })
            .promise();
        return true;
    }

    // Update todo
    async updateTodo(todoId: string, userId: string, updateTodoRequest: UpdateTodoRequest) {
        let expressionAttibutes = {
            ':done': updateTodoRequest.done,
            ':name': updateTodoRequest.name,
            ':dueDate': updateTodoRequest.dueDate,
        };
        let updateExpression = 'set done = :done, dueDate= :dueDate, #n= :name';

        await this.docClient
            .update({
                TableName: this.todosTable,
                Key: {
                    userId: userId,
                    todoId: todoId,
                },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttibutes,
                ExpressionAttributeNames: {
                    '#n': 'name',
                },
            })
            .promise();
    }

    // Restore Todo
    async restoreTodo(userId: string, todoId: string) {
        await this.docClient
            .update({
                TableName: this.todosTable,
                Key: {
                    userId: userId,
                    todoId: todoId,
                },
                UpdateExpression: "set deleted = :deleted",
                ExpressionAttributeValues: { ':deleted': false },
            })
            .promise();
        return true;
    }

    // Upload Image
    async updateTodoAttachmentUrl(userId: string, todoId: string) {
        logger.info('Updating todo attachment url');
        const s3AttachmentUrl = attachment.getAttachmentUrl(todoId);
        const dbTodoTable = process.env.TODOS_TABLE;
        const params = {
            TableName: dbTodoTable,
            Key: {
                userId,
                todoId,
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': s3AttachmentUrl,
            },
            ReturnValues: 'UPDATED_NEW',
        };
        await this.docClient.update(params).promise();
    }
}
