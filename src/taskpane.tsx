import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { initializeIcons } from '@fluentui/react';
import { TaskPane } from './components/TaskPane/TaskPane';

/* Initialize the Fluent UI icons */
initializeIcons();

let isOfficeInitialized = false;

const render = (Component: typeof TaskPane) => {
    ReactDOM.render(
        <Component />,
        document.getElementById('container')
    );
};

/* Render application after Office initializes */
Office.onReady(info => {
    if (info.host === Office.HostType.Word) {
        isOfficeInitialized = true;
        render(TaskPane);
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
