import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadSection } from './admin/UploadSection';
import { EscalationSection } from './admin/EscalationSection';
import { ReportsSection } from './admin/ReportsSection';
import { AllChatsSection } from './admin/AllChatsSection';
import { Upload, AlertTriangle, BarChart3, MessageSquare, Sparkles, Building2 } from 'lucide-react';

type TabType = 'upload' | 'escalation' | 'reports' | 'allchats';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('upload');

  const tabs = [
    { id: 'upload' as TabType, label: 'Upload', icon: Upload, description: 'Upload Excel files' },
    { id: 'escalation' as TabType, label: 'Escalation', icon: AlertTriangle, description: 'Handle escalated chats' },
    { id: 'reports' as TabType, label: 'Reports', icon: BarChart3, description: 'View analytics' },
    { id: 'allchats' as TabType, label: 'All Chats', icon: MessageSquare, description: 'View all conversations' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadSection />;
      case 'escalation':
        return <EscalationSection />;
      case 'reports':
        return <ReportsSection />;
      case 'allchats':
        return <AllChatsSection />;
      default:
        return <UploadSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface p-4 lg:p-8 animate-slide-up">
      {/* Header */}
      <header className="mb-8 flex items-center space-x-6 animate-scale-in">
        <div className="relative animate-float">
          <div className="absolute -inset-4 bg-gradient-primary rounded-full opacity-20 blur-lg animate-pulse-glow" />
          <div className="relative p-3 bg-gradient-primary rounded-xl shadow-glow">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-slide-in-right">
            InPlace Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg mt-2 animate-slide-in-right" style={{animationDelay: '200ms'}}>
            Professional Talent Management Platform
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="mb-8 flex flex-wrap gap-4 animate-slide-up" style={{animationDelay: '400ms'}}>
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'tab-active' : 'tab'}
              size="lg"
              onClick={() => setActiveTab(tab.id)}
              className="rounded-xl shadow-card hover-lift glass-effect"
              style={{animationDelay: `${600 + index * 100}ms`}}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Button>
          );
        })}
      </nav>

      {/* Content */}
      <Card className="bg-gradient-surface border-border shadow-floating glass-effect animate-scale-in hover-lift" style={{animationDelay: '800ms'}}>
        <CardHeader className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-accent opacity-5" />
          <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-4 relative z-10">
            <div className="p-2 rounded-lg bg-gradient-primary shadow-glow">
              {React.createElement(tabs.find(tab => tab.id === activeTab)?.icon || Upload, { 
                className: "h-6 w-6 text-primary-foreground" 
              })}
            </div>
            {tabs.find(tab => tab.id === activeTab)?.label}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-lg relative z-10">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="animate-slide-up">
            {renderTabContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}