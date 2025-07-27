import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner, ProgressBar } from '@/components/ui/loading';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, CloudUpload, FileText } from 'lucide-react';

export function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/upload/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setAlert({
          type: 'success',
          message: `✅ Upload complete! ${result.added} new candidate${result.added !== 1 ? 's' : ''} added, ${result.skipped} record${result.skipped !== 1 ? 's' : ''} skipped.`
        });
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setAlert({
          type: 'error',
          message: '🚨 Upload failed, please try again.'
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setAlert({
        type: 'error',
        message: '🚨 Upload failed, please try again.'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Auto-hide alert after 5 seconds
      setTimeout(() => setAlert(null), 5000);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <Card className="bg-gradient-secondary border-border shadow-floating hover-lift glass-effect">
        <CardContent className="p-8">
          <div className="flex items-center gap-6 mb-6 animate-scale-in">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-primary rounded-xl opacity-20 blur-lg animate-pulse-glow" />
              <div className="relative p-4 rounded-xl bg-gradient-primary shadow-glow">
                <CloudUpload className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Upload Excel File</h3>
              <p className="text-muted-foreground text-lg">Submit a new batch of candidates using an Excel file (.xls or .xlsx)</p>
            </div>
          </div>

          {alert && (
            <Alert className={`mb-6 animate-slide-up ${
              alert.type === 'success' 
                ? 'border-success bg-success/10 shadow-glow' 
                : 'border-destructive bg-destructive/10'
            }`}>
              <div className="flex items-center gap-3">
                {alert.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-success animate-scale-in" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive animate-scale-in" />
                )}
                <AlertDescription className={`text-lg ${
                  alert.type === 'success' ? 'text-success' : 'text-destructive'
                }`}>
                  {alert.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <Input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  required
                  className="file:border-0 file:bg-gradient-primary file:text-primary-foreground file:rounded-lg file:px-6 file:py-3 file:mr-4 file:shadow-card hover:file:shadow-glow file:transition-all file:duration-300 h-14 text-lg"
                />
              </div>
              <Button
                type="submit"
                variant="premium"
                size="xl"
                disabled={!file || uploading}
                className="min-w-[160px] animate-pulse-glow"
              >
                {uploading ? (
                  <div className="flex items-center gap-3">
                    <LoadingSpinner size="sm" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Upload File
                  </>
                )}
              </Button>
            </div>

            {uploading && uploadProgress > 0 && (
              <div className="animate-slide-up">
                <ProgressBar 
                  progress={uploadProgress} 
                  showPercentage 
                  className="mb-2" 
                />
                <p className="text-sm text-muted-foreground text-center">
                  Processing your file...
                </p>
              </div>
            )}
          </form>

          {file && !uploading && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-accent border border-primary/20 animate-scale-in">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-foreground font-medium">
                    Ready to upload: {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}