import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Flex,
  Grid,
  GridItem,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  IconButton,
  Badge,
  Tooltip,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { FiPlus, FiCalendar, FiDroplet, FiThermometer, FiActivity, FiHeart } from 'react-icons/fi';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CycleTracker = () => {
  const { user } = useAuth();
  const calendarRef = useRef(null);
  const toast = useToast();
  
  const [cycles, setCycles] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  
  // Form states
  const [newCycle, setNewCycle] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    cycleLength: 28,
    periodLength: 5,
  });
  
  const [newSymptom, setNewSymptom] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    severity: 3,
    notes: '',
  });
  
  // Modal states
  const { 
    isOpen: isCycleModalOpen, 
    onOpen: onCycleModalOpen, 
    onClose: onCycleModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isSymptomModalOpen, 
    onOpen: onSymptomModalOpen, 
    onClose: onSymptomModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDayModalOpen, 
    onOpen: onDayModalOpen, 
    onClose: onDayModalClose 
  } = useDisclosure();
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Fetch cycles and current cycle
  useEffect(() => {
    const fetchCycleData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all cycles
        const cyclesRes = await axios.get(`${API_URL}/cycles`);
        if (cyclesRes.data.success) {
          setCycles(cyclesRes.data.cycles);
        }
        
        // Fetch current cycle
        const currentCycleRes = await axios.get(`${API_URL}/cycles/current`);
        if (currentCycleRes.data.success) {
          setCurrentCycle(currentCycleRes.data.cycle);
        }
      } catch (error) {
        console.error('Error fetching cycle data:', error);
        toast({
          title: 'Error fetching cycle data',
          description: error.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCycleData();
  }, [toast]);
  
  // Convert cycles to calendar events
  useEffect(() => {
    if (cycles.length > 0) {
      const newEvents = [];
      
      cycles.forEach(cycle => {
        // Period event
        newEvents.push({
          id: `period-${cycle._id}`,
          title: 'Period',
          start: new Date(cycle.startDate),
          end: cycle.endDate ? new Date(cycle.endDate) : new Date(new Date(cycle.startDate).getTime() + (cycle.periodLength || 5) * 24 * 60 * 60 * 1000),
          backgroundColor: '#F56565',
          borderColor: '#F56565',
          textColor: 'white',
          allDay: true,
        });
        
        // Fertile window event
        if (cycle.fertileWindow) {
          newEvents.push({
            id: `fertile-${cycle._id}`,
            title: 'Fertile Window',
            start: new Date(cycle.fertileWindow.start),
            end: new Date(cycle.fertileWindow.end),
            backgroundColor: '#48BB78',
            borderColor: '#48BB78',
            textColor: 'white',
            allDay: true,
          });
          
          // Ovulation day event
          newEvents.push({
            id: `ovulation-${cycle._id}`,
            title: 'Ovulation',
            start: new Date(cycle.fertileWindow.ovulationDay),
            backgroundColor: '#9F7AEA',
            borderColor: '#9F7AEA',
            textColor: 'white',
            allDay: true,
          });
        }
        
        // Symptoms events
        if (cycle.symptoms && cycle.symptoms.length > 0) {
          cycle.symptoms.forEach(symptom => {
            newEvents.push({
              id: `symptom-${symptom._id}`,
              title: `${symptom.type} (${symptom.severity}/5)`,
              start: new Date(symptom.date),
              backgroundColor: '#4299E1',
              borderColor: '#4299E1',
              textColor: 'white',
              allDay: true,
            });
          });
        }
      });
      
      setEvents(newEvents);
    }
  }, [cycles]);
  
  // Handle date click on calendar
  const handleDateClick = (info) => {
    setSelectedDate(new Date(info.dateStr));
    
    // Find symptoms for this date
    if (currentCycle) {
      const daySymptoms = currentCycle.symptoms?.filter(
        symptom => new Date(symptom.date).toDateString() === new Date(info.dateStr).toDateString()
      ) || [];
      
      setSymptoms(daySymptoms);
    }
    
    onDayModalOpen();
  };
  
  // Handle new cycle form submission
  const handleNewCycleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const res = await axios.post(`${API_URL}/cycles`, newCycle);
      
      if (res.data.success) {
        toast({
          title: 'Cycle added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh cycles
        const cyclesRes = await axios.get(`${API_URL}/cycles`);
        if (cyclesRes.data.success) {
          setCycles(cyclesRes.data.cycles);
        }
        
        // Refresh current cycle
        const currentCycleRes = await axios.get(`${API_URL}/cycles/current`);
        if (currentCycleRes.data.success) {
          setCurrentCycle(currentCycleRes.data.cycle);
        }
        
        // Reset form and close modal
        setNewCycle({
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          cycleLength: 28,
          periodLength: 5,
        });
        
        onCycleModalClose();
      }
    } catch (error) {
      console.error('Error adding cycle:', error);
      toast({
        title: 'Error adding cycle',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle new symptom form submission
  const handleNewSymptomSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentCycle) {
      toast({
        title: 'No active cycle',
        description: 'Please start a cycle before adding symptoms',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const res = await axios.post(`${API_URL}/cycles/${currentCycle._id}/symptoms`, newSymptom);
      
      if (res.data.success) {
        toast({
          title: 'Symptom added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh current cycle
        const currentCycleRes = await axios.get(`${API_URL}/cycles/current`);
        if (currentCycleRes.data.success) {
          setCurrentCycle(currentCycleRes.data.cycle);
        }
        
        // Refresh cycles
        const cyclesRes = await axios.get(`${API_URL}/cycles`);
        if (cyclesRes.data.success) {
          setCycles(cyclesRes.data.cycles);
        }
        
        // Reset form and close modal
        setNewSymptom({
          date: new Date().toISOString().split('T')[0],
          type: '',
          severity: 3,
          notes: '',
        });
        
        onSymptomModalClose();
      }
    } catch (error) {
      console.error('Error adding symptom:', error);
      toast({
        title: 'Error adding symptom',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate cycle phase
  const getCyclePhase = () => {
    if (!currentCycle) return 'Unknown';
    
    const { currentDay, cycleLength } = currentCycle;
    
    if (currentDay <= 5) {
      return 'Menstrual';
    } else if (currentDay <= 7) {
      return 'Follicular';
    } else if (currentDay <= 14) {
      return 'Ovulatory';
    } else {
      return 'Luteal';
    }
  };
  
  // Get phase color
  const getPhaseColor = () => {
    const phase = getCyclePhase();
    
    switch (phase) {
      case 'Menstrual':
        return 'red';
      case 'Follicular':
        return 'yellow';
      case 'Ovulatory':
        return 'green';
      case 'Luteal':
        return 'purple';
      default:
        return 'gray';
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Cycle Tracker</Heading>
        <HStack>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="secondary"
            onClick={onCycleModalOpen}
          >
            New Cycle
          </Button>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={onSymptomModalOpen}
          >
            Log Symptom
          </Button>
        </HStack>
      </Flex>
      
      <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={6}>
        {/* Calendar */}
        <GridItem>
          <Card bg={cardBg} boxShadow="md" borderRadius="lg">
            <CardBody>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                dateClick={handleDateClick}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek'
                }}
                height="auto"
                aspectRatio={1.5}
              />
            </CardBody>
          </Card>
        </GridItem>
        
        {/* Cycle Info */}
        <GridItem>
          <VStack spacing={4} align="stretch">
            {/* Current Cycle */}
            <Card bg={cardBg} boxShadow="md" borderRadius="lg">
              <CardBody>
                <Heading size="md" mb={4}>Current Cycle</Heading>
                
                {currentCycle ? (
                  <VStack spacing={3} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold">Cycle Day</Text>
                      <Badge colorScheme={getPhaseColor()} fontSize="md" px={2} py={1} borderRadius="md">
                        Day {currentCycle.currentDay}
                      </Badge>
                    </Flex>
                    
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold">Phase</Text>
                      <Text>{getCyclePhase()}</Text>
                    </Flex>
                    
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold">Started</Text>
                      <Text>
                        {new Date(currentCycle.startDate).toLocaleDateString()}
                      </Text>
                    </Flex>
                    
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold">Cycle Length</Text>
                      <Text>{currentCycle.cycleLength || 28} days</Text>
                    </Flex>
                    
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold">Period Length</Text>
                      <Text>{currentCycle.periodLength || 5} days</Text>
                    </Flex>
                    
                    <Divider />
                    
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold">Next Period</Text>
                      <Text>
                        {currentCycle.nextPeriod 
                          ? new Date(currentCycle.nextPeriod).toLocaleDateString()
                          : 'Unknown'
                        }
                      </Text>
                    </Flex>
                    
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold">Fertile Window</Text>
                      <Text>
                        {currentCycle.fertileWindow 
                          ? `${new Date(currentCycle.fertileWindow.start).toLocaleDateString()} - ${new Date(currentCycle.fertileWindow.end).toLocaleDateString()}`
                          : 'Unknown'
                        }
                      </Text>
                    </Flex>
                    
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold">Ovulation</Text>
                      <Text>
                        {currentCycle.fertileWindow?.ovulationDay 
                          ? new Date(currentCycle.fertileWindow.ovulationDay).toLocaleDateString()
                          : 'Unknown'
                        }
                      </Text>
                    </Flex>
                  </VStack>
                ) : (
                  <Text>No active cycle. Start tracking your cycle to see data here.</Text>
                )}
              </CardBody>
            </Card>
            
            {/* Legend */}
            <Card bg={cardBg} boxShadow="md" borderRadius="lg">
              <CardBody>
                <Heading size="md" mb={4}>Legend</Heading>
                
                <VStack spacing={3} align="stretch">
                  <Flex align="center">
                    <Box w={4} h={4} borderRadius="full" bg="red.500" mr={2} />
                    <Text>Period</Text>
                  </Flex>
                  
                  <Flex align="center">
                    <Box w={4} h={4} borderRadius="full" bg="green.500" mr={2} />
                    <Text>Fertile Window</Text>
                  </Flex>
                  
                  <Flex align="center">
                    <Box w={4} h={4} borderRadius="full" bg="purple.500" mr={2} />
                    <Text>Ovulation</Text>
                  </Flex>
                  
                  <Flex align="center">
                    <Box w={4} h={4} borderRadius="full" bg="blue.500" mr={2} />
                    <Text>Symptoms</Text>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>
      </Grid>
      
      {/* New Cycle Modal */}
      <Modal isOpen={isCycleModalOpen} onClose={onCycleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Start New Cycle</ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleNewCycleSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    type="date"
                    value={newCycle.startDate}
                    onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>End Date (optional)</FormLabel>
                  <Input
                    type="date"
                    value={newCycle.endDate}
                    onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Cycle Length (days)</FormLabel>
                  <Input
                    type="number"
                    min={20}
                    max={45}
                    value={newCycle.cycleLength}
                    onChange={(e) => setNewCycle({ ...newCycle, cycleLength: parseInt(e.target.value) })}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Period Length (days)</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={newCycle.periodLength}
                    onChange={(e) => setNewCycle({ ...newCycle, periodLength: parseInt(e.target.value) })}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCycleModalClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                colorScheme="secondary"
                isLoading={isLoading}
              >
                Save
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      
      {/* New Symptom Modal */}
      <Modal isOpen={isSymptomModalOpen} onClose={onSymptomModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log Symptom</ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleNewSymptomSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={newSymptom.date}
                    onChange={(e) => setNewSymptom({ ...newSymptom, date: e.target.value })}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Symptom Type</FormLabel>
                  <Select
                    placeholder="Select symptom type"
                    value={newSymptom.type}
                    onChange={(e) => setNewSymptom({ ...newSymptom, type: e.target.value })}
                  >
                    <option value="cramps">Cramps</option>
                    <option value="headache">Headache</option>
                    <option value="bloating">Bloating</option>
                    <option value="fatigue">Fatigue</option>
                    <option value="mood swings">Mood Swings</option>
                    <option value="breast tenderness">Breast Tenderness</option>
                    <option value="acne">Acne</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Severity (1-5)</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={newSymptom.severity}
                    onChange={(e) => setNewSymptom({ ...newSymptom, severity: parseInt(e.target.value) })}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    value={newSymptom.notes}
                    onChange={(e) => setNewSymptom({ ...newSymptom, notes: e.target.value })}
                    placeholder="Add any additional notes here..."
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onSymptomModalClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                colorScheme="blue"
                isLoading={isLoading}
              >
                Save
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      
      {/* Day Details Modal */}
      <Modal isOpen={isDayModalOpen} onClose={onDayModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <Tabs isFitted variant="enclosed">
              <TabList mb="1em">
                <Tab>Overview</Tab>
                <Tab>Symptoms</Tab>
                <Tab>Notes</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    {currentCycle ? (
                      <>
                        <Stat>
                          <StatLabel>Cycle Day</StatLabel>
                          <StatNumber>
                            {Math.ceil((selectedDate - new Date(currentCycle.startDate)) / (1000 * 60 * 60 * 24)) + 1}
                          </StatNumber>
                          <StatHelpText>of {currentCycle.cycleLength || 28} days</StatHelpText>
                        </Stat>
                        
                        <Divider />
                        
                        <Flex justify="space-between" align="center">
                          <Text fontWeight="bold">Phase</Text>
                          <Badge colorScheme={getPhaseColor()}>
                            {getCyclePhase()}
                          </Badge>
                        </Flex>
                        
                        <Flex justify="space-between" align="center">
                          <Text fontWeight="bold">Fertility</Text>
                          <Badge colorScheme={
                            currentCycle.fertileWindow &&
                            selectedDate >= new Date(currentCycle.fertileWindow.start) &&
                            selectedDate <= new Date(currentCycle.fertileWindow.end)
                              ? 'green'
                              : 'gray'
                          }>
                            {currentCycle.fertileWindow &&
                             selectedDate >= new Date(currentCycle.fertileWindow.start) &&
                             selectedDate <= new Date(currentCycle.fertileWindow.end)
                              ? 'Fertile'
                              : 'Not Fertile'
                            }
                          </Badge>
                        </Flex>
                        
                        {currentCycle.fertileWindow?.ovulationDay &&
                         selectedDate.toDateString() === new Date(currentCycle.fertileWindow.ovulationDay).toDateString() && (
                          <Flex justify="space-between" align="center">
                            <Text fontWeight="bold">Ovulation</Text>
                            <Badge colorScheme="purple">Ovulation Day</Badge>
                          </Flex>
                        )}
                      </>
                    ) : (
                      <Text>No cycle data available for this date.</Text>
                    )}
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  {symptoms.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                      {symptoms.map((symptom) => (
                        <Box
                          key={symptom._id}
                          p={4}
                          borderWidth="1px"
                          borderRadius="md"
                          borderColor={borderColor}
                        >
                          <Flex justify="space-between" align="center" mb={2}>
                            <Heading size="sm" textTransform="capitalize">
                              {symptom.type}
                            </Heading>
                            <Badge colorScheme={
                              symptom.severity >= 4 ? 'red' :
                              symptom.severity >= 3 ? 'orange' :
                              'green'
                            }>
                              Severity: {symptom.severity}/5
                            </Badge>
                          </Flex>
                          
                          {symptom.notes && (
                            <Text fontSize="sm" color="gray.600">
                              {symptom.notes}
                            </Text>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Text>No symptoms logged for this day.</Text>
                  )}
                  
                  <Button
                    mt={4}
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={() => {
                      setNewSymptom({
                        ...newSymptom,
                        date: selectedDate.toISOString().split('T')[0],
                      });
                      onDayModalClose();
                      onSymptomModalOpen();
                    }}
                  >
                    Add Symptom
                  </Button>
                </TabPanel>
                
                <TabPanel>
                  <Text>Notes feature coming soon!</Text>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          
          <ModalFooter>
            <Button onClick={onDayModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CycleTracker;
