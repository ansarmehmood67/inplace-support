import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw, CheckCircle, XCircle, AlertTriangle, User, MessageCircle, TrendingUp, Bot } from 'lucide-react';
import { getCandidates, getReportStats } from '@/lib/api';

interface Candidate {
  name: string;
  phone_number: string;
  status: string;
  last_message: string;
  last_sender: string;
  last_updated: string;
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

  const openWhatsApp = (phoneNumber: string) => {
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

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
              <ExternalLink className="h-8 w-8 text-primary" />
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
                          onClick={() => openWhatsApp(candidate.phone_number)}
                        >
                          <ExternalLink className="h-4 w-4" />
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
    </div>
  );
}