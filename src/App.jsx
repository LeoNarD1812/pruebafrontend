import { AuthProvider } from './context/AuthContext';
import AppRouter from './router/AppRouter';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
