import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Icon,
  Button,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Badge,
  HStack,
  Progress,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  FiCalendar, 
  FiPill, 
  FiMessageCircle, 
  FiHeart, 
  FiUsers, 
  FiArrowRight,
  FiDroplet,
  FiThermometer,
  FiSun,
  FiMoon,
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentCycle, setCurrentCycle] = useState(null);
  const [todayMedications, setTodayMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch current cycle data
        const cycleRes = await axios.get(`${API_URL}/cycles/current`);
        if (cycleRes.data.success) {
          setCurrentCycle(cycleRes.data.cycle);
        }
        
        // Fetch today's medications
        const medRes = await axios.get(`${API_URL}/medications/today`);
        if (medRes.data.success) {
          setTodayMedications(medRes.data.medications);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
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
        <Box>
          <Heading size="lg">Welcome, {user?.name?.split(' ')[0]}</Heading>
          <Text color="gray.500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </Box>
      </Flex>
      
      {/* Cycle Overview */}
      <Card mb={6} bg={cardBg} boxShadow="md" borderRadius="lg">
        <CardHeader pb={0}>
          <Flex justify="space-between" align="center">
            <Heading size="md">Cycle Overview</Heading>
            <Badge colorScheme={getPhaseColor()} fontSize="md" px={2} py={1} borderRadius="md">
              {getCyclePhase()} Phase
            </Badge>
          </Flex>
        </CardHeader>
        
        <CardBody>
          {currentCycle ? (
            <Box>
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={4}>
                <Stat>
                  <StatLabel>Cycle Day</StatLabel>
                  <StatNumber>{currentCycle.currentDay || 'N/A'}</StatNumber>
                  <StatHelpText>of {currentCycle.cycleLength || '28'} days</StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Next Period</StatLabel>
                  <StatNumber>
                    {currentCycle.nextPeriod 
                      ? new Date(currentCycle.nextPeriod).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'N/A'
                    }
                  </StatNumber>
                  <StatHelpText>
                    {currentCycle.nextPeriod 
                      ? `in ${Math.max(0, Math.ceil((new Date(currentCycle.nextPeriod) - new Date()) / (1000 * 60 * 60 * 24)))} days`
                      : ''
                    }
                  </StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Fertile Window</StatLabel>
                  <StatNumber>
                    {currentCycle.fertileWindow 
                      ? new Date(currentCycle.fertileWindow.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'N/A'
                    }
                  </StatNumber>
                  <StatHelpText>
                    {currentCycle.fertileWindow 
                      ? `to ${new Date(currentCycle.fertileWindow.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : ''
                    }
                  </StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Ovulation Day</StatLabel>
                  <StatNumber>
                    {currentCycle.fertileWindow?.ovulationDay 
                      ? new Date(currentCycle.fertileWindow.ovulationDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'N/A'
                    }
                  </StatNumber>
                  <StatHelpText>
                    {currentCycle.fertileWindow?.ovulationDay 
                      ? `Day ${Math.ceil((new Date(currentCycle.fertileWindow.ovulationDay) - new Date(currentCycle.startDate)) / (1000 * 60 * 60 * 24))}`
                      : ''
                    }
                  </StatHelpText>
                </Stat>
              </SimpleGrid>
              
              <Progress 
                value={(currentCycle.currentDay / (currentCycle.cycleLength || 28)) * 100} 
                colorScheme={getPhaseColor()}
                borderRadius="md"
                size="sm"
                mb={2}
              />
              
              <Flex justify="space-between">
                <Text fontSize="xs">Day 1</Text>
                <Text fontSize="xs">Day {currentCycle.cycleLength || 28}</Text>
              </Flex>
            </Box>
          ) : (
            <Text>No active cycle found. Start tracking your cycle to see data here.</Text>
          )}
        </CardBody>
        
        <CardFooter pt={0}>
          <Button 
            as={RouterLink} 
            to="/cycle-tracker" 
            rightIcon={<FiArrowRight />} 
            colorScheme="secondary" 
            variant="outline"
            size="sm"
          >
            View Cycle Details
          </Button>
        </CardFooter>
      </Card>
      
      {/* Quick Actions */}
      <Heading size="md" mb={4}>Quick Actions</Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mb={6}>
        <Card 
          as={RouterLink} 
          to="/cycle-tracker" 
          bg={cardBg} 
          _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s' }}
          cursor="pointer"
          boxShadow="md"
          borderRadius="lg"
        >
          <CardBody>
            <Flex direction="column" align="center" textAlign="center">
              <Icon as={FiCalendar} boxSize={10} color="secondary.500" mb={3} />
              <Heading size="sm" mb={1}>Track Cycle</Heading>
              <Text fontSize="sm" color="gray.500">Log period, symptoms & more</Text>
            </Flex>
          </CardBody>
        </Card>
        
        <Card 
          as={RouterLink} 
          to="/medication-tracker" 
          bg={cardBg} 
          _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s' }}
          cursor="pointer"
          boxShadow="md"
          borderRadius="lg"
        >
          <CardBody>
            <Flex direction="column" align="center" textAlign="center">
              <Icon as={FiPill} boxSize={10} color="green.500" mb={3} />
              <Heading size="sm" mb={1}>Medications</Heading>
              <Text fontSize="sm" color="gray.500">Track & manage medications</Text>
            </Flex>
          </CardBody>
        </Card>
        
        <Card 
          as={RouterLink} 
          to="/chat" 
          bg={cardBg} 
          _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s' }}
          cursor="pointer"
          boxShadow="md"
          borderRadius="lg"
        >
          <CardBody>
            <Flex direction="column" align="center" textAlign="center">
              <Icon as={FiMessageCircle} boxSize={10} color="blue.500" mb={3} />
              <Heading size="sm" mb={1}>Chat with Anaira</Heading>
              <Text fontSize="sm" color="gray.500">Get support & information</Text>
            </Flex>
          </CardBody>
        </Card>
        
        <Card 
          as={RouterLink} 
          to="/community" 
          bg={cardBg} 
          _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s' }}
          cursor="pointer"
          boxShadow="md"
          borderRadius="lg"
        >
          <CardBody>
            <Flex direction="column" align="center" textAlign="center">
              <Icon as={FiUsers} boxSize={10} color="purple.500" mb={3} />
              <Heading size="sm" mb={1}>Community</Heading>
              <Text fontSize="sm" color="gray.500">Connect with others</Text>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Today's Medications */}
      <Heading size="md" mb={4}>Today's Medications</Heading>
      <Card bg={cardBg} boxShadow="md" borderRadius="lg" mb={6}>
        <CardBody>
          {todayMedications.length > 0 ? (
            <VStack spacing={3} align="stretch">
              {todayMedications.map((med) => (
                <Flex 
                  key={med._id} 
                  justify="space-between" 
                  align="center" 
                  p={3} 
                  borderWidth="1px" 
                  borderRadius="md"
                  borderColor={borderColor}
                >
                  <HStack spacing={3}>
                    <Icon as={FiPill} color="green.500" boxSize={5} />
                    <Box>
                      <Text fontWeight="bold">{med.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {med.dosage} {med.unit} - {med.timeOfDay.join(', ')}
                      </Text>
                    </Box>
                  </HStack>
                  
                  <Badge 
                    colorScheme={med.todayLogs?.length > 0 && med.todayLogs[0].taken ? 'green' : 'yellow'}
                  >
                    {med.todayLogs?.length > 0 && med.todayLogs[0].taken ? 'Taken' : 'Due'}
                  </Badge>
                </Flex>
              ))}
            </VStack>
          ) : (
            <Text>No medications scheduled for today.</Text>
          )}
        </CardBody>
        
        <CardFooter pt={0}>
          <Button 
            as={RouterLink} 
            to="/medication-tracker" 
            rightIcon={<FiArrowRight />} 
            colorScheme="green" 
            variant="outline"
            size="sm"
          >
            View All Medications
          </Button>
        </CardFooter>
      </Card>
    </Box>
  );
};

export default Dashboard;
