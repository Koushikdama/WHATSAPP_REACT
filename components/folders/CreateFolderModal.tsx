import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ChatFolder } from '../../services/folders.service';

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, icon: string, color?: string) => void;
    editingFolder?: ChatFolder;
}

const EMOJI_ICONS = [
    '📁', '📂', '⭐', '❤️', '💼', '🏠', '🎯', '📌',
    '🔥', '💡', '🎨', '🎵', '🎮', '⚡', '🌟', '🎭',
    '📚', '✈️', '🌍', '💰', '🎓', '🏆', '🎬', '📷',
];

const COLORS = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Cyan', value: '#06b6d4' },
];

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
    isOpen,
    onClose,
    onCreate,
    editingFolder,
}) => {
    const [name, setName] = useState(editingFolder?.name || '');
    const [selectedIcon, setSelectedIcon] = useState(editingFolder?.icon || '📁');
    const [selectedColor, setSelectedColor] = useState(editingFolder?.color || '#3b82f6');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        onCreate(name.trim(), selectedIcon, selectedColor);

        // Reset
        setName('');
        setSelectedIcon('📁');
        setSelectedColor('#3b82f6');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#202c33] rounded-lg w-full max-w-md p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">
                        {editingFolder ? 'Edit Folder' : 'Create Folder'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Folder Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Folder Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Work, Family, Friends"
                            className="w-full bg-[#111b21] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                            maxLength={20}
                        />
                        <p className="text-xs text-gray-500 mt-1">{name.length}/20 characters</p>
                    </div>

                    {/* Icon Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Icon
                        </label>
                        <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 bg-[#111b21] rounded-lg">
                            {EMOJI_ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setSelectedIcon(icon)}
                                    className={`text-2xl p-2 rounded transition-all ${selectedIcon === icon
                                            ? 'bg-primary/30 scale-110'
                                            : 'hover:bg-gray-700'
                                        }`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Color
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`h-10 rounded-lg transition-all ${selectedColor === color.value
                                            ? 'ring-2 ring-white scale-105'
                                            : 'hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Preview
                        </label>
                        <div
                            className="flex items-center space-x-3 p-3 rounded-lg"
                            style={{ backgroundColor: `${selectedColor}20` }}
                        >
                            <span className="text-2xl">{selectedIcon}</span>
                            <span className="text-white font-medium">{name || 'Folder Name'}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setName('');
                                setSelectedIcon('📁');
                                setSelectedColor('#3b82f6');
                                onClose();
                            }}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-lg py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {editingFolder ? 'Save Changes' : 'Create Folder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFolderModal;
