import { envConfig } from "@/config/env-config";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";

// Global in-memory cache shared across all components and page transitions
let globalSessionUser = null;
let globalChecking = false;
let globalFetched = false;
let globalPromise = null;
const subscribers = new Set();

const notifySubscribers = () => {
  subscribers.forEach((callback) => {
    try {
      callback(globalSessionUser, globalChecking);
    } catch (e) {
      console.error(e);
    }
  });
};

export const updateGlobalSession = (newUser) => {
  globalSessionUser = newUser;
  globalFetched = true;
  globalChecking = false;
  notifySubscribers();
};

export const clearGlobalSession = () => {
  globalSessionUser = null;
  globalFetched = true;
  globalChecking = false;
  notifySubscribers();
};

export const fetchSessionUser = async (force = false) => {
  if (globalFetched && !force && globalSessionUser !== null) {
    return globalSessionUser;
  }
  if (globalPromise) {
    return globalPromise;
  }

  globalChecking = true;
  notifySubscribers();

  globalPromise = axios
    .get(envConfig.apiURL + "/auth/get-login-user", {
      withCredentials: true,
    })
    .then((res) => {
      if (res.status === 200) {
        globalSessionUser = res.data;
        globalFetched = true;
        return res.data;
      }
      globalSessionUser = null;
      globalFetched = true;
      return null;
    })
    .catch(() => {
      globalSessionUser = null;
      globalFetched = true;
      return null;
    })
    .finally(() => {
      globalChecking = false;
      globalPromise = null;
      notifySubscribers();
    });

  return globalPromise;
};

const useGetSession = () => {
  // Synchronous initialization with cached user - 0ms delay!
  const [user, setUser] = useState(globalSessionUser);
  const [checking, setChecking] = useState(!globalFetched && !globalSessionUser);

  useEffect(() => {
    const handleUpdate = (newUser, newChecking) => {
      setUser(newUser);
      setChecking(newChecking);
    };

    subscribers.add(handleUpdate);

    // If not fetched yet and no ongoing request, fetch now
    if (!globalFetched && !globalPromise) {
      fetchSessionUser();
    } else if (globalSessionUser !== user) {
      setUser(globalSessionUser);
      setChecking(globalChecking);
    }

    return () => {
      subscribers.delete(handleUpdate);
    };
  }, [user]);

  const refreshSession = useCallback(() => {
    return fetchSessionUser(true);
  }, []);

  return {
    user,
    checking,
    refreshSession,
  };
};

export { useGetSession, useGetSession as useGetSeesion };
export default useGetSession;
