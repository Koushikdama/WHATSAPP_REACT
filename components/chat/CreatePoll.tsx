import React, { useState } from 'react';
import { PollInfo } from '../../types';
import { CloseIcon, PlusIcon, TrashIcon } from '../icons';

interface CreatePollProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (poll: PollInfo) => void;
}

const CreatePoll: React.FC<CreatePollProps> = ({ isOpen, onClose, onCreate }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  if (!isOpen) return null;

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 12) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    if (question.trim() && options.every(opt => opt.trim())) {
      onCreate({
        question: question.trim(),
        options: options.map(opt => ({ text: opt.trim(), voters: [] })),
      });
      onClose();
    } else {
      alert('Please fill out the question and all options.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#2a3942] rounded-lg shadow-xl w-full max-w-lg mx-4 text-white" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Create Poll</h2>
          <button onClick={onClose}><CloseIcon className="h-6 w-6" /></button>
        </header>
        <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label htmlFor="poll-question" className="block text-sm font-medium text-gray-300 mb-1">Question</label>
            <input
              id="poll-question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question"
              className="w-full bg-[#202c33] border-transparent rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Options</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-grow bg-[#202c33] border-transparent rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 ring-primary"
                  />
                  {options.length > 2 && (
                    <button onClick={() => removeOption(index)} className="p-2 rounded-full hover:bg-gray-600">
                      <TrashIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 12 && (
              <button onClick={addOption} className="mt-2 flex items-center space-x-2 text-primary hover:opacity-80">
                <PlusIcon className="h-5 w-5" />
                <span>Add option</span>
              </button>
            )}
          </div>
        </main>
        <footer className="px-6 py-4 bg-[#202c33] rounded-b-lg flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-md text-white bg-primary hover:bg-primary-hover glossy-button"
          >
            Create
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CreatePoll;