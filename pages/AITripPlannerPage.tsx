import React, { useState, useRef, useEffect } from 'react';
import { TravelPackage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: string;
    type: 'user' | 'ai';
    content: string;
}

const AITripPlannerPage: React.FC = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'ai',
            content: "👋 Hello! I'm your AI Travel Assistant. Tell me about your dream trip and I'll find the perfect packages for you!"
        }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [recommendedPackages, setRecommendedPackages] = useState<TravelPackage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Removed auto-scroll to prevent page jumping

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isProcessing) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: userInput
        };

        setMessages(prev => [...prev, userMessage]);
        setIsProcessing(true);
        const currentPrompt = userInput;
        setUserInput('');

        try {
            const response = await fetch('http://localhost:5000/api/ai/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: currentPrompt,
                    history: messages // Send conversation history for context
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get AI recommendation');
            }

            const data = await response.json();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: data.response
            };

            setMessages(prev => [...prev, aiMessage]);
            setRecommendedPackages(data.packages || []);
            setIsProcessing(false);

        } catch (error) {
            console.error('Error getting AI recommendation:', error);

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: "I'm sorry, I encountered an error. Please try again."
            };

            setMessages(prev => [...prev, errorMessage]);
            setIsProcessing(false);
        }
    };

    const clearChat = () => {
        setMessages([
            {
                id: '1',
                type: 'ai',
                content: "👋 Hello! I'm your AI Travel Assistant. Tell me about your dream trip and I'll find the perfect packages for you!"
            }
        ]);
        setRecommendedPackages([]);
        setUserInput('');
    };

    return (
        <div className="relative bg-black min-h-screen">
            <div
                className="pointer-events-none absolute inset-0 [background-size:40px_40px] select-none bg-grid-white/[0.05] [background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
            />
            <div className="relative z-10 pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section - Bigger Heading */}
                    <div className="text-center mb-6">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600">
                                AI Trip Planner
                            </span>
                        </h1>
                        <p className="text-base text-gray-400">
                            Powered by Google Gemini AI
                        </p>
                    </div>

                    {/* Main Content - Split Layout with Smaller Boxes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left Side - Chat with Fixed Input */}
                        <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/80 rounded-2xl shadow-2xl border border-gray-800 flex flex-col h-[400px]">
                            {/* Chat Header */}
                            <div className="flex items-center justify-between p-3 border-b border-gray-700 flex-shrink-0">
                                <h2 className="text-base font-semibold text-white flex items-center">
                                    <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Chat
                                </h2>
                                <button
                                    onClick={clearChat}
                                    className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white text-xs rounded-lg border border-gray-700 transition-all flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Clear Chat
                                </button>
                            </div>

                            {/* Messages Area - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                <AnimatePresence>
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className="max-w-[85%]">
                                                <div
                                                    className={`rounded-xl px-4 py-3 ${message.type === 'user'
                                                        ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg'
                                                        : 'bg-gray-800/80 text-gray-100 border border-gray-700'
                                                        }`}
                                                >
                                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Typing Indicator */}
                                {isProcessing && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3">
                                            <div className="flex space-x-2">
                                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area - Fixed at Bottom */}
                            <div className="border-t border-gray-700 p-3 bg-gray-900/50 flex-shrink-0">
                                <form onSubmit={handleSubmit} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder="Describe your dream trip..."
                                        className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                                        disabled={isProcessing}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isProcessing || !userInput.trim()}
                                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Right Side - Recommended Packages */}
                        <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/80 rounded-2xl shadow-2xl overflow-hidden border border-gray-800 h-[400px]">
                            <div className="p-4 h-full flex flex-col">
                                <h2 className="text-lg font-bold text-white mb-3 flex items-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    Recommended Packages
                                </h2>

                                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                    {recommendedPackages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <p className="text-sm">Ask me about your dream trip and I'll recommend the best packages!</p>
                                        </div>
                                    ) : (
                                        <AnimatePresence>
                                            {recommendedPackages.map((pkg, index) => (
                                                <motion.div
                                                    key={pkg.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    onClick={() => navigate(`/packages/${pkg.id}`)}
                                                    className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-teal-500 transition-all cursor-pointer group"
                                                >
                                                    <div className="flex gap-4 p-4">
                                                        <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                                                            <img
                                                                src={pkg.imageUrls?.[0] || pkg.imageUrl || '/images/placeholder.jpg'}
                                                                alt={pkg.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-white font-semibold text-sm mb-1 truncate group-hover:text-teal-400 transition-colors">
                                                                {pkg.title}
                                                            </h3>
                                                            <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                                                                {pkg.description}
                                                            </p>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                                                    <span className="flex items-center">
                                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        {pkg.days} Days
                                                                    </span>
                                                                </div>
                                                                <span className="text-teal-400 font-bold text-sm">
                                                                    ₹{pkg.price.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Example Prompts */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500 mb-3">Try these examples:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {[
                                "Romantic honeymoon in Kerala",
                                "Family hill station trip",
                                "Adventure in Himachal",
                                "Beach vacation"
                            ].map((example, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setUserInput(example)}
                                    className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white text-xs rounded-full border border-gray-700 transition-all"
                                    disabled={isProcessing}
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AITripPlannerPage;
