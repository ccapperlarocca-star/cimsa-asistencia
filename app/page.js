"use client";

import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

const BRAND = {
  navy: "#1A3A7A",
  teal: "#2EC4A5",
  tealDark: "#1A8A7A",
  navyLight: "#E8EDF8",
  tealLight: "#E0F7F3",
};

const loadRecords = async () => {

  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    userId: item.userid,
    name: item.nombre,
    type: item.tipo,
    date: item.fecha,
    time: item.hora,
    lat: item.lat,
    lng: item.lng,
    address: item.direccion
  }));

};

const TopBar = ({ user, onLogout }) => (
  <div
    style={{
      background: BRAND.navy,
      padding: "12px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          fontWeight: 500,
          color: "#fff",
          fontSize: 15
        }}
      >
        Control de Asistencia
      </span>

      <span
        style={{
          fontSize: 11,
          color: BRAND.teal,
          marginLeft: 4,
          fontWeight: 500
        }}
      >
        CIMSA
      </span>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.7)"
        }}
      >
        {user.name}
      </span>

      <button
        onClick={onLogout}
        style={{
          fontSize: 12,
          padding: "4px 12px",
          background: "transparent",
          border: `0.5px solid rgba(255,255,255,0.3)`,
          color: "#fff",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        Salir
      </button>
    </div>
  </div>
);

function LoginView({ onLogin }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error || !data) {
      alert("Usuario o contraseña incorrectos");
      return;
    }

    if (data.active === false) {
      alert("Usuario inactivo");
      return;
    }

    onLogin(data);

  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND.navyLight
      }}
    >
      <div
        style={{
          background: "#fff",
          border: `0.5px solid #dde3f0`,
          borderRadius: 16,
          padding: "2.5rem 2rem",
          width: 340,
          boxSizing: "border-box"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: BRAND.navy,
              margin: "0 auto 1rem"
            }}
          />

          <div style={{ marginBottom: 4 }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: BRAND.navy
              }}
            >
              CIMSA
            </span>

            <span
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: BRAND.teal,
                marginLeft: 4
              }}
            >
              SOLUCIONES
            </span>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#888"
            }}
          >
            Control de Asistencia
          </p>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              fontSize: 13,
              color: "#555",
              display: "block",
              marginBottom: 4
            }}
          >
            Usuario
          </label>

          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Ej: jlopez"
            style={{
              width: "100%",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 13,
              color: "#555",
              display: "block",
              marginBottom: 4
            }}
          >
            Contraseña
          </label>

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: "100%",
              boxSizing: "border-box"
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: 14,
            background: BRAND.navy,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );

}

function WorkerView({ user, records, onRegister, onLogout }) {

  const myRecords = records
    .filter(r => r.userId === user.id)
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  const today = new Date().toISOString().split("T")[0];

  const todayRecords = myRecords.filter(r => r.date === today);

  const lastRecord = todayRecords[0];

  const canEntrada = !lastRecord || lastRecord.type === "salida";
  const canSalida = lastRecord && lastRecord.type === "entrada";

  const handleRegister = (type) => {

    navigator.geolocation.getCurrentPosition(
      pos => {

        const { latitude, longitude } = pos.coords;

        onRegister({
          userId: user.id,
          name: user.name,
          type,
          lat: latitude,
          lng: longitude,
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        });

      },
      () => {
        alert("No se pudo obtener ubicación");
      }
    );

  };

  return (
    <div style={{ minHeight: "100vh", background: BRAND.navyLight }}>

      <TopBar user={user} onLogout={onLogout} />

      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "1.5rem 1rem"
        }}
      >
        <div
          style={{
            background: "#fff",
            border: `0.5px solid #dde3f0`,
            borderRadius: 16,
            padding: "1.5rem",
            marginBottom: "1.5rem",
            textAlign: "center"
          }}
        >
          <p
            style={{
              fontSize: 30,
              fontWeight: 500,
              margin: "0 0 1.5rem",
              color: BRAND.navy
            }}
          >
            {new Date().toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12
            }}
          >
            <button
              onClick={() => handleRegister("entrada")}
              disabled={!canEntrada}
            >
              Entrada
            </button>

            <button
              onClick={() => handleRegister("salida")}
              disabled={!canSalida}
            >
              Salida
            </button>
          </div>
        </div>

        {myRecords.map(r => (
          <div
            key={r.id}
            style={{
              background: "#fff",
              border: "0.5px solid #dde3f0",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 8
            }}
          >
            <strong>{r.type}</strong> - {r.time}
          </div>
        ))}
      </div>
    </div>
  );

}

