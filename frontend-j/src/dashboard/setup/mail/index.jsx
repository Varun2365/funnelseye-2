import React, { useState } from "react";

const sampleEmailMessages = [
  {
    id: 1,
    sender: "Herbalife",
    subject: "Congratulations!",
    preview: "Your account verification is pending...",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    sender: "Support",
    subject: "Your request has been received",
    preview: "We will get back to you shortly.",
    time: "3 hours ago",
    unread: false,
  },
  // Add more sample email messages as needed
];

function EmailSetup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSetupEmail = () => {
    console.log("Email Setup:", email);
    alert(`Email Account ${email} set up successfully!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Email Account Setup</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your email credentials:</p>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-4 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-4 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button onClick={handleSetupEmail} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Setup Email
          </button>

          {/* Display Sample Email Messages */}
          <div className="mt-6">
            <h3 className="text-lg font-medium">Sample Email Messages</h3>
            <div className="divide-y divide-gray-200">
              {sampleEmailMessages.map((email) => (
                <div key={email.id} className={`p-4 ${email.unread ? "bg-blue-50" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{email.sender}</p>
                      <p className="text-sm text-gray-900">{email.subject}</p>
                      <p className="text-sm text-gray-500 truncate">{email.preview}</p>
                    </div>
                    <p className="text-sm text-gray-500">{email.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailSetup;