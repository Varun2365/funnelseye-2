import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Image, 
  Plus,
  Calendar,
  Clock,
  Users
} from 'lucide-react';

const CoachContent = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coach Content Management</h1>
          <p className="text-muted-foreground">
            Manage and organize coach content, courses, and materials.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Coming Soon Message */}
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Coming Soon!</CardTitle>
          <CardDescription className="text-lg">
            Coach Content Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground max-w-md mx-auto">
            This section will allow admins to manage coach content, courses, videos, 
            and other materials. It's currently under development and will be 
            available in a future update.
          </p>
          
          {/* Feature Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Video className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Video Content</h3>
              <p className="text-sm text-muted-foreground">Manage video courses</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Documents</h3>
              <p className="text-sm text-muted-foreground">PDFs, guides, etc.</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Image className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Media Library</h3>
              <p className="text-sm text-muted-foreground">Images & graphics</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-semibold">Collaboration</h3>
              <p className="text-sm text-muted-foreground">Team content creation</p>
            </div>
          </div>

          {/* Planned Features */}
          <div className="bg-muted/30 rounded-lg p-6 max-w-3xl mx-auto">
            <h3 className="font-semibold mb-4 text-center">Planned Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Content approval workflow</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Version control & history</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Content analytics & insights</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Automated content scheduling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Content templates & presets</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Multi-language support</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Expected: Q2 2024</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">In Development</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachContent;
