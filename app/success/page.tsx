// app/success/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Verified Successfully | Ganium AI',
  description: 'Your email has been verified successfully. Please return to the app to continue.',
};

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="container mx-auto max-w-md min-h-screen flex flex-col items-center justify-center py-10">
        {/* Animated Success Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-pulse">
            <svg
              className="w-20 h-20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" className="stroke-white stroke-2" fill="none" />
              <path
                d="M7 12L10 15L17 8"
                className="stroke-white stroke-2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          
          {/* Security Shield Badge */}
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-400 w-12 h-12 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L4 5V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V5L12 2Z"
                className="fill-white"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-300 bg-clip-text text-transparent">
            ✅ Security Verified!
          </h1>
          <p className="text-xl font-semibold mb-4">
            Your email has been successfully verified
          </p>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30 mb-6">
            <span className="text-sm font-medium text-purple-300">
              🔐 End-to-End Encrypted
            </span>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="w-full bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
          <div className="flex items-start mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl mr-4">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17 2H7C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 21.7 7 21H17C18.1046 21 19 20.1046 19 19V4C19 2.89543 18.1046 2 17 2Z"
                  className="stroke-white stroke-2"
                  fill="none"
                />
                <path
                  d="M12 18H12.01"
                  className="stroke-white stroke-2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2">Next Steps Required</h2>
              <p className="text-gray-300">
                To complete the security handshake, please return to the Ganium AI app.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-400/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-400 font-bold">1</span>
              </div>
              <span className="text-gray-200">Open the Ganium AI mobile app</span>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-400 font-bold">2</span>
              </div>
              <span className="text-gray-200">Log out and sign back in</span>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-400/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-400 font-bold">3</span>
              </div>
              <span className="text-gray-200">Access your fully verified account</span>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="w-full mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-300">
            🛡️ Security Features Activated
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-green-400 text-2xl mb-2">✓</div>
              <p className="text-sm font-medium">Email Verified</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-blue-400 text-2xl mb-2">🔐</div>
              <p className="text-sm font-medium">Encryption Active</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-purple-400 text-2xl mb-2">🛡️</div>
              <p className="text-sm font-medium">Threat Protection</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-cyan-400 text-2xl mb-2">⚡</div>
              <p className="text-sm font-medium">2 Free Scans</p>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="w-full bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-5 border border-blue-500/30">
          <div className="flex items-start">
            <div className="text-blue-400 mr-3 mt-1">ℹ️</div>
            <div>
              <p className="text-sm text-gray-300">
                <strong className="text-white">Why relogin?</strong> For security purposes, 
                email verification requires a fresh authentication session. This ensures 
                your account remains protected against unauthorized access.
              </p>
            </div>
          </div>
        </div>

        {/* App Badge */}
        <div className="mt-10 pt-6 border-t border-gray-800 w-full text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-3 rounded-2xl border border-gray-700">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <div className="text-left">
              <p className="font-bold">Ganium AI Security</p>
              <p className="text-xs text-gray-400">AI-Powered Security Assistant</p>
            </div>
          </div>
        </div>

        {/* Timer for automatic redirect suggestion */}
        <div className="mt-8">
          <div className="text-center text-gray-400 text-sm">
            <p>Return to app within <span className="text-green-400 font-bold">5 minutes</span></p>
            <div className="w-48 h-1 bg-gray-700 rounded-full mx-auto mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 animate-[progress_300s_linear_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}