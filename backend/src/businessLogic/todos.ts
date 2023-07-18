import * as uuid from 'uuid';
import { parseUserId } from '../auth/utils';
import { TodosAccess } from '../dataLayer/todosAcess';
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';

// TODO: Implement businessLogic

const logger = createLogger('Todos');
const attachmentUtils = new AttachmentUtils();
const todosAccess = new TodosAccess();

export async function getUserTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken);
    return todosAccess.getTodos(userId);
}
// Create TODO
export async function createTodo(newTodo: CreateTodoRequest, userId: string) {
    logger.info('Inside createTodo function');

    const todoId = uuid.v4();
    const createdAt = new Date().toISOString();
    const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId);
    const newItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: s3AttachmentUrl,
        ...newTodo,
    };
    return await todosAccess.createTodoItem(newItem);
}

// Delete Todo
export async function deleteTodo(userId: string, todoId: string) {
    return await todosAccess.deleteTodo(userId, todoId);
}

// Update Todo
export async function updateTodo(todoId: string, userId: string, updateTodoRequest: UpdateTodoRequest) {
    return await todosAccess.updateTodo(todoId, userId, updateTodoRequest);
}

// Upload Image
export async function createAttachmentUrl(userId: string, todoId: string) {
    logger.info('Inside createAttachmentUrl function');
    todosAccess.updateTodoAttachmentUrl(userId, todoId);
    return attachmentUtils.getUploadUrl(todoId);
}
