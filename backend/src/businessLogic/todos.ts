import * as uuid from 'uuid';
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

export async function getUserTodos(userId: string, deleted: boolean): Promise<TodoItem[]> {
    return todosAccess.getTodos(userId, deleted);
}

// Create TODO
export async function createTodo(newTodo: CreateTodoRequest, userId: string) {
    logger.info('Inside createTodo function');

    const todoId = uuid.v4();
    const createdAt = new Date().toISOString();
    const newItem = {
        userId,
        todoId,
        createdAt,
        attachmentUrl: null,
        done: false,
        deleted: false,
        ...newTodo,
    };
    return await todosAccess.createTodoItem(newItem);
}

// Delete Todo
export async function deleteTodo(userId: string, todoId: string) {
    return await todosAccess.deleteTodo(userId, todoId);
}

export async function softDeleteTodo(userId: string, todoId: string) {
    return await todosAccess.softDeleteTodo(userId, todoId);
}

// Update Todo
export async function updateTodo(todoId: string, userId: string, updateTodoRequest: UpdateTodoRequest) {
    return await todosAccess.updateTodo(todoId, userId, updateTodoRequest);
}

// Restore Todo
export async function restoreTodo(userId: string, todoId: string) {
    return await todosAccess.restoreTodo(userId, todoId);
}

// Upload Image
export async function createAttachmentUrl(userId: string, todoId: string) {
    logger.info('Inside createAttachmentUrl function');
    await todosAccess.updateTodoAttachmentUrl(userId, todoId);
    return attachmentUtils.getUploadUrl(todoId);
}
