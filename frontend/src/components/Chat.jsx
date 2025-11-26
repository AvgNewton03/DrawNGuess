import { useState, useEffect, useRef } from 'react';
import { cn } from "../lib/utils";

function Chat({ socket, username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      setMessages(prev => [...prev, { ...data, id: Date.now() + Math.random() }]);
    };

    socket.on('chatMessage', handleMessage);
    
    return () => {
      socket.off('chatMessage', handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    socket.emit('chatMessage', { msg: input.trim(), username });
    setInput('');
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 min-h-0">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "p-2 rounded text-sm break-words",
              msg.type === 'correct' ? "bg-green-500/20 text-green-400 font-bold" : 
              msg.username === 'System' ? "text-yellow-400 italic" : "bg-black/20"
            )}
          >
            {msg.username !== 'System' && <strong className="mr-1">{msg.username}:</strong>}
            {msg.message || msg.msg}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className="mt-auto">
        <input
          type="text"
          className="w-full bg-black/20 border border-glass-border p-2 rounded text-white text-sm outline-none placeholder:text-text-muted"
          placeholder="Type your guess here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </>
  );
}

export default Chat;
