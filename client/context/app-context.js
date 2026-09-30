"use client";
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer } from "react-toastify";

if (typeof window !== "undefined") {
  axios.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    config.withCredentials = true;
    return config;
  });
}

const appContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [prevPath, setPrevPath] = useState("");
  const [search, setSearch] = useState("");
  const [searchCtgs, setSearchCtgs] = useState([]);
  const [cart, setCart] = useState(0);
  const [bannerWidth, setBannerWidth] = useState(0);

  return (
    <appContext.Provider
      value={{
        prevPath,
        setPrevPath,
        search,
        setSearch,
        cart,
        setCart,
        searchCtgs,
        setSearchCtgs,
        bannerWidth,
        setBannerWidth,
      }}
    >
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="light"
      />
    </appContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(appContext);

  return context;
};
