import React, { useState, forwardRef, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FiTrash2, FiCalendar, FiClock, FiChevronDown, FiAlertCircle, FiCheckCircle, FiCode, FiSearch } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, AnimatePresence } from 'framer-motion';

// Redux se user details aur token laane ke liye imports
import { selectUser, selectToken } from '../../../redux/authSlice';
import { getCoachId, getToken, debugAuthState } from '../../../utils/authUtils';

// --- Helper Functions (Sahayak Functions) ---
const dayNameToIndex = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const dayIndexToName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const formatDateToYMD = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// --- Custom UI Components (Khaas UI Components) ---
const CustomDatePickerInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <motion.div className="input-with-icon-right" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        <input
            type="text"
            className="styled-input datepicker-input"
            onClick={onClick}
            value={value}
            ref={ref}
            readOnly
            placeholder={placeholder}
        />
        <FiCalendar className="input-icon" />
    </motion.div>
));

// Custom Date Range Picker Input Component
const CustomDateRangeInput = forwardRef(({ value, onClick, placeholder, isStart }, ref) => (
    <motion.div className="date-range-input" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        <input
            type="text"
            className="styled-input date-range-picker-input"
            onClick={onClick}
            value={value}
            ref={ref}
            readOnly
            placeholder={placeholder}
        />
        <FiCalendar className="input-icon" />
        <span className="date-range-label">{isStart ? 'Start' : 'End'}</span>
    </motion.div>
));

