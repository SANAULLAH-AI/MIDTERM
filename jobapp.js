import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  Modal,
  Animated,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Navigation Setup
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Theme Context
const ThemeContext = React.createContext();
const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setIsDark(!isDark) }}>
      {children}
    </ThemeContext.Provider>
  );
};
const useTheme = () => React.useContext(ThemeContext);

// Storage Utilities
const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error storing ${key}:`, e);
  }
};

const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error(`Error retrieving ${key}:`, e);
    return null;
  }
};

// API Service
const fetchJobs = async () => {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    const categories = ['Tech', 'Design', 'Marketing', 'Finance', 'Sales'];
    return response.data.map(post => ({
      id: post.id.toString(),
      title: post.title,
      company: `Company ${post.userId}`,
      description: post.body,
      location: ['New York', 'London', 'Remote', 'Tokyo', 'Sydney'][Math.floor(Math.random() * 5)],
      salary: `${Math.floor(Math.random() * 50 + 50)}k - ${Math.floor(Math.random() * 50 + 100)}k`,
      category: categories[Math.floor(Math.random() * categories.length)],
      posted: new Date().toLocaleDateString(),
      requirements: ['3+ years experience', 'Bachelor’s degree', 'Strong communication skills'],
    }));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
};

// Popup Component
const Popup = ({ message, onClose }) => {
  const { theme } = useTheme();
  const fadeAnim = useState(new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [fadeAnim]);
  return (
    <Animated.View style={[styles.popup, { backgroundColor: theme.popupBackground, opacity: fadeAnim }]}>
      <Text style={styles.popupText}>{message}</Text>
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.popupClose}>Close</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Onboarding Screen
const OnboardingScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const handleStart = async () => {
    await storeData('onboardingCompleted', true);
    navigation.replace('Login');
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.onboardingScroll}>
        <Image source={{ uri: 'https://via.placeholder.com/200' }} style={styles.onboardingImage} />
        <Text style={[styles.title, { color: theme.text }]}>Welcome to JobSeeker</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Find your dream job with ease</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleStart}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

// Auth Screens
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popup, setPopup] = useState(null);
  const { theme } = useTheme();

  const handleLogin = async () => {
    if (email && password) {
      const user = { email, name: email.split('@')[0], bio: '', profilePhoto: null, coverPhoto: null, skills: [], experience: '' };
      await storeData('user', user);
      setPopup('Login Successful');
      setTimeout(() => {
        navigation.replace('Main');
        setPopup(null);
      }, 1000);
    } else {
      Alert.alert('Error', 'Please enter email and password');
    }
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.authScroll}>
        <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.logo} />
        <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Email"
          placeholderTextColor={theme.placeholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Password"
          placeholderTextColor={theme.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <View style={styles.authLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={[styles.link, { color: theme.link }]}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={[styles.link, { color: theme.link }]}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.replace('Main')}>
            <Text style={[styles.link, { color: theme.link }]}>Guest</Text>
          </TouchableOpacity>
        </View>
        {popup && <Popup message={popup} onClose={() => setPopup(null)} />}
      </ScrollView>
    </LinearGradient>
  );
};

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popup, setPopup] = useState(null);
  const { theme } = useTheme();

  const handleSignup = async () => {
    if (email && password) {
      const user = { email, name: email.split('@')[0], bio: '', profilePhoto: null, coverPhoto: null, skills: [], experience: '' };
      await storeData('user', user);
      setPopup('Signup Successful');
      setTimeout(() => {
        navigation.replace('Main');
        setPopup(null);
      }, 1000);
    } else {
      Alert.alert('Error', 'Please enter email and password');
    }
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.authScroll}>
        <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.logo} />
        <Text style={[styles.title, { color: theme.text }]}>Join JobSeeker</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Email"
          placeholderTextColor={theme.placeholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Password"
          placeholderTextColor={theme.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleSignup}>
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: theme.link }]}>Already have an account? Login</Text>
        </TouchableOpacity>
        {popup && <Popup message={popup} onClose={() => setPopup(null)} />}
      </ScrollView>
    </LinearGradient>
  );
};

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const { theme } = useTheme();

  const handleReset = () => {
    if (email) {
      Alert.alert('Success', 'Password reset link sent (simulated)');
      setEmail('');
    } else {
      Alert.alert('Error', 'Please enter your email');
    }
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.authScroll}>
        <Text style={[styles.title, { color: theme.text }]}>Reset Password</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Enter your email"
          placeholderTextColor={theme.placeholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleReset}>
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: theme.link }]}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

// Main App Screens
const HomeScreen = () => {
  const { theme } = useTheme();
  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.homeScroll}>
        <Text style={[styles.title, { color: theme.text }]}>JobSeeker Dashboard</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Unlock Your Career Potential</Text>
        <Image source={{ uri: 'https://via.placeholder.com/300x180' }} style={styles.banner} />
        <View style={styles.stats}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Ionicons name="briefcase" size={40} color={theme.button} />
            <Text style={[styles.statNumber, { color: theme.text }]}>75+</Text>
            <Text style={{ color: theme.text }}>Jobs Available</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Ionicons name="paper-plane" size={40} color={theme.button} />
            <Text style={[styles.statNumber, { color: theme.text }]}>12</Text>
            <Text style={{ color: theme.text }}>Applications</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const JobScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const [popup, setPopup] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    fetchJobs().then(data => {
      setJobs(data);
      setFilteredJobs(data);
    });
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    filterJobs(text, category);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    filterJobs(search, cat);
  };

  const filterJobs = (text, cat) => {
    let filtered = jobs.filter(
      job => job.title.toLowerCase().includes(text.toLowerCase()) || job.company.toLowerCase().includes(text.toLowerCase())
    );
    if (cat !== 'All') filtered = filtered.filter(job => job.category === cat);
    setFilteredJobs(filtered);
  };

  const handleApply = (job) => {
    navigation.navigate('JobApplication', { job });
  };

  return (
    <View style={[styles.fullScreen, { backgroundColor: theme.background }]}>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        placeholder="Search jobs..."
        placeholderTextColor={theme.placeholder}
        value={search}
        onChangeText={handleSearch}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {['All', 'Tech', 'Design', 'Marketing', 'Finance', 'Sales'].map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, { backgroundColor: category === cat ? theme.button : theme.card }]}
            onPress={() => handleCategory(cat)}
          >
            <Text style={[styles.categoryText, { color: category === cat ? '#fff' : theme.text }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={filteredJobs}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, { backgroundColor: theme.card }]} onPress={() => setSelectedJob(item)}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={{ color: theme.text }}>{item.company} - {item.location}</Text>
            <Text style={{ color: theme.text }}>{item.salary} | {item.category}</Text>
            <Text style={[styles.cardDescription, { color: theme.text }]}>{item.description.slice(0, 80)}...</Text>
            <Text style={{ color: theme.placeholder, fontSize: 12 }}>Posted: {item.posted}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />
      <Modal visible={!!selectedJob} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={theme.gradient} style={styles.modalContent}>
            {selectedJob && (
              <>
                <Text style={[styles.title, { color: theme.text }]}>{selectedJob.title}</Text>
                <Text style={[styles.subtitle, { color: theme.text }]}>{selectedJob.company} - {selectedJob.location}</Text>
                <Text style={{ color: theme.text, marginVertical: 10 }}>{selectedJob.salary} | {selectedJob.category}</Text>
                <Text style={[styles.cardDescription, { color: theme.text }]}>{selectedJob.description}</Text>
                <Text style={[styles.subtitle, { color: theme.text }]}>Requirements:</Text>
                {selectedJob.requirements.map((req, idx) => (
                  <Text key={idx} style={{ color: theme.text, marginLeft: 10 }}>• {req}</Text>
                ))}
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={() => handleApply(selectedJob)}>
                    <Text style={styles.buttonText}>Apply Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, { backgroundColor: theme.placeholder }]} onPress={() => setSelectedJob(null)}>
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </LinearGradient>
        </View>
      </Modal>
      {popup && <Popup message={popup} onClose={() => setPopup(null)} />}
    </View>
  );
};

const JobApplicationScreen = ({ route, navigation }) => {
  const { job } = route.params;
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [popup, setPopup] = useState(null);
  const { theme } = useTheme();

  const handleResumePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Permission to access media library is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All });
    if (!result.canceled && result.assets) {
      setResume(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (resume && coverLetter) {
      setPopup('Application Submitted');
      setTimeout(() => {
        navigation.goBack();
        setPopup(null);
      }, 1000);
    } else {
      Alert.alert('Error', 'Please upload a resume and write a cover letter');
    }
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.applicationScroll}>
        <Text style={[styles.title, { color: theme.text }]}>{job.title}</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>{job.company} - {job.location}</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleResumePick}>
          <Text style={styles.buttonText}>{resume ? 'Resume Uploaded' : 'Upload Resume'}</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, height: 150 }]}
          placeholder="Cover Letter"
          placeholderTextColor={theme.placeholder}
          value={coverLetter}
          onChangeText={setCoverLetter}
          multiline
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Application</Text>
        </TouchableOpacity>
        {popup && <Popup message={popup} onClose={() => setPopup(null)} />}
      </ScrollView>
    </LinearGradient>
  );
};

const FeedbackScreen = () => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [popup, setPopup] = useState(null);
  const { theme } = useTheme();

  const handleSubmit = () => {
    if (feedback && rating > 0) {
      setPopup('Feedback Submitted');
      setFeedback('');
      setRating(0);
      setTimeout(() => setPopup(null), 1000);
    } else {
      Alert.alert('Error', 'Please provide feedback and a rating');
    }
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.feedbackScroll}>
        <Text style={[styles.title, { color: theme.text }]}>Share Your Feedback</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, height: 120 }]}
          placeholder="Your feedback..."
          placeholderTextColor={theme.placeholder}
          value={feedback}
          onChangeText={setFeedback}
          multiline
        />
        <Text style={[styles.subtitle, { color: theme.text }]}>Rate Us (1-5):</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map(num => (
            <TouchableOpacity key={num} onPress={() => setRating(num)}>
              <Ionicons name={rating >= num ? 'star' : 'star-outline'} size={40} color={theme.button} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Feedback</Text>
        </TouchableOpacity>
        {popup && <Popup message={popup} onClose={() => setPopup(null)} />}
      </ScrollView>
    </LinearGradient>
  );
};

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [experience, setExperience] = useState('');
  const [popup, setPopup] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await getData('user');
      if (storedUser) {
        setUser(storedUser);
        setBio(storedUser.bio || '');
        setProfilePhoto(storedUser.profilePhoto || null);
        setCoverPhoto(storedUser.coverPhoto || null);
        setSkills(storedUser.skills || []);
        setExperience(storedUser.experience || '');
      }
    };
    loadUser();
  }, []);

  const handleImagePick = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Permission to access media library is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [3, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets) {
      const uri = result.assets[0].uri;
      if (type === 'profile') setProfilePhoto(uri);
      else setCoverPhoto(uri);
      setPopup('Image Uploaded');
      setTimeout(() => setPopup(null), 1000);
    }
  };

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSave = async () => {
    if (bio || profilePhoto || coverPhoto || skills.length || experience) {
      const updatedUser = { ...user, bio, profilePhoto, coverPhoto, skills, experience };
      await storeData('user', updatedUser);
      setUser(updatedUser);
      setPopup('Profile Saved');
      setTimeout(() => setPopup(null), 1000);
    } else {
      Alert.alert('Info', 'Nothing to save');
    }
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.profileScroll}>
        <Image source={{ uri: coverPhoto || 'https://via.placeholder.com/300x200' }} style={styles.coverPhoto} />
        <Image source={{ uri: profilePhoto || 'https://via.placeholder.com/150' }} style={[styles.profilePhoto, { borderColor: theme.border }]} />
        <Text style={[styles.title, { color: theme.text }]}>{user?.name || 'Guest'}</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>{user?.email || 'No email'}</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Your bio"
          placeholderTextColor={theme.placeholder}
          value={bio}
          onChangeText={setBio}
        />
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, height: 100 }]}
          placeholder="Work Experience"
          placeholderTextColor={theme.placeholder}
          value={experience}
          onChangeText={setExperience}
          multiline
        />
        <View style={styles.skillSection}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Skills</Text>
          <View style={styles.skillInputRow}>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, flex: 1 }]}
              placeholder="Add a skill"
              placeholderTextColor={theme.placeholder}
              value={newSkill}
              onChangeText={setNewSkill}
            />
            <TouchableOpacity style={[styles.smallButton, { backgroundColor: theme.button }]} onPress={addSkill}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.skillList}>
            {skills.map(skill => (
              <View key={skill} style={[styles.skillTag, { backgroundColor: theme.card }]}>
                <Text style={{ color: theme.text }}>{skill}</Text>
                <TouchableOpacity onPress={() => removeSkill(skill)}>
                  <Ionicons name="close" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={() => handleImagePick('profile')}>
          <Text style={styles.buttonText}>Change Profile Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={() => handleImagePick('cover')}>
          <Text style={styles.buttonText}>Change Cover Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Profile</Text>
        </TouchableOpacity>
        {popup && <Popup message={popup} onClose={() => setPopup(null)} />}
      </ScrollView>
    </LinearGradient>
  );
};

const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [savedJobs, setSavedJobs] = useState(true);
  const [locationTracking, setLocationTracking] = useState(false);

  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.settingsScroll}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
          <Switch value={theme === darkTheme} onValueChange={toggleTheme} trackColor={{ true: theme.button }} thumbColor="#fff" />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Job Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: theme.button }} thumbColor="#fff" />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Saved Jobs Alerts</Text>
          <Switch value={savedJobs} onValueChange={setSavedJobs} trackColor={{ true: theme.button }} thumbColor="#fff" />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Location Tracking</Text>
          <Switch value={locationTracking} onValueChange={setLocationTracking} trackColor={{ true: theme.button }} thumbColor="#fff" />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

// Tab Navigator
const MainTabs = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border, paddingVertical: 10, height: 70 },
        tabBarLabelStyle: { color: theme.text, fontSize: 12, fontWeight: 'bold' },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Jobs') iconName = 'briefcase';
          else if (route.name === 'Feedback') iconName = 'chatbox';
          else if (route.name === 'Profile') iconName = 'person';
          else if (route.name === 'Settings') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.button,
        tabBarInactiveTintColor: theme.placeholder,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Jobs" component={JobScreen} />
      <Tab.Screen name="Feedback" component={FeedbackScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Main App
export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboardingCompleted = await getData('onboardingCompleted');
      setInitialRoute(onboardingCompleted ? 'Login' : 'Onboarding');
    };
    checkOnboarding();
  }, []);

  if (!initialRoute) return null;

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="JobApplication" component={JobApplicationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

// Themes
const lightTheme = {
  background: '#f5f5f5',
  text: '#333',
  border: '#ddd',
  card: '#fff',
  button: '#007bff',
  popupBackground: '#007bff',
  placeholder: '#888',
  link: '#007bff',
  gradient: ['#e6f0ff', '#f5f5f5'],
};

const darkTheme = {
  background: '#1a1a1a',
  text: '#fff',
  border: '#ff4444',
  card: '#333',
  button: '#ff4444',
  popupBackground: '#ff4444',
  placeholder: '#aaa',
  link: '#ff6666',
  gradient: ['#2a2a2a', '#1a1a1a'],
};

// Styles
const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  onboardingScroll: { flexGrow: 1, padding: 40, justifyContent: 'center', alignItems: 'center' },
  authScroll: { flexGrow: 1, padding: 40, justifyContent: 'center', alignItems: 'center' },
  homeScroll: { flexGrow: 1, padding: 20, alignItems: 'center' },
  applicationScroll: { flexGrow: 1, padding: 20 },
  feedbackScroll: { flexGrow: 1, padding: 20, alignItems: 'center' },
  profileScroll: { flexGrow: 1, padding: 20 },
  settingsScroll: { flexGrow: 1, padding: 20 },
  onboardingImage: { width: 200, height: 200, marginBottom: 30, borderRadius: 100 },
  logo: { width: 150, height: 150, marginBottom: 30, borderRadius: 75, borderWidth: 2, borderColor: '#ddd' },
  title: { fontSize: 34, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  subtitle: { fontSize: 20, marginBottom: 20, textAlign: 'center', fontWeight: '500' },
  input: {
    borderWidth: 1,
    padding: 15,
    marginVertical: 10,
    borderRadius: 12,
    fontSize: 16,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
    elevation: 3,
  },
  smallButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '20%',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  authLinks: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  link: { fontSize: 16, fontWeight: 'bold' },
  banner: { width: '100%', height: 200, borderRadius: 15, marginVertical: 20 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  statCard: { padding: 20, borderRadius: 15, alignItems: 'center', width: '45%', elevation: 2 },
  statNumber: { fontSize: 32, fontWeight: 'bold', marginVertical: 5 },
  categoryScroll: { marginVertical: 10, paddingHorizontal: 10 },
  categoryButton: { padding: 12, borderRadius: 25, marginHorizontal: 5 },
  categoryText: { fontSize: 14, fontWeight: 'bold' },
  card: {
    padding: 20,
    marginVertical: 10,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  cardDescription: { fontSize: 14, marginVertical: 10 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '90%', padding: 20, borderRadius: 15, maxHeight: '80%' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  coverPhoto: { width: '100%', height: 250, marginBottom: 20, borderRadius: 15 },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    alignSelf: 'center',
    marginBottom: 20,
  },
  skillSection: { width: '100%', marginVertical: 20 },
  skillInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  skillList: { flexDirection: 'row', flexWrap: 'wrap' },
  skillTag: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 20, margin: 5 },
  popup: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 10,
  },
  popupText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  popupClose: { color: '#fff', fontSize: 14, marginTop: 10 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20, width: '80%' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  settingLabel: { fontSize: 18, fontWeight: 'bold' },
});
