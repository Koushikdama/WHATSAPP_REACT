import React, { useState, useEffect } from 'react';
import { X, Image, Video, FileText, Music } from 'lucide-react';
import { getSharedMedia, FileMetadata, formatFileSize } from '../../services/firebase/fileSharing.service';

interface SharedMediaGalleryProps {
    chatId: string;
    isOpen: boolean;
    onClose: () => void;
}

const SharedMediaGallery: React.FC<SharedMediaGalleryProps> = ({
    chatId,
    isOpen,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'documents' | 'audio'>('all');
    const [media, setMedia] = useState<FileMetadata[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadMedia();
        }
    }, [isOpen, activeTab, chatId]);

    const loadMedia = async () => {
        setLoading(true);
        try {
            const fileType = activeTab === 'all' ? undefined :
                activeTab === 'images' ? 'image' :
                    activeTab === 'videos' ? 'video' :
                        activeTab === 'documents' ? 'document' : 'audio';

            const files = await getSharedMedia(chatId, fileType);
            setMedia(files);
        } catch (error) {
            console.error('Error loading media:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'all', label: 'All', icon: FileText },
        { id: 'images', label: 'Images', icon: Image },
        { id: 'videos', label: 'Videos', icon: Video },
        { id: 'documents', label: 'Docs', icon: FileText },
        { id: 'audio', label: 'Audio', icon: Music },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#202c33] rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Shared Media</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 py-3 transition-colors ${activeTab === tab.id
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-gray-400 hover:text-gray-300'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="text-sm font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : media.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <FileText className="h-16 w-16 text-gray-600 mb-4" />
                            <p className="text-gray-400">No {activeTab} shared yet</p>
                        </div>
                    ) : (
                        <div className={
                            activeTab === 'images' || activeTab === 'videos'
                                ? 'grid grid-cols-3 gap-2'
                                : 'space-y-2'
                        }>
                            {media.map((file) => (
                                <MediaItem key={file.id} file={file} compact={activeTab === 'images' || activeTab === 'videos'} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div className="p-4 border-t border-gray-700 text-center text-sm text-gray-400">
                    {media.length} {activeTab} • Total size: {formatFileSize(media.reduce((sum, f) => sum + f.fileSize, 0))}
                </div>
            </div>
        </div>
    );
};

const MediaItem: React.FC<{ file: FileMetadata; compact: boolean }> = ({ file, compact }) => {
    if (compact && (file.fileType === 'image' || file.fileType === 'video')) {
        return (
            <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square bg-gray-800 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
            >
                {file.fileType === 'image' ? (
                    <img src={file.url} alt={file.fileName} className="w-full h-full object-cover" />
                ) : (
                    <div className="relative w-full h-full">
                        <video src={file.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Video className="h-8 w-8 text-white" />
                        </div>
                    </div>
                )}
            </a>
        );
    }

    return (
        <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-3 bg-[#111b21] rounded-lg hover:bg-[#2a3942] transition-colors"
        >
            <div className="flex-shrink-0">
                {file.fileType === 'image' && <Image className="h-8 w-8 text-blue-400" />}
                {file.fileType === 'video' && <Video className="h-8 w-8 text-purple-400" />}
                {file.fileType === 'audio' && <Music className="h-8 w-8 text-green-400" />}
                {file.fileType === 'document' && <FileText className="h-8 w-8 text-orange-400" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{file.fileName}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>•</span>
                    <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{file.uploaderName}</span>
                </div>
            </div>
        </a>
    );
};

export default SharedMediaGallery;
