import React, { useState } from 'react';
import { ChatFolder } from '../../services/folders.service';
import { Folder, Plus, Edit, Trash2, GripVertical } from 'lucide-react';

interface FolderListProps {
    folders: ChatFolder[];
    activeFolder: string;
    onFolderSelect: (folderId: string) => void;
    onCreateFolder: () => void;
    onEditFolder: (folder: ChatFolder) => void;
    onDeleteFolder: (folderId: string) => void;
}

const FolderList: React.FC<FolderListProps> = ({
    folders,
    activeFolder,
    onFolderSelect,
    onCreateFolder,
    onEditFolder,
    onDeleteFolder,
}) => {
    const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);

    const sortedFolders = [...folders].sort((a, b) => a.position - b.position);

    return (
        <div className="bg-[#111b21] border-b border-gray-700 py-2">
            {/* Header */}
            <div className="px-4 flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <Folder className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-300">FOLDERS</span>
                </div>
                <button
                    onClick={onCreateFolder}
                    className="text-gray-400 hover:text-primary transition-colors p-1"
                    title="Create Folder"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            {/* Folder List */}
            <div className="space-y-1 px-2">
                {sortedFolders.map((folder) => {
                    const isActive = folder.id === activeFolder;
                    const isDefault = ['all', 'unread', 'groups', 'personal'].includes(folder.id);

                    return (
                        <div
                            key={folder.id}
                            className={`relative group flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${isActive
                                    ? 'bg-primary/20 text-primary'
                                    : 'hover:bg-[#202c33] text-gray-300'
                                }`}
                            onMouseEnter={() => setHoveredFolder(folder.id)}
                            onMouseLeave={() => setHoveredFolder(null)}
                            onClick={() => onFolderSelect(folder.id)}
                        >
                            <div className="flex items-center space-x-3 flex-1">
                                {/* Drag handle (for custom folders) */}
                                {!isDefault && (
                                    <GripVertical className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}

                                {/* Folder icon */}
                                <span className="text-lg">{folder.icon}</span>

                                {/* Folder name */}
                                <span className="text-sm font-medium truncate">
                                    {folder.name}
                                </span>

                                {/* Chat count */}
                                {folder.chatIds.length > 0 && (
                                    <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                                        {folder.chatIds.length}
                                    </span>
                                )}
                            </div>

                            {/* Actions (for custom folders) */}
                            {!isDefault && hoveredFolder === folder.id && (
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditFolder(folder);
                                        }}
                                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                                        title="Edit Folder"
                                    >
                                        <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Delete folder "${folder.name}"?`)) {
                                                onDeleteFolder(folder.id);
                                            }
                                        }}
                                        className="p-1 hover:bg-red-600/20 rounded transition-colors text-red-400"
                                        title="Delete Folder"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FolderList;
