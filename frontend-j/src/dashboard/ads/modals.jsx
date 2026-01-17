// MarketingDashboard Modals Component
import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter,
  VStack, HStack, FormControl, FormLabel, Input, Select, Textarea, Button, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Checkbox, Switch, Alert, AlertIcon, AlertTitle, AlertDescription, Box, Text, List,
  ListItem, Wrap, WrapItem, Tag, Tabs, TabList, TabPanels, Tab, TabPanel, useColorModeValue,
  Grid, Image
} from '@chakra-ui/react';
import {
  FiImage, FiStar, FiEdit3, FiShare2, FiTarget, FiBarChart2
} from 'react-icons/fi';

export const CredentialsSetupModal = ({
  isOpen, onClose, loading, metaCredentials, setMetaCredentials, openAICredentials,
  setOpenAICredentials, setupMetaCredentials, setupOpenAICredentials, verifyMetaCredentials
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Setup API Credentials</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Meta API</Tab>
              <Tab>OpenAI API</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Meta API Setup Required!</AlertTitle>
                      <AlertDescription>
                        You need Meta API credentials to manage Facebook and Instagram ads.
                      </AlertDescription>
                    </Box>
                  </Alert>
                  
                  <FormControl>
                    <FormLabel>Access Token</FormLabel>
                    <Input
                      value={metaCredentials.accessToken}
                      onChange={(e) => setMetaCredentials(prev => ({ ...prev, accessToken: e.target.value }))}
                      placeholder="EAABwzLixnjYBO..."
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>App ID</FormLabel>
                    <Input
                      value={metaCredentials.appId}
                      onChange={(e) => setMetaCredentials(prev => ({ ...prev, appId: e.target.value }))}
                      placeholder="123456789"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>App Secret</FormLabel>
                    <Input
                      type="password"
                      value={metaCredentials.appSecret}
                      onChange={(e) => setMetaCredentials(prev => ({ ...prev, appSecret: e.target.value }))}
                      placeholder="abc123def456..."
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Business Account ID (Optional)</FormLabel>
                    <Input
                      value={metaCredentials.businessAccountId}
                      onChange={(e) => setMetaCredentials(prev => ({ ...prev, businessAccountId: e.target.value }))}
                      placeholder="123456789"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Ad Account ID (Optional)</FormLabel>
                    <Input
                      value={metaCredentials.adAccountId}
                      onChange={(e) => setMetaCredentials(prev => ({ ...prev, adAccountId: e.target.value }))}
                      placeholder="act_123456789"
                    />
                  </FormControl>
                  
                  <HStack>
                    <Button onClick={setupMetaCredentials} colorScheme="blue" isLoading={loading}>
                      Setup Meta Credentials
                    </Button>
                    <Button onClick={verifyMetaCredentials} variant="outline" isLoading={loading}>
                      Verify Credentials
                    </Button>
                  </HStack>
                </VStack>
              </TabPanel>
              
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>OpenAI API Setup Required!</AlertTitle>
                      <AlertDescription>
                        You need OpenAI API credentials to use AI-powered features.
                      </AlertDescription>
                    </Box>
                  </Alert>
                  
                  <FormControl>
                    <FormLabel>API Key</FormLabel>
                    <Input
                      type="password"
                      value={openAICredentials.apiKey}
                      onChange={(e) => setOpenAICredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="sk-..."
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Model Preference</FormLabel>
                    <Select
                      value={openAICredentials.modelPreference}
                      onChange={(e) => setOpenAICredentials(prev => ({ ...prev, modelPreference: e.target.value }))}
                    >
                      <option value="gpt-4">GPT-4 (Recommended)</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="gpt-4-turbo-preview">GPT-4 Turbo Preview</option>
                    </Select>
                  </FormControl>
                  
                  <Button onClick={setupOpenAICredentials} colorScheme="green" isLoading={loading}>
                    Setup OpenAI Credentials
                  </Button>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export const CreateCampaignModal = ({
  isOpen, onClose, loading, campaignForm, setCampaignForm, createCampaign,
  funnels, funnelLoading, selectedFunnel, handleFunnelSelection, fetchFunnels
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Campaign</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Campaign Name</FormLabel>
              <Input
                value={campaignForm.name}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="AI-Powered Fitness Campaign"
              />
            </FormControl>
            
            {/* Funnel Selection */}
            <FormControl>
              <FormLabel>Select Funnel (Required)</FormLabel>
              <HStack spacing={2}>
                <Select
                  placeholder={funnelLoading ? "Loading funnels..." : "Choose a funnel"}
                  value={campaignForm.funnelId}
                  onChange={(e) => handleFunnelSelection(e.target.value)}
                  isDisabled={funnelLoading}
                >
                  {funnels.map((funnel) => (
                    <option key={funnel._id || funnel.id} value={funnel._id || funnel.id}>
                      {funnel.name} - {funnel.status || 'Inactive'} ({funnel.type || 'Custom'})
                    </option>
                  ))}
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchFunnels}
                  isLoading={funnelLoading}
                >
                  Refresh
                </Button>
              </HStack>
              {selectedFunnel && (
                <Box mt={2} p={3} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                  <VStack align="stretch" spacing={1}>
                    <Text fontSize="sm" color="green.700" fontWeight="semibold">
                      Selected: {selectedFunnel.name}
                    </Text>
                    <Text fontSize="xs" color="green.600">
                      <Text as="span" fontWeight="semibold">URL:</Text> {campaignForm.funnelUrl}
                    </Text>
                    <Text fontSize="xs" color="green.600">
                      <Text as="span" fontWeight="semibold">Type:</Text> {selectedFunnel.type || 'Custom'}
                    </Text>
                    <Text fontSize="xs" color="green.600">
                      <Text as="span" fontWeight="semibold">Stages:</Text> {selectedFunnel.stageCount || 0}
                    </Text>
                    <Text fontSize="xs" color="green.600">
                      <Text as="span" fontWeight="semibold">Status:</Text> {selectedFunnel.status || 'Inactive'}
                    </Text>
                  </VStack>
                </Box>
              )}
              {funnels.length === 0 && !funnelLoading && (
                <Box mt={2} p={2} bg="yellow.50" borderRadius="md" border="1px" borderColor="yellow.200">
                  <Text fontSize="sm" color="yellow.700">
                    No funnels found. Please create a funnel first in the Portfolio section.
                  </Text>
                </Box>
              )}
            </FormControl>
            
            <FormControl>
              <FormLabel>Objective</FormLabel>
              <Select
                value={campaignForm.objective}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, objective: e.target.value }))}
              >
                <option value="CONVERSIONS">Conversions</option>
                <option value="TRAFFIC">Traffic</option>
                <option value="AWARENESS">Awareness</option>
                <option value="ENGAGEMENT">Engagement</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Daily Budget ($)</FormLabel>
              <NumberInput
                value={campaignForm.budget}
                onChange={(value) => setCampaignForm(prev => ({ ...prev, budget: value }))}
                min={1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel>Target Audience</FormLabel>
              <Textarea
                value={campaignForm.targetAudience}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="Fitness enthusiasts aged 25-45 interested in online coaching"
                rows={3}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Product Information</FormLabel>
              <Textarea
                value={campaignForm.productInfo}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, productInfo: e.target.value }))}
                placeholder="Online fitness coaching program with personalized workout plans and nutrition guidance"
                rows={3}
              />
            </FormControl>
            
            {/* AI Generated Content Selection */}
            {(campaignForm.aiContent.headlines.length > 0 || campaignForm.aiPosters.length > 0 || campaignForm.aiSocialPosts.length > 0) && (
              <Box p={4} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                <Text fontWeight="bold" mb={3} color="green.700">AI Generated Content</Text>
                <VStack spacing={4} align="stretch">
                  
                  {/* AI Headlines Selection */}
                  {campaignForm.aiContent.headlines.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" mb={2} color="green.600">Select Headline:</Text>
                      <VStack spacing={2} align="stretch">
                        {campaignForm.aiContent.headlines.map((headline, index) => (
                          <Box key={index} p={2} bg="white" borderRadius="md" border="1px" borderColor="green.200">
                            <HStack>
                              <input
                                type="radio"
                                name="headline"
                                value={headline}
                                checked={campaignForm.aiContent.selectedHeadline === headline}
                                onChange={(e) => setCampaignForm(prev => ({
                                  ...prev,
                                  aiContent: { ...prev.aiContent, selectedHeadline: e.target.value }
                                }))}
                              />
                              <Text fontSize="sm">{headline}</Text>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* AI Descriptions Selection */}
                  {campaignForm.aiContent.descriptions.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" mb={2} color="green.600">Select Description:</Text>
                      <VStack spacing={2} align="stretch">
                        {campaignForm.aiContent.descriptions.map((description, index) => (
                          <Box key={index} p={2} bg="white" borderRadius="md" border="1px" borderColor="green.200">
                            <HStack>
                              <input
                                type="radio"
                                name="description"
                                value={description}
                                checked={campaignForm.aiContent.selectedDescription === description}
                                onChange={(e) => setCampaignForm(prev => ({
                                  ...prev,
                                  aiContent: { ...prev.aiContent, selectedDescription: e.target.value }
                                }))}
                              />
                              <Text fontSize="sm">{description}</Text>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* AI Posters Selection */}
                  {campaignForm.aiPosters.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" mb={2} color="green.600">Select Poster:</Text>
                      <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={2}>
                        {campaignForm.aiPosters.map((posterUrl, index) => (
                          <Box key={index} p={2} bg="white" borderRadius="md" border="1px" borderColor="green.200">
                            <VStack spacing={2}>
                              <Image src={posterUrl} alt={`AI Poster ${index + 1}`} borderRadius="md" maxH="100px" />
                              <HStack>
                                <input
                                  type="radio"
                                  name="poster"
                                  value={posterUrl}
                                  checked={campaignForm.selectedPoster === posterUrl}
                                  onChange={(e) => setCampaignForm(prev => ({
                                    ...prev,
                                    selectedPoster: e.target.value
                                  }))}
                                />
                                <Text fontSize="xs">Poster {index + 1}</Text>
                              </HStack>
                            </VStack>
                          </Box>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* AI Social Posts Selection */}
                  {campaignForm.aiSocialPosts.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" mb={2} color="green.600">Select Social Post:</Text>
                      <VStack spacing={2} align="stretch">
                        {campaignForm.aiSocialPosts.map((post, index) => (
                          <Box key={index} p={2} bg="white" borderRadius="md" border="1px" borderColor="green.200">
                            <HStack>
                              <input
                                type="radio"
                                name="socialPost"
                                value={JSON.stringify(post)}
                                checked={campaignForm.selectedSocialPost === JSON.stringify(post)}
                                onChange={(e) => setCampaignForm(prev => ({
                                  ...prev,
                                  selectedSocialPost: e.target.value
                                }))}
                              />
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" fontWeight="semibold">Caption:</Text>
                                <Text fontSize="sm">{post.caption}</Text>
                                {post.hashtags && (
                                  <HStack spacing={1}>
                                    {post.hashtags.map((tag, tagIndex) => (
                                      <Tag key={tagIndex} size="sm" colorScheme="blue">#{tag}</Tag>
                                    ))}
                                  </HStack>
                                )}
                              </VStack>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </Box>
            )}

            {/* AI Tools Integration */}
            <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
              <Text fontWeight="bold" mb={3} color="blue.700">AI-Powered Campaign Tools</Text>
              <VStack spacing={3} align="stretch">
                <HStack spacing={4}>
                  <Button
                    size="sm"
                    colorScheme="purple"
                    variant="outline"
                    leftIcon={<FiImage />}
                    onClick={() => {
                      // This will be handled by the parent component
                      console.log('AI Content Generation requested');
                    }}
                  >
                    Generate AI Content
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    leftIcon={<FiTarget />}
                    onClick={() => {
                      console.log('AI Targeting requested');
                    }}
                  >
                    AI Targeting
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="green"
                    variant="outline"
                    leftIcon={<FiBarChart2 />}
                    onClick={() => {
                      console.log('AI Optimization requested');
                    }}
                  >
                    AI Optimization
                  </Button>
                </HStack>
                <HStack>
                  <Checkbox
                    isChecked={campaignForm.useAI}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, useAI: e.target.checked }))}
                  >
                    Use AI for content generation
                  </Checkbox>
                  <Checkbox
                    isChecked={campaignForm.autoOptimize}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, autoOptimize: e.target.checked }))}
                  >
                    Enable auto-optimization
                  </Checkbox>
                </HStack>
              </VStack>
            </Box>
            
            <HStack>
              <FormControl>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="datetime-local"
                  value={campaignForm.schedule.startDate}
                  onChange={(e) => setCampaignForm(prev => ({ 
                    ...prev, 
                    schedule: { ...prev.schedule, startDate: e.target.value }
                  }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="datetime-local"
                  value={campaignForm.schedule.endDate}
                  onChange={(e) => setCampaignForm(prev => ({ 
                    ...prev, 
                    schedule: { ...prev.schedule, endDate: e.target.value }
                  }))}
                />
              </FormControl>
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={createCampaign} isLoading={loading}>
            Create Campaign
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const AIContentModal = ({
  isOpen, onClose, loading, aiContentForm, setAiContentForm, generateAIContent, generatedContent
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>AI Content Generation</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Product Information</FormLabel>
              <Textarea
                value={aiContentForm.productInfo}
                onChange={(e) => setAiContentForm(prev => ({ ...prev, productInfo: e.target.value }))}
                placeholder="Online fitness coaching program with personalized workout plans"
                rows={3}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Target Audience</FormLabel>
              <Textarea
                value={aiContentForm.targetAudience}
                onChange={(e) => setAiContentForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="Fitness enthusiasts aged 25-45 who want to get in shape"
                rows={3}
              />
            </FormControl>
            
            <HStack>
              <FormControl>
                <FormLabel>Campaign Objective</FormLabel>
                <Select
                  value={aiContentForm.campaignObjective}
                  onChange={(e) => setAiContentForm(prev => ({ ...prev, campaignObjective: e.target.value }))}
                >
                  <option value="CONVERSIONS">Conversions</option>
                  <option value="TRAFFIC">Traffic</option>
                  <option value="AWARENESS">Awareness</option>
                  <option value="ENGAGEMENT">Engagement</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Tone</FormLabel>
                <Select
                  value={aiContentForm.tone}
                  onChange={(e) => setAiContentForm(prev => ({ ...prev, tone: e.target.value }))}
                >
                  <option value="motivational">Motivational</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </FormControl>
            </HStack>
            
            <HStack>
              <FormControl>
                <FormLabel>Length</FormLabel>
                <Select
                  value={aiContentForm.length}
                  onChange={(e) => setAiContentForm(prev => ({ ...prev, length: e.target.value }))}
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Include Call to Action</FormLabel>
                <Switch
                  isChecked={aiContentForm.includeCallToAction}
                  onChange={(e) => setAiContentForm(prev => ({ ...prev, includeCallToAction: e.target.checked }))}
                />
              </FormControl>
            </HStack>
            
            <Button onClick={generateAIContent} colorScheme="purple" isLoading={loading}>
              Generate AI Content
            </Button>
            
            {generatedContent.headline && (
              <Box p={4} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                <Text fontWeight="bold" mb={2}>Generated Content:</Text>
                <VStack align="stretch" spacing={2}>
                  <Box>
                    <Text fontWeight="semibold">Headline:</Text>
                    <Text>{generatedContent.headline}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold">Primary Copy:</Text>
                    <Text>{generatedContent.primaryCopy}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold">Call to Action:</Text>
                    <Text>{generatedContent.callToAction}</Text>
                  </Box>
                  {generatedContent.benefits && Array.isArray(generatedContent.benefits) && generatedContent.benefits.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold">Benefits:</Text>
                      <List>
                        {generatedContent.benefits.map((benefit, index) => (
                          <ListItem key={index}>• {benefit}</ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export const AITargetingModal = ({
  isOpen, onClose, loading, aiTargetingForm, setAiTargetingForm, generateTargetingRecommendations, aiResults
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>AI Targeting Recommendations</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Target Audience Description</FormLabel>
              <Textarea
                value={aiTargetingForm.targetAudience}
                onChange={(e) => setAiTargetingForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="Fitness enthusiasts who want to lose weight"
                rows={3}
              />
            </FormControl>
            
            <HStack>
              <FormControl>
                <FormLabel>Budget ($)</FormLabel>
                <NumberInput
                  value={aiTargetingForm.budget}
                  onChange={(value) => setAiTargetingForm(prev => ({ ...prev, budget: value }))}
                  min={1}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Objective</FormLabel>
                <Select
                  value={aiTargetingForm.objective}
                  onChange={(e) => setAiTargetingForm(prev => ({ ...prev, objective: e.target.value }))}
                >
                  <option value="CONVERSIONS">Conversions</option>
                  <option value="TRAFFIC">Traffic</option>
                  <option value="AWARENESS">Awareness</option>
                  <option value="ENGAGEMENT">Engagement</option>
                </Select>
              </FormControl>
            </HStack>
            
            <FormControl>
              <FormLabel>Product Information</FormLabel>
              <Textarea
                value={aiTargetingForm.productInfo}
                onChange={(e) => setAiTargetingForm(prev => ({ ...prev, productInfo: e.target.value }))}
                placeholder="Online fitness coaching program"
                rows={3}
              />
            </FormControl>
            
            <Button onClick={generateTargetingRecommendations} colorScheme="blue" isLoading={loading}>
              Generate Targeting Recommendations
            </Button>
            
            {aiResults.targetingRecommendations && (
              <Box p={4} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                <Text fontWeight="bold" mb={2}>AI Targeting Recommendations:</Text>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontWeight="semibold">Demographics:</Text>
                    {aiResults.targetingRecommendations?.demographics ? (
                      typeof aiResults.targetingRecommendations.demographics === 'object' ? (
                        <VStack align="start" spacing={1}>
                          {Object.entries(aiResults.targetingRecommendations.demographics).map(([key, value]) => (
                            <Text key={key} fontSize="sm">
                              <Text as="span" fontWeight="semibold">{key.charAt(0).toUpperCase() + key.slice(1)}:</Text> {value}
                            </Text>
                          ))}
                        </VStack>
                      ) : (
                    <Text>{aiResults.targetingRecommendations.demographics}</Text>
                      )
                    ) : (
                      <Text>No demographics data available</Text>
                    )}
                  </Box>
                  <Box>
                    <Text fontWeight="semibold">Interests:</Text>
                    <Wrap>
                      {Array.isArray(aiResults.targetingRecommendations?.interests) ? 
                        aiResults.targetingRecommendations.interests.map((interest, index) => (
                        <WrapItem key={index}>
                          <Tag colorScheme="blue">{interest}</Tag>
                        </WrapItem>
                        )) : (
                          <Text color="gray.500" fontSize="sm">No interests data available</Text>
                        )
                      }
                    </Wrap>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold">Budget Allocation:</Text>
                    <Text>Daily: ${aiResults.targetingRecommendations?.budgetAllocation?.dailyBudget || 'N/A'}</Text>
                    <Text>Weekly: ${aiResults.targetingRecommendations?.budgetAllocation?.weeklyBudget || 'N/A'}</Text>
                    <Text>Monthly: ${aiResults.targetingRecommendations?.budgetAllocation?.monthlyBudget || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold">Placements:</Text>
                    <List>
                      {Array.isArray(aiResults.targetingRecommendations?.placements) ? 
                        aiResults.targetingRecommendations.placements.map((placement, index) => (
                        <ListItem key={index}>• {placement}</ListItem>
                        )) : (
                          <ListItem>No placements data available</ListItem>
                        )
                      }
                    </List>
                  </Box>
                </VStack>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export const AIOptimizationModal = ({
  isOpen, onClose, loading, campaigns, selectedCampaign, setSelectedCampaign, optimizeCampaign, aiResults
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>AI Campaign Optimization</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>Campaign Optimization</AlertTitle>
                <AlertDescription>
                  Select a campaign to optimize with AI-powered insights and recommendations.
                </AlertDescription>
              </Box>
            </Alert>
            
            <FormControl>
              <FormLabel>Select Campaign</FormLabel>
              <Select
                placeholder="Choose a campaign to optimize"
                onChange={(e) => setSelectedCampaign(e.target.value)}
              >
                {Array.isArray(campaigns) && campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              onClick={() => optimizeCampaign(selectedCampaign)} 
              colorScheme="green" 
              isLoading={loading}
              isDisabled={!selectedCampaign}
            >
              Optimize Campaign
            </Button>
            
            {aiResults.optimizationSuggestions && (
              <Box p={4} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                <Text fontWeight="bold" mb={2}>Optimization Recommendations:</Text>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontWeight="semibold">Performance Analysis:</Text>
                    {aiResults.optimizationSuggestions?.performanceAnalysis ? (
                      typeof aiResults.optimizationSuggestions.performanceAnalysis === 'object' ? (
                        <VStack align="start" spacing={1}>
                          {Object.entries(aiResults.optimizationSuggestions.performanceAnalysis).map(([key, value]) => (
                            <Text key={key} fontSize="sm">
                              <Text as="span" fontWeight="semibold">{key.charAt(0).toUpperCase() + key.slice(1)}:</Text> {value}
                            </Text>
                          ))}
                        </VStack>
                      ) : (
                    <Text>{aiResults.optimizationSuggestions.performanceAnalysis}</Text>
                      )
                    ) : (
                      <Text>No performance analysis available</Text>
                    )}
                  </Box>
                  
                  {aiResults.optimizationSuggestions?.budgetOptimization && (
                    <Box>
                      <Text fontWeight="semibold">Budget Optimization:</Text>
                      <Text>Current: ${aiResults.optimizationSuggestions.budgetOptimization?.currentBudget || 'N/A'}</Text>
                      <Text>Recommended: ${aiResults.optimizationSuggestions.budgetOptimization?.recommendedBudget || 'N/A'}</Text>
                      <Text>Reasoning: {aiResults.optimizationSuggestions.budgetOptimization?.reasoning || 'No reasoning available'}</Text>
                    </Box>
                  )}
                  
                  {aiResults.optimizationSuggestions?.audienceOptimization && (
                    <Box>
                      <Text fontWeight="semibold">Audience Optimization:</Text>
                      <Text>Recommendation: {aiResults.optimizationSuggestions.audienceOptimization?.recommendedAudience || 'No recommendation available'}</Text>
                      <Text>Reasoning: {aiResults.optimizationSuggestions.audienceOptimization?.reasoning || 'No reasoning available'}</Text>
                    </Box>
                  )}
                  
                  {aiResults.optimizationSuggestions?.creativeOptimization && (
                    <Box>
                      <Text fontWeight="semibold">Creative Optimization:</Text>
                      <List>
                        {Array.isArray(aiResults.optimizationSuggestions?.creativeOptimization?.recommendations) ? 
                          aiResults.optimizationSuggestions.creativeOptimization.recommendations.map((rec, index) => (
                          <ListItem key={index}>• {rec}</ListItem>
                          )) : (
                            <ListItem>No creative recommendations available</ListItem>
                          )
                        }
                      </List>
                    </Box>
                  )}
                  
                  <Box>
                    <Text fontWeight="semibold">Priority Actions:</Text>
                    <List>
                      {Array.isArray(aiResults.optimizationSuggestions?.priorityActions) ? 
                        aiResults.optimizationSuggestions.priorityActions.map((action, index) => (
                        <ListItem key={index}>• {action}</ListItem>
                        )) : (
                          <ListItem>No priority actions available</ListItem>
                        )
                      }
                    </List>
                  </Box>
                </VStack>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export const AutomationModal = ({
  isOpen, onClose, loading, campaigns, selectedCampaign, setSelectedCampaign, automationForm, setAutomationForm, setupCampaignAutomation
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Campaign Automation Setup</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>Automation Rules</AlertTitle>
                <AlertDescription>
                  Set up automated rules to manage your campaigns based on performance metrics.
                </AlertDescription>
              </Box>
            </Alert>
            
            <FormControl>
              <FormLabel>Select Campaign</FormLabel>
              <Select
                placeholder="Choose a campaign to automate"
                onChange={(e) => setSelectedCampaign(e.target.value)}
              >
                {Array.isArray(campaigns) && campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <HStack>
              <Checkbox
                isChecked={automationForm.notifications}
                onChange={(e) => setAutomationForm(prev => ({ ...prev, notifications: e.target.checked }))}
              >
                Enable Notifications
              </Checkbox>
              <Checkbox
                isChecked={automationForm.autoOptimize}
                onChange={(e) => setAutomationForm(prev => ({ ...prev, autoOptimize: e.target.checked }))}
              >
                Enable Auto-Optimization
              </Checkbox>
            </HStack>
            
            <Text fontSize="sm" color="gray.600">
              Default automation rules will be applied:
            </Text>
            <List fontSize="sm">
              <ListItem>• Pause campaign if CTR drops below 1%</ListItem>
              <ListItem>• Reduce budget if CPC exceeds $2.00</ListItem>
              <ListItem>• Optimize audience if conversion rate is low</ListItem>
            </List>
            
            <Button 
              onClick={() => setupCampaignAutomation(selectedCampaign)} 
              colorScheme="orange" 
              isLoading={loading}
              isDisabled={!selectedCampaign}
            >
              Setup Automation
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export const AIPosterModal = ({
  isOpen, onClose, loading, aiPosterForm, setAiPosterForm, aiCampaignForm, setAiCampaignForm,
  generatePoster, generatePosterVariations, generateHeadlines, generateSocialPost, generateCampaign,
  generatedContent, campaignForm, user
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Debug: Log current form data when modal opens
  React.useEffect(() => {
    if (isOpen) {
      console.log('🔍 AIPosterModal opened with form data:', aiPosterForm);
      console.log('🔍 Campaign form data:', campaignForm);
      console.log('🔍 User data:', user);
    }
  }, [isOpen, aiPosterForm, campaignForm, user]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxW="4xl">
        <ModalHeader>
          <HStack spacing={3}>
            <Box p={2} bg="pink.50" borderRadius="lg">
              <FiImage color="#D53F8C" />
            </Box>
            <VStack align="start" spacing={0}>
              <Text>AI Poster Generation</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="normal">
                Generate AI-powered marketing posters and content
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            {/* Campaign Form Data Display */}
            {campaignForm && (
              <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200" w="full">
                <Text fontWeight="bold" mb={2} color="blue.700">📋 Campaign Data (Auto-filled):</Text>
                <VStack align="stretch" spacing={2}>
                  <HStack>
                    <Text fontSize="sm" fontWeight="semibold" color="blue.600">Coach Name:</Text>
                    <Text fontSize="sm" color="blue.800">{user?.name || 'Not available'}</Text>
                  </HStack>
                  <HStack>
                    <Text fontSize="sm" fontWeight="semibold" color="blue.600">Product/Niche:</Text>
                    <Text fontSize="sm" color="blue.800">{campaignForm.productInfo || 'Not specified'}</Text>
                  </HStack>
                  <HStack>
                    <Text fontSize="sm" fontWeight="semibold" color="blue.600">Target Audience:</Text>
                    <Text fontSize="sm" color="blue.800">{campaignForm.targetAudience || 'Not specified'}</Text>
                  </HStack>
                </VStack>
              </Box>
            )}
            
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
              <FormControl isRequired>
                <FormLabel>Coach Name</FormLabel>
                <Input
                  value={aiPosterForm.coachName}
                  onChange={(e) => setAiPosterForm(prev => ({
                    ...prev,
                    coachName: e.target.value
                  }))}
                  placeholder="Enter coach name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Niche</FormLabel>
                <Input
                  value={aiPosterForm.niche}
                  onChange={(e) => setAiPosterForm(prev => ({
                    ...prev,
                    niche: e.target.value
                  }))}
                  placeholder="e.g., Weight Loss & Nutrition"
                />
              </FormControl>
            </Grid>

            <FormControl isRequired>
              <FormLabel>Offer</FormLabel>
              <Input
                value={aiPosterForm.offer}
                onChange={(e) => setAiPosterForm(prev => ({
                  ...prev,
                  offer: e.target.value
                }))}
                placeholder="e.g., 12-Week Transformation Program"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Target Audience</FormLabel>
              <Select
                value={aiPosterForm.targetAudience}
                onChange={(e) => setAiPosterForm(prev => ({
                  ...prev,
                  targetAudience: e.target.value
                }))}
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="fitness">Fitness</option>
                <option value="nutrition">Nutrition</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="business">Business</option>
              </Select>
            </FormControl>

            {/* Campaign-Specific Fields */}
            <Box w="full" p={4} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
              <Text fontWeight="bold" mb={3}>Campaign Settings (for Generate Campaign)</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl isRequired>
                  <FormLabel>Campaign Duration (Days)</FormLabel>
                  <Input
                    type="number"
                    value={aiCampaignForm.campaignDuration}
                    onChange={(e) => setAiCampaignForm(prev => ({
                      ...prev,
                      campaignDuration: parseInt(e.target.value) || 7
                    }))}
                    placeholder="7"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Daily Budget ($)</FormLabel>
                  <Input
                    type="number"
                    value={aiCampaignForm.dailyBudget}
                    onChange={(e) => setAiCampaignForm(prev => ({
                      ...prev,
                      dailyBudget: parseInt(e.target.value) || 50
                    }))}
                    placeholder="50"
                  />
                </FormControl>
              </Grid>
            </Box>

            <HStack spacing={3} w="full" justify="center">
              <Button
                leftIcon={<FiImage />}
                colorScheme="pink"
                onClick={generatePoster}
                isLoading={loading}
              >
                Generate Poster
              </Button>
              <Button
                leftIcon={<FiStar />}
                colorScheme="purple"
                variant="outline"
                onClick={generatePosterVariations}
                isLoading={loading}
              >
                Generate Variations
              </Button>
              <Button
                leftIcon={<FiEdit3 />}
                colorScheme="blue"
                variant="outline"
                onClick={generateHeadlines}
                isLoading={loading}
              >
                Generate Headlines
              </Button>
            </HStack>

            <HStack spacing={3} w="full" justify="center">
              <Button
                leftIcon={<FiShare2 />}
                colorScheme="green"
                variant="outline"
                onClick={generateSocialPost}
                isLoading={loading}
              >
                Generate Social Post
              </Button>
              <Button
                leftIcon={<FiTarget />}
                colorScheme="orange"
                variant="outline"
                onClick={generateCampaign}
                isLoading={loading}
              >
                Generate Campaign
              </Button>
            </HStack>

            {/* Generated Content Display */}
            {generatedContent.posters && Array.isArray(generatedContent.posters) && generatedContent.posters.length > 0 && (
              <Box w="full">
                <Text fontWeight="bold" mb={3}>Generated Posters:</Text>
                <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                  {generatedContent.posters.map((posterUrl, index) => (
                    <Box key={index} p={3} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                      <Image src={posterUrl} alt={`Generated Poster ${index + 1}`} borderRadius="md" />
                    </Box>
                  ))}
                </Grid>
              </Box>
            )}

            {generatedContent.headlines && Array.isArray(generatedContent.headlines) && generatedContent.headlines.length > 0 && (
              <Box w="full">
                <Text fontWeight="bold" mb={3}>Generated Headlines:</Text>
                <VStack align="stretch" spacing={2}>
                  {generatedContent.headlines.map((headlineItem, index) => (
                    <Box key={index} p={3} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                      <Text fontWeight="semibold" mb={2}>
                        {typeof headlineItem === 'object' ? headlineItem.headline : headlineItem}
                      </Text>
                      {typeof headlineItem === 'object' && headlineItem.hashtags && (
                        <Wrap>
                          {headlineItem.hashtags.map((hashtag, tagIndex) => (
                            <WrapItem key={tagIndex}>
                              <Tag colorScheme="blue" size="sm">#{hashtag}</Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      )}
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {generatedContent.socialPosts && Array.isArray(generatedContent.socialPosts) && generatedContent.socialPosts.length > 0 && (
              <Box w="full">
                <Text fontWeight="bold" mb={3}>Generated Social Posts:</Text>
                <VStack align="stretch" spacing={2}>
                  {generatedContent.socialPosts.map((postItem, index) => (
                    <Box key={index} p={3} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                      {typeof postItem === 'object' && postItem.caption ? (
                        <VStack align="stretch" spacing={2}>
                          <Text fontWeight="semibold">Caption:</Text>
                          <Text>{postItem.caption}</Text>
                          {postItem.hashtags && (
                            <Box>
                              <Text fontWeight="semibold" mb={1}>Hashtags:</Text>
                              <Wrap>
                                {postItem.hashtags.map((hashtag, tagIndex) => (
                                  <WrapItem key={tagIndex}>
                                    <Tag colorScheme="blue" size="sm">#{hashtag}</Tag>
                                  </WrapItem>
                                ))}
                              </Wrap>
                            </Box>
                          )}
                        </VStack>
                      ) : (
                        <Text>
                          {typeof postItem === 'object' ? JSON.stringify(postItem, null, 2) : String(postItem)}
                        </Text>
                      )}
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {generatedContent.campaign && (
              <Box w="full">
                <Text fontWeight="bold" mb={3}>Generated Campaign Package:</Text>
                <Box p={4} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                  <Text fontSize="sm" fontFamily="mono" whiteSpace="pre-wrap">
                    {typeof generatedContent.campaign === 'object' ? JSON.stringify(generatedContent.campaign, null, 2) : String(generatedContent.campaign)}
                  </Text>
                </Box>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
