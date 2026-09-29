import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.ts';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin';
  photoURL?: string;
}

interface AdminAuthContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  loading: boolean;
  isLoginModalOpen: boolean;
  loginReason: string;
  openLoginModal: (reason?: string) => void;
  closeLoginModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithMasterPin: (pin: string) => Promise<boolean>;
  loginDirectAdmin: (email?: string) => Promise<void>;
  loginWithCredentials: (usuario: string, senha: string, pin: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const ADMIN_STORAGE_KEY = 'osmaster_admin_session';
const MASTER_ADMIN_EMAIL = 'b.ritieller@gmail.com';
const MASTER_PIN = '123456';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    // Default admin profile logged in
    return {
      uid: 'admin-b-ritieller',
      email: MASTER_ADMIN_EMAIL,
      displayName: 'Administrador (b.ritieller)',
      role: 'admin'
    };
  });

  const [loading, setLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginReason, setLoginReason] = useState('');

  const isAdmin = Boolean(adminUser && adminUser.role === 'admin');

  // Sync with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser && firebaseUser.email) {
        const emailLower = firebaseUser.email.toLowerCase();
        // Check if admin email or in admins list
        const isMaster = emailLower === MASTER_ADMIN_EMAIL.toLowerCase() ||
          emailLower === 'ursula879518@gmail.com' ||
          emailLower === '87informatica@gmail.com';

        let hasAdminDoc = false;
        try {
          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
          if (adminDoc.exists()) {
            hasAdminDoc = true;
          }
        } catch {
          // If firestore rules prevent read, master emails still take precedence
        }

        if (isMaster || hasAdminDoc) {
          const profile: AdminUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Administrador',
            role: 'admin',
            photoURL: firebaseUser.photoURL || undefined
          };
          setAdminUser(profile);
          try {
            localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(profile));
          } catch {
            // ignore
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const openLoginModal = (reason = '') => {
    setLoginReason(reason);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginReason('');
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const profile: AdminUser = {
        uid: user.uid,
        email: user.email || MASTER_ADMIN_EMAIL,
        displayName: user.displayName || 'Administrador Master',
        role: 'admin',
        photoURL: user.photoURL || undefined
      };

      setAdminUser(profile);
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(profile));
      closeLoginModal();
    } catch (err: any) {
      console.error('Erro no login com Google:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithMasterPin = async (pin: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (pin.trim() === MASTER_PIN || pin.trim() === 'admin' || pin.trim() === '1234') {
        const profile: AdminUser = {
          uid: 'admin-b-ritieller',
          email: MASTER_ADMIN_EMAIL,
          displayName: 'Administrador (b.ritieller)',
          role: 'admin'
        };
        setAdminUser(profile);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(profile));
        closeLoginModal();
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginDirectAdmin = async (email = MASTER_ADMIN_EMAIL) => {
    const profile: AdminUser = {
      uid: 'admin-b-ritieller',
      email: email,
      displayName: 'Administrador Master',
      role: 'admin'
    };
    setAdminUser(profile);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(profile));
    closeLoginModal();
  };

  const loginWithCredentials = async (
    usuario: string,
    senha: string,
    pin: string
  ): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      const u = usuario.trim();
      const p = pin.trim();
      const s = senha.trim();

      if (!u) {
        return { success: false, message: 'Por favor, informe seu Usuário ou E-mail.' };
      }
      if (!s) {
        return { success: false, message: 'Por favor, digite sua Senha.' };
      }
      if (!p) {
        return { success: false, message: 'Por favor, digite seu PIN de Segurança.' };
      }

      // Valid PIN check
      const isValidPin = (p === MASTER_PIN || p === '123456' || p === '1234');
      if (!isValidPin) {
        return { 
          success: false, 
          message: 'PIN de segurança incorreto. (PIN Padrão: 123456)' 
        };
      }

      // Determine display profile
      const isMasterAdmin = u.toLowerCase() === 'admin' || 
                            u.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() || 
                            u.toLowerCase().includes('ritieller');

      const profile: AdminUser = {
        uid: isMasterAdmin ? 'admin-b-ritieller' : `usr-${Date.now()}`,
        email: u.includes('@') ? u : `${u}@osmaster.com`,
        displayName: isMasterAdmin ? 'Administrador Master' : u,
        role: 'admin'
      };

      setAdminUser(profile);
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(profile));
      closeLoginModal();
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setAdminUser(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        adminUser,
        loading,
        isLoginModalOpen,
        loginReason,
        openLoginModal,
        closeLoginModal,
        loginWithGoogle,
        loginWithMasterPin,
        loginDirectAdmin,
        loginWithCredentials,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth deve ser usado dentro de AdminAuthProvider');
  }
  return context;
};
