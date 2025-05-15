import * as React from 'react';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  company: string;
  role: string;
  plan: string;
  memberSince: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (email: string, password: string, fullName: string) => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState<UserInfo | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      const userData = await res.json();
  
      console.log("Dữ liệu nhận được từ backend:", userData);
  
      if (res.ok && userData && userData.id) {
  
        setIsAuthenticated(true);
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          company: "Chưa cập nhật",
          role: userData.role,
          plan: "Basic",
          memberSince: new Date(userData.created_at).toLocaleDateString()
        });
  
        localStorage.setItem('userId', userData.id.toString());
  
      } else {
        console.error("Dữ liệu user không hợp lệ:", userData);
        throw new Error("Dữ liệu user không có id");
      }
  
    } catch (err) {
      console.error("Lỗi kết nối API:", err);
    }
  };
  
  

  const register = async (email: string, password: string, fullName: string): Promise<void> => {
    // TODO: Implement actual registration logic here
    // For now, just simulate a successful registration
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');  
    window.location.reload();  
  };

  React.useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      fetch(`http://localhost:5000/api/users/${storedUserId}`)
        .then(res => res.json())
        .then(data => {
          setIsAuthenticated(true);
          setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            company: "Chưa cập nhật",
            role: data.role,
            plan: "Basic",
            memberSince: new Date(data.created_at).toLocaleDateString()
          });
        })
        .catch(err => console.error("Không lấy được thông tin user:", err));
    }
  }, []);
  
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 