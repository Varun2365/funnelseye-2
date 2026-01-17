import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HierarchyRequests from './HierarchyRequests';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  CreditCard, 
  BarChart3, 
  FileText,
  LogOut,
  Menu,
  X,
  Shield,
  BookOpen,
  Package,
  Upload,
  PlusCircle,
  MessageCircle,
  TrendingUp,
  Lock,
  DollarSign,
  HelpCircle,
  Bot,
  Brain,
  Calendar,
  Mail,
  Target,
  Zap,
  Database,
  Server,
  UserCheck,
  AlertTriangle,
  Activity,
  PieChart,
  Globe,
  Layers,
  Cog,
  Monitor,
  ChevronDown,
  ChevronRight,
  
} from 'lucide-react';
import { cn } from '../lib/utils';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courseCategory, setCourseCategory] = useState('customer'); // 'coach' or 'customer'
  const [courseCreationOpen, setCourseCreationOpen] = useState(false); // Track if Course Creation is expanded
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync course category with URL parameter and auto-expand if on course page
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam === 'coach' || categoryParam === 'customer') {
      setCourseCategory(categoryParam);
    }
    
    // Auto-expand Course Creation if on course creation page
    if (location.pathname.startsWith('/course-creation')) {
      setCourseCreationOpen(true);
    }
  }, [location.search, location.pathname]);

  const navigationGroups = [
    // Group 1: Dashboard, User Management
    {
      title: 'Core Management',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'User Management', href: '/users', icon: Users },
      ]
    },
    // Group 2: Financial & MLM, Subscription Plans, Central Messaging
    {
      title: 'Configurations',
      items: [
        { name: 'Financial & MLM', href: '/financial-mlm', icon: DollarSign },
        { name: 'Subscription Plans', href: '/subscription-plans', icon: Package },
        { name: 'Central Messaging', href: '/messaging', icon: MessageCircle },
      ]
    },
    // Group 3: Ads Campaigns, Automation Rules, Course Creation, Funnels, Uploads, AI Features
    {
      title: 'Platform Features',
      items: [
        { name: 'Ads Campaigns', href: '/ads-campaigns', icon: TrendingUp },
        { name: 'AI Features', href: '/ai-features', icon: Brain },
        { name: 'Automation Rules', href: '/automation-rules', icon: Zap },
        {
          name: 'Course Creation',
          href: '/course-creation',
          icon: PlusCircle,
          hasDropdown: true
        },
        { name: 'Funnels', href: '/funnels', icon: Target },
        { name: 'Uploads', href: '/uploads', icon: Upload },
      ]
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )} style={{ backgroundColor: '#02001a', borderColor: '#1a0a4d' }}>
        <div className="flex flex-col h-screen">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b" style={{ borderColor: '#1a0a4d' }}>
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="FunnelsEye Logo" className="h-6 w-6" />
              <div className="flex flex-col">
                <span className="text-sm text-white font-normal">FunnelsEye</span>
                <span className="text-lg font-bold text-white">Admin Control</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-400 hover:text-white"
              style={{
                '--tw-ring-color': 'transparent',
                '--tw-bg-opacity': '0'
              }}
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {navigationGroups.map((group, groupIndex) => (
              <div key={group.title}>
                {/* Group Title */}
                <div className="px-3 mb-3">
                  <h3 className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                    {group.title}
                  </h3>
                </div>
                
                {/* Group Items */}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    
                    // Special handling for Course Creation with collapsible submenu
                    if (item.hasDropdown && item.name === 'Course Creation') {
                      const isOnCoursePage = location.pathname.startsWith('/course-creation');
                      return (
                        <Collapsible 
                          key={item.name} 
                          open={courseCreationOpen} 
                          onOpenChange={setCourseCreationOpen}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-between nav-item text-gray-400 hover:text-white font-normal",
                                isOnCoursePage && "text-white font-medium"
                              )}
                              style={{
                                '--tw-ring-color': 'transparent',
                                backgroundColor: isOnCoursePage ? 'rgba(42, 20, 89, 0.4)' : 'transparent',
                                borderRadius: isOnCoursePage ? '3px' : '0px'
                              }}
                              onMouseEnter={(e) => {
                                if (!isOnCoursePage) {
                                  e.currentTarget.style.backgroundColor = 'rgba(42, 20, 89, 0.2)';
                                  e.currentTarget.style.borderRadius = '3px';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isOnCoursePage) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.borderRadius = '0px';
                                }
                              }}
                            >
                              <div className="flex items-center">
                                <item.icon className="mr-3 h-4 w-4" />
                                {item.name}
                              </div>
                              {courseCreationOpen ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="ml-4 mt-1 space-y-1">
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start nav-item text-sm h-8 text-gray-400 hover:text-white font-normal",
                                isOnCoursePage && courseCategory === 'customer' && "text-white font-medium"
                              )}
                              style={{
                                '--tw-ring-color': 'transparent',
                                backgroundColor: (isOnCoursePage && courseCategory === 'customer') ? 'rgba(42, 20, 89, 0.4)' : 'transparent',
                                borderRadius: (isOnCoursePage && courseCategory === 'customer') ? '3px' : '0px'
                              }}
                              onMouseEnter={(e) => {
                                if (!(isOnCoursePage && courseCategory === 'customer')) {
                                  e.currentTarget.style.backgroundColor = 'rgba(42, 20, 89, 0.2)';
                                  e.currentTarget.style.borderRadius = '3px';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!(isOnCoursePage && courseCategory === 'customer')) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.borderRadius = '0px';
                                }
                              }}
                              onClick={() => {
                                setCourseCategory('customer');
                                navigate('/course-creation?category=customer');
                                setSidebarOpen(false);
                              }}
                            >
                              <BookOpen className="mr-2 h-3 w-3" />
                              Customer Courses
                            </Button>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start nav-item text-sm h-8 text-gray-400 hover:text-white font-normal",
                                isOnCoursePage && courseCategory === 'coach' && "text-white font-medium"
                              )}
                              style={{
                                '--tw-ring-color': 'transparent',
                                backgroundColor: (isOnCoursePage && courseCategory === 'coach') ? 'rgba(42, 20, 89, 0.4)' : 'transparent',
                                borderRadius: (isOnCoursePage && courseCategory === 'coach') ? '3px' : '0px'
                              }}
                              onMouseEnter={(e) => {
                                if (!(isOnCoursePage && courseCategory === 'coach')) {
                                  e.currentTarget.style.backgroundColor = 'rgba(42, 20, 89, 0.2)';
                                  e.currentTarget.style.borderRadius = '3px';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!(isOnCoursePage && courseCategory === 'coach')) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.borderRadius = '0px';
                                }
                              }}
                              onClick={() => {
                                setCourseCategory('coach');
                                navigate('/course-creation?category=coach');
                                setSidebarOpen(false);
                              }}
                            >
                              <Users className="mr-2 h-3 w-3" />
                              Coach Courses
                            </Button>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    }
                    
                    // Regular navigation items
                    return (
                      <Button
                        key={item.name}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start nav-item text-gray-400 hover:text-white font-normal",
                          isActive && "text-white font-medium"
                        )}
                        style={{
                          '--tw-ring-color': 'transparent',
                          backgroundColor: isActive ? 'rgba(42, 20, 89, 0.4)' : 'transparent',
                          borderRadius: isActive ? '3px' : '0px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(42, 20, 89, 0.2)';
                            e.currentTarget.style.borderRadius = '3px';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderRadius = '0px';
                          }
                        }}
                        onClick={() => {
                          navigate(item.href);
                          setSidebarOpen(false);
                        }}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.name}
                      </Button>
                    );
                  })}
                </div>
                
                {/* Divider (except for last group) */}
                {groupIndex < navigationGroups.length - 1 && (
                  <div className="mt-6 mb-2">
                    <div className="h-px bg-gray-500 opacity-50"></div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t" style={{ borderColor: '#1a0a4d' }}>
            <div className="flex items-center space-x-3">
              <div className="p-2" style={{ backgroundColor: '#1a0a4d' }}>
                <Shield className="h-4 w-4 text-purple-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {admin?.firstName} {admin?.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {admin?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
                style={{ '--tw-ring-color': 'transparent' }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
