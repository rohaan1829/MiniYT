'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import PageContainer from '@/components/layout/PageContainer';
import VideoUploadDialog from '@/components/video/VideoUploadDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Video, ArrowLeft } from 'lucide-react';

export default function UploadPage() {
    const { user, sidebarOpen } = useStore();
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(true);

    useEffect(() => {
        useStore.setState({ sidebarOpen: true });
    }, []);

    const handleClose = () => {
        setIsDialogOpen(false);
        router.back();
    };

    const handleSuccess = () => {
        setIsDialogOpen(false);
        router.push('/videos');
    };

    if (!user?.channel) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <Card className="bg-card/40 border-border/50 max-w-md">
                        <CardContent className="py-12 text-center">
                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Video className="w-10 h-10 text-primary/40" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">No Channel Found</h1>
                            <p className="text-muted-foreground mb-6">You need a channel to upload videos.</p>
                            <Button onClick={() => router.push('/channel/create')}>Create Channel</Button>
                        </CardContent>
                    </Card>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground relative pb-32">
                <Header />
                <Sidebar />

                <PageContainer>
                    <div className="max-w-4xl mx-auto space-y-8 px-4 py-8">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                className="rounded-full hover:bg-secondary"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </Button>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Upload className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-bold text-primary uppercase tracking-widest">Creator Studio</span>
                                </div>
                                <h1 className="text-4xl font-black tracking-tight">Upload Video</h1>
                            </div>
                        </div>

                        {/* Upload Prompt Card */}
                        <Card className="bg-card/40 border-dashed border-2 border-border/50 hover:border-primary/30 transition-all cursor-pointer" onClick={() => setIsDialogOpen(true)}>
                            <CardContent className="py-20 text-center">
                                <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Upload className="w-12 h-12 text-primary/40" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Upload a new video</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                                    Share your content with the community. Click here to start uploading.
                                </p>
                                <Button size="lg" className="gap-2">
                                    <Upload className="w-4 h-4" />
                                    Select Video
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </PageContainer>

                <VideoUploadDialog
                    isOpen={isDialogOpen}
                    onClose={handleClose}
                    onSuccess={handleSuccess}
                />
            </div>
        </ProtectedRoute>
    );
}
