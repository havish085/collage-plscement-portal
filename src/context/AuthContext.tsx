import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import toast from 'react-hot-toast';

export type UserRole = 'STUDENT' | 'COMPANY_HR' | 'TPO_ADMIN';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  phone?: string;
  companyName?: string; // For HR
  isApproved?: boolean; // For HR / Students
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  signInWithGoogle: (requestedRole?: UserRole) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string, role: UserRole, extra?: any) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileState: (profile: Partial<UserProfile>) => void;
  isMock: boolean;
  setMockUser: (mockUser: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Define mock data for easy offline/fallback demo access
const MOCK_PROFILES: Record<string, UserProfile> = {
  'student-demo@test.com': {
    uid: 'mock-student-id',
    name: 'Aravind Sharma',
    email: 'student-demo@test.com',
    role: 'STUDENT',
    createdAt: new Date().toISOString(),
    phone: '9876543210',
    isApproved: true
  },
  'hr-demo@test.com': {
    uid: 'mock-hr-id',
    name: 'Sarah Jenkins',
    email: 'hr-demo@test.com',
    role: 'COMPANY_HR',
    createdAt: new Date().toISOString(),
    phone: '9123456789',
    companyName: 'Google India',
    isApproved: true
  },
  'tpo-demo@test.com': {
    uid: 'mock-tpo-id',
    name: 'Dr. Rajesh Nair',
    email: 'tpo-demo@test.com',
    role: 'TPO_ADMIN',
    createdAt: new Date().toISOString(),
    phone: '9998887776',
    isApproved: true
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  // Automatically load mock user if saved in localStorage for persistence during dev reload
  useEffect(() => {
    const savedMock = localStorage.getItem('cpp_mock_user');
    if (savedMock) {
      try {
        const parsed = JSON.parse(savedMock) as UserProfile;
        setUserProfile(parsed);
        setUser({
          uid: parsed.uid,
          email: parsed.email,
          displayName: parsed.name,
          emailVerified: true,
        } as any);
        setIsMock(true);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('cpp_mock_user');
      }
    }

    // Standard Firebase Auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsMock(false);
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // Document doesn't exist, might be a Google Sign-In for the first time
            // Let's create a default profile and prompt them or default to student
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Placement Portal User',
              email: firebaseUser.email || '',
              role: 'STUDENT', // Default to Student, can change during setup
              createdAt: new Date().toISOString(),
              isApproved: true
            };
            await setDoc(docRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error: any) {
          console.error("Firestore read error:", error);
          toast.error("Could not fetch user profile from Firestore. Operating in local mode.");
          // Create a temp profile to avoid breaking the UI
          setUserProfile({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Demo User',
            email: firebaseUser.email || '',
            role: 'STUDENT',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (requestedRole: UserRole = 'STUDENT') => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const newProfile: UserProfile = {
          uid: result.user.uid,
          name: result.user.displayName || 'Google User',
          email: result.user.email || '',
          role: requestedRole,
          createdAt: new Date().toISOString(),
          isApproved: requestedRole === 'STUDENT' // Students auto-approved, HR needs TPO approval optionally
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      } else {
        setUserProfile(userDoc.data() as UserProfile);
      }
      toast.success('Successfully logged in with Google!');
    } catch (error: any) {
      console.error(error);
      // If popup is blocked or Firebase configuration is incorrect, let's log in a mock Google user
      toast.error('Google Sign-in failed. Logging in with a mock account.');
      const mockProfile: UserProfile = {
        uid: 'mock-google-user-id',
        name: 'Google Demo Student',
        email: 'google-demo@test.com',
        role: requestedRole,
        createdAt: new Date().toISOString(),
        isApproved: true
      };
      setMockUser(mockProfile);
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string, role: UserRole, extra?: any) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      const newProfile: UserProfile = {
        uid: result.user.uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
        isApproved: role !== 'COMPANY_HR', // Company HR requires TPO admin approval in production
        ...extra
      };

      await setDoc(doc(db, 'users', result.user.uid), newProfile);
      setUserProfile(newProfile);
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error(error);
      // Fallback in case of registration issues
      toast.error(`Registration failed: ${error.message || 'Creating local demo session instead.'}`);
      const mockProfile: UserProfile = {
        uid: `mock-${Date.now()}`,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
        isApproved: true,
        ...extra
      };
      setMockUser(mockProfile);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Check if it's one of the mock credentials for easy bypass
      if (MOCK_PROFILES[email] && password === 'admin123') {
        setMockUser(MOCK_PROFILES[email]);
        toast.success(`Success! Logged in as Demo ${MOCK_PROFILES[email].role}`);
        setLoading(false);
        return;
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDocSnap = await getDoc(doc(db, 'users', result.user.uid));
      if (userDocSnap.exists()) {
        setUserProfile(userDocSnap.data() as UserProfile);
      }
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error(error);
      // Check if the user wants fallback bypass
      if (MOCK_PROFILES[email]) {
        toast.error(`Firebase error: ${error.message}. Logging in with offline DEMO bypass.`);
        setMockUser(MOCK_PROFILES[email]);
      } else {
        toast.error(`Authentication failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      if (isMock) {
        localStorage.removeItem('cpp_mock_user');
        setUser(null);
        setUserProfile(null);
        setIsMock(false);
        toast.success('Logged out successfully.');
      } else {
        await signOut(auth);
        toast.success('Logged out successfully.');
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Logout error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message || 'Error sending password reset email.');
    }
  };

  const setMockUser = (mockProfile: UserProfile | null) => {
    if (mockProfile) {
      setUserProfile(mockProfile);
      setUser({
        uid: mockProfile.uid,
        email: mockProfile.email,
        displayName: mockProfile.name,
        emailVerified: true,
      } as any);
      setIsMock(true);
      localStorage.setItem('cpp_mock_user', JSON.stringify(mockProfile));
    } else {
      setUser(null);
      setUserProfile(null);
      setIsMock(false);
      localStorage.removeItem('cpp_mock_user');
    }
  };

  const updateProfileState = (updatedProfile: Partial<UserProfile>) => {
    if (userProfile) {
      const newProfile = { ...userProfile, ...updatedProfile } as UserProfile;
      setUserProfile(newProfile);
      if (isMock) {
        localStorage.setItem('cpp_mock_user', JSON.stringify(newProfile));
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      role: userProfile?.role || null,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      logout,
      resetPassword,
      updateProfileState,
      isMock,
      setMockUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
