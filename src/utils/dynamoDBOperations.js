// src/utils/dynamoOperations.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv';

dotenv.config();

// Inicializar cliente DynamoDB
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'Talky_WhatsApp_Bots_Prompts_Data_Base';

export class DynamoDBOperations {
  /**
   * Actualiza el contenido de un prompt específico
   * @param {string} userId - ID del usuario
   * @param {string} promptName - Nombre del prompt a actualizar
   * @param {string} content - Nuevo contenido del prompt
   */
  static async updatePrompt(userId, promptName, content) {
    try {
      const timestamp = new Date().toISOString();
      
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { userId },
        UpdateExpression: 'SET #promptField = :content, #history = list_append(if_not_exists(#history, :empty_list), :historyEntry)',
        ExpressionAttributeNames: {
          '#promptField': promptName,
          '#history': 'history'
        },
        ExpressionAttributeValues: {
          ':content': content,
          ':historyEntry': [{
            value: `Updated ${promptName}`,
            timestamp
          }],
          ':empty_list': []
        }
      });

      await docClient.send(command);
      console.log(`Successfully updated prompt ${promptName} for user ${userId}`);
    } catch (error) {
      console.error(`Error updating prompt ${promptName}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un prompt específico
   * @param {string} userId - ID del usuario
   * @param {string} promptName - Nombre del prompt a obtener
   */
  static async getPromptDB(userId, promptName) {
    try {
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: { userId }
      });

      const response = await docClient.send(command);
      if (!response.Item || !response.Item[promptName]) {
        throw new Error(`Prompt ${promptName} not found for user ${userId}`);
      }

      return response.Item[promptName];
    } catch (error) {
      console.error(`Error getting prompt ${promptName}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene todos los prompts de un usuario
   * @param {string} userId - ID del usuario
   */
  static async getAllPromptsDB(userId) {
    try {
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: { userId }
      });

      const response = await docClient.send(command);
      if (!response.Item) {
        throw new Error(`No prompts found for user ${userId}`);
      }

      // Filtrar los campos que no son prompts (como 'history')
      const { history, ...prompts } = response.Item;
      return prompts;
    } catch (error) {
      console.error(`Error getting prompts for user ${userId}:`, error);
      throw error;
    }
  }
}