// NEW: Single Calendar Component with Date Range Selection
const SingleCalendar = ({ startDate, endDate, onChange }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [tempStartDate, setTempStartDate] = useState(startDate);
    const [tempEndDate, setTempEndDate] = useState(endDate);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const calendarRef = useRef(null);

    // Handle click outside to close calendar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };

        if (showCalendar) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showCalendar]);

    const handleDateClick = (date) => {
        if (!tempStartDate || (tempStartDate && tempEndDate)) {
            // Start new selection
            setTempStartDate(date);
            setTempEndDate(null);
        } else {
            // Complete the selection
            if (date > tempStartDate) {
                setTempEndDate(date);
                // Apply the selection immediately
                onChange([tempStartDate, date]);
                setShowCalendar(false);
            } else {
                // Reset if end date is before start date
                setTempStartDate(date);
                setTempEndDate(null);
            }
        }
    };

    const handleApplyRange = () => {
        if (tempStartDate && tempEndDate) {
            onChange([tempStartDate, tempEndDate]);
            setShowCalendar(false);
        }
    };

    const handleClearRange = () => {
        setTempStartDate(null);
        setTempEndDate(null);
        onChange([null, null]);
        setShowCalendar(false);
    };

    const isDateInRange = (date) => {
        if (!tempStartDate || !tempEndDate) return false;
        return date >= tempStartDate && date <= tempEndDate;
    };

    const isDateSelected = (date) => {
        if (tempStartDate && formatDateToYMD(date) === formatDateToYMD(tempStartDate)) return true;
        if (tempEndDate && formatDateToYMD(date) === formatDateToYMD(tempEndDate)) return true;
        return false;
    };

    // Generate calendar days for current month
    const generateCalendarDays = (month) => {
        const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
        const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        const currentDate = new Date(startDate);
        
        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return days;
    };

    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev);
            newMonth.setMonth(prev.getMonth() + direction);
            return newMonth;
        });
    };

    const calendarDays = generateCalendarDays(currentMonth);
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    return (
        <>
            <div className="single-calendar-wrapper" ref={calendarRef}>
                <motion.div 
                    className="calendar-trigger"
                    onClick={() => setShowCalendar(!showCalendar)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="selected-dates-display">
                        <div className="date-field">
                            <span className="date-label">Start:</span>
                            <span className="date-value">
                                {startDate ? formatDateToYMD(startDate) : 'Select Start Date'}
                            </span>
                        </div>
                        <div className="date-separator">→</div>
                        <div className="date-field">
                            <span className="date-label">End:</span>
                            <span className="date-value">
                                {endDate ? formatDateToYMD(endDate) : 'Select End Date'}
                            </span>
                        </div>
                    </div>
                    <FiCalendar className="calendar-trigger-icon" />
                </motion.div>
            </div>

            {/* Calendar Modal - Outside the form container */}
            <AnimatePresence>
                {showCalendar && (
                    <>
                        <motion.div 
                            className="calendar-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setShowCalendar(false)}
                        />
                        <motion.div 
                            className="calendar-popup"
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                        <div className="calendar-header">
                            <motion.button 
                                className="nav-button"
                                onClick={() => navigateMonth(-1)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                ←
                            </motion.button>
                            <h4>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h4>
                            <motion.button 
                                className="nav-button"
                                onClick={() => navigateMonth(1)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                →
                            </motion.button>
                        </div>
                        
                        <div className="calendar-grid">
                            <div className="calendar-weekdays">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="weekday">{day}</div>
                                ))}
                            </div>
                            
                            <div className="calendar-days">
                                {calendarDays.map((day, index) => {
                                    const isToday = formatDateToYMD(day) === formatDateToYMD(new Date());
                                    const isPast = day < new Date().setHours(0, 0, 0, 0);
                                    const isInRange = isDateInRange(day);
                                    const isSelected = isDateSelected(day);
                                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                                    
                                    return (
                                        <motion.div
                                            key={index}
                                            className={`calendar-day ${isPast ? 'past' : ''} ${isInRange ? 'in-range' : ''} ${isSelected ? 'selected' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                                            onClick={() => !isPast && isCurrentMonth && handleDateClick(day)}
                                            whileHover={!isPast && isCurrentMonth ? { scale: 1.1 } : {}}
                                            whileTap={!isPast && isCurrentMonth ? { scale: 0.9 } : {}}
                                        >
                                            {day.getDate()}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="calendar-actions">
                            <motion.button
                                onClick={handleClearRange}
                                className="calendar-btn secondary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Clear
                            </motion.button>
                            <motion.button
                                onClick={handleApplyRange}
                                className="calendar-btn primary"
                                disabled={!tempStartDate || !tempEndDate}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Apply Range
                            </motion.button>
                        </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

const ApiFeedback = ({ status, message }) => {
    if (status === 'idle' || !message) return null;
    const Icon = status === 'success' ? FiCheckCircle : FiAlertCircle;
    const colorClass = status === 'success' ? 'success' : 'error';
    return (
        <motion.div
            className={`api-feedback ${colorClass}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
        >
            <Icon className="feedback-icon" />
            <span>{message}</span>
        </motion.div>
    );
};

// --- Main Component (Mukhya Component) ---
const AppointmentCalendar = ({ onCancel }) => {
    const authState = useSelector(state => state.auth);
    const user = authState?.user;
    const coachId = getCoachId(authState);
    const token = getToken(authState);
    const funnelId = useSelector(state => state.funnel?.funnelId);

    // Debug auth state
    debugAuthState(authState, 'AppointmentCalendar');

    // State ko manage karne ke liye initial settings
    const [settings, setSettings] = useState({
        workingHours: [],
        unavailableSlots: [],
        defaultAppointmentDuration: 30,
        bufferTime: 0,
        timeZone: 'Asia/Kolkata',
    });

    const [blockDateInput, setBlockDateInput] = useState(null);
    const [apiStatus, setApiStatus] = useState('idle');
    const [apiMessage, setApiMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // NEW: Debugging ke liye state. Yeh last bheje gaye payload ko store karega.
    const [lastPayload, setLastPayload] = useState(null);

    // NEW: Date Range Picker States
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [tempStartDate, setTempStartDate] = useState(null);
    const [tempEndDate, setTempEndDate] = useState(null);
    const [rangeApiStatus, setRangeApiStatus] = useState('idle');
    const [rangeApiMessage, setRangeApiMessage] = useState('');
    const [isRangeLoading, setIsRangeLoading] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    // API se coach ki availability settings fetch karne ka function
    const fetchAvailability = useCallback(async () => {
        if (!coachId || !token) {
            console.log('Coach ID ya token nahi mila.');
            setIsLoading(false);
            return;
        }

        setApiStatus('loading');
        setApiMessage('Aapki settings load ho rahi hain...');
        setIsLoading(true);

        try {
            const response = await fetch(`https://api.funnelseye.com/api/coach/${coachId}/availability`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            console.log('Fetched availability data:', result);

            if (!response.ok) {
                if (response.status === 404) {
                    setApiMessage('Aapki koi settings nahi mili. Kripya apni availability set karein.');
                    setSettings({
                        workingHours: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }],
                        unavailableSlots: [],
                        defaultAppointmentDuration: 30,
                        bufferTime: 0,
                        timeZone: 'Asia/Kolkata',
                    });
                } else {
                    throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
                }
                setApiStatus('idle');
                return;
            }
            
            const data = result.data || result;

            if (data) {
                let funnelSpecificSetting = null;
                if (funnelId && data.funnelSpecificSettings && Array.isArray(data.funnelSpecificSettings)) {
                    funnelSpecificSetting = data.funnelSpecificSettings.find(s => s.funnelId?.toString() === funnelId?.toString());
                }

                const unavailableSlots = (data.unavailableSlots || []).map(slot => ({
                    start: new Date(slot.start),
                    end: new Date(slot.end),
                    reason: slot.reason || 'Time Off'
                }));

                setSettings({
                    workingHours: data.workingHours?.length ? data.workingHours : [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }],
                    unavailableSlots: unavailableSlots,
                    defaultAppointmentDuration: funnelSpecificSetting?.defaultAppointmentDuration || data.defaultAppointmentDuration || 30,
                    bufferTime: funnelSpecificSetting?.bufferTime || data.bufferTime || 0,
                    timeZone: data.timeZone || 'Asia/Kolkata',
                });

                setApiStatus('success');
                setApiMessage('Settings safaltapoorvak load ho gayi.');
            }

        } catch (error) {
            console.error('Availability fetch karne mein error:', error);
            setApiStatus('error');
            setApiMessage(`Settings load karne mein विफल: ${error.message}`);
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                setApiMessage('');
                setApiStatus('idle');
            }, 3000);
        }
    }, [coachId, token, funnelId]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    // Form submit karne par data backend ko bhejne ka function
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!coachId || !token) {
            setApiStatus('error');
            setApiMessage('Authentication zaroori hai. Kripya dobara login karein.');
            return;
        }

        setApiStatus('loading');
        setApiMessage('Settings save ki jaa rahi hain...');
        setIsLoading(true);

        const payload = {
            workingHours: settings.workingHours.map(wh => ({
                dayOfWeek: parseInt(wh.dayOfWeek, 10),
                startTime: wh.startTime,
                endTime: wh.endTime
            })),
            unavailableSlots: settings.unavailableSlots.map(slot => ({
                start: slot.start.toISOString(),
                end: slot.end.toISOString(),
                reason: slot.reason || 'Time Off'
            })),
            defaultAppointmentDuration: parseInt(settings.defaultAppointmentDuration, 10),
            bufferTime: parseInt(settings.bufferTime, 10),
            timeZone: settings.timeZone,
        };

        if (funnelId) {
            payload.funnelSpecificSettings = [{
                funnelId: funnelId,
                defaultAppointmentDuration: parseInt(settings.defaultAppointmentDuration, 10),
                bufferTime: parseInt(settings.bufferTime, 10)
            }];
        }

        // NEW: Payload ko state mein save karein taaki UI mein dikha sakein
        setLastPayload(JSON.stringify(payload, null, 2));
        console.log('Final payload jo backend ko jaa raha hai:', JSON.stringify(payload, null, 2));

        try {
            const response = await fetch(`https://api.funnelseye.com/api/coach/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP ${response.status}: Settings save nahi hui`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            setApiStatus('success');
            setApiMessage(result.message || 'Settings safaltapoorvak save ho gayi!');
            setTimeout(fetchAvailability, 1000);

        } catch (error) {
            console.error('Availability save karne mein error:', error);
            setApiStatus('error');
            setApiMessage(error.message);
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                setApiMessage('');
                setApiStatus('idle');
            }, 5000);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const val = ['defaultAppointmentDuration', 'bufferTime'].includes(name) ? parseInt(value, 10) : value;
        setSettings(prev => ({ ...prev, [name]: val }));
    };

    const handleWorkingHoursChange = (dayIndex, field, value) => {
        setSettings(prev => ({
            ...prev,
            workingHours: prev.workingHours.map(wh =>
                wh.dayOfWeek === dayIndex ? { ...wh, [field]: value } : wh
            )
        }));
    };

    const handleDayToggle = (dayIndex) => {
        setSettings(prev => {
            const isDayActive = prev.workingHours.some(d => d.dayOfWeek === dayIndex);
            const newWorkingHours = isDayActive
                ? prev.workingHours.filter(d => d.dayOfWeek !== dayIndex)
                : [...prev.workingHours, { dayOfWeek: dayIndex, startTime: '09:00', endTime: '17:00' }]
                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
            return { ...prev, workingHours: newWorkingHours };
        });
    };

    const handleBlockDate = (date) => {
        if (!date) return;
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const dateStr = formatDateToYMD(startOfDay);

        const isAlreadyBlocked = settings.unavailableSlots.some(slot => formatDateToYMD(slot.start) === dateStr);
        if (isAlreadyBlocked) {
            setApiMessage('Yeh date pehle se hi block hai.');
            setApiStatus('error');
            setTimeout(() => { setApiStatus('idle'); setApiMessage(''); }, 3000);
            return;
        }

        const newSlot = { start: startOfDay, end: endOfDay, reason: 'Time Off' };
        setSettings(prev => ({ ...prev, unavailableSlots: [...prev.unavailableSlots, newSlot] }));
        setBlockDateInput(null);
        setApiMessage('Date block ho gayi. Changes apply karne ke liye "Save Settings" par click karein.');
        setApiStatus('success');
        setTimeout(() => { setApiMessage(''); setApiStatus('idle'); }, 3000);
    };

    const removeBlockedDate = (dateToRemove) => {
        const dateStrToRemove = formatDateToYMD(dateToRemove);
        setSettings(prev => ({
            ...prev,
            unavailableSlots: prev.unavailableSlots.filter(slot => formatDateToYMD(slot.start) !== dateStrToRemove)
        }));
        setApiMessage('Date unblock ho gayi. Changes apply karne ke liye "Save Settings" par click karein.');
        setApiStatus('success');
        setTimeout(() => { setApiMessage(''); setApiStatus('idle'); }, 3000);
    };

    // NEW: Date Range API Call Function
    const fetchDateRangeData = async (autoSave = false) => {
        if (!startDate || !endDate) {
            if (!autoSave) {
                setRangeApiStatus('error');
                setRangeApiMessage('Please select both start and end dates');
                setTimeout(() => { setRangeApiStatus('idle'); setRangeApiMessage(''); }, 3000);
            }
            return;
        }

        if (startDate > endDate) {
            setRangeApiStatus('error');
            setRangeApiMessage('Start date should be before end date');
            setTimeout(() => { setRangeApiStatus('idle'); setRangeApiMessage(''); }, 3000);
            return;
        }

        setRangeApiStatus('loading');
        setRangeApiMessage(autoSave ? 'Auto-saving date range...' : 'Fetching data for selected date range...');
        setIsRangeLoading(true);

        try {
            const startDateStr = formatDateToYMD(startDate);
            const endDateStr = formatDateToYMD(endDate);
            
            const apiUrl = `https://api.funnelseye.com/api/coach/availability?startDate=${startDateStr}&endDate=${endDateStr}`;
            
            console.log('Fetching data from:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Date range data fetched:', result);

            setRangeApiStatus('success');
            setRangeApiMessage(autoSave ? 
                `Date range auto-saved: ${startDateStr} to ${endDateStr}` : 
                `Data successfully fetched for ${startDateStr} to ${endDateStr}`
            );
            
            // You can process the result here as needed
            // For example, display it in a table or update some state

        } catch (error) {
            console.error('Date range API error:', error);
            setRangeApiStatus('error');
            setRangeApiMessage(`Error ${autoSave ? 'saving' : 'fetching'} data: ${error.message}`);
        } finally {
            setIsRangeLoading(false);
            setTimeout(() => {
                setRangeApiMessage('');
                setRangeApiStatus('idle');
            }, autoSave ? 2000 : 5000); // Shorter timeout for auto-save
        }
    };

    // NEW: Auto-save when both dates are selected
    useEffect(() => {
        if (startDate && endDate && startDate <= endDate) {
            // Debounce the auto-save to avoid multiple API calls
            const timer = setTimeout(() => {
                fetchDateRangeData(true);
            }, 1000); // 1 second delay after both dates are selected

            return () => clearTimeout(timer);
        }
    }, [startDate, endDate]);

    // Calendar helper functions
    const handleDateClick = (date) => {
        if (!tempStartDate || (tempStartDate && tempEndDate)) {
            // Start new selection
            setTempStartDate(date);
            setTempEndDate(null);
        } else {
            // Complete the selection
            if (date > tempStartDate) {
                setTempEndDate(date);
            } else {
                // Reset if end date is before start date
                setTempStartDate(date);
                setTempEndDate(null);
            }
        }
    };

    const handleClearRange = () => {
        setTempStartDate(null);
        setTempEndDate(null);
        setStartDate(null);
        setEndDate(null);
        setRangeApiMessage('');
        setRangeApiStatus('idle');
        setShowCalendar(false);
    };

    const handleApplyRange = () => {
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);
        setShowCalendar(false);
    };

    const isDateInRange = (date) => {
        if (!tempStartDate || !tempEndDate) return false;
        return date >= tempStartDate && date <= tempEndDate;
    };

    const isDateSelected = (date) => {
        if (tempStartDate && formatDateToYMD(date) === formatDateToYMD(tempStartDate)) return true;
        if (tempEndDate && formatDateToYMD(date) === formatDateToYMD(tempEndDate)) return true;
        return false;
    };

    // Generate calendar days for current month
    const generateCalendarDays = (month) => {
        const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        const currentDate = new Date(startDate);
        
        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return days;
    };

    const navigateMonth = (direction) => {
        // This will be handled by the SingleCalendar component
    };

    const currentMonth = new Date();
    const calendarDays = generateCalendarDays(currentMonth);
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    return (
        <>
            {/* Calendar Modal - Outside the form container */}
            <AnimatePresence>
                {showCalendar && (
                    <>
                        <motion.div 
                            className="calendar-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setShowCalendar(false)}
                        />
                        <motion.div 
                            className="calendar-popup"
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                        <div className="calendar-header">
                            <motion.button 
                                className="nav-button"
                                onClick={() => navigateMonth(-1)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                ←
                            </motion.button>
                            <h4>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h4>
                            <motion.button 
                                className="nav-button"
                                onClick={() => navigateMonth(1)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                →
                            </motion.button>
                        </div>
                        
                        <div className="calendar-grid">
                            <div className="calendar-weekdays">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="weekday">{day}</div>
                                ))}
                            </div>
                            
                            <div className="calendar-days">
                                {calendarDays.map((day, index) => {
                                    const isToday = formatDateToYMD(day) === formatDateToYMD(new Date());
                                    const isPast = day < new Date().setHours(0, 0, 0, 0);
                                    const isInRange = isDateInRange(day);
                                    const isSelected = isDateSelected(day);
                                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                                    
                                    return (
                                        <motion.div
                                            key={index}
                                            className={`calendar-day ${isPast ? 'past' : ''} ${isInRange ? 'in-range' : ''} ${isSelected ? 'selected' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                                            onClick={() => !isPast && isCurrentMonth && handleDateClick(day)}
                                            whileHover={!isPast && isCurrentMonth ? { scale: 1.1 } : {}}
                                            whileTap={!isPast && isCurrentMonth ? { scale: 0.9 } : {}}
                                        >
                                            {day.getDate()}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="calendar-actions">
                            <motion.button
                                onClick={handleClearRange}
                                className="calendar-btn secondary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Clear
                            </motion.button>
                            <motion.button
                                onClick={handleApplyRange}
                                className="calendar-btn primary"
                                disabled={!tempStartDate || !tempEndDate}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Apply Range
                            </motion.button>
                        </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="content-section">
            <div className="section-header">
                <h3 className="section-title">
                    {funnelId ? `Funnel-Specific Availability` : 'Global Availability Settings'}
                </h3>
                <p className="section-description">
                    {funnelId
                        ? `Yeh settings aapki global availability ko is funnel (ID: ${funnelId}) ke liye override karti hain.`
                        : 'Apni default availability set karein. Yeh settings sabhi funnels par lagu hongi jab tak override na ki jaayein.'
                    }
                </p>
            </div>

            <AnimatePresence>
                {apiMessage && (
                    <div className="api-feedback-wrapper">
                        <ApiFeedback status={apiStatus} message={apiMessage} />
                    </div>
                )}
            </AnimatePresence>

            {/* NEW: Date Range Picker Section - MOVED TO TOP */}
            <div className="date-range-section-top">

                <AnimatePresence>
                    {rangeApiMessage && (
                        <div className="api-feedback-wrapper">
                            <ApiFeedback status={rangeApiStatus} message={rangeApiMessage} />
                        </div>
                    )}
                </AnimatePresence>

                <div className="date-range-picker-container-top">
                    {/* Simple Date Range Trigger */}
                    <div className="simple-date-trigger" onClick={() => {
                        setTempStartDate(startDate);
                        setTempEndDate(endDate);
                        setShowCalendar(true);
                    }}>
                        <div className="date-display">
                            <div className="date-field">
                                <span className="label">Start:</span>
                                <span className="value">{startDate ? formatDateToYMD(startDate) : 'Select Start Date'}</span>
                            </div>
                            <div className="arrow">→</div>
                            <div className="date-field">
                                <span className="label">End:</span>
                                <span className="value">{endDate ? formatDateToYMD(endDate) : 'Select End Date'}</span>
                            </div>
                        </div>
                        <FiCalendar className="calendar-icon" />
                    </div>

                    <div className="date-range-actions">
                        <motion.button
                            type="button"
                            onClick={() => fetchDateRangeData(false)}
                            className="button-primary date-range-fetch-btn"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isRangeLoading || !startDate || !endDate}
                        >
                            <FiSearch className="button-icon" />
                            {isRangeLoading ? 'Loading...' : 'Manual Refresh'}
                        </motion.button>

                        <motion.button
                            type="button"
                            onClick={() => {
                                setStartDate(null);
                                setEndDate(null);
                                setRangeApiMessage('');
                                setRangeApiStatus('idle');
                            }}
                            className="button-secondary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Clear Range
                        </motion.button>
                    </div>

                    {startDate && endDate && (
                        <div className="selected-range-info">
                            <p className="range-info-text">
                                Selected range: <strong>{formatDateToYMD(startDate)}</strong> to <strong>{formatDateToYMD(endDate)}</strong>
                            </p>
                            {isRangeLoading && (
                                <div className="auto-save-indicator">
                                    <div className="auto-save-spinner"></div>
                                    <span>Auto-saving...</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="loading-indicator">Loading settings...</div>
            ) : (
                <>
                    {/* Available Days & Times */}
                    <div className="form-field">
                        <label>Available Days & Times</label>
                        <p className="field-note">Appointments ke liye apne available din chunein</p>
                        <div className="days-grid">
                            {Object.keys(dayNameToIndex).map(dayName => (
                                <motion.label
                                    key={dayName}
                                    className={`day-pill ${settings.workingHours.some(d => d.dayOfWeek === dayNameToIndex[dayName]) ? 'active' : ''}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={settings.workingHours.some(d => d.dayOfWeek === dayNameToIndex[dayName])}
                                        onChange={() => handleDayToggle(dayNameToIndex[dayName])}
                                        hidden
                                    />
                                    {dayName.substring(0, 3)}
                                </motion.label>
                            ))}
                        </div>
                    </div>

                    {/* Time Settings for Active Days */}
                    <AnimatePresence>
                        {settings.workingHours.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map(({ dayOfWeek, startTime, endTime }) => (
                            <motion.div
                                key={dayOfWeek}
                                className="time-row"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <span className="day-label">{dayIndexToName[dayOfWeek]}</span>
                                <div className="input-with-icon-right">
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => handleWorkingHoursChange(dayOfWeek, 'startTime', e.target.value)}
                                        className="styled-input"
                                    />
                                    <FiClock className="input-icon" />
                                </div>
                                <span>to</span>
                                <div className="input-with-icon-right">
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => handleWorkingHoursChange(dayOfWeek, 'endTime', e.target.value)}
                                        className="styled-input"
                                    />
                                    <FiClock className="input-icon" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Appointment Settings Grid */}
                    <div className="form-grid">
                        <div className="form-field">
                            <label>Appointment Duration</label>
                            <p className="field-note">Har appointment ki default avadhi</p>
                            <div className="custom-select-wrapper">
                                <select
                                    name="defaultAppointmentDuration"
                                    value={settings.defaultAppointmentDuration}
                                    onChange={handleInputChange}
                                    className="styled-select"
                                >
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">60 minutes</option>
                                    <option value="90">90 minutes</option>
                                    <option value="120">120 minutes</option>
                                </select>
                                <FiChevronDown className="select-icon" />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Buffer Time</label>
                            <p className="field-note">Appointments ke beech ka samay</p>
                            <div className="custom-select-wrapper">
                                <select
                                    name="bufferTime"
                                    value={settings.bufferTime}
                                    onChange={handleInputChange}
                                    className="styled-select"
                                >
                                    <option value="0">No buffer</option>
                                    <option value="5">5 minutes</option>
                                    <option value="10">10 minutes</option>
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                </select>
                                <FiChevronDown className="select-icon" />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Time Zone</label>
                            <p className="field-note">Aapka working time zone</p>
                            <div className="custom-select-wrapper">
                                <select
                                    name="timeZone"
                                    value={settings.timeZone}
                                    onChange={handleInputChange}
                                    className="styled-select"
                                >
                                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                                    <option value="America/New_York">Eastern Time (US & Canada)</option>
                                    <option value="America/Chicago">Central Time (US & Canada)</option>
                                    <option value="America/Denver">Mountain Time (US & Canada)</option>
                                    <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                    <option value="Europe/London">London, Dublin (GMT/BST)</option>
                                    <option value="Europe/Berlin">Central European Time</option>
                                </select>
                                <FiChevronDown className="select-icon" />
                            </div>
                        </div>
                    </div>

                    {/* Block Dates Section */}
                    <div className="form-field">
                        <label>Block Dates (Time Off)</label>
                        <p className="field-note">Aap jin taareekhon par anuplabdh hain, unhein chunein</p>
                        <div className="input-with-icon-right">
                            <DatePicker
                                selected={blockDateInput}
                                onChange={handleBlockDate}
                                minDate={new Date()}
                                customInput={<CustomDatePickerInput placeholder="Block karne ke liye date chunein" />}
                                excludeDates={settings.unavailableSlots.map(slot => slot.start)}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="Block karne ke liye date chunein"
                            />
                        </div>

                        <div className="blocked-dates-list">
                            {settings.unavailableSlots.length > 0 ? (
                                <div>
                                    <h4>Blocked Dates:</h4>
                                    <ul>
                                        {settings.unavailableSlots
                                            .sort((a, b) => a.start - b.start)
                                            .map((slot, index) => (
                                                <motion.li
                                                    key={`${formatDateToYMD(slot.start)}-${index}`}
                                                    className="blocked-date-item"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                >
                                                    <div className="blocked-date-info">
                                                        <span className="blocked-date">{formatDateToYMD(slot.start)}</span>
                                                        <span className="blocked-reason">({slot.reason || 'Time Off'})</span>
                                                    </div>
                                                    <motion.button
                                                        type="button"
                                                        onClick={() => removeBlockedDate(slot.start)}
                                                        className="remove-item-button"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <FiTrash2 />
                                                    </motion.button>
                                                </motion.li>
                                            ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="field-note no-blocked-dates">Abhi koi date block nahi hai.</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="content-actions">
                        <motion.button
                            type="button"
                            onClick={onCancel}
                            className="button-secondary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            type="submit"
                            className="button-primary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Settings'}
                        </motion.button>
                    </div>
                </>
            )}

            {/* NEW: Debugging Visualizer */}
            {lastPayload && (
                <div className="debug-visualizer">
                    <h4 className="debug-title">
                        <FiCode /> Last Sent Data (For Debugging)
                    </h4>
                    <p className="debug-description">
                        Yeh woh data hai jo aapke browser se backend ko bheja gaya tha. Agar ismein 'unavailableSlots' sahi hai, lekin save nahi ho raha, to samasya backend mein hai.
                    </p>
                    <pre className="debug-payload">{lastPayload}</pre>
                </div>
            )}

            <style jsx>{`
                .content-section { 
                    font-family: 'Inter', sans-serif; 
                    color: #333; 
                    max-width: 900px; 
                    margin: 0 auto; 
                    padding: 2rem; 
                    background: #fff; 
                    border-radius: 1rem; 
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
                }
                .section-header { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
                .section-title { font-size: 1.75rem; font-weight: 600; margin-bottom: 0.5rem; color: #2d3748; }
                .section-description { color: #718096; margin-bottom: 1rem; line-height: 1.5; }
                .api-feedback-wrapper { margin-bottom: 1.5rem; }
                .form-field { margin-bottom: 2rem; }
                label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: #2d3748; font-size: 1rem; }
                .field-note { color: #718096; font-size: 0.875rem; margin-bottom: 0.75rem; line-height: 1.4; }
                .styled-input, .styled-select { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 1rem; transition: all 0.2s ease; background-color: #fff; font-family: inherit; }
                .styled-input:focus, .styled-select:focus { outline: none; border-color: #4299e1; box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1); }
                .input-with-icon-right { position: relative; }
                .input-icon { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); color: #a0aec0; font-size: 1.1rem; pointer-events: none; }
                .days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; margin-bottom: 1rem; }
                .day-pill { display: flex; align-items: center; justify-content: center; padding: 0.75rem 0.5rem; border-radius: 0.5rem; background-color: #f7fafc; cursor: pointer; border: 1px solid #e2e8f0; font-weight: 500; transition: all 0.2s ease; user-select: none; font-size: 0.875rem; }
                .day-pill.active { background-color: #ebf8ff; color: #3182ce; border-color: #3182ce; font-weight: 600; }
                .day-pill:hover { background-color: #edf2f7; transform: translateY(-1px); }
                .time-row { display: grid; grid-template-columns: 100px 1fr auto 1fr; gap: 1rem; align-items: center; margin-bottom: 0.75rem; padding: 1rem; background-color: #f7fafc; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
                .day-label { font-weight: 600; color: #4a5568; font-size: 0.875rem; }
                .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
                .custom-select-wrapper { position: relative; }
                .styled-select { -webkit-appearance: none; -moz-appearance: none; appearance: none; cursor: pointer; padding-right: 2.5rem; }
                .select-icon { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); color: #a0aec0; pointer-events: none; font-size: 1.2rem; }
                .blocked-dates-list { margin-top: 1rem; }
                .blocked-dates-list h4 { font-size: 1rem; font-weight: 600; color: #4a5568; margin-bottom: 0.75rem; }
                .blocked-dates-list ul { padding: 0; list-style: none; margin: 0; }
                .blocked-date-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 0.5rem; margin-bottom: 0.5rem; }
                .blocked-date-info { display: flex; flex-direction: column; gap: 0.25rem; }
                .blocked-date { font-weight: 600; color: #2d3748; }
                .blocked-reason { font-size: 0.75rem; color: #718096; }
                .remove-item-button { background: transparent; border: none; color: #e53e3e; cursor: pointer; padding: 0.5rem; border-radius: 0.25rem; transition: all 0.2s ease; display: flex; align-items: center; font-size: 1.1rem; }
                .remove-item-button:hover { background-color: #fed7d7; color: #c53030; }
                .no-blocked-dates { font-style: italic; text-align: center; padding: 1rem; background-color: #f7fafc; border-radius: 0.5rem; border: 1px dashed #cbd5e0; }
                .content-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e2e8f0; }
                .button-primary { background-color: #3182ce; color: #fff; border: none; padding: 0.75rem 2rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; min-width: 150px; text-align: center; font-size: 1rem; }
                .button-primary:hover:not(:disabled) { background-color: #2c5aa0; }
                .button-primary:disabled { background-color: #a0aec0; cursor: not-allowed; }
                .button-secondary { background-color: #fff; color: #4a5568; border: 1px solid #e2e8f0; padding: 0.75rem 2rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-size: 1rem; }
                .button-secondary:hover:not(:disabled) { background-color: #f7fafc; border-color: #cbd5e0; }
                .button-secondary:disabled { background-color: #f7fafc; color: #a0aec0; cursor: not-allowed; }
                .api-feedback { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.5rem; font-weight: 500; border: 1px solid; flex-grow: 1; }
                .api-feedback.success { background-color: #f0fff4; color: #38a169; border-color: #9ae6b4; }
                .api-feedback.error { background-color: #fff5f5; color: #e53e3e; border-color: #feb2b2; }
                .loading-indicator { text-align: center; padding: 3rem; font-size: 1.2rem; color: #718096; }
                
                /* NEW: Debugging Visualizer Styles */
                .debug-visualizer {
                    margin-top: 2.5rem;
                    padding: 1.5rem;
                    background-color: #2d3748; /* Dark background */
                    color: #e2e8f0; /* Light text */
                    border-radius: 0.75rem;
                    border: 1px solid #4a5568;
                }
                .debug-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .debug-description {
                    font-size: 0.875rem;
                    color: #a0aec0;
                    margin-bottom: 1rem;
                    line-height: 1.5;
                }
                .debug-payload {
                    background-color: #1a202c; /* Even darker background for code */
                    padding: 1rem;
                    border-radius: 0.5rem;
                    white-space: pre-wrap; /* Ensures long lines wrap */
                    word-break: break-all;
                    font-family: 'Fira Code', 'Courier New', monospace;
                    font-size: 0.85rem;
                }

                /* NEW: Date Range Picker Styles */
                .date-range-section {
                    margin-bottom: 3rem;
                    padding: 2rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 1rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    position: relative;
                    overflow: hidden;
                }
                .date-range-section-top {
                    margin-bottom: 2rem;
                    padding: 2rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 1rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    position: relative;
                    overflow: visible;
                    z-index: 10;
                }
                .date-range-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
                    pointer-events: none;
                }
                .date-range-section-top::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
                    pointer-events: none;
                }
                .date-range-section .section-header {
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                    padding-bottom: 1rem;
                }
                .date-range-section .section-title {
                    color: #fff;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                .date-range-section .section-description {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 0.95rem;
                    line-height: 1.6;
                }
                .date-range-section-top .section-header {
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                    padding-bottom: 1rem;
                }
                .date-range-section-top .section-title {
                    color: #fff;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                .date-range-section-top .section-description {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 0.95rem;
                    line-height: 1.6;
                }
                .date-range-picker-container {
                    position: relative;
                    z-index: 1;
                }
                .date-range-picker-container-top {
                    position: relative;
                    z-index: 15;
                }
                .date-range-inputs {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: 1.5rem;
                    align-items: end;
                    margin-bottom: 1.5rem;
                }
                .date-range-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .date-range-field label {
                    color: #fff;
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .date-range-input {
                    position: relative;
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 0.75rem;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }
                .date-range-picker-input {
                    width: 100%;
                    padding: 1rem 3rem 1rem 1rem;
                    border: none;
                    background: transparent;
                    font-size: 1rem;
                    font-weight: 500;
                    color: #2d3748;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .date-range-picker-input:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 1);
                }
                .date-range-picker-input::placeholder {
                    color: #a0aec0;
                    font-weight: 400;
                }
                .date-range-input .input-icon {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #667eea;
                    font-size: 1.2rem;
                    pointer-events: none;
                }
                .date-range-label {
                    position: absolute;
                    top: 0.5rem;
                    left: 1rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #667eea;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    background: rgba(255, 255, 255, 0.9);
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                }
                .date-range-separator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem 0;
                }
                .date-range-separator span {
                    background: rgba(255, 255, 255, 0.2);
                    color: #fff;
                    padding: 0.75rem 1.5rem;
                    border-radius: 2rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .date-range-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-bottom: 1rem;
                }
                .date-range-fetch-btn {
                    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 0.75rem;
                    color: #fff;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
                    min-width: 160px;
                    justify-content: center;
                }
                .date-range-fetch-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
                }
                .date-range-fetch-btn:disabled {
                    background: rgba(255, 255, 255, 0.3);
                    color: rgba(255, 255, 255, 0.7);
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
                .button-icon {
                    font-size: 1.1rem;
                }
                .selected-range-info {
                    text-align: center;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .range-info-text {
                    color: #fff;
                    font-size: 0.95rem;
                    margin: 0;
                    font-weight: 500;
                }
                .range-info-text strong {
                    color: #fff;
                    font-weight: 700;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    margin: 0 0.25rem;
                }
                .auto-save-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.75rem;
                    padding: 0.5rem;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 0.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .auto-save-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid #fff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .auto-save-indicator span {
                    color: #fff;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                /* Simple Date Trigger Styles */
                .simple-date-trigger {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    position: relative;
                    overflow: hidden;
                }
                .simple-date-trigger:hover {
                    background: rgba(255, 255, 255, 1);
                    border-color: rgba(255, 255, 255, 0.5);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                }
                .date-display {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: 1.5rem;
                    align-items: center;
                }
                .date-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .date-field .label {
                    color: #667eea;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .date-field .value {
                    color: #2d3748;
                    font-size: 1rem;
                    font-weight: 500;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 0.5rem;
                    border: 1px solid #e2e8f0;
                    min-height: 1.2rem;
                    display: flex;
                    align-items: center;
                }
                .arrow {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.75rem;
                    background: rgba(102, 126, 234, 0.1);
                    border-radius: 50%;
                    color: #667eea;
                    font-weight: 600;
                    font-size: 1.2rem;
                    min-width: 40px;
                    min-height: 40px;
                }
                .simple-date-trigger .calendar-icon {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    color: #667eea;
                    font-size: 1.5rem;
                    pointer-events: none;
                }

                /* NEW: Single Calendar Component Styles */
                .single-calendar-wrapper {
                    position: relative;
                    width: 100%;
                }
                .calendar-trigger {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    position: relative;
                    overflow: hidden;
                }
                .calendar-trigger:hover {
                    background: rgba(255, 255, 255, 1);
                    border-color: rgba(255, 255, 255, 0.5);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                }
                .selected-dates-display {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: 1.5rem;
                    align-items: center;
                }
                .date-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .date-field .date-label {
                    color: #667eea;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .date-field .date-value {
                    color: #2d3748;
                    font-size: 1rem;
                    font-weight: 500;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 0.5rem;
                    border: 1px solid #e2e8f0;
                    min-height: 1.2rem;
                    display: flex;
                    align-items: center;
                }
                .date-separator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.75rem;
                    background: rgba(102, 126, 234, 0.1);
                    border-radius: 50%;
                    color: #667eea;
                    font-weight: 600;
                    font-size: 1.2rem;
                    min-width: 40px;
                    min-height: 40px;
                }
                .calendar-trigger-icon {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    color: #667eea;
                    font-size: 1.5rem;
                    pointer-events: none;
                }
                .calendar-popup {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #fff;
                    border-radius: 1rem;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                    border: 1px solid #e2e8f0;
                    z-index: 10000;
                    overflow: visible;
                    max-height: 600px;
                    min-width: 400px;
                    max-width: 90vw;
                    animation: calendarSlideIn 0.3s ease-out;
                }
                @keyframes calendarSlideIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -60%) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                .calendar-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                    backdrop-filter: blur(4px);
                }
                .close-btn {
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }
                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .btn-clear, .btn-apply {
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                .btn-clear {
                    background: #fff;
                    color: #4a5568;
                    border: 1px solid #e2e8f0;
                }
                .btn-clear:hover {
                    background: #f7fafc;
                    border-color: #cbd5e0;
                }
                .btn-apply {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #fff;
                }
                .btn-apply:hover:not(:disabled) {
                    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
                    transform: translateY(-1px);
                }
                .btn-apply:disabled {
                    background: #e2e8f0;
                    color: #a0aec0;
                    cursor: not-allowed;
                    transform: none;
                }
                .calendar-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #fff;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #e2e8f0;
                }
                .calendar-header h4 {
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: 600;
                    flex: 1;
                    text-align: center;
                }
                .calendar-date-display {
                    padding: 1.5rem;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }
                .selected-range-center {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                    background: #fff;
                    padding: 1rem 1.5rem;
                    border-radius: 0.75rem;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                .range-field {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                }
                .range-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #667eea;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .range-value {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #2d3748;
                    padding: 0.5rem 1rem;
                    background: #f7fafc;
                    border-radius: 0.5rem;
                    border: 1px solid #e2e8f0;
                    min-width: 120px;
                    text-align: center;
                }
                .range-arrow {
                    color: #667eea;
                    font-size: 1.5rem;
                    font-weight: 700;
                }
                .nav-button {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: #fff;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .nav-button:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.1);
                }
                .calendar-grid {
                    padding: 1.5rem;
                }
                .calendar-weekdays {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                .weekday {
                    text-align: center;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #718096;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 0.5rem;
                }
                .calendar-days {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 0.5rem;
                }
                .calendar-day {
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #2d3748;
                    transition: all 0.2s ease;
                    position: relative;
                }
                .calendar-day:hover {
                    background: #edf2f7;
                    color: #2d3748;
                }
                .calendar-day.past {
                    color: #cbd5e0;
                    cursor: not-allowed;
                }
                .calendar-day.past:hover {
                    background: transparent;
                    color: #cbd5e0;
                }
                .calendar-day.in-range {
                    background: rgba(102, 126, 234, 0.2);
                    color: #667eea;
                }
                .calendar-day.selected {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #fff;
                    font-weight: 600;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                }
                .calendar-day.selected:hover {
                    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
                }
                .calendar-day.other-month {
                    color: #cbd5e0;
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .calendar-day.other-month:hover {
                    background: transparent;
                    color: #cbd5e0;
                    transform: none;
                }
                .calendar-actions {
                    display: flex;
                    gap: 1rem;
                    padding: 1.5rem;
                    border-top: 1px solid #e2e8f0;
                    background: #f7fafc;
                }
                .calendar-btn {
                    flex: 1;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                }
                .calendar-btn.primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #fff;
                }
                .calendar-btn.primary:hover:not(:disabled) {
                    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }
                .calendar-btn.primary:disabled {
                    background: #e2e8f0;
                    color: #a0aec0;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
                .calendar-btn.secondary {
                    background: #fff;
                    color: #4a5568;
                    border: 1px solid #e2e8f0;
                }
                .calendar-btn.secondary:hover {
                    background: #f7fafc;
                    border-color: #cbd5e0;
                    transform: translateY(-1px);
                }

                @media (max-width: 768px) {
                    .content-section { padding: 1rem; }
                    .time-row { grid-template-columns: 1fr; gap: 0.75rem; text-align: center; }
                    .form-grid { grid-template-columns: 1fr; }
                    .content-actions { flex-direction: column-reverse; }
                    .button-primary, .button-secondary { width: 100%; }
                    .days-grid { grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); }
                    .blocked-date-item { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
                    .remove-item-button { align-self: flex-end; }
                    
                    /* Date Range Picker Mobile Styles */
                    .date-range-section { padding: 1.5rem 1rem; margin-bottom: 2rem; }
                    .date-range-section-top { padding: 1.5rem 1rem; margin-bottom: 2rem; }
                    .date-range-inputs { grid-template-columns: 1fr; gap: 1rem; }
                    .date-range-separator { padding: 0.5rem 0; }
                    .date-range-separator span { padding: 0.5rem 1rem; font-size: 0.8rem; }
                    .date-range-actions { flex-direction: column; gap: 0.75rem; }
                    .date-range-fetch-btn { width: 100%; min-width: auto; }
                    .date-range-picker-input { padding: 0.875rem 2.5rem 0.875rem 0.875rem; font-size: 0.95rem; }
                    .date-range-label { font-size: 0.7rem; top: 0.375rem; left: 0.875rem; }
                    
                    /* Single Calendar Mobile Styles */
                    .calendar-trigger { padding: 1rem; }
                    .selected-dates-display { grid-template-columns: 1fr; gap: 1rem; }
                    .date-separator { margin: 0 auto; }
                    .calendar-trigger-icon { top: 0.75rem; right: 0.75rem; font-size: 1.2rem; }
                    .calendar-popup { 
                        min-width: 320px; 
                        max-width: 95vw;
                        max-height: 80vh;
                        margin: 1rem;
                    }
                    .calendar-header { padding: 1rem; }
                    .calendar-header h4 { font-size: 1rem; }
                    .nav-button { width: 35px; height: 35px; font-size: 1rem; }
                    .calendar-grid { padding: 1rem; }
                    .calendar-day { font-size: 0.8rem; }
                    .calendar-actions { padding: 1rem; }
                    .calendar-btn { padding: 0.625rem 1rem; font-size: 0.8rem; }
                }
            `}</style>
        </form>
        </>
    );
};

export default AppointmentCalendar;
