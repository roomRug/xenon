document.getElementById('sendButton').addEventListener('click', queueMessage);
document.getElementById('userInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        queueMessage();
    }
});

let messageQueue = [];
let isProcessing = false;

function queueMessage() {
    const userInput = document.getElementById('userInput').value;
    if (userInput.trim() === '') return;

    appendMessage(userInput, 'user-message');
    document.getElementById('userInput').value = '';

    messageQueue.push(userInput);
    processQueue();
}

function processQueue() {
    if (isProcessing || messageQueue.length === 0) return;

    isProcessing = true;
    const userMessage = messageQueue.shift();

    appendTypingIndicator();

    fetch('http://localhost:1234/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: 'You are a helpful coding assistant.' },
                { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 150, // Adjust based on your needs
        })
    })
    .then(response => response.json())
    .then(data => {
        const botReply = data.choices && data.choices[0] ? data.choices[0].message.content : 'No response';
        removeTypingIndicator();
        appendMessage(botReply, 'bot-message');
    })
    .catch(error => {
        console.error('Error:', error);
        removeTypingIndicator();
        appendMessage('Error: Unable to connect to the chatbot.', 'bot-message');
    })
    .finally(() => {
        isProcessing = false;
        processQueue(); // Process the next message in the queue
    });
}

function appendMessage(message, className) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${className}`;
    messageElement.textContent = message;

    const messagesContainer = document.getElementById('messages');
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function appendTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing-indicator';
    typingIndicator.id = 'typing-indicator';
    typingIndicator.textContent = 'AI is typing...';

    const messagesContainer = document.getElementById('messages');
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}
