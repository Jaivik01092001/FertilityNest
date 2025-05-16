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
  VStack,
  HStack,
  IconButton,
  Badge,
  Tooltip,
  useToast,
  Avatar,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormHelperText,
  Select,
  Textarea,
  InputGroup,
  InputRightElement,
  Icon,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Switch,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { 
  FiUser, 
  FiEdit2, 
  FiLock, 
  FiSettings, 
  FiEye, 
  FiEyeOff, 
  FiUpload,
  FiCalendar,
  FiMail,
  FiPhone,
  FiSave,
  FiTrash2,
  FiLogOut,
  FiShield,
  FiBell,
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    fertilityStage: user?.fertilityStage || '',
    journeyType: user?.journeyType || '',
    bio: user?.bio || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    cycleReminders: true,
    medicationReminders: true,
    communityUpdates: true,
    partnerUpdates: true,
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    showJourneyType: true,
    showFertilityStage: false,
    allowPartnerViewCycle: true,
    allowPartnerViewMedications: true,
    profileVisibility: 'public',
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState('');
  
  // Modal controls
  const { 
    isOpen: isDeleteAccountModalOpen, 
    onOpen: onDeleteAccountModalOpen, 
    onClose: onDeleteAccountModalClose 
  } = useDisclosure();
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Fetch user settings
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setIsLoading(true);
        
        // Fetch notification settings
        const notifRes = await axios.get(`${API_URL}/users/settings/notifications`);
        if (notifRes.data.success) {
          setNotificationSettings(notifRes.data.settings);
        }
        
        // Fetch privacy settings
        const privacyRes = await axios.get(`${API_URL}/users/settings/privacy`);
        if (privacyRes.data.success) {
          setPrivacySettings(privacyRes.data.settings);
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
        toast({
          title: 'Error fetching settings',
          description: error.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserSettings();
  }, [toast]);
  
  // Handle profile input change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };
  
  // Handle password input change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };
  
  // Handle notification settings change
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    });
  };
  
  // Handle privacy settings change
  const handlePrivacyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrivacySettings({
      ...privacySettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };
  
  // Update profile
  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Create form data for file upload
      const formData = new FormData();
      Object.keys(profileData).forEach((key) => {
        formData.append(key, profileData[key]);
      });
      
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }
      
      const result = await updateProfile(formData);
      
      if (result.success) {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Reset profile picture state
        setProfilePicture(null);
      } else {
        setError(result.error?.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Update profile error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Change password
  const handleChangePassword = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result.success) {
        toast({
          title: 'Password changed',
          description: 'Your password has been changed successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Reset password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(result.error?.message || 'Failed to change password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Change password error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save notification settings
  const handleSaveNotificationSettings = async () => {
    try {
      setIsLoading(true);
      
      const res = await axios.put(`${API_URL}/users/settings/notifications`, notificationSettings);
      
      if (res.data.success) {
        toast({
          title: 'Notification settings saved',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: 'Error saving settings',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save privacy settings
  const handleSavePrivacySettings = async () => {
    try {
      setIsLoading(true);
      
      const res = await axios.put(`${API_URL}/users/settings/privacy`, privacySettings);
      
      if (res.data.success) {
        toast({
          title: 'Privacy settings saved',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: 'Error saving settings',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete account
  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      
      const res = await axios.delete(`${API_URL}/users/account`);
      
      if (res.data.success) {
        toast({
          title: 'Account deleted',
          description: 'Your account has been deleted successfully',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        
        // Logout user
        await logout();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error deleting account',
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
      <Heading size="lg" mb={6}>My Profile</Heading>
      
      <Tabs colorScheme="secondary" variant="enclosed">
        <TabList>
          <Tab><Icon as={FiUser} mr={2} />Profile</Tab>
          <Tab><Icon as={FiLock} mr={2} />Security</Tab>
          <Tab><Icon as={FiBell} mr={2} />Notifications</Tab>
          <Tab><Icon as={FiSettings} mr={2} />Privacy</Tab>
        </TabList>
        
        <TabPanels>
          {/* Profile Tab */}
          <TabPanel px={0}>
            <Card bg={cardBg} boxShadow="md" borderRadius="lg">
              <CardBody>
                {error && (
                  <Alert status="error" mb={4} borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
                
                <Flex 
                  direction={{ base: 'column', md: 'row' }} 
                  align={{ base: 'center', md: 'flex-start' }}
                  gap={6}
                  mb={6}
                >
                  <Box textAlign="center">
                    <Avatar 
                      size="2xl" 
                      name={user?.name} 
                      src={user?.profilePicture}
                      mb={2}
                    />
                    <Button
                      leftIcon={<FiUpload />}
                      size="sm"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Change Photo
                    </Button>
                    <Input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      display="none"
                      onChange={handleProfilePictureChange}
                    />
                    {profilePicture && (
                      <Text fontSize="sm" mt={2}>
                        {profilePicture.name}
                      </Text>
                    )}
                  </Box>
                  
                  <VStack align="stretch" flex={1} spacing={4}>
                    <FormControl>
                      <FormLabel>Full Name</FormLabel>
                      <Input
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        type="email"
                        isReadOnly
                        bg={useColorModeValue('gray.100', 'gray.700')}
                      />
                      <FormHelperText>Email cannot be changed</FormHelperText>
                    </FormControl>
                    
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                      <FormControl>
                        <FormLabel>Phone Number</FormLabel>
                        <Input
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          type="tel"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Date of Birth</FormLabel>
                        <Input
                          name="dateOfBirth"
                          value={profileData.dateOfBirth}
                          onChange={handleProfileChange}
                          type="date"
                        />
                      </FormControl>
                    </Grid>
                  </VStack>
                </Flex>
                
                <Divider mb={6} />
                
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} mb={6}>
                  <FormControl>
                    <FormLabel>Fertility Stage</FormLabel>
                    <Select
                      name="fertilityStage"
                      value={profileData.fertilityStage}
                      onChange={handleProfileChange}
                    >
                      <option value="">Select fertility stage</option>
                      <option value="trying">Trying to Conceive</option>
                      <option value="ivf">IVF Treatment</option>
                      <option value="iui">IUI Treatment</option>
                      <option value="pregnant">Pregnant</option>
                      <option value="postpartum">Postpartum</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Journey Type</FormLabel>
                    <Select
                      name="journeyType"
                      value={profileData.journeyType}
                      onChange={handleProfileChange}
                    >
                      <option value="">Select journey type</option>
                      <option value="natural">Natural Conception</option>
                      <option value="assisted">Assisted Reproduction</option>
                      <option value="donor">Donor Conception</option>
                      <option value="surrogate">Surrogacy</option>
                      <option value="adoption">Adoption</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormControl>
                </Grid>
                
                <FormControl mb={6}>
                  <FormLabel>Bio</FormLabel>
                  <Textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    placeholder="Tell us a bit about yourself..."
                    rows={4}
                  />
                </FormControl>
                
                <Flex justify="flex-end">
                  <Button
                    colorScheme="secondary"
                    leftIcon={<FiSave />}
                    onClick={handleUpdateProfile}
                    isLoading={isLoading}
                  >
                    Save Changes
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Security Tab */}
          <TabPanel px={0}>
            <Card bg={cardBg} boxShadow="md" borderRadius="lg">
              <CardBody>
                <Heading size="md" mb={4}>Change Password</Heading>
                
                {error && (
                  <Alert status="error" mb={4} borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
                
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Current Password</FormLabel>
                    <InputGroup>
                      <Input
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        type={showCurrentPassword ? 'text' : 'password'}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                          icon={showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>New Password</FormLabel>
                    <InputGroup>
                      <Input
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        type={showNewPassword ? 'text' : 'password'}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          icon={showNewPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormHelperText>
                      Password must be at least 8 characters long
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Confirm New Password</FormLabel>
                    <InputGroup>
                      <Input
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        type={showConfirmPassword ? 'text' : 'password'}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  
                  <Flex justify="flex-end">
                    <Button
                      colorScheme="secondary"
                      onClick={handleChangePassword}
                      isLoading={isLoading}
                    >
                      Change Password
                    </Button>
                  </Flex>
                </VStack>
                
                <Divider my={6} />
                
                <Heading size="md" mb={4}>Account Actions</Heading>
                
                <VStack spacing={4} align="stretch">
                  <Button
                    leftIcon={<FiLogOut />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={logout}
                  >
                    Logout from All Devices
                  </Button>
                  
                  <Button
                    leftIcon={<FiTrash2 />}
                    colorScheme="red"
                    variant="outline"
                    onClick={onDeleteAccountModalOpen}
                  >
                    Delete Account
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Notifications Tab */}
          <TabPanel px={0}>
            <Card bg={cardBg} boxShadow="md" borderRadius="lg">
              <CardBody>
                <Heading size="md" mb={4}>Notification Settings</Heading>
                
                <VStack spacing={4} align="stretch" mb={6}>
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="emailNotifications"
                      name="emailNotifications"
                      isChecked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                      colorScheme="secondary"
                      mr={3}
                    />
                    <FormLabel htmlFor="emailNotifications" mb="0">
                      Email Notifications
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="pushNotifications"
                      name="pushNotifications"
                      isChecked={notificationSettings.pushNotifications}
                      onChange={handleNotificationChange}
                      colorScheme="secondary"
                      mr={3}
                    />
                    <FormLabel htmlFor="pushNotifications" mb="0">
                      Push Notifications
                    </FormLabel>
                  </FormControl>
                  
                  <Divider />
                  
                  <Heading size="sm" mb={2}>Notification Types</Heading>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="cycleReminders"
                      name="cycleReminders"
                      isChecked={notificationSettings.cycleReminders}
                      onChange={handleNotificationChange}
                      colorScheme="secondary"
                      mr={3}
                    />
                    <FormLabel htmlFor="cycleReminders" mb="0">
                      Cycle Reminders
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="medicationReminders"
                      name="medicationReminders"
                      isChecked={notificationSettings.medicationReminders}
                      onChange={handleNotificationChange}
                      colorScheme="secondary"
                      mr={3}
                    />
                    <FormLabel htmlFor="medicationReminders" mb="0">
                      Medication Reminders
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="communityUpdates"
                      name="communityUpdates"
                      isChecked={notificationSettings.communityUpdates}
                      onChange={handleNotificationChange}
                      colorScheme="secondary"
                      mr={3}
                    />
                    <FormLabel htmlFor="communityUpdates" mb="0">
                      Community Updates
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="partnerUpdates"
                      name="partnerUpdates"
                      isChecked={notificationSettings.partnerUpdates}
                      onChange={handleNotificationChange}
                      colorScheme="secondary"
                      mr={3}
                    />
                    <FormLabel htmlFor="partnerUpdates" mb="0">
                      Partner Updates
                    </FormLabel>
                  </FormControl>
                </VStack>
                
                <Flex justify="flex-end">
                  <Button
                    colorScheme="secondary"
                    onClick={handleSaveNotificationSettings}
                    isLoading={isLoading}
                  >
                    Save Notification Settings
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Privacy Tab */}
          <TabPanel px={0}>
            <Card bg={cardBg} boxShadow="md" borderRadius="lg">
              <CardBody>
                <Heading size="md" mb={4}>Privacy Settings</Heading>
                
                <VStack spacing={4} align="stretch" mb={6}>
                  <FormControl>
                    <FormLabel>Profile Visibility</FormLabel>
                    <Select
                      name="profileVisibility"
                      value={privacySettings.profileVisibility}
                      onChange={handlePrivacyChange}
                    >
                      <option value="public">Public - Visible to all users</option>
                      <option value="community">Community - Visible to community members only</option>
                      <option value="private">Private - Visible to partner only</option>
                    </Select>
                  </FormControl>
                  
                  <Divider />
                  
                  <Heading size="sm" mb={2}>Information Sharing</Heading>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="showJourneyType"
                      name="showJourneyType"
                      isChecked={privacySettings.showJourneyType}
                      onChange={handlePrivacyChange}
                      colorScheme="secondary"
                      mr={3}
                    />
                    <FormLabel htmlFor="showJourneyType" mb="0">
                      Show Journey Type on Profile
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="showFertilityStage"
                      name="showFertilityStage"
                      isChecked={privacySettings.showFertilityStage}
                      onChange={handlePrivacyChange}
                      colorScheme="secondary"
                      mr={3}
                    />
                    <FormLabel htmlFor="showFertilityStage" mb="0">
                      Show Fertility Stage on Profile
                    </FormLabel>
                  </FormControl>
                  
                  <Divider />
                  
                  <Heading size="sm" mb={2}>Partner Access</Heading>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="allowPartnerViewCycle"
                      name="allowPartnerViewCycle"
                      isChecked={privacySettings.allowPartnerViewCycle}
                      onChange={handlePrivacyChange}
                      colorScheme="secondary"
                      mr={3}
                    />
                    <FormLabel htmlFor="allowPartnerViewCycle" mb="0">
                      Allow Partner to View Cycle Data
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="allowPartnerViewMedications"
                      name="allowPartnerViewMedications"
                      isChecked={privacySettings.allowPartnerViewMedications}
                      onChange={handlePrivacyChange}
                      colorScheme="secondary"
                      mr={3}
                    />
                    <FormLabel htmlFor="allowPartnerViewMedications" mb="0">
                      Allow Partner to View Medications
                    </FormLabel>
                  </FormControl>
                </VStack>
                
                <Flex justify="flex-end">
                  <Button
                    colorScheme="secondary"
                    onClick={handleSavePrivacySettings}
                    isLoading={isLoading}
                  >
                    Save Privacy Settings
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Delete Account Modal */}
      <Modal isOpen={isDeleteAccountModalOpen} onClose={onDeleteAccountModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Account</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Warning!</AlertTitle>
                <AlertDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                </AlertDescription>
              </Box>
            </Alert>
            
            <Text>
              Are you absolutely sure you want to delete your account?
            </Text>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteAccountModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDeleteAccount}
              isLoading={isLoading}
            >
              Delete Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Profile;
