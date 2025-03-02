import { ChatItem, ChatMessage, ChatResponse, Conversation, Message, SaveChatParams, ThreadHistoryResponse } from "@/types/chat";
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL: string = Constants.expoConfig?.extra?.API_URL || '';

if (!API_URL) {
  throw new Error('API_URL is not defined');
}


class ChatService {
    private readonly API_URL = API_URL;

    async getConversations(): Promise<Conversation[]> {
        try {
            const response = await axios.get<Conversation[]>(`${this.API_URL}/conversations`, {
                headers: {
                    'accept': 'application/json'
                }
            });
            
            console.log('API Response:', response.data); // Log the entire response

            const allSameThreadId = response.data.length === 0 || response.data.every(conversation => (conversation as any).thread_id !== undefined && (conversation as any).thread_id === (response.data[0] as any).thread_id);
            console.log('Todos los thread_id son iguales:', allSameThreadId);

            return response.data; // Solo devolver la respuesta de la API
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return []; // Retornar un arreglo vacío en caso de error
        }
    }
    
    async getConversation(id: string): Promise<Conversation> {
        const response = await axios.get(`${this.API_URL}/conversations/${id}`);
        return response.data;
    }
    
    async getConversationMessages(conversationId: string): Promise<Message[]> {
        try {
            console.log(`${this.API_URL}/conversations/${conversationId}/messages`);
            const response = await axios.get<Message[]>(`${this.API_URL}/conversations/${conversationId}/messages`, {
                headers: {
                    'accept': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching conversation messages:', error);
            return [];
        }
    }

    async sendMessage(message: string, threadId?: string): Promise<ChatResponse> {
        if (!message || typeof message !== 'string') {
            throw new Error('Invalid message format');
        }

        try {
            const payload: any = {
                message: message.trim(),
            };

            // Include thread_id in payload if available to maintain the conversation thread
            if (threadId) {
                payload.thread_id = threadId;
                console.log('Continuing conversation with thread_id:', threadId);
            }

            const response = await axios.post<ChatResponse>(
                `${this.API_URL}/agents/chat`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200 && response.data) {
                if (response.data.bigquery_data) {
                    console.log('response: ', response.data.response);
                    console.log('BigQuery Data:', response.data.bigquery_data);
                } else {
                    console.log('No BigQuery Data received.');
                }
                return response.data;
            }

            throw new Error('Error en la respuesta del servidor');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('API Error:', {
                    status: error.response?.status,
                    data: error.response?.data
                });
            }
            throw error;
        }
    }

    async getThreadHistory(threadId: string): Promise<ThreadHistoryResponse> {
        try {
            const response = await axios.get<ThreadHistoryResponse>(`${this.API_URL}/agents/chat/history/${threadId}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Thread History API Error:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
            }
            throw new Error('Failed to fetch thread history');
        }
    }

    async saveChatToHistory(chat: SaveChatParams) {
        try {
            const newChatItem: ChatItem = {
                id: chat.id,
                text: chat.text,
                thread_id: chat.thread_id,
                timestamp: chat.timestamp,
                type: chat.type // Asegurarse de que esto esté configurado correctamente
            };

            // Organizar por fecha
            const today = new Date();
            const chatDate = new Date(chat.timestamp);
            
            let sectionTitle = '';
            if (chatDate.toDateString() === today.toDateString()) {
                sectionTitle = 'Today';
            } else if (chatDate.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString()) {
                sectionTitle = 'Yesterday';
            } else if (chatDate.getTime() > today.getTime() - (30 * 24 * 60 * 60 * 1000)) {
                sectionTitle = '30 days before';
            } else {
                sectionTitle = chatDate.toLocaleString('default', { month: 'long' });
            }
        } catch (error) {
            console.error('Error saving chat to history:', error);
            throw new Error('Failed to save chat to history');
        }
    }
}

// Export a singleton instance
export default new ChatService();