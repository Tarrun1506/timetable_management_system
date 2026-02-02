import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import AdminSidebar from '../components/AdminSidebar';
import {
  Settings,
  ArrowLeft,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Clock,
  Calendar,
  Users,
  Coffee,
  CheckCircle,
  School,
  BookOpen,
  MapPin,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

const InfrastructureData = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('policies');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [configId, setConfigId] = useState(null);

  // Infrastructure data state
  const [generalPolicies, setGeneralPolicies] = useState({
    maxConsecutiveHours: 3,
    maxDailyHours: 8,
    minBreakBetweenSessions: 15,
    maxTeachingHoursPerDay: 6,
    preferredClassroomUtilization: 80,
    allowBackToBackLabs: false,
    prioritizeTeacherPreferences: true,
    allowSplitSessions: false,
    maxStudentsPerClass: 60,
    minRoomCapacityBuffer: 10,
    allowOverlappingLabs: false,
    prioritizeCoreBefore: true,
    avoidFirstLastPeriod: false,
    requireLabAssistant: true
  });

  const [workingHours, setWorkingHours] = useState({
    startTime: '09:00',
    endTime: '17:00',
    lunchBreakStart: '12:30',
    lunchBreakEnd: '13:30',
    periodDuration: 50,
    breakDuration: 10,
    labPeriodDuration: 120,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    maxPeriodsPerDay: 8,
    earlyMorningStart: '08:00',
    eveningEndTime: '18:00'
  });

  const [academicCalendar, setAcademicCalendar] = useState({
    academicYearStart: '2024-07-01',
    academicYearEnd: '2025-06-30',
    semester1Start: '2024-07-01',
    semester1End: '2024-12-15',
    semester2Start: '2025-01-01',
    semester2End: '2025-06-30',
    totalWeeks: 16,
    examWeeks: 2,
    vacationWeeks: 4
  });

  const [constraintRules, setConstraintRules] = useState({
    minGapBetweenExams: 2,
    maxSubjectsPerDay: 6,
    preferMorningLabs: true,
    avoidFridayAfternoon: true,
    balanceWorkload: true,
    groupSimilarSubjects: false,
    maintainTeacherContinuity: true,
    prioritizePopularSlots: false
  });

  // Fetch system configuration on component mount
  useEffect(() => {
    fetchSystemConfig();
  }, []);

  const fetchSystemConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/data/system-config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system configuration');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setConfigId(result.data._id);

        // Log fetched configuration
        console.log('='.repeat(60));
        console.log('📋 SYSTEM CONFIGURATION LOADED');
        console.log('='.repeat(60));
        console.log('Configuration:', JSON.stringify(result.data, null, 2));
        console.log('='.repeat(60));

        // Update states with fetched data
        if (result.data.generalPolicies) {
          setGeneralPolicies(result.data.generalPolicies);
        }
        if (result.data.workingHours) {
          setWorkingHours(result.data.workingHours);
        }
        if (result.data.academicCalendar) {
          const calendar = result.data.academicCalendar;
          setAcademicCalendar({
            academicYearStart: calendar.academicYearStart ? calendar.academicYearStart.split('T')[0] : '2024-07-01',
            academicYearEnd: calendar.academicYearEnd ? calendar.academicYearEnd.split('T')[0] : '2025-06-30',
            semester1Start: calendar.semester1Start ? calendar.semester1Start.split('T')[0] : '2024-07-01',
            semester1End: calendar.semester1End ? calendar.semester1End.split('T')[0] : '2024-12-15',
            semester2Start: calendar.semester2Start ? calendar.semester2Start.split('T')[0] : '2025-01-01',
            semester2End: calendar.semester2End ? calendar.semester2End.split('T')[0] : '2025-06-30',
            totalWeeks: calendar.totalWeeks || 16,
            examWeeks: calendar.examWeeks || 2,
            vacationWeeks: calendar.vacationWeeks || 4
          });
        }
        if (result.data.constraintRules) {
          setConstraintRules(result.data.constraintRules);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching system config:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const saveConfiguration = async (section, data) => {
    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/data/system-config/${section}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${section}`);
      }

      const result = await response.json();

      // Log the saved data to console
      console.log('='.repeat(60));
      console.log(`✅ ${section.toUpperCase()} SAVED SUCCESSFULLY`);
      console.log('='.repeat(60));
      console.log('Saved Data:', JSON.stringify(result.data, null, 2));
      console.log('Response:', result);
      console.log('='.repeat(60));

      setSuccessMessage(result.message || 'Configuration saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      setSaving(false);
      return true;
    } catch (err) {
      console.error(`Error saving ${section}:`, err);
      setError(err.message);
      setSaving(false);
      return false;
    }
  };

  const handleSaveGeneralPolicies = async () => {
    console.log('💾 Saving General Policies...');
    console.log('Data to save:', generalPolicies);
    await saveConfiguration('general-policies', generalPolicies);
  };

  const handleSaveWorkingHours = async () => {
    console.log('💾 Saving Working Hours...');
    console.log('Data to save:', workingHours);
    await saveConfiguration('working-hours', workingHours);
  };

  const handleSaveAcademicCalendar = async () => {
    console.log('💾 Saving Academic Calendar...');
    console.log('Data to save:', academicCalendar);
    await saveConfiguration('academic-calendar', academicCalendar);
  };

  const handleSaveConstraintRules = async () => {
    console.log('💾 Saving Constraint Rules...');
    console.log('Data to save:', constraintRules);
    await saveConfiguration('constraint-rules', constraintRules);
  };

  const handleBack = () => {
    navigate('/programs-data');
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const results = await Promise.all([
        saveConfiguration('general-policies', generalPolicies),
        saveConfiguration('working-hours', workingHours),
        saveConfiguration('academic-calendar', academicCalendar),
        saveConfiguration('constraint-rules', constraintRules)
      ]);
      setSaving(false);
      return results.every(r => r === true);
    } catch (err) {
      console.error('Error saving all configurations:', err);
      setSaving(false);
      return false;
    }
  };

  const handleNext = async () => {
    const success = await saveAll();

    if (success) {
      navigate('/generate-timetable');
    } else {
      const confirmMove = window.confirm('Some configurations failed to save. Move to generation anyway?');
      if (confirmMove) {
        navigate('/generate-timetable');
      }
    }
  };

  const handlePolicyChange = (key, value) => {
    setGeneralPolicies(prev => ({ ...prev, [key]: value }));
  };

  const handleWorkingHoursChange = (key, value) => {
    setWorkingHours(prev => ({ ...prev, [key]: value }));
  };

  const handleCalendarChange = (key, value) => {
    setAcademicCalendar(prev => ({ ...prev, [key]: value }));
  };

  const handleConstraintChange = (key, value) => {
    setConstraintRules(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Infrastructure & Policies</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-gray-500 dark:text-gray-400">Welcome, {user?.name}</span>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="w-full flex pt-0">
        {/* Left Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxHeight: 'calc(100vh - 4rem)', overflow: 'auto' }}>
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                {successMessage}
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading configuration...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">System Configuration</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure general policies, working hours, and academic calendar for optimal timetable generation
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Daily Hours</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{generalPolicies.maxDailyHours}</p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Break Time</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{generalPolicies.minBreakBetweenSessions}m</p>
                      </div>
                      <Coffee className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Academic Weeks</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{academicCalendar.totalWeeks}</p>
                      </div>
                      <School className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8 px-6">
                      <button
                        onClick={() => setActiveTab('policies')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'policies'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                      >
                        General Policies
                      </button>
                      <button
                        onClick={() => setActiveTab('schedule')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'schedule'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                      >
                        Working Hours
                      </button>
                      <button
                        onClick={() => setActiveTab('calendar')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'calendar'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                      >
                        Academic Calendar
                      </button>
                      <button
                        onClick={() => setActiveTab('constraints')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'constraints'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                      >
                        Advanced Constraints
                      </button>
                    </nav>
                  </div>

                  {/* General Policies Tab */}
                  {activeTab === 'policies' && (
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">General Timetable Policies</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Maximum Consecutive Hours
                            </label>
                            <input
                              type="number"
                              value={generalPolicies.maxConsecutiveHours}
                              onChange={(e) => handlePolicyChange('maxConsecutiveHours', parseInt(e.target.value))}
                              min="1"
                              max="8"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Maximum Daily Hours
                            </label>
                            <input
                              type="number"
                              value={generalPolicies.maxDailyHours}
                              onChange={(e) => handlePolicyChange('maxDailyHours', parseInt(e.target.value))}
                              min="1"
                              max="15"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Min Break Between Sessions (minutes)
                            </label>
                            <input
                              type="number"
                              value={generalPolicies.minBreakBetweenSessions}
                              onChange={(e) => handlePolicyChange('minBreakBetweenSessions', parseInt(e.target.value))}
                              min="5"
                              max="30"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Preferred Classroom Utilization (%)
                            </label>
                            <input
                              type="number"
                              value={generalPolicies.preferredClassroomUtilization}
                              onChange={(e) => handlePolicyChange('preferredClassroomUtilization', parseInt(e.target.value))}
                              min="60"
                              max="95"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Maximum Students Per Class
                            </label>
                            <input
                              type="number"
                              value={generalPolicies.maxStudentsPerClass}
                              onChange={(e) => handlePolicyChange('maxStudentsPerClass', parseInt(e.target.value))}
                              min="20"
                              max="100"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Room Capacity Buffer (%)
                            </label>
                            <input
                              type="number"
                              value={generalPolicies.minRoomCapacityBuffer}
                              onChange={(e) => handlePolicyChange('minRoomCapacityBuffer', parseInt(e.target.value))}
                              min="5"
                              max="25"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="allowBackToBackLabs"
                              checked={generalPolicies.allowBackToBackLabs}
                              onChange={(e) => handlePolicyChange('allowBackToBackLabs', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="allowBackToBackLabs" className="text-sm text-gray-700 dark:text-gray-300">
                              Allow back-to-back laboratory sessions
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="prioritizeTeacherPreferences"
                              checked={generalPolicies.prioritizeTeacherPreferences}
                              onChange={(e) => handlePolicyChange('prioritizeTeacherPreferences', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="prioritizeTeacherPreferences" className="text-sm text-gray-700 dark:text-gray-300">
                              Prioritize teacher availability preferences
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="allowSplitSessions"
                              checked={generalPolicies.allowSplitSessions}
                              onChange={(e) => handlePolicyChange('allowSplitSessions', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="allowSplitSessions" className="text-sm text-gray-700 dark:text-gray-300">
                              Allow split course sessions across different days
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="allowOverlappingLabs"
                              checked={generalPolicies.allowOverlappingLabs}
                              onChange={(e) => handlePolicyChange('allowOverlappingLabs', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="allowOverlappingLabs" className="text-sm text-gray-700 dark:text-gray-300">
                              Allow overlapping lab sessions for different batches
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="prioritizeCoreBefore"
                              checked={generalPolicies.prioritizeCoreBefore}
                              onChange={(e) => handlePolicyChange('prioritizeCoreBefore', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="prioritizeCoreBefore" className="text-sm text-gray-700 dark:text-gray-300">
                              Schedule core subjects before electives
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="avoidFirstLastPeriod"
                              checked={generalPolicies.avoidFirstLastPeriod}
                              onChange={(e) => handlePolicyChange('avoidFirstLastPeriod', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="avoidFirstLastPeriod" className="text-sm text-gray-700 dark:text-gray-300">
                              Avoid scheduling in first and last periods when possible
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="requireLabAssistant"
                              checked={generalPolicies.requireLabAssistant}
                              onChange={(e) => handlePolicyChange('requireLabAssistant', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="requireLabAssistant" className="text-sm text-gray-700 dark:text-gray-300">
                              Require lab assistant availability for lab sessions
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleSaveGeneralPolicies}
                          disabled={saving}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{saving ? 'Saving...' : 'Save Policies'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Working Hours Tab */}
                  {activeTab === 'schedule' && (
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Working Hours Configuration</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Daily Schedule</h4>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                              <input
                                type="time"
                                value={workingHours.startTime}
                                onChange={(e) => handleWorkingHoursChange('startTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                              <input
                                type="time"
                                value={workingHours.endTime}
                                onChange={(e) => handleWorkingHoursChange('endTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lunch Start</label>
                              <input
                                type="time"
                                value={workingHours.lunchBreakStart}
                                onChange={(e) => handleWorkingHoursChange('lunchBreakStart', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lunch End</label>
                              <input
                                type="time"
                                value={workingHours.lunchBreakEnd}
                                onChange={(e) => handleWorkingHoursChange('lunchBreakEnd', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Period Duration (min)</label>
                              <input
                                type="number"
                                value={workingHours.periodDuration}
                                onChange={(e) => handleWorkingHoursChange('periodDuration', parseInt(e.target.value))}
                                min="15"
                                max="120"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Break Duration (min)</label>
                              <input
                                type="number"
                                value={workingHours.breakDuration}
                                onChange={(e) => handleWorkingHoursChange('breakDuration', parseInt(e.target.value))}
                                min="0"
                                max="60"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lab Duration (min)</label>
                              <input
                                type="number"
                                value={workingHours.labPeriodDuration}
                                onChange={(e) => handleWorkingHoursChange('labPeriodDuration', parseInt(e.target.value))}
                                min="90"
                                max="180"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Periods Per Day</label>
                              <input
                                type="number"
                                value={workingHours.maxPeriodsPerDay}
                                onChange={(e) => handleWorkingHoursChange('maxPeriodsPerDay', parseInt(e.target.value))}
                                min="1"
                                max="15"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Working Days</label>
                              <select
                                multiple
                                value={workingHours.workingDays}
                                onChange={(e) => {
                                  const selectedDays = Array.from(e.target.selectedOptions, option => option.value);
                                  handleWorkingHoursChange('workingDays', selectedDays);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Current Schedule Preview</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Working Hours:</span>
                              <span className="text-gray-900 dark:text-white">{workingHours.startTime} - {workingHours.endTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Lunch Break:</span>
                              <span className="text-gray-900 dark:text-white">{workingHours.lunchBreakStart} - {workingHours.lunchBreakEnd}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Theory Period:</span>
                              <span className="text-gray-900 dark:text-white">{workingHours.periodDuration} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Break Duration:</span>
                              <span className="text-gray-900 dark:text-white">{workingHours.breakDuration} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Lab Duration:</span>
                              <span className="text-gray-900 dark:text-white">{workingHours.labPeriodDuration} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Max Periods/Day:</span>
                              <span className="text-gray-900 dark:text-white">{workingHours.maxPeriodsPerDay}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Working Days:</span>
                              <span className="text-gray-900 dark:text-white">{workingHours.workingDays.length} days</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleSaveWorkingHours}
                          disabled={saving}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{saving ? 'Saving...' : 'Save Working Hours'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Academic Calendar Tab */}
                  {activeTab === 'calendar' && (
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Academic Calendar Settings</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Academic Year Start
                            </label>
                            <input
                              type="date"
                              value={academicCalendar.academicYearStart}
                              onChange={(e) => handleCalendarChange('academicYearStart', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Academic Year End
                            </label>
                            <input
                              type="date"
                              value={academicCalendar.academicYearEnd}
                              onChange={(e) => handleCalendarChange('academicYearEnd', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Semester 1 Start
                            </label>
                            <input
                              type="date"
                              value={academicCalendar.semester1Start}
                              onChange={(e) => handleCalendarChange('semester1Start', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Semester 1 End
                            </label>
                            <input
                              type="date"
                              value={academicCalendar.semester1End}
                              onChange={(e) => handleCalendarChange('semester1End', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Semester 2 Start
                            </label>
                            <input
                              type="date"
                              value={academicCalendar.semester2Start}
                              onChange={(e) => handleCalendarChange('semester2Start', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Semester 2 End
                            </label>
                            <input
                              type="date"
                              value={academicCalendar.semester2End}
                              onChange={(e) => handleCalendarChange('semester2End', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Total Teaching Weeks
                            </label>
                            <input
                              type="number"
                              value={academicCalendar.totalWeeks}
                              onChange={(e) => handleCalendarChange('totalWeeks', parseInt(e.target.value))}
                              min="12"
                              max="20"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Examination Weeks
                            </label>
                            <input
                              type="number"
                              value={academicCalendar.examWeeks}
                              onChange={(e) => handleCalendarChange('examWeeks', parseInt(e.target.value))}
                              min="1"
                              max="4"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleSaveAcademicCalendar}
                          disabled={saving}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{saving ? 'Saving...' : 'Save Calendar'}</span>
                        </button>
                      </div>
                    </div>
                  )}



                  {/* Advanced Constraints Tab */}
                  {activeTab === 'constraints' && (
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Advanced Scheduling Constraints</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Minimum Gap Between Exams (days)
                            </label>
                            <input
                              type="number"
                              value={constraintRules.minGapBetweenExams}
                              onChange={(e) => handleConstraintChange('minGapBetweenExams', parseInt(e.target.value))}
                              min="1"
                              max="7"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Maximum Subjects Per Day
                            </label>
                            <input
                              type="number"
                              value={constraintRules.maxSubjectsPerDay}
                              onChange={(e) => handleConstraintChange('maxSubjectsPerDay', parseInt(e.target.value))}
                              min="4"
                              max="8"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="preferMorningLabs"
                              checked={constraintRules.preferMorningLabs}
                              onChange={(e) => handleConstraintChange('preferMorningLabs', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="preferMorningLabs" className="text-sm text-gray-700 dark:text-gray-300">
                              Prefer scheduling labs in morning hours
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="avoidFridayAfternoon"
                              checked={constraintRules.avoidFridayAfternoon}
                              onChange={(e) => handleConstraintChange('avoidFridayAfternoon', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="avoidFridayAfternoon" className="text-sm text-gray-700 dark:text-gray-300">
                              Avoid Friday afternoon scheduling when possible
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="balanceWorkload"
                              checked={constraintRules.balanceWorkload}
                              onChange={(e) => handleConstraintChange('balanceWorkload', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="balanceWorkload" className="text-sm text-gray-700 dark:text-gray-300">
                              Balance daily workload across the week
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="groupSimilarSubjects"
                              checked={constraintRules.groupSimilarSubjects}
                              onChange={(e) => handleConstraintChange('groupSimilarSubjects', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="groupSimilarSubjects" className="text-sm text-gray-700 dark:text-gray-300">
                              Group similar subjects on same day
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="maintainTeacherContinuity"
                              checked={constraintRules.maintainTeacherContinuity}
                              onChange={(e) => handleConstraintChange('maintainTeacherContinuity', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="maintainTeacherContinuity" className="text-sm text-gray-700 dark:text-gray-300">
                              Maintain teacher continuity in sequential periods
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="prioritizePopularSlots"
                              checked={constraintRules.prioritizePopularSlots}
                              onChange={(e) => handleConstraintChange('prioritizePopularSlots', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="prioritizePopularSlots" className="text-sm text-gray-700 dark:text-gray-300">
                              Prioritize popular time slots for core subjects
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Constraint Summary</h4>
                        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          <p>• Active constraints will be considered during timetable generation</p>
                          <p>• These rules help optimize the schedule for better learning outcomes</p>
                          <p>• Conflicts between constraints will be resolved based on priority</p>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleSaveConstraintRules}
                          disabled={saving}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{saving ? 'Saving...' : 'Save Constraints'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handleBack}
                    className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back: Programs & Courses
                  </button>

                  <button
                    onClick={handleNext}
                    className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Generate Timetable
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

    </div>
  );
};

export default InfrastructureData;
