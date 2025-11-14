"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";

export default function ImageUploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'public/projects');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      setResult({
        success: true,
        ...data.data,
      });

      toast({
        title: "Upload successful!",
        description: "Image uploaded to Cloudflare R2",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      setResult({
        success: false,
        error: error.message,
      });
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Image Upload Test - Cloudflare R2
            </CardTitle>
            <CardDescription>
              Test uploading images to your Cloudflare R2 bucket
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Input */}
            <div className="space-y-2">
              <Label htmlFor="image">Select Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <p className="text-sm text-muted-foreground">
                Supported: JPG, PNG, GIF, WebP (Max 5MB)
              </p>
            </div>

            {/* Preview */}
            {preview && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-4 bg-muted">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full h-auto max-h-96 mx-auto rounded"
                  />
                </div>
                {file && (
                  <div className="text-sm text-muted-foreground">
                    <p>File: {file.name}</p>
                    <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                    <p>Type: {file.type}</p>
                  </div>
                )}
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload to R2
                </>
              )}
            </Button>

            {/* Result */}
            {result && (
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">
                      {result.success ? 'Upload Successful!' : 'Upload Failed'}
                    </h3>
                    {result.success ? (
                      <>
                        <div className="text-sm space-y-1">
                          <p><strong>File:</strong> {result.fileName}</p>
                          <p><strong>Path:</strong> {result.path}</p>
                          <p><strong>Size:</strong> {(result.size / 1024).toFixed(2)} KB</p>
                          <p><strong>Type:</strong> {result.type}</p>
                        </div>
                        <div className="mt-3">
                          <Label className="text-sm font-medium">Public URL:</Label>
                          <div className="mt-1 p-2 bg-white border rounded text-xs break-all">
                            <a 
                              href={result.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {result.url}
                            </a>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => window.open(result.url, '_blank')}
                          >
                            Open Image in New Tab
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-red-700">{result.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <h4 className="font-semibold mb-2">ℹ️ Info</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Images are uploaded to: <code>public/projects/</code></li>
                <li>• Stored in Cloudflare R2 bucket: <code>bimaided</code></li>
                <li>• Files are publicly accessible via the returned URL</li>
                <li>• Max file size: 5MB</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setResult(null);
                }}
              >
                Reset
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/admin"}
              >
                Go to Admin Panel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">✅ Cloudflare R2 is Ready!</h4>
              <p className="text-sm text-muted-foreground">
                You can now upload project images through the admin panel or using this test page.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">🌐 Optional: Set Up Custom Domain</h4>
              <p className="text-sm text-muted-foreground">
                For cleaner URLs (e.g., cdn.bimaided.com), see <code>CLOUDFLARE_R2_SETUP.md</code>
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">🧪 Test R2 Connection</h4>
              <p className="text-sm text-muted-foreground">
                Run: <code className="bg-muted px-2 py-1 rounded">node scripts/setup-r2.cjs</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
