import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloseIcon } from '../icons';

interface PasscodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (currentPasscode: string, newPasscode: string) => void;
    title: string;
    currentPasscode: string;
}

const PasscodeModal: React.FC<PasscodeModalProps> = ({ isOpen, onClose, onSubmit, title, currentPasscode }) => {
    const [current, setCurrent] = useState('');
    const [newPasscode, setNewPasscode] = useState('');
    const [confirmPasscode, setConfirmPasscode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (current !== currentPasscode) {
            setError('Current passcode is incorrect');
            return;
        }

        if (!newPasscode || newPasscode.length < 4) {
            setError('New passcode must be at least 4 characters');
            return;
        }

        if (newPasscode !== confirmPasscode) {
            setError('Passcodes do not match');
            return;
        }

        onSubmit(current, newPasscode);
        handleClose();
    };

    const handleClose = () => {
        setCurrent('');
        setNewPasscode('');
        setConfirmPasscode('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70"
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        className="relative bg-[#202c33] rounded-lg p-6 w-full max-w-md shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">{title}</h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <CloseIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="current" className="block text-sm font-medium text-gray-300 mb-2">
                                    Current Passcode
                                </label>
                                <input
                                    type="password"
                                    id="current"
                                    value={current}
                                    onChange={(e) => setCurrent(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#111b21] text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none"
                                    placeholder="Enter current passcode"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="newPasscode" className="block text-sm font-medium text-gray-300 mb-2">
                                    New Passcode
                                </label>
                                <input
                                    type="password"
                                    id="newPasscode"
                                    value={newPasscode}
                                    onChange={(e) => setNewPasscode(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#111b21] text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none"
                                    placeholder="Enter new passcode"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPasscode" className="block text-sm font-medium text-gray-300 mb-2">
                                    Confirm Passcode
                                </label>
                                <input
                                    type="password"
                                    id="confirmPasscode"
                                    value={confirmPasscode}
                                    onChange={(e) => setConfirmPasscode(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#111b21] text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none"
                                    placeholder="Re-enter new passcode"
                                    required
                                />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                                >
                                    Change Passcode
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PasscodeModal;
