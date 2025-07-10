import './App.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import Chatbot from './Components/Chatbot/chatbot';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TranslationProvider } from "./context/TranslationContext";

function App() {
  return (
    <>
    <NatakaChatbot />
    <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App