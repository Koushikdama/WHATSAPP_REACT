import React, { useState, useEffect } from 'react';
import { Conversation, GroupInfo, Message } from '../../types';
import { getGroupInfo, getGroupMessages } from '../../api';
import ContactInfo from '../../pages/contacts/ContactInfo';
import { useAppContext } from '../../context/AppContext';
import { AttachmentIcon, SearchIcon } from '../icons';
import useResponsive from '../../hooks/useResponsive';
import { useGroupPermissions } from '../../hooks/useGroupPermissions';

interface InfoPanelProps {
  chat: Conversation;
  onClose: () => void;
}

const InfoPanel = ({ chat, onClose }: InfoPanelProps) => {
  const isDesktop = useResponsive();
  const { conversations, toggleChatLock, currentUser, users } = useAppContext();
  const currentChat = conversations.find(c => c.id === chat.id);
  const isLocked = currentChat?.isLocked || false;
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharedContent, setSharedContent] = useState<{ media: Message[], links: { id: string, url: string }[], docs: Message[] }>({ media: [], links: [], docs: [] });
  const [activeTab, setActiveTab] = useState<'media' | 'links' | 'docs'>('media');
  const [participantSearch, setParticipantSearch] = useState('');
  const [memberActionMenu, setMemberActionMenu] = useState<string | null>(null);

  const permissions = useGroupPermissions(groupInfo, currentUser?.id || '');

  useEffect(() => {
    if (chat.conversationType === 'GROUP' && currentUser) {
      const fetchGroupData = async () => {
        setLoading(true);
        try {
          const info = await getGroupInfo(chat.id, currentUser.id);
          setGroupInfo(info);

          const messages = await getGroupMessages(chat.id, currentUser.id);
          const media: Message[] = [];
          const links: { id: string, url: string }[] = [];
          const docs: Message[] = [];
          const urlRegex = /(https?:\/\/[^\s]+)/g;

          for (const msg of messages) {
            if (msg.messageType === 'image') {
              media.push(msg);
            }
            if (msg.messageType === 'document' && msg.fileInfo) {
              docs.push(msg);
            }
            if (msg.messageType === 'text') {
              const foundLinks = msg.content.match(urlRegex);
              if (foundLinks) {
                links.push(...foundLinks.map(link => ({ id: msg.id + link, url: link })));
              }
            }
          }
          setSharedContent({ media, links, docs });

        } catch (error) {
          console.error("Failed to fetch group info", error);
        } finally {
          setLoading(false);
        }
      };
      fetchGroupData();
    }
  }, [chat, currentUser]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (memberActionMenu) {
        setMemberActionMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [memberActionMenu]);

  const renderSharedContent = () => {
    if (activeTab === 'media') {
      return sharedContent.media.length > 0 ? (
        <div className="grid grid-cols-3 gap-1">
          {sharedContent.media.map(msg => (
            <img key={msg.id} src={msg.content} alt="Shared media" className="w-full h-24 object-cover rounded" />
          ))}
        </div>
      ) : <p className="text-gray-400 text-center text-sm py-4">No media shared yet.</p>;
    }
    if (activeTab === 'links') {
      return sharedContent.links.length > 0 ? (
        <ul className="space-y-2">
          {sharedContent.links.map(link => (
            <li key={link.id} className="bg-[#2a3942] p-2 rounded">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-emerald-400 text-sm truncate block hover:underline">{link.url}</a>
            </li>
          ))}
        </ul>
      ) : <p className="text-gray-400 text-center text-sm py-4">No links shared yet.</p>;
    }
    if (activeTab === 'docs') {
      return sharedContent.docs.length > 0 ? (
        <ul className="space-y-2">
          {sharedContent.docs.map(msg => (
            <li key={msg.id} className="flex items-center bg-[#2a3942] p-2 rounded">
              <AttachmentIcon className="h-6 w-6 text-gray-400 mr-3" />
              <div>
                <p className="text-white text-sm truncate">{msg.fileInfo?.name}</p>
                <p className="text-gray-500 text-xs">{msg.fileInfo?.size}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="text-gray-400 text-center text-sm py-4">No documents shared yet.</p>;
    }
    return null;
  };

  const filteredParticipants = groupInfo
    ? Object.entries(groupInfo.members).filter(([userId]) => {
      const user = users.find(u => u.id === userId);
      return user?.name.toLowerCase().includes(participantSearch.toLowerCase());
    })
    : [];

  const handleMemberAction = (userId: string, action: 'remove' | 'promote' | 'demote') => {
    const user = users.find(u => u.id === userId);

    if (action === 'remove') {
      if (window.confirm(`Remove ${user?.name} from the group?`)) {
        console.log('Remove member:', userId);
        // TODO: Call API to remove member
      }
    } else if (action === 'promote') {
      if (window.confirm(`Make ${user?.name} a co-admin?`)) {
        console.log('Promote to co-admin:', userId);
        // TODO: Call API to promote member
      }
    } else if (action === 'demote') {
      if (window.confirm(`Remove ${user?.name} as co-admin?`)) {
        console.log('Demote from co-admin:', userId);
        // TODO: Call API to demote member
      }
    }

    setMemberActionMenu(null);
  };

  const handleAddParticipant = () => {
    console.log('Add participant clicked');
    // TODO: Open add participant modal
  };

  const handleEditGroup = () => {
    console.log('Edit group clicked');
    // TODO: Open edit group modal
  };

  const panelClassName = isDesktop
    ? "absolute top-0 right-0 h-full w-[35%] bg-[#202c33] border-l border-gray-700 flex flex-col z-20 transition-all duration-300 ease-in-out"
    : "fixed inset-0 bg-[#111b21] flex flex-col z-30";

  return (
    <div className={panelClassName}>
      <header className="flex-shrink-0 bg-[#202c33] p-4 flex items-center space-x-4">
        <button onClick={onClose} className="text-white">
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
        </button>
        <h2 className="text-lg font-semibold text-white">
          {chat.conversationType === 'GROUP' ? 'Group Info' : 'Contact Info'}
        </h2>
      </header>

      {chat.conversationType === 'INDIVIDUAL' ? (
        <ContactInfo userId={chat.participants?.find(p => p !== currentUser?.id) || chat.id} noLayout={true} />
      ) : (
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col items-center p-4 md:p-6 bg-[#111b21] border-b border-gray-700">
            <img src={chat.profileImage} alt={chat.name} className="h-32 w-32 md:h-40 md:w-40 rounded-full mb-4" />
            <div className="flex items-center gap-2">
              <h1 className="text-2xl text-white">{chat.name}</h1>
              {permissions.canChangeGroupInfo && (
                <button
                  onClick={handleEditGroup}
                  className="p-1.5 hover:bg-gray-700 rounded-full transition-colors"
                  title="Edit group"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" className="text-gray-400 hover:text-white">
                    <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                  </svg>
                </button>
              )}
            </div>
            <p className="text-gray-400">Group · {groupInfo?.memberCount || '...'} participants</p>
          </div>

          {groupInfo && (
            <>
              <div className="bg-[#111b21] p-4 my-3">
                <p className="text-gray-400 text-sm">Description</p>
                <p className="text-white mt-1">{groupInfo.description}</p>
              </div>

              {/* Current User Role & Permissions */}
              <div className="bg-[#111b21] p-4 my-3 border-l-4 border-primary">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400 text-sm">Your Role</p>
                  <div className="flex items-center gap-2">
                    {permissions.isAdmin ? (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" className="text-emerald-400">
                          <path fill="currentColor" d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V9h7V2.99c3.53.43 6.43 2.96 7.28 6.01H12v4z"></path>
                        </svg>
                        <span className="text-emerald-400 font-semibold">Group Owner</span>
                      </>
                    ) : permissions.isCoAdmin ? (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" className="text-blue-400">
                          <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V11H5V8.99h7V4l5.26 2.47c.46.22.76.69.76 1.21v.32H12v4z"></path>
                        </svg>
                        <span className="text-blue-400 font-semibold">Co-Admin</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" className="text-gray-400">
                          <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                        </svg>
                        <span className="text-gray-400 font-semibold">Member</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-300 text-xs font-medium mb-2">Permissions:</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {permissions.canChangeGroupInfo && (
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <svg viewBox="0 0 24 24" width="14" height="14" className="text-green-400">
                          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                        </svg>
                        Edit group info & description
                      </div>
                    )}
                    {permissions.canAddMembers && (
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <svg viewBox="0 0 24 24" width="14" height="14" className="text-green-400">
                          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                        </svg>
                        Add new participants
                      </div>
                    )}
                    {permissions.isAdmin && (
                      <>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <svg viewBox="0 0 24 24" width="14" height="14" className="text-green-400">
                            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                          </svg>
                          Remove any participant
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <svg viewBox="0 0 24 24" width="14" height="14" className="text-green-400">
                            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                          </svg>
                          Promote/demote co-admins
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <svg viewBox="0 0 24 24" width="14" height="14" className="text-green-400">
                            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                          </svg>
                          Delete the group
                        </div>
                      </>
                    )}
                    {permissions.isCoAdmin && !permissions.isAdmin && (
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <svg viewBox="0 0 24 24" width="14" height="14" className="text-green-400">
                          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                        </svg>
                        Remove regular members
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <svg viewBox="0 0 24 24" width="14" height="14" className="text-green-400">
                        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                      </svg>
                      Send messages & media
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="bg-[#111b21] p-4 my-3">
            <h3 className="text-gray-400 text-sm mb-2">Shared Content</h3>
            <div className="flex border-b border-gray-700 mb-2">
              <button onClick={() => setActiveTab('media')} className={`flex-1 py-2 text-sm ${activeTab === 'media' ? 'text-primary border-b-2 border-primary' : 'text-gray-300'}`}>Media</button>
              <button onClick={() => setActiveTab('links')} className={`flex-1 py-2 text-sm ${activeTab === 'links' ? 'text-primary border-b-2 border-primary' : 'text-gray-300'}`}>Links</button>
              <button onClick={() => setActiveTab('docs')} className={`flex-1 py-2 text-sm ${activeTab === 'docs' ? 'text-primary border-b-2 border-primary' : 'text-gray-300'}`}>Docs</button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {loading ? <p className="text-center text-gray-400">Loading content...</p> : renderSharedContent()}
            </div>
          </div>

          {permissions.canChangeGroupSettings && (
            <div className="bg-[#111b21] my-3">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#2a3942]">
                <div>
                  <p className="text-white">Chat lock</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isLocked} onChange={() => toggleChatLock(chat.id)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full transition-colors peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          )}

          <div className="bg-[#111b21] my-3">
            <h3 className="p-4 text-emerald-500 font-semibold">{groupInfo?.memberCount || '...'} Participants</h3>
            <div className="px-4 pb-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search participants"
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="w-full bg-[#2a3942] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            {permissions.canAddMembers && (
              <button
                onClick={handleAddParticipant}
                className="w-full p-3 text-primary hover:bg-[#2a3942] flex items-center gap-2 transition-colors"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                </svg>
                Add participant
              </button>
            )}
            {loading && <p className="p-4 text-gray-400">Loading participants...</p>}
            {groupInfo && filteredParticipants.map(([userId, role]) => {
              const user = users.find(u => u.id === userId);
              if (!currentUser) return null;
              const canShowActions = userId !== currentUser.id && permissions.canRemoveMember(userId);

              return (
                <div key={userId} className="relative flex items-center p-3 hover:bg-[#2a3942] group">
                  <img src={user?.avatar} alt={user?.name} className="h-10 w-10 rounded-full mr-4" />
                  <div className="flex-grow">
                    <p className="text-white">{user?.name || userId}{user?.id === currentUser.id && ' (You)'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {role === 'ADMIN' ? (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full">Admin</span>
                    ) : role === 'CO_ADMIN' ? (
                      <span className="text-xs bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded-full">Co-Admin</span>
                    ) : (
                      <span className="text-xs bg-gray-700 text-gray-400 font-semibold px-2 py-0.5 rounded-full">Member</span>
                    )}

                    {canShowActions && (
                      <div className="relative">
                        <button
                          onClick={() => setMemberActionMenu(memberActionMenu === userId ? null : userId)}
                          className="p-1.5 hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <svg viewBox="0 0 24 24" width="20" height="20" className="text-gray-400">
                            <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                          </svg>
                        </button>

                        {memberActionMenu === userId && (
                          <div className="absolute right-0 top-8 bg-[#2a3942] rounded-lg shadow-lg py-2 z-10 min-w-[160px]">
                            {permissions.canRemoveMember(userId) && (
                              <button
                                onClick={() => handleMemberAction(userId, 'remove')}
                                className="w-full px-4 py-2 text-left text-white hover:bg-[#3b4a54] transition-colors"
                              >
                                Remove {user?.name}
                              </button>
                            )}
                            {permissions.canPromoteToCoAdmin && role === 'MEMBER' && (
                              <button
                                onClick={() => handleMemberAction(userId, 'promote')}
                                className="w-full px-4 py-2 text-left text-white hover:bg-[#3b4a54] transition-colors"
                              >
                                Make co-admin
                              </button>
                            )}
                            {permissions.canDemoteFromCoAdmin && role === 'CO_ADMIN' && (
                              <button
                                onClick={() => handleMemberAction(userId, 'demote')}
                                className="w-full px-4 py-2 text-left text-white hover:bg-[#3b4a54] transition-colors"
                              >
                                Dismiss as admin
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#111b21] my-3 text-red-500">
            <div className="p-4 cursor-pointer hover:bg-[#2a3942]">
              <p>Exit group</p>
            </div>
            {permissions.canDeleteGroup && (
              <div className="p-4 cursor-pointer hover:bg-[#2a3942]">
                <p>Delete group</p>
              </div>
            )}
            <div className="p-4 cursor-pointer hover:bg-[#2a3942]">
              <p>Report group</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPanel;