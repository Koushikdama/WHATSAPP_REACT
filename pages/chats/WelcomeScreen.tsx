import React from 'react';

const WelcomeScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-[#222e35] p-10 border-l border-gray-700">
      <img src="https://static.whatsapp.net/rsrc.php/v3/y7/r/_DSx_SM7ITE.png" alt="WhatsApp Web" className="w-64 h-64" />
      <h1 className="text-3xl font-light text-gray-300 mt-4">WhatsApp Web</h1>
      <p className="text-gray-400 mt-2">
        Send and receive messages without keeping your phone online.
        <br />
        Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
      </p>
      <div className="mt-8 border-t border-gray-600 w-full"></div>
      <p className="text-gray-500 mt-4 text-sm">
        End-to-end encrypted
      </p>
    </div>
  );
};

export default WelcomeScreen;