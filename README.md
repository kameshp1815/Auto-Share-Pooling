# AutoSharePolling

## 🚀 Getting Started: Clone and Run

Follow these steps to clone this project and run it on your own machine:

### 1. Clone the Repository
```sh
git https://github.com/kameshp1815/Auto-Share-Pooling.git
cd AutoSharePolling
```

### 2. Set Up the Backend (Server)
```sh
cd server
npm install
```
- **Create a `.env` file in the `server/` directory** with the following content:
  ```
  MONGODB_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  ```
  - Replace `your_mongodb_connection_string` with your MongoDB URI (e.g., from MongoDB Atlas).
  - Replace `your_jwt_secret` with any random string (used for JWT signing).
- **Start the backend server:**
  ```sh
  npm start / node index.js
  ```

### 3. Set Up the Frontend (Client)
Open a new terminal window/tab, then:
```sh
cd client
npm install
```
- **Create a `.env` file in the `client/` directory** with the following content:
  ```
  VITE_LOCATIONIQ_API_KEY=your_locationiq_api_key
  ```
  - Replace `your_locationiq_api_key` with your LocationIQ API key (get one for free at https://locationiq.com/).
- **Start the frontend:**
  ```sh
  npm run dev
  ```

### 4. Open the App
- Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

# AutoSharePolling

A modern MERN stack ride-booking application inspired by Rapido, supporting both user and driver flows. Users can book rides, view history, and drivers can accept and complete rides. Built with React (Vite + Tailwind), Node.js/Express, and MongoDB.

---

## 🚗 Features

### User
- Register and login with JWT authentication
- Book rides with vehicle selection (Bike, Auto, Cab)
- Location autocomplete (LocationIQ, Tamil Nadu-wide)
- Real driving distance & fare calculation
- View booking history and ride details
- Profile management (view email, change password, logout)
- Modern, mobile-friendly UI

### Driver
- Driver login
- View available rides and accept them
- View and complete assigned rides
- Auto-refresh dashboard

### General
- Custom 404 page
- Secure API key handling via environment variables
- CORS and Vite proxy setup for smooth API calls

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **APIs:** LocationIQ (Autocomplete & Directions)

---

## 🔑 Environment Variables

### Server (`server/.env`)
- `MONGODB_URI` — Your MongoDB connection string
- `JWT_SECRET` — Secret for JWT token signing

### Client (`client/.env`)
- `VITE_LOCATIONIQ_API_KEY` — Your LocationIQ API key



---

## 📦 Folder Structure
```
AutoSharePolling/
  client/      # React frontend (Vite + Tailwind)
  server/      # Express backend (Node.js + MongoDB)
```

---

## 🧪 API Endpoints (Backend)
- `POST   /api/auth/register` — Register user/driver
- `POST   /api/auth/login` — Login user/driver
- `POST   /api/rides/book` — Book a ride
- `GET    /api/rides/history/:email` — User booking history
- `GET    /api/rides/available` — Available rides for drivers
- `POST   /api/rides/accept/:rideId` — Driver accepts ride
- `GET    /api/rides/driver/:email` — Driver's rides
- `POST   /api/rides/complete/:rideId` — Mark ride as completed

---

## 📝 Contribution
1. Fork the repo and create your branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## 📄 License
This project is for educational/demo purposes. Please check with the author before using in production.

---

## 🙏 Credits
- [LocationIQ](https://locationiq.com/) for geocoding and directions APIs
- [React Icons](https://react-icons.github.io/react-icons/)
- [Tailwind CSS](https://tailwindcss.com/) 