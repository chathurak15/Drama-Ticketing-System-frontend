# Naataka.LK – Stage Drama Ticketing System (Frontend)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

**Naataka.LK** is a modern, web based **stage drama ticketing platform** designed to digitalize and enhance the Sri Lankan theatre industry.  
This repository contains the **Frontend application**, built using **React.js**, delivering a smooth and user friendly experience for audiences, organizers, and administrators.

🔴 **Live Site:**  
👉 https://nataka.chathurakavindu.me

---

## 📺 Live Demo Video

A complete walkthrough of the system including drama browsing, seat selection, booking flow, and admin features:

[![Naataka.LK Demo Video](https://img.youtube.com/vi/IJQm3H3ZFc0/0.jpg)](https://www.youtube.com/watch?v=IJQm3H3ZFc0)

---

## 🚀 Key Features

### 🎭 General Users
- Browse upcoming and ongoing stage dramas
- View drama details, cast information, ratings, and trailers
- Interactive **seat selection system** with real-time availability
- Secure ticket booking and booking history
- Responsive UI for mobile, tablet, and desktop

### 🎟️ Organizers
- Create and manage drama events
- Configure theatre seating or open-area ticketing
- Set custom ticket prices per category
- Track ticket sales and show performance

### 🛠️ Admin
- Role based user management
- System monitoring and oversight
- Secure access control

---

## 💺 Interactive Seat Booking System

- Visual seat map by category (VIP, Premium, Standard, Balcony)
- Real time seat status:
  - 🟢 Available  
  - 🔴 Booked  
  - 🟡 Temporarily Locked
- Supports **theatre seating** and **open-area general admission**

---

## 🔒 Authentication & Security

- JWT-based authentication
- Role based redirection:
  - Admin Dashboard
  - Organizer Dashboard
  - User Dashboard
- Protected routes using React Router

---

## 📱 Responsive Design

- Fully responsive layout
- Optimized for:
  - Desktop
  - Tablet
  - Mobile devices
- Built using Tailwind CSS, Bootstrap, and custom styles

---

## 🛠️ Tech Stack

| Category | Technology |
|--------|-----------|
| Framework | React.js |
| Language | JavaScript (ES6+) |
| Styling | Tailwind CSS, CSS, Bootstrap |
| Routing | React Router DOM |
| State Management | React Context API & Hooks |
| HTTP Client | Axios |
| Build Tool | NPM |
| Hosting | AWS |

---

## ⚙️ Installation & Setup

Follow the steps below to run the frontend locally.

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/chathurak15/Drama-Ticketing-System-frontend.git
cd Drama-Ticketing-System-frontend
````

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory and add:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
```

### 4️⃣ Run the Application

```bash
npm start
```

The application will be available at:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🔗 Backend Repository

This frontend connects to a **Java Spring Boot backend**.

👉 **Backend Repository:**
[https://github.com/chathurak15/Drama-Ticketing-System-backend](https://github.com/chathurak15/Drama-Ticketing-System-backend)

---

## 📞 Contact

For questions, feedback, or collaboration:

* 📧 **Email:** [chathurakavindu@example.com](mailto:chathurakavindu@example.com)
* 💼 **LinkedIn:** [https://www.linkedin.com/in/chathura-kavindu/](https://www.linkedin.com/in/chathura-kavindu/)

---

## ❤️ Acknowledgment

Made with passion ❤️ to support and uplift the **Sri Lankan theatre industry** 🇱🇰
**Naataka.LK – Where Drama Meets Technology**

```

