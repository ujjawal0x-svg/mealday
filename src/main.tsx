import React from 'react';import {createRoot} from 'react-dom/client';import {MealdayApp10IndividualScreens} from './App';createRoot(document.getElementById('root')!).render(<MealdayApp10IndividualScreens/>);
if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/image-cache-sw.js').catch(()=>{});});}
