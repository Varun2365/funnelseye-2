import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  Download,
  Share2,
  BookOpen,
  Clock,
  User,
  FileText,
  Video,
  Image,
  File,
  ArrowLeft,
  CheckCircle,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const CoursePreview = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Video player state
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoRef, setVideoRef] = useState(null);
  
  // Accordion state
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [expandedLessons, setExpandedLessons] = useState(new Set());
  
  // Progress tracking
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/v1/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          setCourse(result.data);
          // Set first lesson as current if available
          if (result.data.modules && result.data.modules.length > 0) {
            const firstModule = result.data.modules[0];
            if (firstModule.contents && firstModule.contents.length > 0) {
              setCurrentLesson(firstModule.contents[0]);
              setCurrentModuleIndex(0);
              setCurrentLessonIndex(0);
            }
          }
        } else {
          setError(result.message || 'Failed to fetch course');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Error fetching course');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Handle module accordion toggle
  const toggleModule = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Handle lesson accordion toggle
  const toggleLesson = (lessonId) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  // Handle lesson selection
  const selectLesson = (lesson, moduleIndex, lessonIndex) => {
    setCurrentLesson(lesson);
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
    
    // Reset video state when switching lessons
    setVideoRef(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    
    // Mark lesson as completed after viewing
    const newCompleted = new Set(completedLessons);
    newCompleted.add(lesson._id);
    setCompletedLessons(newCompleted);
  };

  // Handle video player controls
  const togglePlayPause = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef) {
      videoRef.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef) {
      videoRef.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    if (videoRef) {
      const newTime = (newProgress / 100) * duration;
      videoRef.currentTime = newTime;
      setProgress(newProgress);
      setCurrentTime(newTime);
    }
  };

  // Handle video events
  const handleVideoLoadedMetadata = (e) => {
    setDuration(e.target.duration);
  };

  const handleVideoTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
    setProgress((e.target.currentTime / e.target.duration) * 100);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoVolumeChange = (e) => {
    setVolume(e.target.volume);
    setIsMuted(e.target.muted);
  };

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get content type icon
  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'audio': return <File className="h-4 w-4" />;
      case 'youtube': return <Video className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  // Render content based on type
  const renderContent = (lesson) => {
    if (!lesson) return null;

    switch (lesson.type) {
      case 'video':
        return (
          <video
            ref={setVideoRef}
            src={lesson.content}
            className="w-full h-full rounded-lg"
            onLoadedMetadata={handleVideoLoadedMetadata}
            onTimeUpdate={handleVideoTimeUpdate}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onVolumeChange={handleVideoVolumeChange}
            volume={volume}
            muted={isMuted}
          />
        );
      
      case 'image':
        return (
          <img
            src={lesson.content}
            alt={lesson.title}
            className="w-full h-full object-contain rounded-lg"
          />
        );
      
      case 'pdf':
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold mb-2">{lesson.title}</h3>
              <p className="text-gray-600 mb-4">{lesson.description}</p>
              <Button 
                onClick={() => window.open(lesson.content, '_blank')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Open PDF
              </Button>
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="text-center w-full max-w-md">
              <File className="h-16 w-16 mx-auto mb-4 text-purple-500" />
              <h3 className="text-lg font-semibold mb-2">{lesson.title}</h3>
              <p className="text-gray-600 mb-4">{lesson.description}</p>
              <audio
                ref={setVideoRef}
                src={lesson.content}
                className="w-full"
                onLoadedMetadata={handleVideoLoadedMetadata}
                onTimeUpdate={handleVideoTimeUpdate}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onVolumeChange={handleVideoVolumeChange}
                volume={volume}
                muted={isMuted}
              />
            </div>
          </div>
        );
      
      case 'youtube':
        return (
          <div className="w-full h-full rounded-lg overflow-hidden">
            <div 
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="text-center">
              <File className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-semibold mb-2">{lesson.title}</h3>
              <p className="text-gray-600">{lesson.description}</p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Course</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/admin/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/admin/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/courses')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-600">Course Preview</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                  {currentLesson ? (
                    renderContent(currentLesson)
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg opacity-75">Select a lesson to start</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Video Controls */}
                {currentLesson && (currentLesson.type === 'video' || currentLesson.type === 'audio') && (
                  <div className="bg-white p-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMute}
                          >
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={progress}
                        onChange={handleProgressChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lesson Info */}
            {currentLesson && (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{currentLesson.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{currentLesson.duration || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{currentLesson.author || 'Unknown'}</span>
                        </div>
                        <Badge variant="secondary">{currentLesson.type}</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{currentLesson.description}</p>
                  
                  {/* Resources */}
                  {currentLesson.resources && currentLesson.resources.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Resources:</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentLesson.resources.map((resource, index) => (
                          <Badge key={index} variant="outline" className="flex items-center space-x-1">
                            <FileText className="h-3 w-3" />
                            <span>{resource}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Course Content</span>
                </CardTitle>
                <div className="text-sm text-gray-600">
                  {course.modules?.length || 0} modules • {course.modules?.reduce((total, module) => total + (module.contents?.length || 0), 0) || 0} lessons
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {course.modules?.map((module, moduleIndex) => (
                    <div key={module._id} className="border-b last:border-b-0">
                      {/* Module Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleModule(module._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {expandedModules.has(module._id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="font-medium">{module.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {module.contents?.length || 0}
                          </Badge>
                        </div>
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-1 ml-6">{module.description}</p>
                        )}
                      </div>

                      {/* Module Lessons */}
                      {expandedModules.has(module._id) && (
                        <div className="bg-gray-50">
                          {module.contents?.map((lesson, lessonIndex) => (
                            <div
                              key={lesson._id}
                              className={`p-3 cursor-pointer transition-colors border-l-2 ${
                                currentLesson?._id === lesson._id
                                  ? 'bg-blue-50 border-blue-500'
                                  : 'hover:bg-gray-100 border-transparent'
                              }`}
                              onClick={() => selectLesson(lesson, moduleIndex, lessonIndex)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {completedLessons.has(lesson._id) ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-shrink-0">
                                  {getContentTypeIcon(lesson.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {lesson.title}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {lesson.duration || 'No duration'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;
