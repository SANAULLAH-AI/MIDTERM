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
    const categories = ['Tech', 'Design', 'Marketing', 'Finance', 'Sales', 'Management'];
    return response.data.map(post => ({
      id: post.id.toString(),
      title: post.title,
      company: `Company ${post.userId}`,
      description: post.body,
      location: ['New York', 'London', 'Remote', 'Tokyo', 'Dubai'][Math.floor(Math.random() * 5)],
      salary: Math.floor(Math.random() * 70 + 80), // In thousands (80k-150k)
      category: categories[Math.floor(Math.random() * categories.length)],
      posted: new Date().toLocaleDateString(),
      requirements: ['5+ years experience', 'Advanced degree', 'Leadership skills'],
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
  const handleStart = async () => {
    await storeData('onboardingCompleted', true);
    navigation.replace('Login');
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.onboardingScroll}>
        <Image source={{ uri: 'https://via.placeholder.com/200' }} style={styles.onboardingImage} />
        <Text style={[styles.title, { color: theme.text }]}>Welcome to JobSeeker Elite</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Your Path to Prestigious Careers</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleStart}>
          <Text style={styles.buttonText}>Embark Now</Text>
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
        <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.logo} />
        <Text style={[styles.title, { color: theme.text }]}>Elite Access</Text>
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
            <Text style={[styles.link, { color: theme.link }]}>Guest Access</Text>
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
        <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.logo} />
        <Text style={[styles.title, { color: theme.text }]}>Join the Elite</Text>
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
          <Text style={[styles.link, { color: theme.link }]}>Already Elite? Login</Text>
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
        <Text style={[styles.title, { color: theme.text }]}>Reset Access</Text>
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

  return (
    <LinearGradient colors={theme.gradient} style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.homeScroll}>
        {notification && (
          <View style={[styles.notificationBanner, { backgroundColor: theme.button }]}>
            <Text style={styles.notificationText}>New Elite Jobs Available!</Text>
            <TouchableOpacity onPress={() => setNotification(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        <Text style={[styles.title, { color: theme.text }]}>JobSeeker Elite</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Unrivaled Career Excellence</Text>
        <Image source={{ uri: 'https://via.placeholder.com/300x200' }} style={styles.banner} />
        <View style={styles.stats}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="briefcase" size={50} color={theme.button} />
            <Text style={[styles.statNumber, { color: theme.text }]}>120+</Text>
            <Text style={{ color: theme.text, fontWeight: 'bold' }}>Elite Jobs</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="paper-plane" size={50} color={theme.button} />
            <Text style={[styles.statNumber, { color: theme.text }]}>18</Text>
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
  const [salaryRange, setSalaryRange] = useState([0, 200]);
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
    filterJobs(text, category, location, salaryRange);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    filterJobs(search, cat, location, salaryRange);
  };

  const handleLocation = (loc) => {
    setLocation(loc);
    filterJobs(search, category, loc, salaryRange);
  };

  const handleSalary = (range) => {
    setSalaryRange(range);
    filterJobs(search, category, location, range);
  };

  const filterJobs = (text, cat, loc, range) => {
    let filtered = jobs.filter(
      job => job.title.toLowerCase().includes(text.toLowerCase()) || job.company.toLowerCase().includes(text.toLowerCase())
    );
    if (cat !== 'All') filtered = filtered.filter(job => job.category === cat);
    if (loc !== 'All') filtered = filtered.filter(job => job.location === loc);
    filtered = filtered.filter(job => job.salary >= range[0] && job.salary <= range[1]);
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
        placeholder="Search Elite Jobs..."
        placeholderTextColor={theme.placeholder}
        value={search}
        onChangeText={handleSearch}
      />
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {['All', 'Tech', 'Design', 'Marketing', 'Finance', 'Sales', 'Management'].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, { backgroundColor: category === cat ? theme.button : theme.card, borderColor: theme.border }]}
              onPress={() => handleCategory(cat)}
            >
              <Text style={[styles.categoryText, { color: category === cat ? '#fff' : theme.text }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {['All', 'New York', 'London', 'Remote', 'Tokyo', 'Dubai'].map(loc => (
            <TouchableOpacity
              key={loc}
              style={[styles.categoryButton, { backgroundColor: location === loc ? theme.button : theme.card, borderColor: theme.border }]}
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
              onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={{ color: theme.text, fontWeight: '500' }}>{item.company} - {item.location}</Text>
                <Text style={{ color: theme.button }}>{item.salary}k | {item.category}</Text>
                <Text style={[styles.cardDescription, { color: theme.text }]}>{item.description.slice(0, 80)}...</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => toggleSaveJob(item)}>
                    <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={24} color={theme.button} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 130 }} // Space for filters
      />
      <Modal visible={!!selectedJob} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={theme.gradient} style={styles.modalContent}>
            {selectedJob && (
              <>
                <Text style={[styles.title, { color: theme.text }]}>{selectedJob.title}</Text>
                <Text style={[styles.subtitle, { color: theme.text }]}>{selectedJob.company} - {selectedJob.location}</Text>
                <Text style={{ color: theme.button, marginVertical: 10 }}>{selectedJob.salary}k | {selectedJob.category}</Text>
                <Text style={[styles.cardDescription, { color: theme.text }]}>{selectedJob.description}</Text>
                <Text style={[styles.subtitle, { color: theme.text }]}>Requirements:</Text>
                {selectedJob.requirements.map((req, idx) => (
                  <Text key={idx} style={{ color: theme.text, marginLeft: 15, fontSize: 14 }}>• {req}</Text>
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
          style={[styles.input, { borderColor: theme.border, color: theme.text, height: 150, backgroundColor: theme.inputBackground }]}
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
      <Text style={[styles.title, { color: theme.text, marginTop: 20 }]}>Saved Elite Jobs</Text>
      <FlatList
        data={savedJobs}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={{ color: theme.text, fontWeight: '500' }}>{item.company} - {item.location}</Text>
            <Text style={{ color: theme.button }}>{item.salary}k | {item.category}</Text>
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
        <Text style={[styles.title, { color: theme.text }]}>Elite Feedback</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, height: 120, backgroundColor: theme.inputBackground }]}
          placeholder="Your Prestigious Thoughts..."
          placeholderTextColor={theme.placeholder}
          value={feedback}
          onChangeText={setFeedback}
          multiline
        />
        <Text style={[styles.subtitle, { color: theme.text }]}>Rate Our Service (1-5):</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map(num => (
            <TouchableOpacity key={num} onPress={() => setRating(num)}>
              <Ionicons name={rating >= num ? 'star' : 'star-outline'} size={45} color={theme.button} />
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
        <Image source={{ uri: coverPhoto || 'https://via.placeholder.com/300x250' }} style={styles.coverPhoto} />
        <Image source={{ uri: profilePhoto || 'https://via.placeholder.com/160' }} style={[styles.profilePhoto, { borderColor: theme.border }]} />
        <Text style={[styles.title, { color: theme.text }]}>{user?.name || 'Elite Member'}</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>{user?.email || 'No email'}</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBackground }]}
          placeholder="Your Elite Bio"
          placeholderTextColor={theme.placeholder}
          value={bio}
          onChangeText={setBio}
        />
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, height: 120, backgroundColor: theme.inputBackground }]}
          placeholder="Professional Experience"
          placeholderTextColor={theme.placeholder}
          value={experience}
          onChangeText={setExperience}
          multiline
        />
        <View style={styles.skillSection}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Elite Skills</Text>
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
                  <Ionicons name="close" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.portfolioSection}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Portfolio</Text>
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
                  <Ionicons name="trash" size={20} color={theme.button} />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
        <View style={styles.analyticsSection}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Analytics</Text>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="paper-plane" size={40} color={theme.button} />
            <Text style={[styles.statNumber, { color: theme.text }]}>{user?.applications || 0}</Text>
            <Text style={{ color: theme.text, fontWeight: 'bold' }}>Applications Submitted</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={() => handleImagePick('profile')}>
          <Text style={styles.buttonText}>Change Profile Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={() => handleImagePick('cover')}>
          <Text style={styles.buttonText}>Change Cover Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Elite Profile</Text>
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
        <Text style={[styles.title, { color: theme.text }]}>Elite Settings</Text>
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
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border, paddingVertical: 10, height: 80, elevation: 10 },
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
        tabBarActiveTintColor: theme.button,
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
  card: 'rgba(40, 40, 40, 0.8)',
  button: '#ff4d4d',
  popupBackground: '#ff4d4d',
  placeholder: '#999',
  link: '#ff6666',
  gradient: ['#2a2a2a', '#0d0d0d'],
  inputBackground: 'rgba(50, 50, 50, 0.8)',
};

