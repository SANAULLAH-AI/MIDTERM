// client/App.js
import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Switch,
  Image,
  Animated,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();
const BASE_URL = 'http://192.168.100.149:5000/api'; // Ensure this URL is correct and server is running

// Memoized JobItem
const JobItem = memo(({ item, onPress, isDarkMode }) => (
  <TouchableOpacity style={[styles.jobCard, isDarkMode && styles.darkCard]} onPress={onPress}>
    <Image source={{ uri: item.image }} style={styles.jobCardImage} resizeMode="cover" />
    <View style={styles.jobCardContent}>
      <Text style={[styles.jobTitle, isDarkMode && styles.darkText]}>{item.title}</Text>
      <Text style={[styles.company, isDarkMode && styles.darkText]}>{item.company}</Text>
      <View style={styles.jobMeta}>
        <Ionicons name="location" size={16} color={isDarkMode ? '#81b0ff' : '#1a73e8'} />
        <Text style={[styles.location, isDarkMode && styles.darkText]}>{item.location}</Text>
      </View>
      <Text style={[styles.salary, isDarkMode && styles.darkText]}>{item.salary}</Text>
    </View>
  </TouchableOpacity>
));

// Job Detail Screen
const JobDetailScreen = ({ route, navigation }) => {
  const { job, toggleFavorite, favorites, isDarkMode, jobs } = route.params;
  const isFavorite = favorites.includes(job.id);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const relatedJobs = jobs.filter((j) => j.id !== job.id && j.category === job.category).slice(0, 3);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const RelatedJobItem = memo(({ item }) => (
    <TouchableOpacity
      style={[styles.relatedJobCard, isDarkMode && styles.darkCard]}
      onPress={() => navigation.push('JobDetail', { job: item, toggleFavorite, favorites, isDarkMode, jobs })}
    >
      <Text style={[styles.jobTitle, isDarkMode && styles.darkText]}>{item.title}</Text>
      <Text style={[styles.company, isDarkMode && styles.darkText]}>{item.company}</Text>
    </TouchableOpacity>
  ));

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Animated.View style={[styles.detailHeader, isDarkMode && styles.darkHeader, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>{job.title}</Text>
      </Animated.View>
      <ScrollView style={styles.detailContent}>
        <Image source={{ uri: job.image }} style={styles.jobImage} resizeMode="cover" />
        <View style={[styles.detailCard, isDarkMode && styles.darkCard]}>
          <Text style={[styles.detailCompany, isDarkMode && styles.darkText]}>{job.company}</Text>
          <View style={styles.detailMeta}>
            <Ionicons name="location" size={20} color={isDarkMode ? '#81b0ff' : '#1a73e8'} />
            <Text style={[styles.detailLocation, isDarkMode && styles.darkText]}>{job.location}</Text>
          </View>
          <Text style={[styles.detailSalary, isDarkMode && styles.darkText]}>{job.salary}</Text>
          <Text style={[styles.detailDescription, isDarkMode && styles.darkText]}>{job.description}</Text>
          <TouchableOpacity
            style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
            onPress={() => toggleFavorite(job.id)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#fff' : '#fff'}
            />
            <Text style={styles.favoriteButtonText}>
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
          {relatedJobs.length > 0 && (
            <View style={styles.relatedJobsSection}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Related Jobs</Text>
              <FlatList
                data={relatedJobs}
                renderItem={({ item }) => <RelatedJobItem item={item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Job Listings Screen
const JobListingsScreen = ({ navigation, route }) => {
  const { jobs, toggleFavorite, favorites, isDarkMode } = route.params;
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    setFilteredJobs(jobs);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [jobs, fadeAnim]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    filterJobs(text, categoryFilter);
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
    filterJobs(searchQuery, category);
  };

  const filterJobs = (search, category) => {
    let filtered = [...jobs];
    if (search) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.company.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category) {
      filtered = filtered.filter((job) => job.category.toLowerCase().includes(category.toLowerCase()));
    }
    setFilteredJobs(filtered);
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Job Listings</Text>
      </View>
      <Animated.View style={{ opacity: fadeAnim }}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkInput]}
          placeholder="Search jobs..."
          placeholderTextColor={isDarkMode ? '#888' : '#888'}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <ScrollView horizontal style={styles.categoryFilter}>
          {['All', 'Tech', 'Marketing', 'Sales'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                isDarkMode && styles.darkCategoryButton,
                categoryFilter === (cat === 'All' ? '' : cat) && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategoryFilter(cat === 'All' ? '' : cat)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  isDarkMode && styles.darkText,
                  categoryFilter === (cat === 'All' ? '' : cat) && styles.categoryButtonTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <FlatList
          data={filteredJobs}
          renderItem={({ item }) => (
            <JobItem
              item={item}
              onPress={() =>
                navigation.navigate('JobDetail', { job: item, toggleFavorite, favorites, isDarkMode, jobs })
              }
              isDarkMode={isDarkMode}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.jobList}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

// Profile Screen
const ProfileScreen = ({ navigation, route }) => {
  const { setIsLoggedIn, isDarkMode, toggleDarkMode, username, setUsername, updateUser } = route.params;
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const storedCover = await AsyncStorage.getItem('coverPhoto');
        const storedProfile = await AsyncStorage.getItem('profilePhoto');
        setCoverPhoto(storedCover || null);
        setProfilePhoto(storedProfile || null);
      } catch (err) {
        console.error('Error loading profile data:', err);
      }
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    };
    loadProfileData();
  }, [fadeAnim]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      setIsLoggedIn(false);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) return;
    try {
      const updatedUser = await updateUser({ username: newUsername });
      setUsername(updatedUser.username);
      await AsyncStorage.setItem('username', updatedUser.username);
      setEditMode(false);
    } catch (err) {
      console.error('Error saving username:', err);
    }
  };

  const handleSelectCoverPhoto = async () => {
    const newPhoto = 'https://via.placeholder.com/300x100';
    try {
      await AsyncStorage.setItem('coverPhoto', newPhoto);
      await updateUser({ coverPhoto: newPhoto });
      setCoverPhoto(newPhoto);
    } catch (err) {
      console.error('Error saving cover photo:', err);
    }
  };

  const handleSelectProfilePhoto = async () => {
    const newPhoto = 'https://via.placeholder.com/150';
    try {
      await AsyncStorage.setItem('profilePhoto', newPhoto);
      await updateUser({ profilePhoto: newPhoto });
      setProfilePhoto(newPhoto);
    } catch (err) {
      console.error('Error saving profile photo:', err);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Profile</Text>
      </View>
      <Animated.ScrollView contentContainerStyle={styles.profileContent} style={{ opacity: fadeAnim }}>
        {coverPhoto ? (
          <Image source={{ uri: coverPhoto }} style={styles.coverPhoto} resizeMode="cover" />
        ) : (
          <View style={styles.coverPhotoPlaceholder} />
        )}
        <TouchableOpacity style={styles.changeCoverButton} onPress={handleSelectCoverPhoto}>
          <Text style={styles.changeCoverText}>Change Cover Photo</Text>
        </TouchableOpacity>
        <View style={styles.profilePhotoContainer}>
          <Image
            source={{ uri: profilePhoto || 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.changeProfileButton} onPress={handleSelectProfilePhoto}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.changeProfileText}>Change</Text>
          </TouchableOpacity>
        </View>
        {editMode ? (
          <View style={styles.editProfile}>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="New Username"
              placeholderTextColor={isDarkMode ? '#888' : '#888'}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveUsername}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, isDarkMode && styles.darkText]}>{username}</Text>
            <Text style={[styles.profileEmail, isDarkMode && styles.darkText]}>
              {username.toLowerCase().replace(/\s/g, '')}@example.com
            </Text>
            <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.profileOptions}>
          <View style={styles.optionRow}>
            <Text style={[styles.optionText, isDarkMode && styles.darkText]}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isDarkMode ? '#1a73e8' : '#f4f3f4'}
            />
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

// Home Screen
const HomeScreen = ({ navigation, route }) => {
  const { jobs, loading, error, toggleFavorite, favorites, isDarkMode, username } = route.params;
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Animated.View style={[styles.header, isDarkMode && styles.darkHeader, { opacity: fadeAnim }]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Welcome, {username}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle" size={30} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
      <ScrollView contentContainerStyle={styles.homeContent}>
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, isDarkMode && styles.darkText]}>Find Your Dream Job</Text>
          <Text style={[styles.heroSubtitle, isDarkMode && styles.darkText]}>
            Explore opportunities tailored for you
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Jobs')}
          >
            <Text style={styles.exploreButtonText}>Explore Jobs</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.jobsSection}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Featured Jobs</Text>
          {loading ? (
            <ActivityIndicator size="large" color={isDarkMode ? '#1a73e8' : '#1a73e8'} />
          ) : error ? (
            <Text style={[styles.errorText, isDarkMode && styles.darkText]}>{error}</Text>
          ) : (
            <FlatList
              data={jobs.slice(0, 3)}
              renderItem={({ item }) => (
                <JobItem
                  item={item}
                  onPress={() =>
                    navigation.navigate('JobDetail', { job: item, toggleFavorite, favorites, isDarkMode, jobs })
                  }
                  isDarkMode={isDarkMode}
                />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Settings Screen
const SettingsScreen = ({ route }) => {
  const { isDarkMode, toggleDarkMode, jobs } = route.params;
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Settings</Text>
      </View>
      <Animated.ScrollView contentContainerStyle={styles.settingsContent} style={{ opacity: fadeAnim }}>
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#1a73e8' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Notifications</Text>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={'#1a73e8'}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>
            Available Jobs: {jobs.length}
          </Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

// Feedback Screen
const FeedbackScreen = ({ route }) => {
  const { isDarkMode, username, updateUser } = route.params;
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const response = await fetch(`${BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password: await AsyncStorage.getItem('password') }),
        });
        const data = await response.json();
        if (response.ok && data.feedback) setFeedbackList(data.feedback);
      } catch (err) {
        console.error('Error loading feedback:', err);
      }
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    };
    loadFeedback();
  }, [fadeAnim, username]);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;
    try {
      const newFeedback = { text: feedback, date: new Date() };
      const updatedList = [...feedbackList, newFeedback];
      await updateUser({ feedback: updatedList });
      setFeedbackList(updatedList);
      setFeedback('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Feedback</Text>
      </View>
      <Animated.ScrollView contentContainerStyle={styles.feedbackContent} style={{ opacity: fadeAnim }}>
        <Text style={[styles.feedbackTitle, isDarkMode && styles.darkText]}>
          We Value Your Feedback
        </Text>
        <TextInput
          style={[styles.feedbackInput, isDarkMode && styles.darkInput]}
          multiline
          numberOfLines={4}
          placeholder="Share your thoughts..."
          placeholderTextColor={isDarkMode ? '#888' : '#888'}
          value={feedback}
          onChangeText={setFeedback}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFeedback}>
          <Text style={styles.submitButtonText}>Submit Feedback</Text>
        </TouchableOpacity>
        {submitted && (
          <Text style={styles.successText}>Thank you for your feedback!</Text>
        )}
        {feedbackList.length > 0 && (
          <View style={styles.feedbackHistory}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Your Feedback</Text>
            {feedbackList.map((item, index) => (
              <View key={index} style={[styles.feedbackItem, isDarkMode && styles.darkCard]}>
                <Text style={[styles.feedbackDate, isDarkMode && styles.darkText]}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
                <Text style={[styles.feedbackText, isDarkMode && styles.darkText]}>{item.text}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

// Main App Component
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        const darkMode = await AsyncStorage.getItem('isDarkMode');
        if (loggedIn === 'true') {
          const storedUsername = await AsyncStorage.getItem('username');
          const storedPassword = await AsyncStorage.getItem('password');
          if (storedUsername && storedPassword) {
            await handleLogin(storedUsername, storedPassword, false);
          }
        }
        setIsDarkMode(darkMode === 'true');
      } catch (err) {
        console.error('Error initializing app:', err);
        setError('Failed to initialize app');
      }
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    };
    initializeApp();
  }, [fadeAnim]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/jobs`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
      setError('');
    } catch (err) {
      console.error('Fetch jobs error:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('password', password);
      setIsLoggedIn(true);
      setUsername(data.username);
      setError('');
      await fetchJobs();
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed');
    }
  };

  const handleLogin = async (loginUsername, loginPassword, setErrorFlag = true) => {
    const user = loginUsername || username;
    const pass = loginPassword || password;
    if (!user.trim() || !pass.trim()) {
      if (setErrorFlag) setError('Please enter username and password');
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('username', user);
      await AsyncStorage.setItem('password', pass);
      setIsLoggedIn(true);
      setUsername(data.username);
      setFavorites(data.favorites || []);
      setError('');
      await fetchJobs();
    } catch (err) {
      console.error('Login error:', err);
      if (setErrorFlag) setError(err.message || 'Login failed');
    }
  };

  const updateUser = async (updates) => {
    try {
      const response = await fetch(`${BASE_URL}/user/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      if (updates.favorites !== undefined) setFavorites(data.favorites);
      return data;
    } catch (err) {
      console.error('Update user error:', err);
      throw err;
    }
  };

  const toggleFavorite = async (jobId) => {
    const newFavorites = favorites.includes(jobId)
      ? favorites.filter((id) => id !== jobId)
      : [...favorites, jobId];
    setFavorites(newFavorites);
    try {
      await updateUser({ favorites: newFavorites });
    } catch (err) {
      console.error('Toggle favorite error:', err);
      setFavorites(favorites); // Revert on error
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('isDarkMode', newMode.toString());
    } catch (err) {
      console.error('Error saving dark mode:', err);
    }
  };

  const screenParams = {
    setIsLoggedIn,
    isDarkMode,
    toggleDarkMode,
    jobs,
    loading,
    error,
    toggleFavorite,
    favorites,
    username,
    setUsername,
    updateUser,
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <StatusBar style={isDarkMode ? 'light' : 'light'} backgroundColor={isDarkMode ? '#1a1a1a' : '#1a73e8'} />
        <Animated.View
          style={[styles.authContainer, isDarkMode && styles.darkAuthContainer, { opacity: fadeAnim }]}
        >
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={styles.authLogo}
            resizeMode="contain"
          />
          <Text style={[styles.authTitle, isDarkMode && styles.darkText]}>
            {isSignup ? 'Sign Up' : 'Login'}
          </Text>
          <Text style={[styles.authSubtitle, isDarkMode && styles.darkText]}>
            {isSignup ? 'Create an account' : 'Sign in to continue'}
          </Text>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="Username"
            placeholderTextColor={isDarkMode ? '#888' : '#888'}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="Password"
            placeholderTextColor={isDarkMode ? '#888' : '#888'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? <Text style={[styles.errorText, isDarkMode && styles.darkText]}>{error}</Text> : null}
          <TouchableOpacity style={styles.authButton} onPress={isSignup ? handleSignup : handleLogin}>
            <Text style={styles.authButtonText}>{isSignup ? 'Sign Up' : 'Login'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => {
              setIsSignup(!isSignup);
              setError('');
              setUsername('');
              setPassword('');
            }}
          >
            <Text style={[styles.toggleButtonText, isDarkMode && styles.darkText]}>
              {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={isDarkMode ? 'light' : 'light'} backgroundColor={isDarkMode ? '#1a1a1a' : '#1a73e8'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Jobs') iconName = 'briefcase';
            else if (route.name === 'Feedback') iconName = 'chatbubble';
            else if (route.name === 'Settings') iconName = 'settings';
            else if (route.name === 'Profile') iconName = 'person';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#1a73e8',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: [styles.tabBar, isDarkMode && styles.darkTabBar],
          tabBarLabelStyle: styles.tabLabel,
          headerShown: false,
        })}
        tabBarOptions={{
          showLabel: true,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} initialParams={screenParams} />
        <Tab.Screen name="Jobs" component={JobListingsScreen} initialParams={screenParams} />
        <Tab.Screen name="Feedback" component={FeedbackScreen} initialParams={screenParams} />
        <Tab.Screen name="Settings" component={SettingsScreen} initialParams={screenParams} />
        <Tab.Screen name="Profile" component={ProfileScreen} initialParams={screenParams} />
        <Tab.Screen
          name="JobDetail"
          component={JobDetailScreen}
          options={{ tabBarButton: () => null }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  darkAuthContainer: {
    backgroundColor: '#1a1a1a',
  },
  authLogo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a73e8',
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  darkInput: {
    backgroundColor: '#333',
    color: '#fff',
  },
  authButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#1a73e8',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#1a73e8',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  darkHeader: {
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  homeContent: {
    padding: 20,
  },
  heroSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  jobsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  jobCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  darkCard: {
    backgroundColor: '#333',
  },
  jobCardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  jobCardContent: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  company: {
    fontSize: 14,
    color: '#1a73e8',
    marginBottom: 5,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  salary: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  darkText: {
    color: '#fff',
  },
  jobList: {
    paddingVertical: 15,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  categoryFilter: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  darkCategoryButton: {
    backgroundColor: '#333',
  },
  categoryButtonActive: {
    backgroundColor: '#1a73e8',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a73e8',
    padding: 20,
    paddingTop: 40,
  },
  detailTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    flex: 1,
  },
  detailContent: {
    flex: 1,
  },
  jobImage: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  detailCompany: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 10,
  },
  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLocation: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  detailSalary: {
    fontSize: 18,
    color: '#2ecc71',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  favoriteButton: {
    flexDirection: 'row',
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  favoriteButtonActive: {
    backgroundColor: '#e74c3c',
  },
  favoriteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  applyButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  relatedJobsSection: {
    marginTop: 20,
  },
  relatedJobCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  profileContent: {
    padding: 20,
    alignItems: 'center',
  },
  coverPhoto: {
    width: '100%',
    height: 150,
    borderRadius: 15,
    marginBottom: 20,
  },
  coverPhotoPlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#ddd',
    borderRadius: 15,
    marginBottom: 20,
  },
  changeCoverButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  changeCoverText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profilePhotoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#1a73e8',
  },
  changeProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1a73e8',
    borderRadius: 20,
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeProfileText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginVertical: 5,
  },
  editProfile: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    padding: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileOptions: {
    width: '100%',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsContent: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  feedbackContent: {
    padding: 20,
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  feedbackInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successText: {
    color: '#2ecc71',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackHistory: {
    marginTop: 20,
  },
  feedbackItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
  },
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    paddingVertical: 5,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  darkTabBar: {
    backgroundColor: '#1a1a1a',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
});
