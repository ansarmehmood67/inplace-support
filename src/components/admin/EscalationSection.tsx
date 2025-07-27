import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Bot, UserCog, Send, RefreshCw, Play, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { getEscalated, getChatHistory, sendAdminReply, resumeBot } from '@/lib/api';
import { toast } from 'sonner';

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
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadEscalations = async () => {
    if (!isOnline) {
      toast.error('No internet connection. Please check your network.');
      return;
    }

    setLoading(true);
    try {
      const data = await getEscalated();
      setCandidates(data);
      toast.success(`Found ${data.length} escalated conversations`);
    } catch (error) {
      console.error('Error loading escalations:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load escalated conversations');
      setCandidates([]);
    } finally {
      setLoading(false);
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
    setChatLoading(true);
    try {
      const data = await getChatHistory(phoneNumber);
      setChatHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching chat:', error);
      toast.error('Failed to load chat history');
      setChatHistory([]);
    } finally {
      setChatLoading(false);
    }
  };

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCandidate || !replyText.trim()) {
      toast.error('Please enter a message to send');
      return;
    }

    if (!isOnline) {
      toast.error('No internet connection. Please check your network.');
      return;
    }

    setSending(true);
    try {
      await sendAdminReply(selectedCandidate.phone_number, replyText);
      setReplyText('');
      toast.success('Reply sent successfully');
      // Refresh chat history
      fetchChat(selectedCandidate.phone_number);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleResumeBot = async () => {
    if (!selectedCandidate) return;

    if (!isOnline) {
      toast.error('No internet connection. Please check your network.');
      return;
    }

    try {
      await resumeBot(selectedCandidate.phone_number);
      toast.success('Bot resumed successfully for this candidate');
      // Refresh the escalations list
      loadEscalations();
    } catch (error) {
      console.error('Error resuming bot:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to resume bot');
    }
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      case 'admin': return <UserCog className="h-4 w-4" />;
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
    <div className="space-y-8 animate-slide-up">
      {/* Network Status */}
      {!isOnline && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 animate-error-shake">
          <WifiOff className="h-5 w-5 text-red-500" />
          <span className="text-red-700 font-medium">No internet connection. Please check your network.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px]">
        {/* Candidates List */}
        <Card className="bg-gradient-surface border-border/50 shadow-floating glass-effect hover-lift">
          <CardHeader className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-accent opacity-5" />
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-foreground relative z-10">
              <div className="p-2 rounded-lg bg-gradient-primary shadow-glow">
                <AlertCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              Escalated Candidates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] px-6">
              <div className="space-y-3 py-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-16 w-full animate-skeleton" />
                    </div>
                  ))
                ) : candidates.length === 0 ? (
                  <div className="text-center py-12 animate-fade-in">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No escalated candidates found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadEscalations}
                      className="mt-4"
                      disabled={!isOnline}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                ) : (
                  candidates.map((candidate, index) => (
                    <Button
                      key={candidate.phone_number}
                      variant={selectedCandidate?.phone_number === candidate.phone_number ? 'tab-active' : 'tab'}
                      className="w-full justify-start p-4 h-auto rounded-xl shadow-card hover-lift glass-effect animate-scale-in"
                      onClick={() => selectCandidate(candidate)}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="text-left">
                        <div className="font-semibold text-foreground">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground">{candidate.phone_number}</div>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="p-6 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={loadEscalations}
                disabled={loading || !isOnline}
                className="w-full rounded-xl shadow-card hover-lift"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh List</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-surface border-border/50 shadow-floating glass-effect hover-lift">
            <CardHeader className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-accent opacity-5" />
              <CardTitle className="text-2xl font-bold text-foreground relative z-10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-primary shadow-glow">
                  <Bot className="h-6 w-6 text-primary-foreground" />
                </div>
                {selectedCandidate ? `Chat with: ${selectedCandidate.name}` : 'Select a candidate to start chatting'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[350px] p-6">
                <div className="space-y-4">
                  {chatLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-full animate-skeleton" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/4 animate-skeleton" />
                          <Skeleton className="h-6 w-3/4 animate-skeleton" />
                        </div>
                      </div>
                    ))
                  ) : chatHistory.length === 0 ? (
                    <div className="text-center py-12 animate-fade-in">
                      <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">
                        {selectedCandidate ? 'No messages yet' : 'Select a candidate to view chat history'}
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-4 rounded-xl border shadow-card ${getMessageStyles(message.from)} animate-scale-in`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="mt-1 p-2 rounded-full bg-primary/10">
                          {getMessageIcon(message.from)}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                            {message.from === 'admin' ? 'Admin' : message.from}
                          </div>
                          <div className="text-sm leading-relaxed">{message.text}</div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Reply Form */}
          {selectedCandidate && (
            <Card className="bg-gradient-surface border-border/50 shadow-floating glass-effect hover-lift animate-scale-in">
              <CardContent className="p-6">
                <form onSubmit={sendReply} className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your admin reply..."
                      className="flex-1 rounded-xl shadow-card"
                      disabled={sending || !isOnline}
                    />
                    <Button 
                      type="submit" 
                      variant="premium" 
                      disabled={!replyText.trim() || sending || !isOnline}
                      className="rounded-xl shadow-glow hover-lift"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="warning"
                    onClick={handleResumeBot}
                    className="w-full rounded-xl shadow-card hover-lift"
                    disabled={!isOnline}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume Bot for this Candidate
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}