import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsLayout from '../../components/layout/SettingsLayout';
import { useAppContext } from '../../context/AppContext';
import { CheckIcon } from '../../components/icons';
import { THEMES, gradients, TOGGLE_ON_COLORS, TOGGLE_OFF_COLORS } from '../../utils/theme/themes';
import { ThemeSettings } from '../../types';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { SettingsSection, SegmentedButton } from '../../components/common';

const wallpapers = [
  'https://i.redd.it/qwd83nc4xxf41.jpg',
  'https://picsum.photos/seed/wallpaper1/1080/1920',
  '#0b141a',
  'https://picsum.photos/seed/wallpaper2/1080/1920',
  'https://picsum.photos/seed/wallpaper3/1080/1920',
];



const ChatPreview: React.FC<{ settings: ThemeSettings; bubbleColor: string }> = ({ settings, bubbleColor }) => {
  const backgroundStyle = {
    backgroundImage: `url(${settings.chatBackground})`,
    backgroundColor: settings.chatBackground.startsWith('#') ? settings.chatBackground : 'transparent',
  };
  const fontSizeClass = `font-size-${settings.fontSize}`;

  return (
    <div className={`p-4 rounded-lg bg-cover bg-center border border-gray-700 ${fontSizeClass}`} style={backgroundStyle}>
      <div className="space-y-2">
        {/* Received Message */}
        <div className="flex">
          <div className="bg-[#202c33] text-white p-2 rounded-lg max-w-[70%]">
            <p>Hey! How's it going?</p>
            <span className="text-xs text-gray-400 float-right ml-2 mt-1">10:00 AM</span>
          </div>
        </div>
        {/* Sent Message */}
        <div className="flex justify-end">
          <div className="text-white p-2 rounded-lg max-w-[70%]" style={{ backgroundColor: bubbleColor }}>
            <p>Great, thanks! Just customizing my theme.</p>
            <span className="text-xs text-gray-400/80 float-right ml-2 mt-1">10:01 AM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatsSettingsScreen = () => {
  const { themeSettings, updateThemeSettings } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('display');
  const [previewToggle, setPreviewToggle] = useState(true);

  const selectedThemeName = themeSettings.themeColor.name;
  const bubbleColor = THEMES[selectedThemeName as keyof typeof THEMES]?.bubbleColor || THEMES.default.bubbleColor;

  const handleSettingChange = async (key: keyof typeof themeSettings, value: any) => {
    await updateThemeSettings({ [key]: value });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleSettingChange('chatBackground', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };



  return (
    <SettingsLayout title="Chats" onBack={() => navigate('/settings')}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <div className="border-b border-gray-700 flex">
        <button onClick={() => setActiveTab('display')} className={`flex-1 p-3 text-center font-semibold ${activeTab === 'display' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>
          Display
        </button>
        <button onClick={() => setActiveTab('chat_settings')} className={`flex-1 p-3 text-center font-semibold ${activeTab === 'chat_settings' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>
          Chat Settings
        </button>
      </div>

      <div className="p-4 md:p-6">
        {activeTab === 'display' && (
          <div className="md:grid md:grid-cols-2 md:gap-8">
            <div className="mb-6 md:mb-0">
              <SettingsSection title="Live Preview">
                <ChatPreview settings={themeSettings} bubbleColor={bubbleColor} />
              </SettingsSection>
            </div>
            <div className="divide-y divide-gray-800">
              <SettingsSection title="Theme Gradient">
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-3 mt-2">
                  {gradients.map(gradient => (
                    <button key={gradient.name} onClick={() => handleSettingChange('themeColor', { name: gradient.name, from: gradient.gradient.from, to: gradient.gradient.to })}
                      className={`w-full aspect-square rounded-full focus:outline-none flex-shrink-0 flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#111b21] transition-all duration-200 hover:transform hover:scale-110 ${themeSettings.themeColor.name === gradient.name ? 'ring-white' : 'ring-transparent'}`}
                      style={{ backgroundImage: `linear-gradient(to right, ${gradient.gradient.from}, ${gradient.gradient.to})` }}
                    >
                      {themeSettings.themeColor.name === gradient.name && <CheckIcon className="h-6 w-6 text-white" />}
                    </button>
                  ))}
                </div>
              </SettingsSection>

              <SettingsSection title="Chat Wallpaper">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                  {wallpapers.map(wp => (
                    <button key={wp} onClick={() => handleSettingChange('chatBackground', wp)} className="w-full aspect-square rounded-lg overflow-hidden ring-2 ring-offset-2 ring-offset-[#111b21] focus:outline-none relative group transition-transform hover:scale-105">
                      <div style={{ backgroundImage: `url(${wp})`, backgroundColor: wp.startsWith('#') ? wp : 'transparent' }} className="w-full h-full bg-cover bg-center"></div>
                      <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${themeSettings.chatBackground === wp ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <CheckIcon className="h-8 w-8 text-white" />
                      </div>
                    </button>
                  ))}
                  <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-square rounded-lg bg-[#2a3942] flex flex-col items-center justify-center text-gray-300 transition-transform hover:scale-105">
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
                    <span className="text-xs mt-1">Custom</span>
                  </button>
                </div>
              </SettingsSection>

              <SettingsSection title="Toggle Button Colors">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#2a3942]">
                  <span className="text-white font-semibold">Preview</span>
                  <ThemeToggle checked={previewToggle} onChange={setPreviewToggle} />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">On State</p>
                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-3">
                    {TOGGLE_ON_COLORS.map(color => (
                      // FIX: TOGGLE_ON_COLORS items do not have a nested 'gradient' property. Access 'from' and 'to' directly.
                      <button key={color.name} onClick={() => handleSettingChange('toggleOnColor', { name: color.name, from: color.from, to: color.to })}
                        className={`w-full aspect-square rounded-full focus:outline-none flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#111b21] ${themeSettings.toggleOnColor.name === color.name ? 'ring-white' : 'ring-transparent'}`}
                        style={{ backgroundImage: `linear-gradient(to right, ${color.from}, ${color.to})` }}
                      >
                        {themeSettings.toggleOnColor.name === color.name && <CheckIcon className="h-6 w-6 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Off State</p>
                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-3">
                    {TOGGLE_OFF_COLORS.map(color => (
                      <button key={color.name} onClick={() => handleSettingChange('toggleOffColor', color)}
                        className={`w-full aspect-square rounded-full focus:outline-none flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#111b21] ${themeSettings.toggleOffColor.name === color.name ? 'ring-white' : 'ring-transparent'}`}
                        style={{ backgroundColor: color.color }}
                      >
                        {themeSettings.toggleOffColor.name === color.name && <CheckIcon className="h-6 w-6 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="Header Animation">
                <SegmentedButton
                  options={[
                    { label: 'None', value: 'none' },
                    { label: 'Shine', value: 'shine' },
                    { label: 'Wave', value: 'wave' }
                  ]}
                  value={themeSettings.headerAnimation}
                  onChange={(value) => handleSettingChange('headerAnimation', value)}
                />
              </SettingsSection>
            </div>
          </div>
        )}

        {activeTab === 'chat_settings' && (
          <div className="divide-y divide-gray-800">
            <SettingsSection title="UI Style">
              <SegmentedButton
                options={[
                  { label: 'Normal', value: 'normal' },
                  { label: 'Glossy', value: 'glossy' }
                ]}
                value={themeSettings.uiStyle}
                onChange={(value) => handleSettingChange('uiStyle', value)}
              />
            </SettingsSection>

            <SettingsSection title="Font Size">
              <SegmentedButton
                options={[
                  { label: 'Small', value: 'small' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Large', value: 'large' }
                ]}
                value={themeSettings.fontSize}
                onChange={(value) => handleSettingChange('fontSize', value)}
              />
            </SettingsSection>

            <div className="px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-white">Enable Animations</h2>
                <p className="text-xs text-gray-500">Enable/disable all UI animations.</p>
              </div>
              <ThemeToggle
                checked={themeSettings.animationsEnabled}
                onChange={(checked) => handleSettingChange('animationsEnabled', checked)}
              />
            </div>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};

export default ChatsSettingsScreen;