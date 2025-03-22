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
  const [isDark, setIsDark] = useState(true);
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
    const categories = ['Tech', 'Design', 'Marketing', 'Finance', 'Sales', 'Management', 'Executive'];
    return response.data.map(post => ({
      id: post.id.toString(),
      title: post.title,
      company: `Elite ${post.userId}`,
      description: post.body,
      location: ['New York', 'London', 'Remote', 'Tokyo', 'Dubai', 'Paris'][Math.floor(Math.random() * 6)],
      salary: Math.floor(Math.random() * 100 + 100), // 100k-200k for luxury
      category: categories[Math.floor(Math.random() * categories.length)],
      posted: new Date().toLocaleDateString(),
      requirements: ['5+ years experience', 'Advanced degree', 'Proven excellence'],
      isFeatured: Math.random() > 0.7, // 30% chance of being featured
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
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
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
  const fadeAnim = useState(new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handleStart = async () => {
    await storeData('onboardingCompleted', true);
    navigation.replace('Login');
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <Animated.View style={[styles.onboardingScroll, { opacity: fadeAnim }]}>
        <Image source={{ uri: 'https://via.placeholder.com/250' }} style={styles.onboardingImage} />
        <Text style={[styles.title, { color: theme.text }]}>JobSeeker Luxe</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Exquisite Careers Await</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleStart}>
          <Text style={styles.buttonText}>Enter the Elite</Text>
        </TouchableOpacity>
      </Animated.View>
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
      const user = { email, name: email.split('@')[0], bio: '', profilePhoto: null, coverPhoto: null, skills: [], experience: '', portfolio: [], applications: 0 };
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
        <Image source={{ uri: 'https://via.placeholder.com/180' }} style={styles.logo} />
        <Text style={[styles.title, { color: theme.text }]}>Luxe Access</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBackground }]}
          placeholder="Email"
          placeholderTextColor={theme.placeholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBackground }]}
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
            <Text style={[styles.link, { color: theme.link }]}>Guest Entry</Text>
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
      const user = { email, name: email.split('@')[0], bio: '', profilePhoto: null, coverPhoto: null, skills: [], experience: '', portfolio: [], applications: 0 };
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
        <Image source={{ uri: 'https://via.placeholder.com/180' }} style={styles.logo} />
        <Text style={[styles.title, { color: theme.text }]}>Join Luxe Elite</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBackground }]}
          placeholder="Email"
          placeholderTextColor={theme.placeholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBackground }]}
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
          <Text style={[styles.link, { color: theme.link }]}>Already Luxe? Login</Text>
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
        <Text style={[styles.title, { color: theme.text }]}>Reset Luxe Access</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBackground }]}
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
  const [notification, setNotification] = useState(true);
  const [featuredJobs, setFeaturedJobs] = useState([]);

  useEffect(() => {
    fetchJobs().then(data => setFeaturedJobs(data.filter(job => job.isFeatured).slice(0, 5)));
  }, []);

  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.homeScroll}>
        {notification && (
          <View style={[styles.notificationBanner, { backgroundColor: theme.button }]}>
            <Text style={styles.notificationText}>New Luxe Opportunities Await!</Text>
            <TouchableOpacity onPress={() => setNotification(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        <Text style={[styles.title, { color: theme.text }]}>JobSeeker Luxe</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Unparalleled Career Mastery</Text>
        <FlatList
          horizontal
          data={featuredJobs}
          renderItem={({ item }) => (
            <View style={[styles.featuredCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={{ color: theme.text }}>{item.company} - {item.location}</Text>
              <Text style={{ color: theme.accent }}>{item.salary}k</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          style={styles.featuredCarousel}
        />
        <View style={styles.stats}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="briefcase" size={50} color={theme.accent} />
            <Text style={[styles.statNumber, { color: theme.text }]}>150+</Text>
            <Text style={{ color: theme.text, fontWeight: 'bold' }}>Luxe Jobs</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="paper-plane" size={50} color={theme.accent} />
            <Text style={[styles.statNumber, { color: theme.text }]}>20</Text>
            <Text style={{ color: theme.text, fontWeight: 'bold' }}>Applications</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const JobScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const [popup, setPopup] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const loadData = async () => {
      const jobsData = await fetchJobs();
      const saved = await getData('savedJobs') || [];
      setJobs(jobsData);
      setFilteredJobs(jobsData);
      setSavedJobs(saved);
    };
    loadData();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    filterJobs(text, category, location);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    filterJobs(search, cat, location);
  };

  const handleLocation = (loc) => {
    setLocation(loc);
    filterJobs(search, category, loc);
  };

  const filterJobs = (text, cat, loc) => {
    let filtered = jobs.filter(
      job => job.title.toLowerCase().includes(text.toLowerCase()) || job.company.toLowerCase().includes(text.toLowerCase())
    );
    if (cat !== 'All') filtered = filtered.filter(job => job.category === cat);
    if (loc !== 'All') filtered = filtered.filter(job => job.location === loc);
    setFilteredJobs(filtered);
  };

  const handleApply = (job) => {
    navigation.navigate('JobApplication', { job });
  };

  const toggleSaveJob = async (job) => {
    const isSaved = savedJobs.some(saved => saved.id === job.id);
    let updatedSavedJobs;
    if (isSaved) {
      updatedSavedJobs = savedJobs.filter(saved => saved.id !== job.id);
      setPopup('Job Unsaved');
    } else {
      updatedSavedJobs = [...savedJobs, job];
      setPopup('Job Saved');
    }
    setSavedJobs(updatedSavedJobs);
    await storeData('savedJobs', updatedSavedJobs);
    setTimeout(() => setPopup(null), 1000);
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBackground }]}
        placeholder="Search Luxe Opportunities..."
        placeholderTextColor={theme.placeholder}
        value={search}
        onChangeText={handleSearch}
      />
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {['All', 'Tech', 'Design', 'Marketing', 'Finance', 'Sales', 'Management', 'Executive'].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                { backgroundColor: category === cat ? theme.button : theme.card, borderColor: theme.border },
                category === cat && { shadowColor: theme.accent, shadowOpacity: 0.6 },
              ]}
              onPress={() => handleCategory(cat)}
            >
              <Text style={[styles.categoryText, { color: category === cat ? '#fff' : theme.text }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
          {['All', 'New York', 'London', 'Remote', 'Tokyo', 'Dubai', 'Paris'].map(loc => (
            <TouchableOpacity
              key={loc}
              style={[
                styles.categoryButton,
                { backgroundColor: location === loc ? theme.button : theme.card, borderColor: theme.border },
                location === loc && { shadowColor: theme.accent, shadowOpacity: 0.6 },
              ]}
              onPress={() => handleLocation(loc)}
            >
              <Text style={[styles.categoryText, { color: location === loc ? '#fff' : theme.text }]}>{loc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={filteredJobs}
        renderItem={({ item }) => {
          const isSaved = savedJobs.some(saved => saved.id === item.id);
          const scaleAnim = new Animated.Value(1);
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setSelectedJob(item)}
              onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={{ color: theme.text, fontWeight: '500' }}>{item.company} - {item.location}</Text>
                <Text style={{ color: theme.accent }}>{item.salary}k | {item.category}</Text>
                <Text style={[styles.cardDescription, { color: theme.text }]}>{item.description.slice(0, 80)}...</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => toggleSaveJob(item)}>
                    <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={26} color={theme.accent} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 100 }}
      />
      <Modal visible={!!selectedJob} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={theme.gradient} style={styles.modalContent}>
            {selectedJob && (
              <>
                <Text style={[styles.title, { color: theme.text }]}>{selectedJob.title}</Text>
                <Text style={[styles.subtitle, { color: theme.text }]}>{selectedJob.company} - {selectedJob.location}</Text>
                <Text style={{ color: theme.accent, marginVertical: 10 }}>{selectedJob.salary}k | {selectedJob.category}</Text>
                <Text style={[styles.cardDescription, { color: theme.text }]}>{selectedJob.description}</Text>
                <Text style={[styles.subtitle, { color: theme.text }]}>Requirements:</Text>
                {selectedJob.requirements.map((req, idx) => (
                  <Text key={idx} style={{ color: theme.text, marginLeft: 15, fontSize: 15 }}>• {req}</Text>
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
    </LinearGradient>
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

  const handleSubmit = async () => {
    if (resume && coverLetter) {
      const user = await getData('user');
      if (user) {
        user.applications += 1;
        await storeData('user', user);
      }
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
          style={[styles.input, { borderColor: theme.border, color: theme.text, height: 160, backgroundColor: theme.inputBackground }]}
          placeholder="Craft Your Luxe Cover Letter"
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

const SavedJobsScreen = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    const loadSavedJobs = async () => {
      const saved = await getData('savedJobs') || [];
      setSavedJobs(saved);
    };
    loadSavedJobs();
  }, []);

  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <Text style={[styles.title, { color: theme.text, marginTop: 30 }]}>Luxe Saved Jobs</Text>
      <FlatList
        data={savedJobs}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={{ color: theme.text, fontWeight: '500' }}>{item.company} - {item.location}</Text>
            <Text style={{ color: theme.accent }}>{item.salary}k | {item.category}</Text>
            <Text style={[styles.cardDescription, { color: theme.text }]}>{item.description.slice(0, 80)}...</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
      />
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
        <Text style={[styles.title, { color: theme.text }]}>Luxe Feedback</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, height: 140, backgroundColor: theme.inputBackground }]}
          placeholder="Share Your Exquisite Thoughts..."
          placeholderTextColor={theme.placeholder}
          value={feedback}
          onChangeText={setFeedback}
          multiline
        />
        <Text style={[styles.subtitle, { color: theme.text }]}>Rate Our Excellence (1-5):</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map(num => (
            <TouchableOpacity key={num} onPress={() => setRating(num)}>
              <Ionicons name={rating >= num ? 'star' : 'star-outline'} size={48} color={theme.accent} />
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
  const [portfolio, setPortfolio] = useState([]);
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
        setPortfolio(storedUser.portfolio || []);
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
      else if (type === 'cover') setCoverPhoto(uri);
      else setPortfolio([...portfolio, uri]);
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

  const removePortfolioItem = (uri) => {
    setPortfolio(portfolio.filter(item => item !== uri));
  };

  const handleSave = async () => {
    if (bio || profilePhoto || coverPhoto || skills.length || experience || portfolio.length) {
      const updatedUser = { ...user, bio, profilePhoto, coverPhoto, skills, experience, portfolio };
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
        <LinearGradient colors={[theme.border, theme.background]} style={styles.coverPhoto}>
          <Image source={{ uri: coverPhoto || 'https://via.placeholder.com/300x300' }} style={styles.coverPhotoImage} />
        </LinearGradient>
        <Image source={{ uri: profilePhoto || 'https://via.placeholder.com/180' }} style={[styles.profilePhoto, { borderColor: theme.accent }]} />
        <Text style={[styles.title, { color: theme.text }]}>{user?.name || 'Luxe Member'}</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>{user?.email || 'No email'}</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBackground }]}
          placeholder="Your Luxe Bio"
          placeholderTextColor={theme.placeholder}
          value={bio}
          onChangeText={setBio}
        />
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, height: 140, backgroundColor: theme.inputBackground }]}
          placeholder="Elite Experience"
          placeholderTextColor={theme.placeholder}
          value={experience}
          onChangeText={setExperience}
          multiline
        />
        <View style={styles.skillSection}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Luxe Skills</Text>
          <View style={styles.skillInputRow}>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, flex: 1, backgroundColor: theme.inputBackground }]}
              placeholder="Add a Skill"
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
              <View key={skill} style={[styles.skillTag, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={{ color: theme.text }}>{skill}</Text>
                <TouchableOpacity onPress={() => removeSkill(skill)}>
                  <Ionicons name="close" size={22} color={theme.text} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.portfolioSection}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Luxe Portfolio</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={() => handleImagePick('portfolio')}>
            <Text style={styles.buttonText}>Add Portfolio Item</Text>
          </TouchableOpacity>
          <FlatList
            horizontal
            data={portfolio}
            renderItem={({ item }) => (
              <View style={styles.portfolioItem}>
                <Image source={{ uri: item }} style={styles.portfolioImage} />
                <TouchableOpacity style={styles.removePortfolio} onPress={() => removePortfolioItem(item)}>
                  <Ionicons name="trash" size={22} color={theme.accent} />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
        <View style={styles.analyticsSection}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Luxe Analytics</Text>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="paper-plane" size={50} color={theme.accent} />
            <Text style={[styles.statNumber, { color: theme.text }]}>{user?.applications || 0}</Text>
            <Text style={{ color: theme.text, fontWeight: 'bold' }}>Applications Submitted</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={() => handleImagePick('profile')}>
          <Text style={styles.buttonText}>Update Profile Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={() => handleImagePick('cover')}>
          <Text style={styles.buttonText}>Update Cover Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Luxe Profile</Text>
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
        <Text style={[styles.title, { color: theme.text }]}>Luxe Settings</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
          <Switch value={theme === darkTheme} onValueChange={toggleTheme} trackColor={{ true: theme.accent }} thumbColor="#fff" />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Job Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: theme.accent }} thumbColor="#fff" />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Saved Jobs Alerts</Text>
          <Switch value={savedJobs} onValueChange={setSavedJobs} trackColor={{ true: theme.accent }} thumbColor="#fff" />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Location Tracking</Text>
          <Switch value={locationTracking} onValueChange={setLocationTracking} trackColor={{ true: theme.accent }} thumbColor="#fff" />
        </View>
        <View style={styles.vipSection}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Luxe VIP Membership</Text>
          <Text style={{ color: theme.text, fontSize: 16, marginVertical: 10 }}>Unlock exclusive jobs and priority support</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]}>
            <Text style={styles.buttonText}>Coming Soon</Text>
          </TouchableOpacity>
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
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border, paddingVertical: 12, height: 90, elevation: 15 },
        tabBarLabelStyle: { color: theme.text, fontSize: 14, fontWeight: 'bold' },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Jobs') iconName = 'briefcase';
          else if (route.name === 'Saved') iconName = 'bookmark';
          else if (route.name === 'Feedback') iconName = 'chatbox';
          else if (route.name === 'Profile') iconName = 'person';
          else if (route.name === 'Settings') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.placeholder,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Jobs" component={JobScreen} />
      <Tab.Screen name="Saved" component={SavedJobsScreen} />
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
  accent: '#ffd700', // Gold accent
  popupBackground: '#007bff',
  placeholder: '#888',
  link: '#007bff',
  gradient: ['#e6f0ff', '#f5f5f5'],
  inputBackground: 'rgba(255, 255, 255, 0.9)',
};

const darkTheme = {
  background: '#0d0d0d',
  text: '#e0e0e0',
  border: '#ff4d4d',
  card: 'rgba(40, 40, 40, 0.85)',
  button: '#ff4d4d',
  accent: '#ffd700', // Gold accent for luxury
  popupBackground: '#ff4d4d',
  placeholder: '#999',
  link: '#ff6666',
  gradient: ['#2a2a2a', '#0d0d0d'],
  inputBackground: 'rgba(50, 50, 50, 0.85)',
};

// Styles
const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  onboardingScroll: { flexGrow: 1, padding: 50, justifyContent: 'center', alignItems: 'center' },
  authScroll: { flexGrow: 1, padding: 50, justifyContent: 'center', alignItems: 'center' },
  homeScroll: { flexGrow: 1, padding: 40, alignItems: 'center' },
  applicationScroll: { flexGrow: 1, padding: 40 },
  feedbackScroll: { flexGrow: 1, padding: 40, alignItems: 'center' },
  profileScroll: { flexGrow: 1, padding: 40 },
  settingsScroll: { flexGrow: 1, padding: 40 },
  onboardingImage: { width: 250, height: 250, marginBottom: 50, borderRadius: 125, borderWidth: 4, borderColor: '#ffd700' },
  logo: { width: 180, height: 180, marginBottom: 50, borderRadius: 90, borderWidth: 4, borderColor: '#ffd700' },
  title: { fontSize: 40, fontWeight: '900', marginBottom: 25, textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 8 },
  subtitle: { fontSize: 24, marginBottom: 30, textAlign: 'center', fontWeight: '700' },
  input: {
    borderWidth: 2,
    padding: 20,
    marginVertical: 15,
    borderRadius: 18,
    fontSize: 18,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  button: {
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginVertical: 15,
    width: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  smallButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '25%',
  },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  authLinks: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 30 },
  link: { fontSize: 18, fontWeight: 'bold', textDecorationLine: 'underline' },
  featuredCarousel: { marginVertical: 30 },
  featuredCard: { padding: 20, borderRadius: 20, marginRight: 15, borderWidth: 2, width: 250, elevation: 5 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 30 },
  statCard: { padding: 30, borderRadius: 25, alignItems: 'center', width: '45%', borderWidth: 2, elevation: 8 },
  statNumber: { fontSize: 40, fontWeight: 'bold', marginVertical: 12 },
  filterContainer: { paddingVertical: 10 },
  categoryScroll: { marginVertical: 15, paddingHorizontal: 20, height: 50 },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 8,
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  categoryText: { fontSize: 14, fontWeight: '700' },
  card: {
    padding: 30,
    marginVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  cardTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  cardDescription: { fontSize: 16, marginVertical: 12 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
  modalContent: { width: '92%', padding: 35, borderRadius: 25, elevation: 12, maxHeight: '90%' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  coverPhoto: { width: '100%', height: 300, marginBottom: 30, borderRadius: 25, overflow: 'hidden' },
  coverPhotoImage: { width: '100%', height: '100%' },
  profilePhoto: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 5,
    alignSelf: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  skillSection: { width: '100%', marginVertical: 30 },
  portfolioSection: { width: '100%', marginVertical: 30 },
  analyticsSection: { width: '100%', marginVertical: 30 },
  vipSection: { width: '100%', marginVertical: 30 },
  skillInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  skillList: { flexDirection: 'row', flexWrap: 'wrap' },
  skillTag: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 30, margin: 10, borderWidth: 1 },
  portfolioItem: { position: 'relative', marginRight: 20 },
  portfolioImage: { width: 140, height: 140, borderRadius: 20, borderWidth: 2, borderColor: '#ffd700' },
  removePortfolio: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 15, padding: 6 },
  popup: {
    position: 'absolute',
    top: 80,
    left: 40,
    right: 40,
    padding: 30,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  popupText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  popupClose: { color: '#fff', fontSize: 18, marginTop: 15 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 30, width: '90%' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 30 },
  settingLabel: { fontSize: 22, fontWeight: 'bold' },
  notificationBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    elevation: 8,
  },
  notificationText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
