import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, User, Crown, Star, TrendingUp } from 'lucide-react';

const HierarchyVisualization = ({ hierarchyData, coachName }) => {
    if (!hierarchyData) return null;

    // Debug logging
    console.log('HierarchyVisualization received data:', hierarchyData);

    // Function to render a single coach node
    const renderCoachNode = (coach, level = 0, isRoot = false) => {
        const levelColors = [
            'bg-blue-50 border-blue-200', // Level 0 - Root
            'bg-green-50 border-green-200', // Level 1
            'bg-yellow-50 border-yellow-200', // Level 2
            'bg-purple-50 border-purple-200', // Level 3
            'bg-pink-50 border-pink-200', // Level 4+
        ];

        const levelIcons = [
            <Crown className="w-4 h-4 text-blue-600" />, // Level 0
            <Star className="w-4 h-4 text-green-600" />, // Level 1
            <Users className="w-4 h-4 text-yellow-600" />, // Level 2
            <User className="w-4 h-4 text-purple-600" />, // Level 3
            <TrendingUp className="w-4 h-4 text-pink-600" />, // Level 4+
        ];

        const colorClass = levelColors[Math.min(level, levelColors.length - 1)];
        const icon = levelIcons[Math.min(level, levelIcons.length - 1)];

        return (
            <div key={coach._id || coach.id} className="flex flex-col items-center">
                <Card className={`w-48 ${colorClass} border-2 shadow-md hover:shadow-lg transition-shadow`}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-center mb-2">
                            {icon}
                        </div>
                        <div className="text-center">
                            <h4 className="font-semibold text-sm truncate" title={coach.name}>
                                {coach.name}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate" title={coach.email}>
                                {coach.email}
                            </p>
                            {coach.selfCoachId && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                    ID: {coach.selfCoachId}
                                </Badge>
                            )}
                            {coach.currentLevel && (
                                <Badge variant="outline" className="text-xs mt-1 ml-1">
                                    {coach.currentLevel}
                                </Badge>
                            )}
                        </div>
                        {coach.downlineCount > 0 && (
                            <div className="text-center mt-2">
                                <Badge variant="default" className="text-xs">
                                    {coach.downlineCount} downline
                                </Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Function to render hierarchy levels
    const renderHierarchyLevels = (data) => {
        if (!data || !data.hierarchy) return null;

        // Group downline members by level
        const levelGroups = {};
        const rootCoach = data.hierarchy;
        
        // Add root coach to level 0
        levelGroups[0] = [rootCoach];
        
        // Group downline members by their level
        if (rootCoach.children && rootCoach.children.length > 0) {
            rootCoach.children.forEach(member => {
                const level = member.level || 1;
                if (!levelGroups[level]) {
                    levelGroups[level] = [];
                }
                levelGroups[level].push(member);
            });
        }

        // Render each level
        const levels = [];
        Object.keys(levelGroups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(levelKey => {
            const level = parseInt(levelKey);
            const coaches = levelGroups[level];
            
            levels.push(
                <div key={level} className="flex flex-wrap justify-center gap-6 mb-8">
                    {coaches.map((coach, index) => (
                        <div key={coach._id || coach.id || index} className="flex flex-col items-center">
                            {renderCoachNode(coach, level, level === 0)}
                        </div>
                    ))}
                </div>
            );
        });

        return levels;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Hierarchy Structure
                </h3>
                <p className="text-gray-600">
                    Complete downline visualization for <span className="font-semibold">{coachName}</span>
                </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Root Coach</span>
                </div>
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Level 1</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">Level 2</span>
                </div>
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Level 3+</span>
                </div>
            </div>

            {/* Hierarchy Visualization */}
            <div className="overflow-auto max-h-96 p-4 bg-white rounded-lg border">
                {renderHierarchyLevels(hierarchyData)}
            </div>

            {/* Summary Stats */}
            {hierarchyData.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {hierarchyData.summary.totalCoaches || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total Coaches</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {hierarchyData.summary.maxDepth || 0}
                            </div>
                            <div className="text-sm text-gray-600">Max Depth</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {hierarchyData.summary.activeCoaches || 0}
                            </div>
                            <div className="text-sm text-gray-600">Active Coaches</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {hierarchyData.summary.totalRevenue || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total Revenue</div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default HierarchyVisualization;
