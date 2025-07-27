import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, Play, AlertTriangle, User, Shield } from 'lucide-react';

interface Candidate {
  name: string;
  phone_number: string;
}

interface ChatMessage {
  from: 'user' | 'bot' | 'admin';
  text: string;
}

export function EscalationSection() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadEscalations = async () => {
    try {
      const response = await fetch('/get_escalated/');
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error('Failed to load escalations:', error);
    }
  };

  const selectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    fetchChat(candidate.phone_number);
    
    // Clear existing interval and set new one
    if (intervalId) clearInterval(intervalId);
    const newIntervalId = setInterval(() => fetchChat(candidate.phone_number), 2000);
    setIntervalId(newIntervalId);
  };

  const fetchChat = async (phoneNumber: string) => {
    try {
      const response = await fetch(`/get_chat_history/?phone=${phoneNumber}`);
      const data = await response.json();
      setChatHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch chat:', error);
    }
  };

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCandidate || !replyText.trim()) return;

    try {
      await fetch('/send_admin_reply/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: selectedCandidate.phone_number,
          text: replyText
        })
      });
      setReplyText('');
      fetchChat(selectedCandidate.phone_number);
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  const resumeBot = async () => {
    if (!selectedCandidate) return;

    try {
      await fetch('/resume_bot/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: selectedCandidate.phone_number })
      });
      alert('Bot resumed for user.');
      loadEscalations(); // Refresh the list
    } catch (error) {
      console.error('Failed to resume bot:', error);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadEscalations();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const getMessageIcon = (from: string) => {
    switch (from) {
      case 'user': return <User className="h-4 w-4" />;
      case 'bot': return <Bot className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      default: return null;
    }
  };

  const getMessageStyles = (from: string) => {
    switch (from) {
      case 'user':
        return 'bg-chat-user text-foreground border-primary/20';
      case 'bot':
        return 'bg-chat-bot text-foreground border-success/20';
      case 'admin':
        return 'bg-chat-admin text-foreground border-info/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Candidates List */}
      <Card className="bg-gradient-secondary border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Escalated Candidates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] px-4">
            <div className="space-y-2">
              {candidates.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No escalated candidates</p>
              ) : (
                candidates.map((candidate) => (
                  <Button
                    key={candidate.phone_number}
                    variant={selectedCandidate?.phone_number === candidate.phone_number ? 'tab-active' : 'outline'}
                    className="w-full justify-start p-4 h-auto"
                    onClick={() => selectCandidate(candidate)}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{candidate.name}</div>
                      <div className="text-sm opacity-75">{candidate.phone_number}</div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={loadEscalations}
              className="w-full"
            >
              Refresh List
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-gradient-secondary border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              {selectedCandidate ? `💬 Chat with: ${selectedCandidate.name}` : '💬 Select a candidate to start chatting'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] p-4">
              <div className="space-y-3">
                {chatHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${getMessageStyles(message.from)}`}
                  >
                    <div className="mt-1">
                      {getMessageIcon(message.from)}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium opacity-75 mb-1 capitalize">
                        {message.from === 'admin' ? 'Admin' : message.from}
                      </div>
                      <div className="text-sm">{message.text}</div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Reply Form */}
        {selectedCandidate && (
          <Card className="bg-gradient-secondary border-border">
            <CardContent className="p-4">
              <form onSubmit={sendReply} className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1"
                  />
                  <Button type="submit" variant="success" disabled={!replyText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="warning"
                  onClick={resumeBot}
                  className="w-full"
                >
                  <Play className="h-4 w-4" />
                  Resume Bot
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}