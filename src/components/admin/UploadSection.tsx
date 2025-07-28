import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, AlertCircle, FileSpreadsheet, Wifi, WifiOff, Eye } from 'lucide-react';
import { uploadFile } from '@/lib/api';
import { toast } from 'sonner';
import { validateExcelFile, type ExcelValidationResult } from '@/lib/excel-utils';

export function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [validation, setValidation] = useState<ExcelValidationResult | null>(null);

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size too large. Please select a file smaller than 10MB.');
        return;
      }
      
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Invalid file type. Please select an Excel or CSV file.');
        return;
      }
      
      setFile(selectedFile);
      setAlert(null);
      setValidation(null);
      
      // Validate Excel file structure
      setValidating(true);
      toast.loading('Validating file structure...', { id: 'validation-toast' });
      
      try {
        const validationResult = await validateExcelFile(selectedFile);
        setValidation(validationResult);
        
        if (validationResult.isValid) {
          toast.success('File validated successfully!', { id: 'validation-toast' });
          if (validationResult.warnings.length > 0) {
            toast.warning(`File has ${validationResult.warnings.length} warnings. Check details below.`);
          }
        } else {
          toast.error('File validation failed. Please check the errors below.', { id: 'validation-toast' });
        }
      } catch (error) {
        toast.error('Failed to validate file. Please try again.', { id: 'validation-toast' });
        setValidation({ isValid: false, errors: ['Failed to validate file'], warnings: [] });
      } finally {
        setValidating(false);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    if (!isOnline) {
      toast.error('No internet connection. Please check your network and try again.');
      return;
    }

    if (validation && !validation.isValid) {
      toast.error('Please fix the file validation errors before uploading.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setAlert(null);

    // Simulate realistic upload progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      toast.loading('Uploading and processing file...', { id: 'upload-toast' });
      
      const response = await uploadFile(file, (progress) => {
        setProgress(progress);
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();
      
      if (data.success) {
        const failedList = data.failed || [];
        const failedCount = Array.isArray(failedList) ? failedList.length : 0;
        const message = `Upload completed! ✅ Added: ${data.added} | ⏭️ Skipped: ${data.skipped} | ❌ Failed: ${failedCount}`;
        
        setAlert({
          type: 'success',
          message: failedCount > 0 
            ? `${message}\n\nFailed entries: ${failedList.join(', ')}`
            : message
        });
        
        toast.success(message, { id: 'upload-toast' });
        
        // Reset form
        setFile(null);
        setValidation(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const errorMessage = data.error || 'Upload failed. Please try again.';
        setAlert({ type: 'error', message: errorMessage });
        toast.error(errorMessage, { id: 'upload-toast' });
      }
    } catch (error) {
      clearInterval(progressInterval);
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      setAlert({ type: 'error', message: errorMessage });
      toast.error(errorMessage, { id: 'upload-toast' });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Network Status Indicator */}
      {!isOnline && (
        <Alert className="border-2 border-red-500/20 bg-red-500/5 shadow-floating glass-effect animate-error-shake">
          <WifiOff className="h-5 w-5 text-red-500" />
          <AlertDescription className="text-red-700 font-medium">
            No internet connection. Please check your network connection.
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Card */}
      <Card className="relative overflow-hidden border-border/50 bg-gradient-surface shadow-floating glass-effect hover-lift">
        <div className="absolute inset-0 bg-gradient-accent opacity-5" />
        <CardContent className="p-8 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Input */}
            <div className="relative group">
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                file 
                  ? 'border-primary bg-primary/5 shadow-glow' 
                  : 'border-border hover:border-primary/50 hover:bg-primary/5'
              } ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {file ? (
                  <div className="flex items-center justify-center space-x-4 animate-scale-in">
                    <div className="p-3 rounded-full bg-primary/10">
                      <FileSpreadsheet className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">{file.name}</h3>
                      <p className="text-muted-foreground text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <div className="p-4 rounded-full bg-gradient-primary mx-auto w-fit mb-4 shadow-glow animate-float">
                      {isOnline ? (
                        <Upload className="h-8 w-8 text-primary-foreground" />
                      ) : (
                        <WifiOff className="h-8 w-8 text-primary-foreground" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {isOnline ? 'Upload Excel File' : 'No Internet Connection'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {isOnline 
                        ? 'Choose an Excel file (.xlsx, .xls) or CSV file to upload candidate data'
                        : 'Please check your internet connection to upload files'
                      }
                    </p>
                  </div>
                )}
                
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading || !isOnline}
                  aria-label="Choose file to upload"
                />
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={!file || uploading || !isOnline || validating || (validation && !validation.isValid)}
                size="lg"
                variant="premium"
                className="px-8 py-3 rounded-xl shadow-glow hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={uploading ? 'Uploading file' : 'Upload selected file'}
              >
                {uploading ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : validating ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Validating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {isOnline ? (
                      <Upload className="h-5 w-5" />
                    ) : (
                      <WifiOff className="h-5 w-5" />
                    )}
                    <span>{isOnline ? 'Upload File' : 'Offline'}</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      {uploading && (
        <Card className="bg-gradient-surface border-border/50 shadow-floating glass-effect animate-scale-in">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Upload Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <div className="relative overflow-hidden">
                <Progress value={progress} className="h-3 bg-muted" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                     style={{ transform: 'translateX(-100%)', animation: 'shimmer 1.5s infinite' }} />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Processing your file securely...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Validation Results */}
      {validation && (
        <Card className="bg-gradient-surface border-border/50 shadow-floating glass-effect animate-scale-in">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">File Validation Results</h3>
            </div>
            
            {validation.errors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-red-600 mb-2">❌ Errors (must be fixed):</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validation.warnings.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-amber-600 mb-2">⚠️ Warnings (review recommended):</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
                  {validation.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validation.isValid && (
              <div className="text-emerald-600 font-medium">
                ✅ File structure is valid and ready for upload!
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alert Messages */}
      {alert && (
        <Alert className={`border-2 shadow-floating glass-effect animate-scale-in ${
          alert.type === 'success' 
            ? 'border-emerald-500/20 bg-emerald-500/5' 
            : 'border-red-500/20 bg-red-500/5 animate-error-shake'
        }`}>
          <div className="flex items-center space-x-3">
            {alert.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-emerald-500 animate-pulse" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
            )}
            <AlertDescription className={`${
              alert.type === 'success' ? 'text-emerald-700' : 'text-red-700'
            } font-medium whitespace-pre-line`}>
              {alert.message}
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
}