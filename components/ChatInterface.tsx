'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { Button } from './Button';
import { UserAvatar } from './UserAvatar';
import { Input } from './Input';
import type { User } from '../lib/types';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface ChatInterfaceProps {
  currentUser: User;
  otherUser: User;
  itemTitle: string;
  onClose: () => void;
}

export function ChatInterface({
  currentUser,
  otherUser,
  itemTitle,
  onClose
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock messages for demonstration
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: otherUser.userId,
        content: `Hi! I'm interested in borrowing your ${itemTitle}. Is it still available?`,
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        read: true
      },
      {
        id: '2',
        senderId: currentUser.userId,
        content: 'Yes, it\'s still available! When would you like to borrow it?',
        timestamp: new Date(Date.now() - 3300000), // 55 minutes ago
        read: true
      },
      {
        id: '3',
        senderId: otherUser.userId,
        content: 'Great! I\'d like to borrow it this weekend. How does Saturday work?',
        timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
        read: true
      }
    ];
    setMessages(mockMessages);
  }, [currentUser.userId, otherUser.userId, itemTitle]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.userId,
      content: newMessage.trim(),
      timestamp: new Date(),
      read: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate response
      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: otherUser.userId,
        content: 'Thanks for your response! I\'ll check back soon.',
        timestamp: new Date(),
        read: false
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar src={otherUser.profilePicUrl} alt={otherUser.displayName} size="md" />
            <div>
              <h3 className="font-semibold text-text-primary">{otherUser.displayName}</h3>
              <p className="text-sm text-text-secondary">About: {itemTitle}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUser.userId;
            const showDateSeparator = index === 0 ||
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <div className="text-center my-4">
                    <span className="text-xs text-text-secondary bg-gray-100 px-3 py-1 rounded-full">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                )}

                <div className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  {!isCurrentUser && (
                    <UserAvatar
                      src={otherUser.profilePicUrl}
                      alt={otherUser.displayName}
                      size="sm"
                    />
                  )}

                  <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-1' : 'order-2'}`}>
                    <div className={`rounded-lg px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-primary'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className={`text-xs text-text-secondary mt-1 ${
                      isCurrentUser ? 'text-right' : 'text-left'
                    }`}>
                      {formatTime(message.timestamp)}
                      {isCurrentUser && message.read && (
                        <span className="ml-1">✓✓</span>
                      )}
                    </p>
                  </div>

                  {isCurrentUser && (
                    <UserAvatar
                      src={currentUser.profilePicUrl}
                      alt={currentUser.displayName}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <UserAvatar
                src={otherUser.profilePicUrl}
                alt={otherUser.displayName}
                size="sm"
              />
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

