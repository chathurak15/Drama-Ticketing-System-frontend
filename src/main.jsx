import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AboutUs from './Components/Pages/AboutUs.jsx'
import Actors from './Components/Pages/Actors.jsx';
import Contact from './Components/Pages/Contact.jsx';
import Dramas from './Components/Pages/Dramas.jsx';
import Login from './Components/Pages/Login.jsx';
import Shows from './Components/Pages/Shows.jsx';
import Home from './Components/Pages/Home.jsx';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    path: "/about",
    element: <AboutUs />,
  },
  {
    path: "/actors",
    element: <Actors />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/dramas",
    element: <Dramas />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/shows",
    element: <Shows />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
