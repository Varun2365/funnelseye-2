import React from 'react';
import {
  Box,
  Grid,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Button,
  useColorModeValue,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import {
  MdRestaurantMenu,
  MdBook,
  MdDownload,
  MdPlayArrow,
} from 'react-icons/md';

const EducationHub = () => {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');

  const recipes = [
    { id: 1, name: 'Protein Power Bowl', calories: 420, time: '20 min', category: 'Lunch', protein: '35g', carbs: '45g', fat: '12g' },
    { id: 2, name: 'Green Smoothie', calories: 180, time: '5 min', category: 'Breakfast', protein: '15g', carbs: '25g', fat: '5g' },
    { id: 3, name: 'Grilled Salmon', calories: 350, time: '25 min', category: 'Dinner', protein: '40g', carbs: '10g', fat: '15g' },
    { id: 4, name: 'Quinoa Salad', calories: 320, time: '15 min', category: 'Lunch', protein: '12g', carbs: '50g', fat: '8g' },
    { id: 5, name: 'Chicken Wrap', calories: 380, time: '10 min', category: 'Lunch', protein: '30g', carbs: '35g', fat: '10g' },
    { id: 6, name: 'Overnight Oats', calories: 250, time: '5 min', category: 'Breakfast', protein: '10g', carbs: '40g', fat: '6g' },
  ];

  const nutritionGuides = [
    { id: 1, title: 'Macronutrients 101', description: 'Understanding proteins, carbs, and fats', pages: 12, category: 'Basics' },
    { id: 2, title: 'Meal Timing Guide', description: 'When to eat for optimal results', pages: 8, category: 'Nutrition' },
    { id: 3, title: 'Hydration Essentials', description: 'Importance of water in fitness', pages: 6, category: 'Health' },
    { id: 4, title: 'Supplement Guide', description: 'What supplements you need', pages: 10, category: 'Supplements' },
  ];

  const pdfResources = [
    { id: 1, name: 'Complete Nutrition Guide', size: '2.5 MB', downloads: 1250, category: 'PDF' },
    { id: 2, name: 'Workout Plan Template', size: '1.8 MB', downloads: 980, category: 'PDF' },
    { id: 3, name: 'Progress Tracking Sheet', size: '0.5 MB', downloads: 2100, category: 'PDF' },
    { id: 4, name: 'Meal Prep Checklist', size: '0.3 MB', downloads: 1500, category: 'PDF' },
  ];

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="3xl" fontWeight="black" color="gray.800" mb={1}>
          Educational Hub
        </Text>
        <Text color="gray.600" fontSize="lg">
          Recipes, nutrition guides, and resources to support your journey
        </Text>
      </Box>

      <Tabs>
        <TabList mb={6}>
          <Tab>Recipe Database</Tab>
          <Tab>Nutrition Guides</Tab>
          <Tab>PDF Resources</Tab>
        </TabList>

        <TabPanels>
          {/* Recipe Database Tab */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={6}>
              {recipes.map((recipe) => (
                <Card key={recipe.id} bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" _hover={{ transform: 'translateY(-5px)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }} transition="all 0.3s">
                  <CardBody p={4}>
                    <Box w="100%" h="150px" bg="gray.200" borderRadius="xl" mb={3} display="flex" alignItems="center" justifyContent="center">
                      <Icon as={MdRestaurantMenu} boxSize={10} color="gray.500" />
                    </Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>{recipe.name}</Text>
                    <HStack mb={2}>
                      <Badge fontSize="xs" colorScheme="green" variant="subtle">{recipe.category}</Badge>
                      <Text fontSize="xs" color="gray.500">{recipe.time}</Text>
                      <Text fontSize="xs" color="gray.500">•</Text>
                      <Text fontSize="xs" color="gray.500">{recipe.calories} kcal</Text>
                    </HStack>
                    <SimpleGrid columns={3} spacing={2} mb={3}>
                      <Box textAlign="center" p={2} bg="gray.50" borderRadius="md">
                        <Text fontSize="xs" color="gray.500">Protein</Text>
                        <Text fontSize="xs" fontWeight="bold">{recipe.protein}</Text>
                      </Box>
                      <Box textAlign="center" p={2} bg="gray.50" borderRadius="md">
                        <Text fontSize="xs" color="gray.500">Carbs</Text>
                        <Text fontSize="xs" fontWeight="bold">{recipe.carbs}</Text>
                      </Box>
                      <Box textAlign="center" p={2} bg="gray.50" borderRadius="md">
                        <Text fontSize="xs" color="gray.500">Fat</Text>
                        <Text fontSize="xs" fontWeight="bold">{recipe.fat}</Text>
                      </Box>
                    </SimpleGrid>
                    <Button size="sm" colorScheme="green" w="full" borderRadius="xl">View Recipe</Button>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* Nutrition Guides Tab */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {nutritionGuides.map((guide) => (
                <Card key={guide.id} bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
                  <CardBody p={6}>
                    <HStack justify="space-between" mb={3}>
                      <Icon as={MdBook} boxSize={8} color="blue.500" />
                      <Badge colorScheme="blue" borderRadius="full">{guide.category}</Badge>
                    </HStack>
                    <Text fontSize="lg" fontWeight="bold" mb={2}>{guide.title}</Text>
                    <Text fontSize="sm" color="gray.600" mb={3}>{guide.description}</Text>
                    <HStack justify="space-between">
                      <Text fontSize="xs" color="gray.500">{guide.pages} pages</Text>
                      <Button size="sm" colorScheme="blue" borderRadius="xl" rightIcon={<MdPlayArrow />}>Read Guide</Button>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* PDF Resources Tab */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {pdfResources.map((pdf) => (
                <Card key={pdf.id} bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
                  <CardBody p={6}>
                    <HStack justify="space-between" mb={3}>
                      <HStack>
                        <Icon as={MdDownload} boxSize={6} color="red.500" />
                        <Box>
                          <Text fontSize="sm" fontWeight="bold">{pdf.name}</Text>
                          <Text fontSize="xs" color="gray.500">{pdf.size} • {pdf.downloads} downloads</Text>
                        </Box>
                      </HStack>
                      <Badge colorScheme="red" borderRadius="full">{pdf.category}</Badge>
                    </HStack>
                    <Button size="sm" colorScheme="red" w="full" borderRadius="xl" leftIcon={<MdDownload />}>Download PDF</Button>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default EducationHub;

