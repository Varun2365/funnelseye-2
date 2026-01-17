import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { UserCheck, Clock, ArrowLeft, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminStaffComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-indigo-200 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-200 rounded-full opacity-20 animate-bounce"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-8">
        {/* Main Card */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            {/* Animated Icon */}
            <div className="mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse opacity-20 scale-110"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
                <UserCheck className="h-12 w-12 text-white animate-bounce" />
              </div>
              {/* Sparkle Effects */}
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-spin" />
              <Zap className="absolute -bottom-2 -left-2 h-5 w-5 text-blue-400 animate-pulse" />
            </div>
            
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
              Coming Soon
            </CardTitle>
            
            <div className="mt-4 flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 text-muted-foreground animate-spin" />
              <span className="text-lg text-muted-foreground font-medium">
                Admin Staff Management
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="text-center space-y-8">
            {/* Animated Text */}
            <div className="space-y-4">
              <p className="text-xl text-gray-600 animate-fade-in">
                We're working on something amazing!
              </p>
              <p className="text-lg text-gray-500 animate-fade-in-delay">
                Stay tuned for the next big update.
              </p>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-progress-bar"></div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="group hover:scale-105 transition-transform duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                Back to Dashboard
              </Button>
              <Button
                onClick={() => navigate('/users')}
                className="group hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <UserCheck className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                Manage Users
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Floating Elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-10 animate-float"></div>
        <div className="absolute -bottom-10 -right-10 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 animate-float-delay"></div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delay {
          0% { opacity: 0; transform: translateY(20px); }
          50% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes progress-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 2s ease-out;
        }
        
        .animate-progress-bar {
          animation: progress-bar 3s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delay {
          animation: float-delay 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminStaffComingSoon;
