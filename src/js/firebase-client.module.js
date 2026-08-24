import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserSessionPersistence,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';

const testDouble = window.JUNIPER_BACKEND_TEST_DOUBLE;

if (testDouble) {
  window.JuniperBackend = testDouble;
  window.dispatchEvent(new Event('juniper-backend-ready'));
} else {
  const firebaseConfig = {
    projectId: 'juniper-voice-assistant-nym',
    appId: '1:465750626776:web:25df7cc883689ce638a2ad',
    storageBucket: 'juniper-voice-assistant-nym.firebasestorage.app',
    apiKey: 'AIzaSyCzO3XTYogZVYOTRFUBJe2r33C8gJ8i-5E',
    authDomain: 'juniper-voice-assistant-nym.firebaseapp.com',
    messagingSenderId: '465750626776'
  };
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const functions = getFunctions(app, 'us-west1');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const local = ['127.0.0.1', 'localhost'].includes(window.location.hostname);

  if (local) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  }

  const ready = setPersistence(auth, browserSessionPersistence)
    .then(() => new Promise(resolve => {
      const unsubscribe = onAuthStateChanged(auth, user => {
        updateAuthStatus(user);
        unsubscribe();
        resolve(user);
      });
    }));

  function updateAuthStatus(user, message = '') {
    const status = document.getElementById('backendAuthStatus');
    const signInButton = document.getElementById('backendSignIn');
    const signOutButton = document.getElementById('backendSignOut');
    const bannerMessage = document.getElementById('voiceAccessMessage');
    const bannerSignIn = document.getElementById('voiceAccessSignIn');
    if (status) status.textContent = message || (user ? `Signed in as ${user.email || 'approved user'}` : 'Not signed in');
    if (signInButton) signInButton.hidden = Boolean(user);
    if (signOutButton) signOutButton.hidden = !user;
    if (bannerMessage) {
      bannerMessage.textContent = user
        ? 'Cloud voices ready · Device voice remains available'
        : 'Device voice ready · Sign in for cloud voices';
    }
    if (bannerSignIn) bannerSignIn.hidden = Boolean(user);
  }

  async function backendSignIn() {
    try {
      updateAuthStatus(null, 'Opening secure Google sign-in…');
      const credential = await signInWithPopup(auth, provider);
      updateAuthStatus(credential.user);
      return credential.user;
    } catch (error) {
      updateAuthStatus(null, error.message || 'Google sign-in did not open. Try again.');
      throw error;
    }
  }

  async function backendSignOut() {
    await signOut(auth);
    updateAuthStatus(null);
  }

  async function call(name, data) {
    await ready;
    if (!auth.currentUser) throw new Error('Sign in with an approved Google account first.');
    const response = await httpsCallable(functions, name)(data);
    return response.data;
  }

  window.JuniperBackend = Object.freeze({
    ready,
    currentUser: () => auth.currentUser,
    signIn: backendSignIn,
    signOut: backendSignOut,
    listVoices: () => call('listVoiceOptions', {}),
    synthesize: request => call('synthesizeVoice', request)
  });
  window.dispatchEvent(new Event('juniper-backend-ready'));
}
