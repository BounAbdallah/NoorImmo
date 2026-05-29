import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { aiService } from '../../services/aiService';

export default function ChatWidget() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    // Fonctions définies avant les hooks qui les référencent
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadSuggestions = async () => {
        try {
            const response = await aiService.getSuggestions();
            if (response.success) {
                setSuggestions(response.data.suggestions || []);
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    };

    // Tous les useEffect AVANT tout return conditionnel (règle des hooks)
    useEffect(() => {
        if (isOpen && suggestions.length === 0) {
            loadSuggestions();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Masquer sur les pages publiques — APRÈS tous les hooks
    const publicPages = ['/', '/pricing', '/contact', '/login', '/register', '/custom-plan-request', '/forgot-password', '/reset-password'];
    if (publicPages.includes(location.pathname)) {
        return null;
    }

    const handleSendMessage = async (message = null) => {
        const messageToSend = message || inputMessage.trim();
        if (!messageToSend) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: messageToSend,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await aiService.chat(messageToSend, conversationId);

            if (response.success) {
                const aiMessage = {
                    id: Date.now() + 1,
                    type: 'assistant',
                    content: response.data.response,
                    queryType: response.data.query_type,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
                setConversationId(response.data.conversation_id);
            }
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                type: 'assistant',
                content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
                isError: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleSendMessage(suggestion);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50"
                title="Assistant IA"
            >
                <MessageSquare size={24} />
            </button>
        );
    }

    return (
        <div
            className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl z-50 flex flex-col transition-all ${isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'
                }`}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare size={20} />
                    <span className="font-semibold">Assistant Noor Immo</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="hover:bg-blue-800 p-1 rounded transition"
                    >
                        {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="hover:bg-blue-800 p-1 rounded transition"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-8">
                                <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="font-medium">Bonjour ! 👋</p>
                                <p className="text-sm mt-2">Comment puis-je vous aider aujourd'hui ?</p>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${msg.type === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : msg.isError
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-white text-gray-800 shadow'
                                        }`}
                                >
                                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                                    {msg.queryType && (
                                        <div className="text-xs mt-1 opacity-70">
                                            {msg.queryType === 'sql' ? '⚡ Réponse rapide' : '🧠 IA'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white rounded-lg p-3 shadow">
                                    <Loader2 size={20} className="animate-spin text-blue-600" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="px-4 py-2 border-t bg-white">
                            <p className="text-xs text-gray-500 mb-2">💡 Questions suggérées :</p>
                            <div className="space-y-1">
                                {suggestions.slice(0, 3).map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full text-left text-sm text-blue-600 hover:bg-blue-50 p-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isLoading}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t bg-white rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Tapez votre question..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={isLoading || !inputMessage.trim()}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
