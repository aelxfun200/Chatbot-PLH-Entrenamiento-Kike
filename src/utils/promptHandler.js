// src/utils/promptHandler.js
import { DynamoDBOperations } from './dynamoDBOperations.js';

export const getPrompt = async (promptName, userId = 'user123') => {
    try {
        const promptContent = await DynamoDBOperations.getPromptDB(userId, promptName);
        return promptContent;
    } catch (error) {
        console.error('Error getting prompt:', error);
        throw error;
    }
};

export const updatePrompt = async (promptName, content, userId = 'user123') => {
    try {
        await DynamoDBOperations.updatePrompt(userId, promptName, content);
    } catch (error) {
        console.error('Error updating prompt:', error);
        throw error;
    }
};