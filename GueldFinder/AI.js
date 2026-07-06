module.exports = class DeepSeekAdapter {
    static async generateResponse(prompt) {
        // Adicionado const para escopo correto
        const API_URL = 'https://api.deepseek.com/v1/chat/completions'; 
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer sk-2a4144829a9946fc9d01b0e8be0bf98d`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0, // Perfeito para manter a saída de JSON consistente
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[DeepSeekAdapter] API Error:`, {
                status: response.status,
                statusText: response.statusText,
                body: errorBody,
                prompt: prompt.substring(0, 50) + '...',
            });
            throw new Error('DeepSeek API Failure');
        }

        const data = await response.json();
        return {
            content: data?.choices?.[0]?.message?.content,
            usage: data.usage,
        };
    }
}