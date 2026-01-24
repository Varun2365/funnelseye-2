import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { templates } from './funnel-templates';

const StageTemplateSelector = ({ stageType, selectedKey, onSelect, onClose }) => {
  console.log('StageTemplateSelector - stageType:', stageType);
  console.log('StageTemplateSelector - templates object:', templates);

  const templateSet = {
    'welcome-page': templates.welcomeTemplates,
    'vsl-page': templates.vslTemplates,
    'thankyou-page': templates.thankyouTemplates,
    'whatsapp-page': templates.whatsappTemplates,
    'product-offer': templates.productOfferTemplates,
    'custom-page': templates.miscTemplates,
    'appointment-page': templates.appointmentTemplates,
    'payment-page': templates.paymentTemplates,
  }[stageType];

  console.log('StageTemplateSelector - templateSet for', stageType, ':', templateSet);

  if (!templateSet || Object.keys(templateSet).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No templates available for this stage type.</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Select a Template</h3>
        <p className="text-muted-foreground">
          Choose a template to start building your {stageType.replace('-', ' ')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(templateSet).map(([key, template]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedKey === key ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
            }`}
            onClick={() => onSelect(key)}
          >
            <div className="aspect-video relative overflow-hidden rounded-t-lg">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x300/ccc/ffffff?text=No+Image';
                }}
              />
              {selectedKey === key && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary">Selected</Badge>
                </div>
              )}
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-input bg-background rounded-md hover:bg-accent"
        >
          Back to Category
        </button>
        <button
          onClick={() => onSelect(selectedKey)}
          disabled={!selectedKey}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue with Template
        </button>
      </div>
    </div>
  );
};

export default StageTemplateSelector;