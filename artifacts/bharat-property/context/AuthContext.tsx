import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserRole = "citizen" | "cpf" | "developer" | "govt" | "bank";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  pan: string;
  aadhaar: string;
  verifiedStatus: boolean;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

const DEMO_USERS: Record<string, User> = {
  citizen: {
    id: "USR001",
    name: "Rajesh Kumar Sharma",
    role: "citizen",
    phone: "9876543210",
    pan: "ABCPS1234D",
    aadhaar: "XXXX-XXXX-1234",
    verifiedStatus: true,
    email: "rajesh.sharma@gmail.com",
  },
  cpf: {
    id: "USR002",
    name: "Priya Mehta",
    role: "cpf",
    phone: "9123456780",
    pan: "XYZPM9876F",
    aadhaar: "XXXX-XXXX-5678",
    verifiedStatus: true,
    email: "priya.mehta@cpf.in",
  },
  developer: {
    id: "USR003",
    name: "Amit Builders Pvt. Ltd.",
    role: "developer",
    phone: "9000012345",
    pan: "DEVAB5432G",
    aadhaar: "XXXX-XXXX-9012",
    verifiedStatus: true,
    email: "amit.builders@dev.in",
  },
  govt: {
    id: "USR004",
    name: "Sub-Registrar K. Iyer",
    role: "govt",
    phone: "9700012345",
    pan: "GOVTK7654H",
    aadhaar: "XXXX-XXXX-3456",
    verifiedStatus: true,
    email: "k.iyer@maharashtra.gov.in",
  },
  bank: {
    id: "USR005",
    name: "SBI Home Loans Officer",
    role: "bank",
    phone: "9800012345",
    pan: "BANKS2345I",
    aadhaar: "XXXX-XXXX-7890",
    verifiedStatus: true,
    email: "homeloan@sbi.co.in",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("bpcs_user")
      .then((data) => {
        if (data) {
          setUser(JSON.parse(data));
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (phone: string, role: UserRole) => {
    const user = DEMO_USERS[role];
    await AsyncStorage.setItem("bpcs_user", JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem("bpcs_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
