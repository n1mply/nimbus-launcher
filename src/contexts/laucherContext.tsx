/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useState, useEffect, useContext } from "react";

const LauncherContext = createContext();

export function LauncherProvider({ children }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        const data = await window?.versions.getGameVersions();
        const allVersions = data.versions;
        // console.log(allVersions);
        setVersions(allVersions);
      } catch (err:any) {
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, []);

  return (
    <LauncherContext.Provider value={{ versions, loading, error }}>
      {children}
    </LauncherContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLauncher() {
  const context = useContext(LauncherContext);
  if (!context) {
    throw new Error("useMinecraft must be used within LauncherProvider");
  }
  return context;
}
