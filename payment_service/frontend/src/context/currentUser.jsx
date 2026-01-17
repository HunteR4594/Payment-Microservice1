import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CurrentUserContext = createContext(null);

function safeGetQueryParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const role = params.get('role');
    return { userId, role };
  } catch {
    return { userId: null, role: null };
  }
}

function safeGetLocalStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocalStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export const CurrentUserProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => safeGetLocalStorage('ps_userId') || 'user_001');
  const [role, setRole] = useState(() => safeGetLocalStorage('ps_role') || 'user');

  useEffect(() => {
    // Allow upstream microservices to deep-link into payment UI:
    // e.g. /checkout/ord_123?userId=u_001&role=admin
    const qp = safeGetQueryParams();
    if (qp.userId) {
      setUserId(qp.userId);
      safeSetLocalStorage('ps_userId', qp.userId);
    }
    if (qp.role) {
      setRole(qp.role);
      safeSetLocalStorage('ps_role', qp.role);
    }
  }, []);

  const value = useMemo(() => {
    const normalizedRole = (role || 'user').toLowerCase();
    return {
      userId,
      role: normalizedRole,
      isAdmin: normalizedRole === 'admin',
      setUser: ({ userId: nextUserId, role: nextRole }) => {
        if (nextUserId) {
          setUserId(nextUserId);
          safeSetLocalStorage('ps_userId', nextUserId);
        }
        if (nextRole) {
          setRole(nextRole);
          safeSetLocalStorage('ps_role', nextRole);
        }
      },
    };
  }, [userId, role]);

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error('useCurrentUser must be used within CurrentUserProvider');
  }
  return ctx;
}
