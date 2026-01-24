import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, UserCheck } from 'lucide-react';

const CategorySelectionDialog = ({ open, onClose, onSelectCategory }) => {
  const categories = [
    {
      id: 'coach',
      title: 'Coach Funnel',
      description: 'Create funnels for coaches to sell their services, courses, and programs',
      icon: UserCheck,
      features: [
        'Lead capture pages',
        'Sales funnels',
        'Course sales',
        'Program enrollment',
        'Payment integration'
      ]
    },
    {
      id: 'customer',
      title: 'Customer Funnel',
      description: 'Create funnels for customers to purchase products and services',
      icon: Users,
      features: [
        'Product sales pages',
        'Lead magnets',
        'Webinars',
        'Membership sites',
        'Customer onboarding'
      ]
    }
  ];

  const handleSelectCategory = (categoryId) => {
    onSelectCategory(categoryId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Choose Your Funnel Type</DialogTitle>
          <DialogDescription className="text-center text-lg">
            Select the type of funnel you want to create based on your target audience
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50"
              onClick={() => handleSelectCategory(category.id)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <category.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{category.title}</CardTitle>
                <CardDescription className="text-base">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6" size="lg">
                  Create {category.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategorySelectionDialog;