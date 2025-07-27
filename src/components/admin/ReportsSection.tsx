import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw, CheckCircle, XCircle, AlertTriangle, User } from 'lucide-react';

interface Candidate {
  name: string;
  phone_number: string;
  status: string;
  last_message: string;
  last_sender: string;
  last_updated: string;
}

export function ReportsSection() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      // Since we don't have direct access to the template data, 
      // we'll need to make an API call or use the existing data structure
      // For now, we'll simulate the data structure
      const response = await fetch('https://ba072026eae8.ngrok-free.app/get_all_candidates/', {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error('Failed to load candidates:', error);
      // Fallback: Use mock data for demonstration
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-secondary border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold text-foreground">{candidates.length}</p>
              </div>
              <User className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-secondary border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Escalated</p>
                <p className="text-2xl font-bold text-warning">
                  {candidates.filter(c => c.status?.toLowerCase() === 'escalated').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-success">
                  {candidates.filter(c => c.status?.toLowerCase() === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-info">
                  {candidates.filter(c => c.status?.toLowerCase() === 'active').length}
                </p>
              </div>
              <User className="h-8 w-8 text-info" />
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
              onClick={loadCandidates}
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