function AdminView({
  records,
  onLogout,
  onAddUser,
  onToggleUser,
  allUsers
}) {

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    name: ""
  });

  const workers = allUsers.filter(u => u.role === "worker");

  const handleAdd = () => {

    if (
      !newUser.username ||
      !newUser.password ||
      !newUser.name
    ) {
      alert("Completa todos los campos");
      return;
    }

    onAddUser(newUser);

    setNewUser({
      username: "",
      password: "",
      name: ""
    });

  };

  return (
    <div style={{ minHeight: "100vh", background: BRAND.navyLight }}>

      <TopBar
        user={{ name: "Administrador" }}
        onLogout={onLogout}
      />

      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "1.5rem 1rem"
        }}
      >

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "1rem",
            marginBottom: "1.5rem"
          }}
        >
          <h3>Agregar trabajador</h3>

          <input
            placeholder="Nombre"
            value={newUser.name}
            onChange={e =>
              setNewUser({
                ...newUser,
                name: e.target.value
              })
            }
          />

          <input
            placeholder="Usuario"
            value={newUser.username}
            onChange={e =>
              setNewUser({
                ...newUser,
                username: e.target.value
              })
            }
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={newUser.password}
            onChange={e =>
              setNewUser({
                ...newUser,
                password: e.target.value
              })
            }
          />

          <button onClick={handleAdd}>
            Agregar
          </button>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "1rem",
            marginBottom: "1.5rem"
          }}
        >
          <h3>Trabajadores</h3>

          {workers.map(w => (
            <div
              key={w.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8
              }}
            >
              <span>
                {w.name} ({w.username})
              </span>

              <button onClick={() => onToggleUser(w.id)}>
                {w.active === false ? "Activar" : "Desactivar"}
              </button>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "1rem"
          }}
        >
          <h3>Registros</h3>

          {records.map(r => (
            <div
              key={r.id}
              style={{
                borderBottom: "1px solid #eee",
                padding: "8px 0"
              }}
            >
              {r.name} - {r.type} - {r.date} - {r.time}
            </div>
          ))}
        </div>

      </div>
    </div>
  );

}

export default function Page() {

  const [currentUser, setCurrentUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {

    const fetchData = async () => {

      const loadedRecords = await loadRecords();

      setRecords(loadedRecords);

      await loadUsers();

    };

    fetchData();

  }, []);

  async function loadUsers() {

    const { data, error } = await supabase
      .from("usuarios")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    setAllUsers(data);

  }

  const handleRegister = async ({
    userId,
    name,
    type,
    lat,
    lng,
    address
  }) => {

    const now = new Date();

    const fecha = now.toISOString().split("T")[0];
    const hora = now.toTimeString().slice(0, 5);

    const { error } = await supabase
      .from("registros")
      .insert([
        {
          userid: userId,
          nombre: name,
          tipo: type,
          fecha,
          hora,
          lat,
          lng,
          direccion: address
        }
      ]);

    if (error) {
      console.error(error);
      alert("Error guardando registro");
      return;
    }

    const updatedRecords = await loadRecords();

    setRecords(updatedRecords);

  };

 const handleAddUser = async ({
  username,
  password,
  name
}) => {

  console.log("Intentando guardar usuario...");

  const { data, error } = await supabase
    .from("usuarios")
    .insert([
      {
        username,
        password,
        role: "worker",
        name,
        active: true
      }
    ])
    .select();

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    console.error(error);
    alert("Error creando usuario");
    return;
  }

  alert("Usuario creado correctamente");

  await loadUsers();

};

    if (error) {
      console.error(error);
      alert("Error creando usuario");
      return;
    }

    await loadUsers();

  };

  const handleToggleUser = async (id) => {

    const user = allUsers.find(u => u.id === id);

    if (!user) return;

    const { error } = await supabase
      .from("usuarios")
      .update({
        active: user.active === false
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Error actualizando usuario");
      return;
    }

    await loadUsers();

  };

  if (!currentUser) {
    return <LoginView onLogin={setCurrentUser} />;
  }

  if (currentUser.role === "worker") {
    return (
      <WorkerView
        user={currentUser}
        records={records}
        onRegister={handleRegister}
        onLogout={() => setCurrentUser(null)}
      />
    );
  }

  return (
    <AdminView
      records={records}
      allUsers={allUsers}
      onLogout={() => setCurrentUser(null)}
      onAddUser={handleAddUser}
      onToggleUser={handleToggleUser}
    />
  );

}