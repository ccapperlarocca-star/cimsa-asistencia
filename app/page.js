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
  if (error) { console.error(error); return []; }
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
  <div style={{ background: BRAND.navy, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontWeight: 500, color: "#fff", fontSize: 15 }}>Control de Asistencia</span>
      <span style={{ fontSize: 11, color: BRAND.teal, marginLeft: 4, fontWeight: 500 }}>CIMSA</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{user.name}</span>
      <button onClick={onLogout} style={{ fontSize: 12, padding: "4px 12px", background: "transparent", border: "0.5px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 6, cursor: "pointer" }}>
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
      .maybeSingle();
    if (error || !data) { alert("Usuario o contraseña incorrectos"); return; }
    if (data.active === false) { alert("Usuario inactivo"); return; }
    onLogin(data);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BRAND.navyLight }}>
      <div style={{ background: "#fff", border: "0.5px solid #dde3f0", borderRadius: 16, padding: "2.5rem 2rem", width: 340, boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: BRAND.navy, margin: "0 auto 1rem" }} />
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: BRAND.navy }}>CIMSA</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: BRAND.teal, marginLeft: 4 }}>SOLUCIONES</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Control de Asistencia</p>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4 }}>Usuario</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Ej: jlopez" style={{ width: "100%", boxSizing: "border-box" }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4 }}>Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", boxSizing: "border-box" }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <button onClick={handleLogin} style={{ width: "100%", padding: "10px", fontSize: 14, background: BRAND.navy, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>
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
    if (!navigator.geolocation) { alert("Tu dispositivo no soporta GPS"); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        onRegister({ userId: user.id, name: user.name, type, lat: latitude, lng: longitude, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
      },
      () => { alert("Ubicación bloqueada. Activa el GPS para registrarte."); }
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: BRAND.navyLight }}>
      <TopBar user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <div style={{ background: "#fff", border: "0.5px solid #dde3f0", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: 30, fontWeight: 500, margin: "0 0 1.5rem", color: BRAND.navy }}>
            {new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button onClick={() => handleRegister("entrada")} disabled={!canEntrada}>Entrada</button>
            <button onClick={() => handleRegister("salida")} disabled={!canSalida}>Salida</button>
          </div>
        </div>
        {myRecords.map(r => (
          <div key={r.id} style={{ background: "#fff", border: "0.5px solid #dde3f0", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
            <strong>{r.type}</strong> - {r.date} {r.time}
          </div>
        ))}
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
    if (!navigator.geolocation) { alert("Tu dispositivo no soporta GPS"); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        onRegister({ userId: user.id, name: user.name, type, lat: latitude, lng: longitude, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
      },
      () => { alert("Ubicación bloqueada. Activa el GPS para registrarte."); }
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: BRAND.navyLight }}>
      <TopBar user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <div style={{ background: "#fff", border: "0.5px solid #dde3f0", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#888", margin: "0 0 4px" }}>
            {new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p style={{ fontSize: 30, fontWeight: 500, margin: "0 0 1.5rem", color: BRAND.navy }}>
            {new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button onClick={() => handleRegister("entrada")} disabled={!canEntrada}
              style={{ padding: "16px", fontSize: 15, background: canEntrada ? BRAND.tealLight : "#f5f5f5", color: canEntrada ? BRAND.tealDark : "#bbb", border: `1.5px solid ${canEntrada ? BRAND.teal : "#e0e0e0"}`, borderRadius: 10, cursor: canEntrada ? "pointer" : "not-allowed" }}>
              Entrada
            </button>
            <button onClick={() => handleRegister("salida")} disabled={!canSalida}
              style={{ padding: "16px", fontSize: 15, background: canSalida ? BRAND.navyLight : "#f5f5f5", color: canSalida ? BRAND.navy : "#bbb", border: `1.5px solid ${canSalida ? BRAND.navy : "#e0e0e0"}`, borderRadius: 10, cursor: canSalida ? "pointer" : "not-allowed" }}>
              Salida
            </button>
          </div>
        </div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#888", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Mis registros recientes</p>
        {myRecords.length === 0 && <p style={{ fontSize: 13, color: "#aaa" }}>Sin registros aún.</p>}
        {myRecords.slice(0, 10).map(r => (
          <div key={r.id} style={{ background: "#fff", border: "0.5px solid #dde3f0", borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: r.type === "entrada" ? BRAND.tealLight : BRAND.navyLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 14, color: r.type === "entrada" ? BRAND.teal : BRAND.navy }}>{r.type === "entrada" ? "↓" : "↑"}</span>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: r.type === "entrada" ? BRAND.tealDark : BRAND.navy }}>{r.type === "entrada" ? "Entrada" : "Salida"}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{r.address}</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{r.time}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{r.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminView({ records, onLogout, onAddUser, onToggleUser, onDeleteUser, allUsers }) {
  const [newUser, setNewUser] = useState({ username: "", password: "", name: "" });
  const [tab, setTab] = useState("registros");
  const [filterDate, setFilterDate] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [addMsg, setAddMsg] = useState("");

  const workers = allUsers.filter(u => u.role === "worker");
  const today = new Date().toISOString().split("T")[0];
  const todayIn = records.filter(r => r.date === today && r.type === "entrada").map(r => r.userId);
  const todayOut = records.filter(r => r.date === today && r.type === "salida").map(r => r.userId);
  const presentToday = workers.filter(w => todayIn.includes(w.id) && !todayOut.includes(w.id)).length;
  const entradas = records.filter(r => r.date === today && r.type === "entrada").length;

  const filtered = records.filter(r => {
    if (filterDate && r.date !== filterDate) return false;
    if (filterUser && r.userId !== parseInt(filterUser)) return false;
    return true;
  }).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  const exportCSV = () => {
    const header = "Nombre,Tipo,Fecha,Hora,Latitud,Longitud,Dirección";
    const rows = filtered.map(r => `${r.name},${r.type},${r.date},${r.time},${r.lat},${r.lng},"${r.address}"`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "asistencia_cimsa.csv"; a.click();
  };

  const handleAdd = () => {
    if (!newUser.username || !newUser.password || !newUser.name) { setAddMsg("error:Completa todos los campos"); return; }
    onAddUser(newUser);
    setNewUser({ username: "", password: "", name: "" });
    setAddMsg("ok:Usuario creado correctamente ✓");
    setTimeout(() => setAddMsg(""), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: BRAND.navyLight }}>
      <TopBar user={{ name: "Administrador" }} onLogout={onLogout} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
          {[
            { label: "Presentes ahora", value: presentToday, color: BRAND.teal, bg: BRAND.tealLight },
            { label: "Entradas hoy", value: entradas, color: BRAND.navy, bg: BRAND.navyLight },
            { label: "Total registros", value: records.length, color: BRAND.tealDark, bg: BRAND.tealLight },
          ].map(m => (
            <div key={m.label} style={{ background: "#fff", border: "0.5px solid #dde3f0", borderRadius: 12, padding: "1rem", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: m.bg, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 11, color: "#888", margin: "0 0 2px" }}>{m.label}</p>
                <p style={{ fontSize: 24, fontWeight: 500, margin: 0, color: BRAND.navy }}>{m.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem", borderBottom: `2px solid #dde3f0` }}>
          {["registros", "trabajadores"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontSize: 13, padding: "8px 18px", background: "transparent", color: tab === t ? BRAND.navy : "#888", border: "none", borderBottom: tab === t ? `2px solid ${BRAND.navy}` : "2px solid transparent", marginBottom: -2, cursor: "pointer", fontWeight: tab === t ? 500 : 400 }}>
              {t === "registros" ? "Registros" : "Trabajadores"}
            </button>
          ))}
        </div>

        {tab === "registros" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ fontSize: 13 }} />
              <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{ fontSize: 13 }}>
                <option value="">Todos los trabajadores</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <button onClick={() => { setFilterDate(""); setFilterUser(""); }} style={{ fontSize: 12, padding: "6px 12px" }}>Limpiar</button>
              <button onClick={exportCSV} style={{ fontSize: 12, padding: "6px 14px", marginLeft: "auto", background: BRAND.navy, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                ↓ Exportar CSV
              </button>
            </div>
            <div style={{ background: "#fff", border: "0.5px solid #dde3f0", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
                <thead>
                  <tr style={{ background: BRAND.navy }}>
                    {["Nombre", "Tipo", "Fecha", "Hora", "Ubicación"].map(h => (
                      <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && <tr><td colSpan={5} style={{ padding: "1.5rem", textAlign: "center", color: "#aaa" }}>Sin registros</td></tr>}
                  {filtered.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "0.5px solid #eef1f8" : "none", background: i % 2 === 0 ? "#fff" : "#fafbfd" }}>
                      <td style={{ padding: "8px 12px" }}>{r.name}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 6, background: r.type === "entrada" ? BRAND.tealLight : BRAND.navyLight, color: r.type === "entrada" ? BRAND.tealDark : BRAND.navy, fontWeight: 500 }}>{r.type}</span>
                      </td>
                      <td style={{ padding: "8px 12px" }}>{r.date}</td>
                      <td style={{ padding: "8px 12px" }}>{r.time}</td>
                      <td style={{ padding: "8px 12px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "trabajadores" && (
          <>
            <div style={{ background: "#fff", border: "0.5px solid #dde3f0", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, margin: "0 0 1rem", color: BRAND.navy }}>Agregar trabajador</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, alignItems: "end" }}>
                <div>
                  <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Nombre completo</label>
                  <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="Ana Ramírez" style={{ width: "100%", boxSizing: "border-box", fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Usuario</label>
                  <input value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder="aramirez" style={{ width: "100%", boxSizing: "border-box", fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Contraseña</label>
                  <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" style={{ width: "100%", boxSizing: "border-box", fontSize: 13 }} />
                </div>
                <button onClick={handleAdd} style={{ fontSize: 13, padding: "8px 16px", background: BRAND.navy, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Agregar</button>
              </div>
              {addMsg && (() => {
                const isError = addMsg.startsWith("error:");
                const msg = addMsg.replace(/^(ok|error):/, "");
                return <p style={{ fontSize: 12, color: isError ? "#c0392b" : BRAND.tealDark, marginTop: 8 }}>{msg}</p>;
              })()}
            </div>

            <div style={{ background: "#fff", border: "0.5px solid #dde3f0", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: BRAND.navy }}>
                    {["Nombre", "Usuario", "Estado", "Acción"].map(h => (
                      <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w, i) => (
                    <tr key={w.id} style={{ borderBottom: i < workers.length - 1 ? "0.5px solid #eef1f8" : "none", background: i % 2 === 0 ? "#fff" : "#fafbfd" }}>
                      <td style={{ padding: "8px 12px" }}>{w.name}</td>
                      <td style={{ padding: "8px 12px", color: "#888" }}>{w.username}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 6, background: w.active !== false ? BRAND.tealLight : "#f5f5f5", color: w.active !== false ? BRAND.tealDark : "#999", fontWeight: 500 }}>
                          {w.active !== false ? "activo" : "inactivo"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", display: "flex", gap: 6 }}>
                        <button onClick={() => onToggleUser(w.id)} style={{ fontSize: 11, padding: "4px 12px", background: "transparent", border: "0.5px solid #dde3f0", borderRadius: 6, cursor: "pointer", color: BRAND.navy }}>
                          {w.active !== false ? "Desactivar" : "Activar"}
                        </button>
                        <button onClick={() => { if (window.confirm(`¿Eliminar a ${w.name}? Esta acción no se puede deshacer.`)) onDeleteUser(w.id); }}
                          style={{ fontSize: 11, padding: "4px 12px", background: "#fdecea", border: "0.5px solid #f5c6c6", borderRadius: 6, cursor: "pointer", color: "#c0392b" }}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
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
      const { data } = await supabase.from("usuarios").select("*");
      if (data) setAllUsers(data);
    };
    fetchData();
  }, []);

  const handleRegister = async ({ userId, name, type, lat, lng, address }) => {
    const now = new Date();
    const fecha = now.toISOString().split("T")[0];
    const hora = now.toTimeString().slice(0, 5);
    const { error } = await supabase
      .from("registros")
      .insert([{ userid: userId, nombre: name, tipo: type, fecha, hora, lat, lng, direccion: address }]);
    if (error) { console.error(error); alert("Error guardando registro"); return; }
    const updated = await loadRecords();
    setRecords(updated);
  };

  const handleAddUser = async ({ username, password, name }) => {
    const { error } = await supabase
      .from("usuarios")
      .insert([{ username, password, role: "worker", name, active: true }]);
    if (error) { console.error(error); alert("Error creando usuario"); return; }
    const { data } = await supabase.from("usuarios").select("*");
    if (data) setAllUsers(data);
  };

  const handleDeleteUser = async (id) => {
    const { error } = await supabase.from("usuarios").delete().eq("id", id);
    if (error) { console.error(error); alert("Error eliminando usuario"); return; }
    const { data } = await supabase.from("usuarios").select("*");
    if (data) setAllUsers(data);
  };

  const handleToggleUser = async (id) => {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;
    const { error } = await supabase
      .from("usuarios")
      .update({ active: user.active === false ? true : false })
      .eq("id", id);
    if (error) { console.error(error); alert("Error actualizando usuario"); return; }
    const { data } = await supabase.from("usuarios").select("*");
    if (data) setAllUsers(data);
  };

  if (!currentUser) return <LoginView onLogin={setCurrentUser} />;
  if (currentUser.role === "worker") return <WorkerView user={currentUser} records={records} onRegister={handleRegister} onLogout={() => setCurrentUser(null)} />;
  return <AdminView records={records} allUsers={allUsers} onLogout={() => setCurrentUser(null)} onAddUser={handleAddUser} onToggleUser={handleToggleUser} />;
}