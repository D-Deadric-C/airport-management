import React, { useState, useEffect } from "react";
import { api } from "./api";

// -------- Login component --------
function Login({ onLogin, switchToRegister }) {
  const [email, setEmail] = useState("admin@mail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api.login(email, password);
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3>Welcome back</h3>
      <p style={{ opacity: 0.8, fontSize: "0.85rem" }}>
        Sign in to manage flights, bookings and more.
      </p>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Login</button>
      <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
        No account?{" "}
        <button
          type="button"
          onClick={switchToRegister}
          style={{
            background: "transparent",
            border: "none",
            color: "#60a5fa",
            padding: 0,
          }}
        >
          Register with OTP
        </button>
      </p>
    </form>
  );
}

// -------- Register with OTP --------
function Register({ onRegistered, switchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [serverOtp, setServerOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const sendOtp = async () => {
    setErr("");
    setMsg("");
    if (!phone) {
      setErr("Phone is required");
      return;
    }
    try {
      const res = await api.requestOtp(phone);
      setOtpSent(true);
      setServerOtp(res.otp); // demo: show OTP from backend
      setMsg("OTP sent (demo). Check below.");
    } catch (e) {
      setErr(e.response?.data?.error || "Error sending OTP");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!otpSent) {
      setErr("Please request OTP first");
      return;
    }
    try {
      const payload = {
        name,
        email,
        password,
        phone,
        age: age ? Number(age) : null,
        otp,
        role: "passenger",
      };
      const data = await api.register(payload);
      setMsg("Registration complete! Logging you in...");
      onRegistered(data); // auto-login
    } catch (e) {
      setErr(e.response?.data?.error || "Error registering");
    }
  };

  return (
    <form onSubmit={handleRegister} className="card">
      <h3>Create account</h3>
      <p style={{ opacity: 0.8, fontSize: "0.85rem" }}>
        Register with phone + OTP. Student discounts apply automatically for{" "}
        <code>.edu</code> emails.
      </p>
      <input
        placeholder="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Email (use .edu for student discount)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button type="button" onClick={sendOtp}>
          Send OTP
        </button>
      </div>
      {otpSent && (
        <p style={{ fontSize: "0.8rem", opacity: 0.9 }}>
          Demo OTP (from backend): <strong>{serverOtp}</strong>
        </p>
      )}
      {msg && <p>{msg}</p>}
      {err && <p className="error">{err}</p>}

      <button type="submit" style={{ marginTop: "0.4rem" }}>
        Register & Login
      </button>
      <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
        Already have an account?{" "}
        <button
          type="button"
          onClick={switchToLogin}
          style={{
            background: "transparent",
            border: "none",
            color: "#60a5fa",
            padding: 0,
          }}
        >
          Back to login
        </button>
      </p>
    </form>
  );
}

// -------- Booking section (for passengers) --------
function BookingSection({ user, flight, onBooked }) {
  const [numSeats, setNumSeats] = useState(1);
  const [msg, setMsg] = useState("");
  const [bagTag, setBagTag] = useState("");
  const [priceInfo, setPriceInfo] = useState(null);

  const handleBook = async () => {
    setMsg("");
    setBagTag("");
    setPriceInfo(null);
    try {
      const booking = await api.bookFlight({
        user_id: user.id,
        flight_id: flight.id,
        num_seats: numSeats,
      });

      // create baggage tag linked to this booking
      const tag = `BAG-${booking.id}-${Date.now().toString().slice(-4)}`;
      await api.createBaggage({
        tag_number: tag,
        booking_id: booking.id,
        status: "Checked-in",
        last_location: `${flight.source} Airport`,
      });

      setMsg("Booking successful!");
      setBagTag(tag);
      setPriceInfo({
        base: booking.base_price,
        final: booking.final_price,
        reason: booking.discount_reason,
      });

      if (onBooked) onBooked(booking);
    } catch (e) {
      setMsg(e.response?.data?.error || "Error booking");
    }
  };

  return (
    <div className="card">
      <h4>Book {flight.code}</h4>
      <p>
        {flight.source} → {flight.destination} | Available:{" "}
        {flight.available_seats} | Status: {flight.status}
      </p>
      <input
        type="number"
        min="1"
        value={numSeats}
        onChange={(e) => setNumSeats(Number(e.target.value))}
      />
      <button onClick={handleBook}>Confirm Booking</button>
      {msg && <p>{msg}</p>}
      {bagTag && (
        <p>
          Your baggage tag: <strong>{bagTag}</strong>
        </p>
      )}
      {priceInfo && (
        <p style={{ fontSize: "0.85rem" }}>
          Base: ₹{priceInfo.base} | Final: ₹{priceInfo.final}{" "}
          {priceInfo.reason && <>({priceInfo.reason})</>}
        </p>
      )}
    </div>
  );
}

// -------- Flights (view + create) --------
function Flights({ user }) {
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [error, setError] = useState("");

  const [newFlight, setNewFlight] = useState({
    code: "",
    source: "",
    destination: "",
    departure_time: "",
    arrival_time: "",
    total_seats: 100,
  });

  useEffect(() => {
    api.getFlights().then(setFlights);
    api.getAirports().then(setAirports);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const created = await api.createFlight(newFlight);
      setFlights((prev) => [...prev, created]);
      setNewFlight({
        code: "",
        source: "",
        destination: "",
        departure_time: "",
        arrival_time: "",
        total_seats: 100,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Error creating flight");
    }
  };

  return (
    <div className="card">
      <h3>Flights</h3>
      {flights.length === 0 && <p>No flights yet</p>}
      {flights.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>From</th>
              <th>To</th>
              <th>Dep</th>
              <th>Arr</th>
              <th>Total</th>
              <th>Available</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((f) => (
              <tr key={f.id} onClick={() => setSelectedFlight(f)}>
                <td>{f.code}</td>
                <td>{f.source}</td>
                <td>{f.destination}</td>
                <td>{f.departure_time}</td>
                <td>{f.arrival_time}</td>
                <td>{f.total_seats}</td>
                <td>{f.available_seats}</td>
                <td>{f.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {user.role === "admin" && (
        <>
          <h4>Add Flight</h4>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleCreate} className="inline-form">
            <input
              placeholder="Code"
              value={newFlight.code}
              onChange={(e) =>
                setNewFlight({ ...newFlight, code: e.target.value })
              }
            />
            <select
              value={newFlight.source}
              onChange={(e) =>
                setNewFlight({ ...newFlight, source: e.target.value })
              }
            >
              <option value="">Source</option>
              {airports.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.code} – {a.city}
                </option>
              ))}
            </select>
            <select
              value={newFlight.destination}
              onChange={(e) =>
                setNewFlight({ ...newFlight, destination: e.target.value })
              }
            >
              <option value="">Destination</option>
              {airports.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.code} – {a.city}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={newFlight.departure_time}
              onChange={(e) =>
                setNewFlight({
                  ...newFlight,
                  departure_time: e.target.value,
                })
              }
            />
            <input
              type="datetime-local"
              value={newFlight.arrival_time}
              onChange={(e) =>
                setNewFlight({
                  ...newFlight,
                  arrival_time: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Total seats"
              value={newFlight.total_seats}
              onChange={(e) =>
                setNewFlight({
                  ...newFlight,
                  total_seats: Number(e.target.value),
                })
              }
            />
            <button type="submit">Create</button>
          </form>
        </>
      )}

      {user.role === "passenger" && selectedFlight && (
        <BookingSection
          user={user}
          flight={selectedFlight}
          onBooked={() => {
            api.getFlights().then(setFlights);
          }}
        />
      )}
    </div>
  );
}

// -------- My Bookings --------
function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.myBookings(user.id).then(setBookings);
  }, [user.id]);

  return (
    <div className="card">
      <h3>My Bookings</h3>
      {bookings.length === 0 && <p>No bookings yet</p>}
      <ul>
        {bookings.map((b) => (
          <li key={b.id}>
            {b.flight.code} – {b.flight.source} → {b.flight.destination} (
            {b.status}) | Seats: {b.num_seats}
          </li>
        ))}
      </ul>
    </div>
  );
}

// -------- Booking & Payment History (uses backend prices) --------
function History({ user }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.myBookings(user.id).then(setBookings);
  }, [user.id]);

  return (
    <div className="card">
      <h3>Booking & Payment History</h3>
      {bookings.length === 0 && <p>No bookings yet</p>}
      <ul>
        {bookings.map((b) => (
          <li key={b.id}>
            {b.flight.code} – {b.flight.source} → {b.flight.destination} |{" "}
            Seats: {b.num_seats} | Status: {b.status} | Base: ₹
            {b.base_price} | Final: ₹{b.final_price}{" "}
            {b.discount_reason && <>({b.discount_reason})</>}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
        * Prices come from backend (demo only).
      </p>
    </div>
  );
}

// -------- Feedback --------
function FeedbackPanel({ user }) {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [allList, setAllList] = useState([]);
  const [myList, setMyList] = useState([]);

  const refreshFeedback = () => {
    api.listFeedback().then(setAllList);
    api.myFeedback(user.id).then(setMyList);
  };

  const send = async () => {
    if (!message) return;
    await api.sendFeedback({ user_id: user.id, message, rating });
    setMessage("");
    refreshFeedback();
  };

  useEffect(() => {
    refreshFeedback();
  }, []);

  return (
    <div className="card">
      <h3>Feedback</h3>
      <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
        Your feedback is stored in the airport database and visible to admins.
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write feedback"
      />
      <input
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      />
      <button onClick={send}>Submit</button>

      <h4>My Feedback</h4>
      {myList.length === 0 && <p>No feedback yet</p>}
      <ul>
        {myList.map((f) => (
          <li key={f.id}>
            [{new Date(f.created_at).toLocaleString()}] {f.message} (
            {f.rating}/5)
          </li>
        ))}
      </ul>

      {user.role === "admin" && (
        <>
          <h4>All Feedback (Admin)</h4>
          <ul>
            {allList.map((f) => (
              <li key={f.id}>
                {f.user.name}: {f.message} ({f.rating}/5) –{" "}
                {new Date(f.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
          <a
            href={api.feedbackCsvUrl}
            style={{ fontSize: "0.8rem", color: "#38bdf8" }}
          >
            Download feedback CSV
          </a>
        </>
      )}
    </div>
  );
}

// -------- Baggage --------
function BaggageLookup() {
  const [tag, setTag] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const search = async () => {
    setError("");
    setResult(null);
    if (!tag) return;
    try {
      const data = await api.searchBaggage(tag);
      setResult(data);
    } catch (e) {
      setError("Not found");
    }
  };

  return (
    <div className="card">
      <h3>Baggage Tracking</h3>
      <input
        placeholder="Tag number"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
      />
      <button onClick={search}>Search</button>
      {error && <p className="error">{error}</p>}
      {result && (
        <p>
          Tag {result.tag_number}: {result.status} – {result.last_location}
        </p>
      )}
    </div>
  );
}

// -------- Change Password --------
function ChangePassword({ user }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleChange = async () => {
    setMsg("");
    if (!oldPassword || !newPassword) {
      setMsg("Both fields required");
      return;
    }
    try {
      const res = await api.changePassword({
        user_id: user.id,
        old_password: oldPassword,
        new_password: newPassword,
      });
      setMsg(res.message || "Password updated");
      setOldPassword("");
      setNewPassword("");
    } catch (e) {
      setMsg(e.response?.data?.error || "Error changing password");
    }
  };

  return (
    <div className="card">
      <h3>Change Password</h3>
      <input
        type="password"
        placeholder="Old password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleChange}>Update Password</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}

// -------- Profile --------
function Profile({ user, onUserUpdate }) {
  const [profile, setProfile] = useState(user);
  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age || "");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.getUser(user.id).then((u) => {
      setProfile(u);
      setName(u.name);
      setAge(u.age || "");
    });
  }, [user.id]);

  const handleSave = async () => {
    setMsg("");
    try {
      const updated = await api.updateUser(user.id, {
        name,
        age: age ? Number(age) : null,
      });
      setProfile(updated);
      onUserUpdate(updated);
      localStorage.setItem("ams_user", JSON.stringify(updated));
      setMsg("Profile updated");
    } catch (e) {
      setMsg(e.response?.data?.error || "Error updating profile");
    }
  };

  const ageText =
    profile.age == null
      ? "Age not set"
      : profile.age >= 18
      ? `Age: ${profile.age} (Adult)`
      : `Age: ${profile.age} (Minor)`;

  return (
    <>
      <div className="card">
        <h3>Profile</h3>
        <p>Email: {profile.email}</p>
        <p>Role: {profile.role}</p>
        <p>Phone: {profile.phone || "Not set"}</p>
        <p>Verified: {profile.is_verified ? "Yes" : "No"}</p>
        <p>{ageText}</p>

        <h4>Edit Details</h4>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <button onClick={handleSave}>Save Profile</button>
        {msg && <p>{msg}</p>}
      </div>

      <ChangePassword user={profile} />
    </>
  );
}

// -------- Admin Summary --------
function AdminSummary() {
  const [summary, setSummary] = useState(null);
  const [csvPath, setCsvPath] = useState("employees.csv");
  const [importMsg, setImportMsg] = useState("");

  useEffect(() => {
    api.getAdminSummary().then(setSummary);
  }, []);

  const handleImport = async () => {
    setImportMsg("");
    try {
      const res = await api.importEmployees(csvPath);
      setImportMsg(
        `Imported: ${res.created}, skipped existing: ${res.skipped_existing}`
      );
      const s = await api.getAdminSummary();
      setSummary(s);
    } catch (e) {
      setImportMsg(e.response?.data?.error || "Error importing employees");
    }
  };

  if (!summary) return null;

  return (
    <div className="card">
      <h3>Admin Overview</h3>
      <ul>
        <li>Total users: {summary.total_users}</li>
        <li>Passengers: {summary.total_passengers}</li>
        <li>Employees (non-passengers): {summary.total_employees}</li>
        <li>Flights: {summary.total_flights}</li>
        <li>Bookings: {summary.total_bookings}</li>
        <li>Feedback entries: {summary.total_feedback}</li>
      </ul>

      <h4>Import employees from CSV</h4>
      <input
        placeholder="Path to CSV (server-side)"
        value={csvPath}
        onChange={(e) => setCsvPath(e.target.value)}
      />
      <button onClick={handleImport}>Import Employees</button>
      {importMsg && <p>{importMsg}</p>}
    </div>
  );
}

// -------- Main App --------
export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ams_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [activePage, setActivePage] = useState("dashboard");
  const [authMode, setAuthMode] = useState("login");

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem("ams_user", JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("ams_user");
  };

  if (!user) {
    return (
      <div className="page">
        <header className="topbar">
          <h2>Airport Management System</h2>
        </header>
        <div className="grid">
          {authMode === "login" ? (
            <Login
              onLogin={handleLogin}
              switchToRegister={() => setAuthMode("register")}
            />
          ) : (
            <Register
              onRegistered={handleLogin}
              switchToLogin={() => setAuthMode("login")}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h2>Airport Management System</h2>
          <nav className="nav">
            <button
              className={activePage === "dashboard" ? "active" : ""}
              onClick={() => setActivePage("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={activePage === "history" ? "active" : ""}
              onClick={() => setActivePage("history")}
            >
              History
            </button>
            <button
              className={activePage === "profile" ? "active" : ""}
              onClick={() => setActivePage("profile")}
            >
              Profile
            </button>
          </nav>
        </div>
        <div>
          <span>
            {user.name} ({user.role})
          </span>{" "}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {activePage === "dashboard" && (
        <div className="grid">
          <Flights user={user} />
          <MyBookings user={user} />
          <BaggageLookup />
          <FeedbackPanel user={user} />
          {user.role === "admin" && <AdminSummary />}
        </div>
      )}

      {activePage === "history" && (
        <div className="grid">
          <History user={user} />
        </div>
      )}

      {activePage === "profile" && (
        <div className="grid">
          <Profile user={user} onUserUpdate={setUser} />
        </div>
      )}
    </div>
  );
}
