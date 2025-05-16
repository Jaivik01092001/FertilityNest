import { useState, useEffect } from 'react';
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
  CardHeader,
  CardFooter,
  Divider,
  Switch,
  Checkbox,
  CheckboxGroup,
  Stack,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiCheck, 
  FiX, 
  FiCalendar, 
  FiClock, 
  FiRepeat, 
  FiPill,
  FiAlertCircle,
  FiInfo,
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MedicationTracker = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [medications, setMedications] = useState([]);
  const [medicationLogs, setMedicationLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  
  // Form states
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    unit: 'mg',
    frequency: 'daily',
    timeOfDay: ['morning'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    reminderEnabled: true,
  });
  
  // Modal controls
  const { 
    isOpen: isMedicationModalOpen, 
    onOpen: onMedicationModalOpen, 
    onClose: onMedicationModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDeleteModalOpen, 
    onOpen: onDeleteModalOpen, 
    onClose: onDeleteModalClose 
  } = useDisclosure();
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Fetch medications
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all medications
        const medsRes = await axios.get(`${API_URL}/medications`);
        if (medsRes.data.success) {
          setMedications(medsRes.data.medications);
        }
        
        // Fetch recent logs
        const logsRes = await axios.get(`${API_URL}/medications/logs/recent`);
        if (logsRes.data.success) {
          setMedicationLogs(logsRes.data.logs);
        }
      } catch (error) {
        console.error('Error fetching medication data:', error);
        toast({
          title: 'Error fetching medication data',
          description: error.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMedications();
  }, [toast]);
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedication({
      ...newMedication,
      [name]: value,
    });
  };
  
  // Handle checkbox group change
  const handleTimeOfDayChange = (values) => {
    setNewMedication({
      ...newMedication,
      timeOfDay: values,
    });
  };
  
  // Handle switch change
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setNewMedication({
      ...newMedication,
      [name]: checked,
    });
  };
  
  // Open edit modal
  const handleEditMedication = (medication) => {
    setSelectedMedication(medication);
    setNewMedication({
      name: medication.name,
      dosage: medication.dosage,
      unit: medication.unit,
      frequency: medication.frequency,
      timeOfDay: medication.timeOfDay,
      startDate: new Date(medication.startDate).toISOString().split('T')[0],
      endDate: medication.endDate ? new Date(medication.endDate).toISOString().split('T')[0] : '',
      notes: medication.notes || '',
      reminderEnabled: medication.reminderEnabled,
    });
    onMedicationModalOpen();
  };
  
  // Open add modal
  const handleAddMedication = () => {
    setSelectedMedication(null);
    setNewMedication({
      name: '',
      dosage: '',
      unit: 'mg',
      frequency: 'daily',
      timeOfDay: ['morning'],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      reminderEnabled: true,
    });
    onMedicationModalOpen();
  };
  
  // Save medication
  const handleSaveMedication = async () => {
    // Validate form
    if (!newMedication.name || !newMedication.dosage) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      let res;
      if (selectedMedication) {
        // Update existing medication
        res = await axios.put(`${API_URL}/medications/${selectedMedication._id}`, newMedication);
      } else {
        // Create new medication
        res = await axios.post(`${API_URL}/medications`, newMedication);
      }
      
      if (res.data.success) {
        toast({
          title: selectedMedication ? 'Medication updated' : 'Medication added',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh medications
        const medsRes = await axios.get(`${API_URL}/medications`);
        if (medsRes.data.success) {
          setMedications(medsRes.data.medications);
        }
        
        onMedicationModalClose();
      }
    } catch (error) {
      console.error('Error saving medication:', error);
      toast({
        title: 'Error saving medication',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete medication
  const handleDeleteMedication = async () => {
    if (!selectedMedication) return;
    
    try {
      setIsLoading(true);
      
      const res = await axios.delete(`${API_URL}/medications/${selectedMedication._id}`);
      
      if (res.data.success) {
        toast({
          title: 'Medication deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh medications
        const medsRes = await axios.get(`${API_URL}/medications`);
        if (medsRes.data.success) {
          setMedications(medsRes.data.medications);
        }
        
        onDeleteModalClose();
      }
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({
        title: 'Error deleting medication',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Log medication as taken
  const handleLogMedication = async (medicationId, taken = true) => {
    try {
      setIsLoading(true);
      
      const res = await axios.post(`${API_URL}/medications/log`, {
        medication: medicationId,
        taken,
        timestamp: new Date().toISOString(),
      });
      
      if (res.data.success) {
        toast({
          title: taken ? 'Medication marked as taken' : 'Medication skipped',
          status: taken ? 'success' : 'info',
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh medications and logs
        const [medsRes, logsRes] = await Promise.all([
          axios.get(`${API_URL}/medications`),
          axios.get(`${API_URL}/medications/logs/recent`)
        ]);
        
        if (medsRes.data.success) {
          setMedications(medsRes.data.medications);
        }
        
        if (logsRes.data.success) {
          setMedicationLogs(logsRes.data.logs);
        }
      }
    } catch (error) {
      console.error('Error logging medication:', error);
      toast({
        title: 'Error logging medication',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Medication Tracker</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="green"
          onClick={handleAddMedication}
        >
          Add Medication
        </Button>
      </Flex>
      
      <Tabs colorScheme="green" variant="enclosed">
        <TabList>
          <Tab>Active Medications</Tab>
          <Tab>Medication History</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel px={0}>
            {medications.length > 0 ? (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                {medications.map((med) => (
                  <Card key={med._id} bg={cardBg} boxShadow="md" borderRadius="lg">
                    <CardHeader pb={2}>
                      <Flex justify="space-between" align="center">
                        <Heading size="md">{med.name}</Heading>
                        <HStack>
                          <IconButton
                            aria-label="Edit medication"
                            icon={<FiEdit2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleEditMedication(med)}
                          />
                          <IconButton
                            aria-label="Delete medication"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => {
                              setSelectedMedication(med);
                              onDeleteModalOpen();
                            }}
                          />
                        </HStack>
                      </Flex>
                    </CardHeader>
                    
                    <CardBody pt={0}>
                      <VStack align="stretch" spacing={2}>
                        <Flex justify="space-between">
                          <Text fontWeight="bold">Dosage:</Text>
                          <Text>{med.dosage} {med.unit}</Text>
                        </Flex>
                        
                        <Flex justify="space-between">
                          <Text fontWeight="bold">Frequency:</Text>
                          <Text>{med.frequency}</Text>
                        </Flex>
                        
                        <Flex justify="space-between">
                          <Text fontWeight="bold">Time of Day:</Text>
                          <Text>{med.timeOfDay.join(', ')}</Text>
                        </Flex>
                        
                        {med.notes && (
                          <Box>
                            <Text fontWeight="bold">Notes:</Text>
                            <Text fontSize="sm">{med.notes}</Text>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                    
                    <CardFooter pt={0}>
                      <HStack spacing={2} width="full">
                        <Button
                          leftIcon={<FiCheck />}
                          colorScheme="green"
                          size="sm"
                          flex={1}
                          onClick={() => handleLogMedication(med._id, true)}
                          isDisabled={med.todayLogs?.length > 0 && med.todayLogs[0].taken}
                        >
                          {med.todayLogs?.length > 0 && med.todayLogs[0].taken ? 'Taken' : 'Mark as Taken'}
                        </Button>
                        
                        <Button
                          leftIcon={<FiX />}
                          colorScheme="gray"
                          size="sm"
                          flex={1}
                          onClick={() => handleLogMedication(med._id, false)}
                          isDisabled={med.todayLogs?.length > 0}
                        >
                          Skip
                        </Button>
                      </HStack>
                    </CardFooter>
                  </Card>
                ))}
              </Grid>
            ) : (
              <Card bg={cardBg} boxShadow="md" borderRadius="lg" p={6}>
                <VStack spacing={4} align="center">
                  <Icon as={FiPill} boxSize={12} color="gray.400" />
                  <Text color="gray.500" textAlign="center">
                    No medications added yet. Click the "Add Medication" button to get started.
                  </Text>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="green"
                    onClick={handleAddMedication}
                  >
                    Add Medication
                  </Button>
                </VStack>
              </Card>
            )}
          </TabPanel>
          
          <TabPanel px={0}>
            <Card bg={cardBg} boxShadow="md" borderRadius="lg">
              <CardBody>
                <Heading size="md" mb={4}>Medication History</Heading>
                
                {medicationLogs.length > 0 ? (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Medication</Th>
                        <Th>Dosage</Th>
                        <Th>Date & Time</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {medicationLogs.map((log) => (
                        <Tr key={log._id}>
                          <Td>{log.medication.name}</Td>
                          <Td>{log.medication.dosage} {log.medication.unit}</Td>
                          <Td>
                            {new Date(log.timestamp).toLocaleDateString()} at{' '}
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Td>
                          <Td>
                            <Badge colorScheme={log.taken ? 'green' : 'yellow'}>
                              {log.taken ? 'Taken' : 'Skipped'}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text color="gray.500" textAlign="center">
                    No medication history available.
                  </Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Add/Edit Medication Modal */}
      <Modal isOpen={isMedicationModalOpen} onClose={onMedicationModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedMedication ? 'Edit Medication' : 'Add New Medication'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Medication Name</FormLabel>
                <Input
                  name="name"
                  value={newMedication.name}
                  onChange={handleInputChange}
                  placeholder="Enter medication name"
                />
              </FormControl>
              
              <HStack>
                <FormControl isRequired>
                  <FormLabel>Dosage</FormLabel>
                  <Input
                    name="dosage"
                    value={newMedication.dosage}
                    onChange={handleInputChange}
                    placeholder="Enter dosage"
                    type="number"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    name="unit"
                    value={newMedication.unit}
                    onChange={handleInputChange}
                  >
                    <option value="mg">mg</option>
                    <option value="g">g</option>
                    <option value="mcg">mcg</option>
                    <option value="ml">ml</option>
                    <option value="tablet">tablet</option>
                    <option value="capsule">capsule</option>
                    <option value="IU">IU</option>
                  </Select>
                </FormControl>
              </HStack>
              
              <FormControl>
                <FormLabel>Frequency</FormLabel>
                <Select
                  name="frequency"
                  value={newMedication.frequency}
                  onChange={handleInputChange}
                >
                  <option value="daily">Daily</option>
                  <option value="twice-daily">Twice Daily</option>
                  <option value="three-times-daily">Three Times Daily</option>
                  <option value="every-other-day">Every Other Day</option>
                  <option value="weekly">Weekly</option>
                  <option value="as-needed">As Needed</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Time of Day</FormLabel>
                <CheckboxGroup
                  colorScheme="green"
                  value={newMedication.timeOfDay}
                  onChange={handleTimeOfDayChange}
                >
                  <Stack spacing={2} direction={{ base: 'column', md: 'row' }}>
                    <Checkbox value="morning">Morning</Checkbox>
                    <Checkbox value="afternoon">Afternoon</Checkbox>
                    <Checkbox value="evening">Evening</Checkbox>
                    <Checkbox value="bedtime">Bedtime</Checkbox>
                  </Stack>
                </CheckboxGroup>
              </FormControl>
              
              <HStack>
                <FormControl>
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    name="startDate"
                    type="date"
                    value={newMedication.startDate}
                    onChange={handleInputChange}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>End Date (Optional)</FormLabel>
                  <Input
                    name="endDate"
                    type="date"
                    value={newMedication.endDate}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </HStack>
              
              <FormControl>
                <FormLabel>Notes (Optional)</FormLabel>
                <Textarea
                  name="notes"
                  value={newMedication.notes}
                  onChange={handleInputChange}
                  placeholder="Add any additional notes or instructions"
                  rows={3}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="reminderEnabled" mb="0">
                  Enable Reminders
                </FormLabel>
                <Switch
                  id="reminderEnabled"
                  name="reminderEnabled"
                  isChecked={newMedication.reminderEnabled}
                  onChange={handleSwitchChange}
                  colorScheme="green"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onMedicationModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="green" 
              onClick={handleSaveMedication}
              isLoading={isLoading}
            >
              {selectedMedication ? 'Update' : 'Add'} Medication
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <Text>
              Are you sure you want to delete {selectedMedication?.name}? This action cannot be undone.
            </Text>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDeleteMedication}
              isLoading={isLoading}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MedicationTracker;
