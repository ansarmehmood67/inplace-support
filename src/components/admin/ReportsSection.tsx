import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, User, MessageCircle, TrendingUp, Bot, Send, X, ArrowUp, Send as SendIcon } from 'lucide-react';
import { getCandidates, getReportStats, getChatHistory, sendAdminReply } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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
  timestamp?: string;
}

interface ReportStats {
  summary: {
    total_users: number;
    total_messages: number;
    average_conversation_length: number;
    bot_messages: number;
    user_messages: number;
    admin_messages: number;
  };
  engagement_funnel: {
    sent: number;
    replied: number;
    completed_onboarding: number;
    escalated: number;
  };
  escalation_stats: {
    total_escalated: number;
    with_reason: number;
  };
}

export function ReportsSection() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [candidatesData, statsData] = await Promise.all([
        getCandidates(),
        getReportStats()
      ]);
      setCandidates(candidatesData);
      setReportStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setCandidates([]);
      setReportStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'escalated':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'active':
        return <User className="h-4 w-4 text-info" />;
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'escalated':
        return <Badge variant="destructive">{status}</Badge>;
      case 'completed':
        return <Badge className="bg-success text-success-foreground">{status}</Badge>;
      case 'active':
        return <Badge className="bg-info text-info-foreground">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const openChat = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setLoadingChat(true);
    try {
      const response = await getChatHistory(candidate.phone_number);
      setChatHistory(response || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setChatHistory([]);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setLoadingChat(false);
    }
  };

  const closeChat = () => {
    setSelectedCandidate(null);
    setChatHistory([]);
    setNewMessage('');
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedCandidate || sendingMessage) return;
    
    setSendingMessage(true);
    try {
      await sendAdminReply(selectedCandidate.phone_number, newMessage);
      
      // Add the message to the chat history immediately
      const newMsg: ChatMessage = {
        from: 'admin',
        text: newMessage,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, newMsg]);
      setNewMessage('');
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageIcon = (from: string) => {
    switch (from) {
      case 'user':
        return <User className="h-4 w-4 text-info" />;
      case 'bot':
        return <Bot className="h-4 w-4 text-accent" />;
      case 'admin':
        return <User className="h-4 w-4 text-warning" />;
      default:
        return <MessageCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMessageStyles = (from: string) => {
    switch (from) {
      case 'user':
        return 'bg-info/10 border-info/20 ml-auto';
      case 'bot':
        return 'bg-accent/10 border-accent/20';
      case 'admin':
        return 'bg-warning/10 border-warning/20 ml-auto';
      default:
        return 'bg-muted border-border';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-secondary border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{reportStats?.summary.total_users || 0}</p>
              </div>
              <User className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-secondary border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold text-info">{reportStats?.summary.total_messages || 0}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Conversation</p>
                <p className="text-2xl font-bold text-success">{reportStats?.summary.average_conversation_length || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bot Messages</p>
                <p className="text-2xl font-bold text-accent">{reportStats?.summary.bot_messages || 0}</p>
              </div>
              <Bot className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-secondary border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold text-foreground">{reportStats?.engagement_funnel.sent || 0}</p>
              </div>
              <Send className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-secondary border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Replied</p>
                <p className="text-2xl font-bold text-info">{reportStats?.engagement_funnel.replied || 0}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Onboarding</p>
                <p className="text-2xl font-bold text-success">{reportStats?.engagement_funnel.completed_onboarding || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Escalated</p>
                <p className="text-2xl font-bold text-warning">{reportStats?.engagement_funnel.escalated || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="bg-gradient-secondary border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Candidate Reports</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="p-4 font-semibold text-muted-foreground">Name</th>
                  <th className="p-4 font-semibold text-muted-foreground">Phone</th>
                  <th className="p-4 font-semibold text-muted-foreground">Status</th>
                  <th className="p-4 font-semibold text-muted-foreground">Last Updated</th>
                  <th className="p-4 font-semibold text-muted-foreground">Escalated</th>
                  <th className="p-4 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      {loading ? 'Loading candidates...' : 'No candidates found.'}
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate, index) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(candidate.status)}
                          <span className="font-medium text-foreground">{candidate.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-foreground font-mono text-sm">{candidate.phone_number}</td>
                      <td className="p-4">{getStatusBadge(candidate.status)}</td>
                      <td className="p-4 text-muted-foreground text-sm">{formatDate(candidate.last_updated)}</td>
                      <td className="p-4">
                        {candidate.status?.toLowerCase() === 'escalated' ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </td>
                      <td className="p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openChat(candidate)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          Chat
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Chat Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl h-[80vh] bg-card border-border flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedCandidate.status)}
                  <div>
                    <CardTitle className="text-lg text-foreground">{selectedCandidate.name}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">{selectedCandidate.phone_number}</p>
                  </div>
                  {getStatusBadge(selectedCandidate.status)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeChat}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                {loadingChat ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : chatHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 max-w-[80%] ${getMessageStyles(message.from)}`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getMessageIcon(message.from)}
                        </div>
                        <div className="flex-1">
                          <div className="bg-card border rounded-lg p-3">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {message.text}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {message.from}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            {/* Message Input - Only show for escalated candidates */}
            {selectedCandidate.status?.toLowerCase() === 'escalated' && (
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={sendingMessage}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    size="sm"
                  >
                    {sendingMessage ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <SendIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send • This candidate is escalated, so you can reply
                </p>
              </div>
            )}

            {/* Read-only message for non-escalated candidates */}
            {selectedCandidate.status?.toLowerCase() !== 'escalated' && (
              <div className="p-4 border-t border-border">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    This conversation is read-only. Only escalated candidates can receive admin replies.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}