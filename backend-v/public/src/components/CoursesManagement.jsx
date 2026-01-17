import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

const CoursesManagement = () => {
    const [programs, setPrograms] = useState([]);
    const [modules, setModules] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('programs');
    const { showToast } = useToast();

    // Form states
    const [programForm, setProgramForm] = useState({
        title: '',
        description: '',
        category: '',
        difficulty: 'beginner',
        estimatedDuration: '',
        price: '',
        isActive: true
    });

    const [moduleForm, setModuleForm] = useState({
        title: '',
        description: '',
        order: '',
        isActive: true
    });

    const [lessonForm, setLessonForm] = useState({
        title: '',
        description: '',
        contentType: 'video',
        contentUrl: '',
        duration: '',
        order: '',
        isActive: true
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchPrograms(),
                fetchModules(),
                fetchLessons()
            ]);
        } catch (error) {
            console.error('Error fetching courses data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPrograms = async () => {
        try {
            const response = await axios.get('/api/admin/courses/programs');
            setPrograms(response.data.data || []);
        } catch (error) {
            console.error('Error fetching programs:', error);
        }
    };

    const fetchModules = async () => {
        try {
            const response = await axios.get('/api/admin/courses/modules');
            setModules(response.data.data || []);
        } catch (error) {
            console.error('Error fetching modules:', error);
        }
    };

    const fetchLessons = async () => {
        try {
            const response = await axios.get('/api/admin/courses/lessons');
            setLessons(response.data.data || []);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        }
    };

    const createProgram = async () => {
        setSaving(true);
        try {
            await axios.post('/api/admin/courses/programs', programForm);
            showToast('Program created successfully', 'success');
            setProgramForm({
                title: '',
                description: '',
                category: '',
                difficulty: 'beginner',
                estimatedDuration: '',
                price: '',
                isActive: true
            });
            await fetchPrograms();
        } catch (error) {
            console.error('Error creating program:', error);
            showToast('Error creating program', 'error');
        } finally {
            setSaving(false);
        }
    };

    const createModule = async () => {
        if (!selectedProgram) {
            showToast('Please select a program first', 'error');
            return;
        }

        setSaving(true);
        try {
            const moduleData = { ...moduleForm, programId: selectedProgram._id };
            await axios.post('/api/admin/courses/modules', moduleData);
            showToast('Module created successfully', 'success');
            setModuleForm({
                title: '',
                description: '',
                order: '',
                isActive: true
            });
            await fetchModules();
        } catch (error) {
            console.error('Error creating module:', error);
            showToast('Error creating module', 'error');
        } finally {
            setSaving(false);
        }
    };

    const createLesson = async () => {
        if (!selectedModule) {
            showToast('Please select a module first', 'error');
            return;
        }

        setSaving(true);
        try {
            const lessonData = { ...lessonForm, moduleId: selectedModule._id };
            await axios.post('/api/admin/courses/lessons', lessonData);
            showToast('Lesson created successfully', 'success');
            setLessonForm({
                title: '',
                description: '',
                contentType: 'video',
                contentUrl: '',
                duration: '',
                order: '',
                isActive: true
            });
            await fetchLessons();
        } catch (error) {
            console.error('Error creating lesson:', error);
            showToast('Error creating lesson', 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleProgramStatus = async (programId, currentStatus) => {
        try {
            await axios.patch(`/api/admin/courses/programs/${programId}`, {
                isActive: !currentStatus
            });
            showToast('Program status updated', 'success');
            await fetchPrograms();
        } catch (error) {
            console.error('Error updating program status:', error);
            showToast('Error updating program status', 'error');
        }
    };

    const toggleModuleStatus = async (moduleId, currentStatus) => {
        try {
            await axios.patch(`/api/admin/courses/modules/${moduleId}`, {
                isActive: !currentStatus
            });
            showToast('Module status updated', 'success');
            await fetchModules();
        } catch (error) {
            console.error('Error updating module status:', error);
            showToast('Error updating module status', 'error');
        }
    };

    const toggleLessonStatus = async (lessonId, currentStatus) => {
        try {
            await axios.patch(`/api/admin/courses/lessons/${lessonId}`, {
                isActive: !currentStatus
            });
            showToast('Lesson status updated', 'success');
            await fetchLessons();
        } catch (error) {
            console.error('Error updating lesson status:', error);
            showToast('Error updating lesson status', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading courses data...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Courses & Content Management</h1>
                <p className="text-muted-foreground">
                    Manage educational programs, modules, and lessons with hierarchical organization
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="programs">Programs</TabsTrigger>
                    <TabsTrigger value="modules">Modules</TabsTrigger>
                    <TabsTrigger value="lessons">Lessons</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                </TabsList>

                <TabsContent value="programs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Program</CardTitle>
                            <CardDescription>
                                Add a new educational program to the platform
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="programTitle">Program Title</Label>
                                    <Input
                                        id="programTitle"
                                        value={programForm.title}
                                        onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                                        placeholder="Enter program title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="programCategory">Category</Label>
                                    <Input
                                        id="programCategory"
                                        value={programForm.category}
                                        onChange={(e) => setProgramForm({ ...programForm, category: e.target.value })}
                                        placeholder="e.g., Business, Technology"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="programDescription">Description</Label>
                                <Textarea
                                    id="programDescription"
                                    value={programForm.description}
                                    onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                                    placeholder="Describe the program content and objectives"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="programDifficulty">Difficulty Level</Label>
                                    <Select value={programForm.difficulty} onValueChange={(value) => setProgramForm({ ...programForm, difficulty: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="programDuration">Estimated Duration (hours)</Label>
                                    <Input
                                        id="programDuration"
                                        type="number"
                                        value={programForm.estimatedDuration}
                                        onChange={(e) => setProgramForm({ ...programForm, estimatedDuration: e.target.value })}
                                        placeholder="e.g., 20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="programPrice">Price (USD)</Label>
                                    <Input
                                        id="programPrice"
                                        type="number"
                                        step="0.01"
                                        value={programForm.price}
                                        onChange={(e) => setProgramForm({ ...programForm, price: e.target.value })}
                                        placeholder="e.g., 99.99"
                                    />
                                </div>
                            </div>
                            <Button onClick={createProgram} disabled={saving}>
                                {saving ? "Creating..." : "Create Program"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>All Programs</CardTitle>
                            <CardDescription>
                                Manage existing programs and their status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {programs.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Difficulty</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {programs.map((program) => (
                                            <TableRow key={program._id}>
                                                <TableCell className="font-medium">{program.title}</TableCell>
                                                <TableCell>{program.category}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{program.difficulty}</Badge>
                                                </TableCell>
                                                <TableCell>{program.estimatedDuration}h</TableCell>
                                                <TableCell>${program.price}</TableCell>
                                                <TableCell>
                                                    <Badge variant={program.isActive ? "default" : "secondary"}>
                                                        {program.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant={program.isActive ? "outline" : "default"}
                                                        onClick={() => toggleProgramStatus(program._id, program.isActive)}
                                                    >
                                                        {program.isActive ? "Deactivate" : "Activate"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No programs created yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="modules" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Module</CardTitle>
                            <CardDescription>
                                Add a new module to an existing program
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="programSelect">Select Program</Label>
                                <Select onValueChange={(value) => setSelectedProgram(programs.find(p => p._id === value))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programs.filter(p => p.isActive).map((program) => (
                                            <SelectItem key={program._id} value={program._id}>
                                                {program.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="moduleTitle">Module Title</Label>
                                    <Input
                                        id="moduleTitle"
                                        value={moduleForm.title}
                                        onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                        placeholder="Enter module title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="moduleOrder">Order</Label>
                                    <Input
                                        id="moduleOrder"
                                        type="number"
                                        value={moduleForm.order}
                                        onChange={(e) => setModuleForm({ ...moduleForm, order: e.target.value })}
                                        placeholder="e.g., 1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="moduleDescription">Description</Label>
                                <Textarea
                                    id="moduleDescription"
                                    value={moduleForm.description}
                                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                    placeholder="Describe the module content"
                                    rows={3}
                                />
                            </div>
                            <Button onClick={createModule} disabled={saving || !selectedProgram}>
                                {saving ? "Creating..." : "Create Module"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>All Modules</CardTitle>
                            <CardDescription>
                                Manage existing modules and their status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {modules.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Program</TableHead>
                                            <TableHead>Order</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {modules.map((module) => (
                                            <TableRow key={module._id}>
                                                <TableCell className="font-medium">{module.title}</TableCell>
                                                <TableCell>{module.programId?.title || 'Unknown'}</TableCell>
                                                <TableCell>{module.order}</TableCell>
                                                <TableCell>
                                                    <Badge variant={module.isActive ? "default" : "secondary"}>
                                                        {module.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant={module.isActive ? "outline" : "default"}
                                                        onClick={() => toggleModuleStatus(module._id, module.isActive)}
                                                    >
                                                        {module.isActive ? "Deactivate" : "Activate"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No modules created yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="lessons" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Lesson</CardTitle>
                            <CardDescription>
                                Add a new lesson to an existing module
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="moduleSelect">Select Module</Label>
                                <Select onValueChange={(value) => setSelectedModule(modules.find(m => m._id === value))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a module" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modules.filter(m => m.isActive).map((module) => (
                                            <SelectItem key={module._id} value={module._id}>
                                                {module.title} - {module.programId?.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="lessonTitle">Lesson Title</Label>
                                    <Input
                                        id="lessonTitle"
                                        value={lessonForm.title}
                                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                        placeholder="Enter lesson title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lessonOrder">Order</Label>
                                    <Input
                                        id="lessonOrder"
                                        type="number"
                                        value={lessonForm.order}
                                        onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })}
                                        placeholder="e.g., 1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lessonDescription">Description</Label>
                                <Textarea
                                    id="lessonDescription"
                                    value={lessonForm.description}
                                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                                    placeholder="Describe the lesson content"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="lessonContentType">Content Type</Label>
                                    <Select value={lessonForm.contentType} onValueChange={(value) => setLessonForm({ ...lessonForm, contentType: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="document">Document</SelectItem>
                                            <SelectItem value="audio">Audio</SelectItem>
                                            <SelectItem value="quiz">Quiz</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lessonContentUrl">Content URL</Label>
                                    <Input
                                        id="lessonContentUrl"
                                        value={lessonForm.contentUrl}
                                        onChange={(e) => setLessonForm({ ...lessonForm, contentUrl: e.target.value })}
                                        placeholder="YouTube/Vimeo URL or file path"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lessonDuration">Duration (minutes)</Label>
                                    <Input
                                        id="lessonDuration"
                                        type="number"
                                        value={lessonForm.duration}
                                        onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                                        placeholder="e.g., 15"
                                    />
                                </div>
                            </div>
                            <Button onClick={createLesson} disabled={saving || !selectedModule}>
                                {saving ? "Creating..." : "Create Lesson"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>All Lessons</CardTitle>
                            <CardDescription>
                                Manage existing lessons and their status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {lessons.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Module</TableHead>
                                            <TableHead>Program</TableHead>
                                            <TableHead>Content Type</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Order</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lessons.map((lesson) => (
                                            <TableRow key={lesson._id}>
                                                <TableCell className="font-medium">{lesson.title}</TableCell>
                                                <TableCell>{lesson.moduleId?.title || 'Unknown'}</TableCell>
                                                <TableCell>{lesson.moduleId?.programId?.title || 'Unknown'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{lesson.contentType}</Badge>
                                                </TableCell>
                                                <TableCell>{lesson.duration}m</TableCell>
                                                <TableCell>{lesson.order}</TableCell>
                                                <TableCell>
                                                    <Badge variant={lesson.isActive ? "default" : "secondary"}>
                                                        {lesson.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant={lesson.isActive ? "outline" : "default"}
                                                        onClick={() => toggleLessonStatus(lesson._id, lesson.isActive)}
                                                    >
                                                        {lesson.isActive ? "Deactivate" : "Activate"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No lessons created yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assignments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Assignments</CardTitle>
                            <CardDescription>
                                Assign courses to coaches and customers, track progress
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-muted-foreground py-8">
                                Course assignment functionality coming soon...
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CoursesManagement;
