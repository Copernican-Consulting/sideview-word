import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { initializeIcons } from '@fluentui/react';
import { TaskPane } from './components/TaskPane/TaskPane';
import { initializeDefaultPrompts } from './utils/promptLoader';
import './taskpane.css';

/* Initialize the Fluent UI icons */
initializeIcons();

let isOfficeInitialized = false;

const render = (Component: typeof TaskPane) => {
    ReactDOM.render(
        <React.StrictMode>
            <Component />
        </React.StrictMode>,
        document.getElementById('container')
    );
};

/* Render application after Office initializes */
Office.onReady(async info => {
    if (info.host === Office.HostType.Word) {
        try {
            // Initialize default prompts
            await initializeDefaultPrompts();
            
            isOfficeInitialized = true;
            render(TaskPane);
        } catch (error) {
            console.error('Error initializing add-in:', error);
            // Render error state
            ReactDOM.render(
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100vh',
                    padding: '20px',
                    textAlign: 'center',
                    color: '#a4262c'
                }}>
                    <h2>Error Initializing Add-in</h2>
                    <p>Failed to load required resources. Please try reloading the add-in.</p>
                </div>,
                document.getElementById('container')
            );
        }
    }
});

/* Initial render showing a loading message */
if (!isOfficeInitialized) {
    ReactDOM.render(
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh' 
        }}>
            <h1>Loading Office.js...</h1>
        </div>,
        document.getElementById('container')
    );
}
