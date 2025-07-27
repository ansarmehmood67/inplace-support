import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadSection } from './admin/UploadSection';
import { EscalationSection } from './admin/EscalationSection';
import { ReportsSection } from './admin/ReportsSection';
import { AllChatsSection } from './admin/AllChatsSection';
import { Upload, AlertTriangle, BarChart3, MessageSquare, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-surface p-4 lg:p-8">
      {/* Header */}
      <header className="mb-8 flex items-center space-x-4">
        <div className="relative">
          <Sparkles className="h-12 w-12 text-primary" />
          <div className="absolute -inset-1 rounded-full bg-gradient-primary opacity-20 blur-md"></div>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">
            InPlace Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your chatbot and conversations</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="mb-8 flex flex-wrap gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'tab-active' : 'tab'}
              size="lg"
              onClick={() => setActiveTab(tab.id)}
              className="rounded-xl shadow-card"
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Button>
          );
        })}
      </nav>

      {/* Content */}
      <Card className="bg-gradient-surface border-border shadow-elevated">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            {React.createElement(tabs.find(tab => tab.id === activeTab)?.icon || Upload, { className: "h-6 w-6 text-primary" })}
            {tabs.find(tab => tab.id === activeTab)?.label}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {renderTabContent()}
        </CardContent>
      </Card>
    </div>
  );
}