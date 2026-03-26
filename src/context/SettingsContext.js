import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [settings, setSettings] = useState({
        sections: {
            students: true,
            teachers: true,
            attendance: true,
            grades: true,
            fees: true
        }
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            const res = await axios.get('/api/settings');
            setSettings(res.data);
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [user]);

    const updateSettings = async (newSections) => {
        try {
            const res = await axios.put('/api/settings', { sections: newSections });
            setSettings(res.data);
            return true;
        } catch (err) {
            console.error('Error updating settings:', err);
            return false;
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsContext;
