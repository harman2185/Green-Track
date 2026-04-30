/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
 const [token, setToken] = useState(() => localStorage.getItem("greentrack_token"));
 const [user, setUser] = useState(() => {
  const value = localStorage.getItem("greentrack_user");
  return value ? JSON.parse(value) : null;
 });

 useEffect(() => {
  if (token) {
   localStorage.setItem("greentrack_token", token);
  } else {
   localStorage.removeItem("greentrack_token");
  }
 }, [token]);

 useEffect(() => {
  if (user) {
   localStorage.setItem("greentrack_user", JSON.stringify(user));
  } else {
   localStorage.removeItem("greentrack_user");
  }
 }, [user]);

 const value = useMemo(
  () => ({
   token,
   user,
   isAuthenticated: Boolean(token),
   login: (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
   },
   logout: () => {
    setToken(null);
    setUser(null);
   },
  }),
  [token, user]
 );

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
 const context = useContext(AuthContext);
 if (!context) {
  throw new Error("useAuth must be used inside AuthProvider");
 }
 return context;
}