// Styles
const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  onboardingScroll: { flexGrow: 1, padding: 40, justifyContent: 'center', alignItems: 'center' },
  authScroll: { flexGrow: 1, padding: 40, justifyContent: 'center', alignItems: 'center' },
  homeScroll: { flexGrow: 1, padding: 30, alignItems: 'center' },
  applicationScroll: { flexGrow: 1, padding: 30 },
  feedbackScroll: { flexGrow: 1, padding: 30, alignItems: 'center' },
  profileScroll: { flexGrow: 1, padding: 30 },
  settingsScroll: { flexGrow: 1, padding: 30 },
  onboardingImage: { width: 220, height: 220, marginBottom: 40, borderRadius: 110, borderWidth: 3, borderColor: '#ff4d4d' },
  logo: { width: 160, height: 160, marginBottom: 40, borderRadius: 80, borderWidth: 3, borderColor: '#ff4d4d' },
  title: { fontSize: 36, fontWeight: '800', marginBottom: 20, textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },
  subtitle: { fontSize: 22, marginBottom: 25, textAlign: 'center', fontWeight: '600' },
  input: {
    borderWidth: 1,
    padding: 18,
    marginVertical: 12,
    borderRadius: 15,
    fontSize: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  button: {
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  smallButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '25%',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  authLinks: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 25 },
  link: { fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline' },
  banner: { width: '100%', height: 220, borderRadius: 20, marginVertical: 25, borderWidth: 2, borderColor: '#ff4d4d' },
  stats: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  statCard: { padding: 25, borderRadius: 20, alignItems: 'center', width: '45%', borderWidth: 1, elevation: 5 },
  statNumber: { fontSize: 36, fontWeight: 'bold', marginVertical: 10 },
  filterContainer: { paddingVertical: 10 },
  categoryScroll: { marginVertical: 5, paddingHorizontal: 10, height: 40 }, // Fixed height for visibility
  categoryButton: { padding: 10, borderRadius: 30, marginHorizontal: 8, borderWidth: 1, elevation: 2, justifyContent: 'center' },
  categoryText: { fontSize: 14, fontWeight: 'bold' },
  card: {
    padding: 25,
    marginVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  cardDescription: { fontSize: 15, marginVertical: 10 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  modalContent: { width: '90%', padding: 30, borderRadius: 20, elevation: 10, maxHeight: '85%' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  coverPhoto: { width: '100%', height: 280, marginBottom: 25, borderRadius: 20, borderWidth: 2, borderColor: '#ff4d4d' },
  profilePhoto: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    alignSelf: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  skillSection: { width: '100%', marginVertical: 25 },
  portfolioSection: { width: '100%', marginVertical: 25 },
  analyticsSection: { width: '100%', marginVertical: 25 },
  skillInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  skillList: { flexDirection: 'row', flexWrap: 'wrap' },
  skillTag: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 25, margin: 8, borderWidth: 1 },
  portfolioItem: { position: 'relative', marginRight: 15 },
  portfolioImage: { width: 120, height: 120, borderRadius: 15, borderWidth: 1, borderColor: '#ff4d4d' },
  removePortfolio: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 15, padding: 5 },
  popup: {
    position: 'absolute',
    top: 70,
    left: 30,
    right: 30,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  popupText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  popupClose: { color: '#fff', fontSize: 16, marginTop: 12 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 25, width: '85%' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 25 },
  settingLabel: { fontSize: 20, fontWeight: 'bold' },
  notificationBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 5,
  },
  notificationText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
