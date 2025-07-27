import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

export function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/upload/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

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
      setAlert({
        type: 'error',
        message: '🚨 Upload failed, please try again.'
      });
    } finally {
      setUploading(false);
      // Auto-hide alert after 5 seconds
      setTimeout(() => setAlert(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-secondary border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Upload Excel File</h3>
              <p className="text-muted-foreground">Submit a new batch of candidates using an Excel file (.xls or .xlsx)</p>
            </div>
          </div>

          {alert && (
            <Alert className={`mb-4 ${alert.type === 'success' ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'}`}>
              <div className="flex items-center gap-2">
                {alert.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <AlertDescription className={alert.type === 'success' ? 'text-success' : 'text-destructive'}>
                  {alert.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  required
                  className="file:border-0 file:bg-primary/10 file:text-primary file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:bg-primary/20 transition-all"
                />
              </div>
              <Button
                type="submit"
                variant="premium"
                size="lg"
                disabled={!file || uploading}
                className="min-w-[120px]"
              >
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    Uploading...
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </form>

          {file && (
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-foreground">
                <span className="font-medium">Selected file:</span> {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}