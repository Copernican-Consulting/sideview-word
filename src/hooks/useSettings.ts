import { useState, useEffect } from 'react';
import { Settings, DEFAULT_SETTINGS, STORAGE_KEYS } from '../types/settings';

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedSettings = await Office.context.document.settings.get(STORAGE_KEYS.settings);
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
        } catch (err) {
            setError('Failed to load settings');
            console.error('Error loading settings:', err);
        }
    };

    const saveSettings = async (newSettings: Settings) => {
        try {
            await Office.context.document.settings.set(STORAGE_KEYS.settings, JSON.stringify(newSettings));
            await Office.context.document.settings.saveAsync();
            setSettings(newSettings);
            setError('');
        } catch (err) {
            setError('Failed to save settings');
            console.error('Error saving settings:', err);
        }
    };

    const resetSettings = async () => {
        try {
            await saveSettings(DEFAULT_SETTINGS);
        } catch (err) {
            setError('Failed to reset settings');
            console.error('Error resetting settings:', err);
        }
    };

    return {
        settings,
        saveSettings,
        resetSettings,
        error
    };
};
