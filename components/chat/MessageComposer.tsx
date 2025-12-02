import React, { useState, useRef, useEffect } from 'react';
import { EmojiIcon, AttachmentIcon, MicIcon, SendIcon, CloseIcon, PencilIcon, CheckIcon, GifIcon, DocumentIcon, PollIcon } from '../icons';
import { useAppContext } from '../../context/AppContext';
import { editMessage } from '../../api'; // Keep editMessage from api for now
import { Message, PollInfo } from '../../types';
import GifPicker from '../chat/GifPicker';
import CreatePoll from '../chat/CreatePoll';

interface MessageComposerProps {
  onMessageSent: (newMessage: Message) => void;
  replyingTo: Message | null;
  onClearReply: () => void;
  editingMessage: Message | null;
  onEditComplete: () => void;
}

const MessageComposer = ({ onMessageSent, replyingTo, onClearReply, editingMessage, onEditComplete }: MessageComposerProps) => {
  const [text, setText] = useState('');
  const { selectedChat, currentUser, createPoll, users } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<{ url: string; type: 'image' | 'video' | 'document'; file: File } | null>(null);
  const [activeFilter, setActiveFilter] = useState('none');
  const [isAttachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [isGifPickerOpen, setGifPickerOpen] = useState(false);
  const [isCreatePollOpen, setCreatePollOpen] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
      if (replyingTo) onClearReply(); // Can't edit and reply at the same time
    }
  }, [editingMessage, onClearReply]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setAttachmentMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    const recordingInterval = recordingIntervalRef.current;
    const mediaRecorder = mediaRecorderRef.current;

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (recordingInterval) clearInterval(recordingInterval);
      if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
    }
  }, []);

  // Effect specifically for cleaning up Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (attachmentPreview) {
        URL.revokeObjectURL(attachmentPreview.url);
      }
    }
  }, [attachmentPreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'document') => {
    const file = event.target.files?.[0];
    if (file) {
      if (attachmentPreview) URL.revokeObjectURL(attachmentPreview.url);

      const fileType = type === 'media'
        ? (file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : null))
        : 'document';

      if (fileType) {
        const url = URL.createObjectURL(file);
        setAttachmentPreview({ url, type: fileType, file });
        setActiveFilter('none');
      }
    }
  };

  const handleRemoveAttachment = () => {
    setAttachmentPreview(null); // The useEffect cleanup will handle URL.revokeObjectURL
    setActiveFilter('none');
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const handleSend = async () => {
    if ((!text.trim() && !attachmentPreview) || !selectedChat || !currentUser) return;

    try {
      if (editingMessage) {
        await editMessage(selectedChat.id, editingMessage.id, text);
        onEditComplete();
        setText('');
      } else {
        // Prepare message data for Firestore
        let messageData: Partial<Message>;

        if (attachmentPreview) {
          // For media/document messages
          const file = attachmentPreview.file;
          const fileType = attachmentPreview.type;
          // Assuming uploadFile function exists and returns a URL
          // For now, we'll use the attachmentPreview.url directly as a mock
          // const uploadedUrl = await uploadFile(file); 

          messageData = {
            content: text || file.name, // Use text if available, otherwise file name
            senderId: currentUser.id,
            timestamp: new Date().toISOString(),
            status: 'sent',
            messageType: fileType,
            fileInfo: {
              url: attachmentPreview.url, // Using attachmentPreview.url as a mock for uploadedUrl
              name: file.name,
              size: `${(file.size / 1024).toFixed(1)} KB`,
              type: file.type,
            },
            reactions: {},
            deleteFor: [],
            deleteForEveryone: false, // Track if deleted for everyone
            isEdited: false, // Track if message was edited
            isSeen: false, // Track if message is seen
          };
        } else {
          // For plain text messages
          messageData = {
            content: text,
            senderId: currentUser.id,
            timestamp: new Date().toISOString(),
            status: 'sent',
            messageType: 'text',
            fileInfo: undefined,
            reactions: {},
            deleteFor: [],
            deleteForEveryone: false,
            isEdited: false,
            isSeen: false,
          };
        }

        // Only add reply fields if replying to a message
        if (replyingTo) {
          messageData.replyMessageId = replyingTo.id;
          messageData.replyMessageSender = replyingTo.senderId === currentUser.id ? 'You' : (users.find(u => u.id === replyingTo.senderId)?.name || 'Unknown');
          messageData.replyMessageContent = replyingTo.content;
        }

        // Add file info if attachment exists
        if (attachmentPreview) {
          messageData.fileInfo = {
            name: attachmentPreview.file.name,
            size: `${(attachmentPreview.file.size / 1024).toFixed(2)} KB`,
            url: attachmentPreview.url
          };
        }

        // Mock Send to Firestore
        const sentMessage: Message = {
          id: Date.now().toString(),
          senderId: currentUser.id,
          content: messageData.content || '',
          timestamp: new Date().toISOString(),
          messageType: messageData.messageType || 'text',
          status: 'sent',
          reactions: {},
          ...messageData
        };

        // Optimistically update UI
        onMessageSent(sentMessage);
      }
      setText('');
      setAttachmentPreview(null);
      onClearReply();

    } catch (error) {
      console.error("Failed to send/edit message:", error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleGifSend = async (gifUrl: string) => {
    if (!selectedChat || !currentUser) return;

    try {
      const messageData: Partial<Message> = {
        senderId: currentUser.id,
        content: '',
        messageType: 'image',
        fileInfo: {
          name: 'giphy.gif',
          size: 'N/A',
          url: gifUrl,
        },
      };

      // Mock Send to Firestore
      const sentMessage: Message = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        content: '',
        timestamp: new Date().toISOString(),
        messageType: 'image',
        status: 'sent',
        reactions: {},
        ...messageData
      };

      onMessageSent(sentMessage);
      setGifPickerOpen(false);
    } catch (error) {
      console.error('Failed to send GIF:', error);
      alert('Failed to send GIF. Please try again.');
    }
  };

  const handleCreatePoll = async (poll: PollInfo) => {
    if (!selectedChat) return;
    const newPollMessage = await createPoll(selectedChat.id, poll);
    if (newPollMessage) {
      onMessageSent(newPollMessage);
    }
    setCreatePollOpen(false);
  };

  const handleSendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (!selectedChat || !currentUser) return;

    try {
      const audioUrl = URL.createObjectURL(audioBlob);

      const messageData: Partial<Message> = {
        senderId: currentUser.id,
        content: audioUrl,
        messageType: 'voice',
        duration: new Date(duration * 1000).toISOString().substr(14, 5),
      };

      // Mock Send to Firestore
      const sentMessage: Message = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        content: audioUrl,
        timestamp: new Date().toISOString(),
        messageType: 'voice',
        status: 'sent',
        reactions: {},
        ...messageData
      };

      onMessageSent(sentMessage);
    } catch (error) {
      console.error('Failed to send voice message:', error);
      alert('Failed to send voice message. Please try again.');
    }
  };

  const handleStartRecording = async () => {
    // ... recording logic ...
  };
  const handleStopRecording = () => {
    // ... recording logic ...
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const showSendButton = text.trim() !== '' || attachmentPreview !== null;
  const buttonIcon = editingMessage ? <CheckIcon className="h-6 w-6" /> : <SendIcon className="h-6 w-6" />;
  const filterClass = activeFilter !== 'none' ? `filter-${activeFilter}` : '';

  return (
    <div className="flex-shrink-0 bg-[#202c33] z-10">
      {/* Modals */}
      <GifPicker isOpen={isGifPickerOpen} onClose={() => setGifPickerOpen(false)} onSelect={handleGifSend} />
      <CreatePoll isOpen={isCreatePollOpen} onClose={() => setCreatePollOpen(false)} onCreate={handleCreatePoll} />

      {/* Attachment Preview */}
      {attachmentPreview && (
        <div className="px-4 pt-2 bg-[#202c33] relative">
          <div className="relative inline-block bg-[#111b21] p-2 rounded-lg">
            {attachmentPreview.type === 'image' && <img src={attachmentPreview.url} alt="Preview" className={`max-h-24 rounded-md ${filterClass}`} />}
            {attachmentPreview.type === 'video' && <video src={attachmentPreview.url} controls className={`max-h-24 rounded-md ${filterClass}`} />}
            {attachmentPreview.type === 'document' && (
              <div className="flex items-center p-2 rounded-lg">
                <DocumentIcon className="h-10 w-10 text-gray-400 mr-3" />
                <div>
                  <p className="text-white text-sm truncate max-w-xs">{attachmentPreview.file.name}</p>
                  <p className="text-gray-500 text-xs">{`${(attachmentPreview.file.size / 1024).toFixed(2)} KB`}</p>
                </div>
              </div>
            )}
            <button onClick={handleRemoveAttachment} className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 text-white hover:bg-gray-600 focus:outline-none" aria-label="Remove attachment">
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          {/* ... filter buttons ... */}
        </div>
      )}

      {/* Editing/Replying Previews */}
      {editingMessage ? (
        <div className="px-4 py-2 flex justify-between items-start bg-[#2a3942] rounded-t-lg">
          <div className="flex items-start">
            <PencilIcon className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-primary">Editing Message</p>
              <p className="text-sm text-gray-300 truncate max-w-xs">{editingMessage.content}</p>
            </div>
          </div>
          <button onClick={onEditComplete} className="text-gray-400 hover:text-white">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      ) : replyingTo && (
        <div className="px-4 pt-3 flex justify-between items-start bg-[#2a3942] rounded-t-lg">
          <div className="flex items-start">
            <div className="w-1 bg-primary rounded-l-lg self-stretch mr-3"></div>
            <div>
              <p className="font-semibold text-primary">{replyingTo.senderId === currentUser?.id ? 'You' : users.find(u => u.id === replyingTo.senderId)?.name}</p>
              <p className="text-sm text-gray-300 truncate max-w-xs">{replyingTo.content}</p>
            </div>
          </div>
          <button onClick={onClearReply} className="text-gray-400 hover:text-white">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="px-4 py-3 flex items-center space-x-3">
        <button className="text-gray-400 hover:text-gray-200">
          <EmojiIcon className="h-6 w-6" />
        </button>

        {/* Attachment Menu */}
        <div className="relative" ref={attachmentMenuRef}>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleFileChange(e, 'media')} />
          <input ref={docInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, 'document')} />
          <button className="text-gray-400 hover:text-gray-200" onClick={() => setAttachmentMenuOpen(prev => !prev)}>
            <AttachmentIcon className="h-6 w-6" />
          </button>
          {isAttachmentMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-56 bg-[#233138] rounded-lg shadow-lg z-20 py-2">
              <button onClick={() => { fileInputRef.current?.click(); setAttachmentMenuOpen(false); }} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-[#111b21]">
                <GifIcon className="h-5 w-5 text-purple-400" /><span>Photo & Video</span>
              </button>
              <button onClick={() => { docInputRef.current?.click(); setAttachmentMenuOpen(false); }} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-[#111b21]">
                <DocumentIcon className="h-5 w-5 text-blue-400" /><span>Document</span>
              </button>
              <button onClick={() => { setGifPickerOpen(true); setAttachmentMenuOpen(false); }} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-[#111b21]">
                <GifIcon className="h-5 w-5 text-green-400" /><span>GIF</span>
              </button>
              {selectedChat?.conversationType === 'GROUP' && (
                <button onClick={() => { setCreatePollOpen(true); setAttachmentMenuOpen(false); }} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-[#111b21]">
                  <PollIcon className="h-5 w-5 text-orange-400" /><span>Poll</span>
                </button>
              )}
            </div>
          )}
        </div>

        <input type="text" placeholder="Type a message" className="flex-grow bg-[#2a3942] rounded-lg px-4 py-2 text-sm focus:outline-none" value={text} onChange={(e) => setText(e.target.value)} onKeyPress={handleKeyPress} />

        <button onClick={showSendButton ? handleSend : undefined} className="bg-primary rounded-full p-2 text-white glossy-button">
          {showSendButton ? buttonIcon : <MicIcon className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
};

export default MessageComposer;