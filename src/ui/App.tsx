import { useCallback, useEffect, useMemo, useState } from 'react';
import { login, register } from '../application/auth-service.js';
import { enrollInClass, fetchClasses, unenrollFromClass, updateCapacity } from '../application/class-service.js';
import { ClassSession, User } from '../domain/models.js';
import '../styles/layout.css';

const formatDate = (date: string) =>
  new Date(date).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ inviteToken: '', name: '', email: '', password: '' });
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const selectedClass = useMemo(
    () => classes.find((cls) => cls.id === selectedClassId) ?? classes[0],
    [classes, selectedClassId]
  );

  const loadClasses = useCallback(async () => {
    try {
      const data = await fetchClasses(user?.token);
      setClasses(data);
    } catch (error) {
      console.error(error);
      setMessage('No se pudo cargar el horario. Verifica tu conexión.');
    }
  }, [user?.token]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const data = await login(loginForm.email, loginForm.password);
      setUser(data);
      await loadClasses();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const data = await register(
        registerForm.inviteToken,
        registerForm.name,
        registerForm.email,
        registerForm.password
      );
      setUser(data);
      await loadClasses();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const modifyEnrollment = async (action: 'enroll' | 'unenroll') => {
    if (!user || !selectedClass) return;
    setLoading(true);
    setMessage('');
    try {
      if (action === 'enroll') {
        await enrollInClass(selectedClass.id, user.token);
      } else {
        await unenrollFromClass(selectedClass.id, user.token);
      }
      await loadClasses();
      setMessage(action === 'enroll' ? 'Te has apuntado.' : 'Has salido de la clase.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo actualizar tu plaza');
    } finally {
      setLoading(false);
    }
  };

  const adjustCapacity = async (delta: number) => {
    if (!user || user.role !== 'admin' || !selectedClass) return;
    setLoading(true);
    setMessage('');
    try {
      await updateCapacity(selectedClass.id, delta, user.token);
      await loadClasses();
      setMessage('Capacidad actualizada.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo ajustar la capacidad');
    } finally {
      setLoading(false);
    }
  };

  const attendeeStatus = (session: ClassSession | undefined) => {
    if (!session || !user) return '';
    const inClass = session.attendees.some((a) => a.id === user.id);
    const inWaitlist = session.waitlist.some((a) => a.id === user.id);
    if (inClass) return 'Apuntado';
    if (inWaitlist) return 'En lista de espera';
    return 'Disponible';
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <h1>Gestión de clases de jiu-jitsu</h1>
          <p>Consulta horarios, apúntate o sal de la clase y deja que la lista de espera fluya automáticamente.</p>
        </div>
        <div className="auth-panels">
          <form className="panel" onSubmit={handleLogin}>
            <h2>Iniciar sesión</h2>
            <label>
              Correo
              <input
                required
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
            </label>
            <label>
              Contraseña
              <input
                required
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </label>
            <button type="submit" disabled={loading}>Entrar</button>
          </form>

          <form className="panel" onSubmit={handleRegister}>
            <h2>Registrarse</h2>
            <p className="help">Necesitas el enlace o token enviado por el administrador.</p>
            <label>
              Token de invitación
              <input
                required
                value={registerForm.inviteToken}
                onChange={(e) => setRegisterForm({ ...registerForm, inviteToken: e.target.value })}
              />
            </label>
            <label>
              Nombre
              <input
                required
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              />
            </label>
            <label>
              Correo
              <input
                required
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              />
            </label>
            <label>
              Contraseña
              <input
                required
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              />
            </label>
            <button type="submit" disabled={loading}>Crear cuenta</button>
          </form>
        </div>
      </header>

      <main className="grid">
        <section className="card chat">
          <h3>Chat / avisos</h3>
          <div className="chat-box">Zona de mensajes rápidos o avisos del profesor.</div>
          <div className="actions">
            <button onClick={() => modifyEnrollment('enroll')} disabled={!user || !selectedClass}>Apuntarse</button>
            <button onClick={() => modifyEnrollment('unenroll')} disabled={!user || !selectedClass}>Desapuntarse</button>
            <button onClick={() => setSelectedClassId(selectedClass?.id ?? null)}>Ver lista</button>
            <button onClick={loadClasses}>Horarios</button>
          </div>
          {selectedClass && (
            <div className="status">
              <span>Estado: {attendeeStatus(selectedClass)}</span>
              {user?.role === 'admin' && (
                <div className="admin-controls">
                  <button onClick={() => adjustCapacity(-1)} disabled={loading}>- hueco</button>
                  <span>Capacidad: {selectedClass.capacity}</span>
                  <button onClick={() => adjustCapacity(1)} disabled={loading}>+ hueco</button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="card schedule">
          <div className="card-header">
            <div>
              <h3>Próximas clases</h3>
              <p>Selecciona una clase para ver asistentes y lista de espera.</p>
            </div>
            {user && <span className="pill">{user.name} · {user.role}</span>}
          </div>
          <div className="list">
            {classes.map((session) => (
              <article
                key={session.id}
                className={`session ${selectedClass?.id === session.id ? 'active' : ''}`}
                onClick={() => setSelectedClassId(session.id)}
              >
                <div>
                  <h4>{session.title}</h4>
                  <p>{formatDate(session.date)}</p>
                  <p className="muted">Instructor: {session.instructor}</p>
                </div>
                <div className="meta">
                  <span className="pill">{session.attendees.length}/{session.capacity}</span>
                  <span className="pill warn">Espera: {session.waitlist.length}</span>
                </div>
              </article>
            ))}
          </div>
          {selectedClass && (
            <div className="panel attendees">
              <h4>Personas apuntadas</h4>
              <ul>
                {selectedClass.attendees.map((person) => (
                  <li key={person.id}>{person.name}</li>
                ))}
              </ul>
              <h4>Lista de espera</h4>
              <ul>
                {selectedClass.waitlist.length === 0 && <li>Nadie en espera</li>}
                {selectedClass.waitlist.map((person) => (
                  <li key={person.id}>{person.name}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>

      {message && <div className="toast">{message}</div>}
    </div>
  );
}
