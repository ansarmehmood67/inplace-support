import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, User, Bot, Shield, ExternalLink, ChevronDown } from 'lucide-react';

interface Candidate {
  name: string;
  phone_number: string;
  status: string;
  last_message: string;
  last_sender: string;
  last_updated: string;
}

interface ChatMessage {
  from: 'user' | 'bot' | 'admin';
  text: string;
}

export function AllChatsSection() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userIsScrolling, setUserIsScrolling] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const loadAllChats = async () => {
    try {
      const { getCandidates } = await import('@/lib/api');
      const data = await getCandidates();
      setCandidates(data);
    } catch (error) {
      console.error('Failed to load all chats:', error);
    }
  };

  const selectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsAtBottom(true);
    setShowScrollButton(false);
    fetchChat(candidate.phone_number);
    
    // Clear existing interval and set new one with longer interval
    if (intervalId) clearInterval(intervalId);
    const newIntervalId = setInterval(() => {
      if (!userIsScrolling) {
        fetchChat(candidate.phone_number);
      }
    }, 5000);
    setIntervalId(newIntervalId);
  };

  const fetchChat = async (phoneNumber: string) => {
    try {
      const { getChatHistory } = await import('@/lib/api');
      const data = await getChatHistory(phoneNumber);
      setChatHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch chat:', error);
    }
  };

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setIsAtBottom(true);
      setShowScrollButton(false);
    }
  }, []);

  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    if (!target) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setIsAtBottom(isBottom);
    setShowScrollButton(!isBottom && chatHistory.length > 0);
    
    // Mark user as scrolling
    setUserIsScrolling(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => setUserIsScrolling(false), 2000);
  }, [chatHistory.length]);

  useEffect(() => {
    loadAllChats();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (isAtBottom && !userIsScrolling && chatHistory.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [chatHistory, isAtBottom, userIsScrolling, scrollToBottom]);

  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

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
        return 'bg-chat-user text-foreground border-primary/20 ml-auto max-w-[80%]';
      case 'bot':
        return 'bg-chat-bot text-foreground border-success/20 mr-auto max-w-[80%]';
      case 'admin':
        return 'bg-chat-admin text-foreground border-info/20 mr-auto max-w-[80%]';
      default:
        return 'bg-muted text-muted-foreground max-w-[80%]';
    }
  };

  const openWhatsApp = (phoneNumber: string) => {
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Candidates List */}
      <Card className="bg-gradient-secondary border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <MessageSquare className="h-5 w-5 text-primary" />
            All Candidates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px] px-4">
            <div className="space-y-2">
              {candidates.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No candidates found</p>
              ) : (
                candidates.map((candidate) => (
                  <div key={candidate.phone_number} className="space-y-2">
                    <Button
                      variant={selectedCandidate?.phone_number === candidate.phone_number ? 'tab-active' : 'outline'}
                      className="w-full justify-start p-4 h-auto"
                      onClick={() => selectCandidate(candidate)}
                    >
                      <div className="text-left flex-1">
                        <div className="font-semibold">{candidate.name}</div>
                        <div className="text-sm opacity-75">{candidate.phone_number}</div>
                      </div>
                    </Button>
                    {selectedCandidate?.phone_number === candidate.phone_number && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => openWhatsApp(candidate.phone_number)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open WhatsApp
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAllChats}
              className="w-full"
            >
              Refresh List
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Viewer */}
      <div className="lg:col-span-2">
        <Card className="bg-gradient-secondary border-border h-full">
          <CardHeader>
            <CardTitle className="text-foreground">
              {selectedCandidate ? `💬 Chat with: ${selectedCandidate.name}` : '💬 Select a candidate to view chat'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[500px] relative">
            <ScrollArea ref={scrollAreaRef} className="h-full p-4">
              <div className="space-y-3">
                {chatHistory.length === 0 && selectedCandidate ? (
                  <p className="text-muted-foreground text-center py-8">No chat history available</p>
                ) : (
                  chatHistory.map((message, index) => (
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
                        <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            
            {/* Scroll to bottom button */}
            {showScrollButton && (
              <Button
                onClick={scrollToBottom}
                size="sm"
                className="absolute bottom-4 right-4 rounded-full shadow-lg animate-fade-in"
                variant="outline"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}