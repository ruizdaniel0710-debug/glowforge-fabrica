import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingCart, Tags, Users, Settings, LogOut, ExternalLink, Hexagon, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listOrders } from "@/lib/orders.functions";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const listFn = useServerFn(listOrders);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const knownOrdersRef = useRef<Set<string>>(new Set());

  // Estado de Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Estados para el Formulario de Login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    // Verificamos si hay sesión activa (usando sessionStorage como fallback)
    const session = sessionStorage.getItem("admin_session");
    if (session === "true") {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    // Aquí usamos credenciales por defecto (admin / snakelab2026) 
    // Cuando conectes Supabase correctamente, esto se cambiaría por supabase.auth.signInWithPassword()
    if (username === "admin" && password === "snakelab2026") {
      sessionStorage.setItem("admin_session", "true");
      setIsAuthenticated(true);
      toast.success("Bienvenido al panel de administración");
    } else {
      setLoginError("Usuario o contraseña incorrectos");
      toast.error("Credenciales inválidas");
    }
  };

  const signOut = async () => {
    sessionStorage.removeItem("admin_session");
    setIsAuthenticated(false);
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  // Polling every 30s for notifications
  const { data: orders = [] } = useQuery({
    queryKey: ["store-orders"],
    queryFn: () => listFn(),
    refetchInterval: 30000,
    enabled: isAuthenticated, // Solo hacer polling si está logueado
  });

  const pendingOrders = orders.filter(o => o.status === 'pendiente' || o.status === 'recibida');
  const pendingCount = pendingOrders.length;

  useEffect(() => {
    if (isAuthenticated && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || orders.length === 0) return;
    
    // Initialize known orders on first load
    if (knownOrdersRef.current.size === 0) {
      orders.forEach(o => knownOrdersRef.current.add(o.id));
      return;
    }

    let newPendingCount = 0;
    orders.forEach(o => {
      if (!knownOrdersRef.current.has(o.id)) {
        knownOrdersRef.current.add(o.id);
        if (o.status === 'pendiente' || o.status === 'recibida') {
          newPendingCount++;
        }
      }
    });

    if (newPendingCount > 0) {
      playBeep();
      toast.success(`${newPendingCount} pedido(s) nuevo(s) recibido(s)`);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🐍 Nuevo pedido en SNAKELAB', {
          body: `${newPendingCount} pedido(s) pendiente(s) por revisar.`,
        });
      }
    }
  }, [orders, isAuthenticated]);

  const playBeep = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.45);
    } catch (e) {}
  };

  if (isCheckingAuth) {
    return <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center text-white">Cargando...</div>;
  }

  // PANTALLA DE LOGIN SI NO ESTÁ AUTENTICADO
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050505] text-white overflow-hidden font-sans relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#ef2b32]/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-[#ef2b32]/5 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="relative z-10 w-full max-w-md p-8 bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#ef2b32]/10 mb-4">
              <Lock className="w-8 h-8 text-[#ef2b32]" />
            </div>
            <h1 className="text-2xl font-bold font-display tracking-widest uppercase">Snakelab Admin</h1>
            <p className="text-sm text-gray-400 mt-2">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Usuario</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#ef2b32] transition-colors"
                placeholder="Ej. admin"
                autoComplete="off"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#ef2b32] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <p className="text-[#ef2b32] text-sm text-center font-medium">{loginError}</p>
            )}

            <Button type="submit" className="w-full bg-[#ef2b32] hover:bg-[#d0242a] text-white py-6 rounded-lg text-lg font-bold tracking-wide mt-4">
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" /> Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // PANEL DE ADMINISTRACIÓN SI ESTÁ AUTENTICADO
  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden font-sans">
      <aside className="w-[260px] bg-[#111] border-r border-white/10 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/10 gap-3 text-primary font-bold tracking-wider">
          <Hexagon className="w-5 h-5 fill-primary" />
          ADMIN PANEL
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 [&.active]:bg-[#e53935]/10 [&.active]:text-[#e53935] transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/catalogo" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 [&.active]:bg-[#e53935]/10 [&.active]:text-[#e53935] transition-colors">
            <Package className="w-4 h-4" /> Productos
          </Link>
          <Link to="/pedidos" className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 [&.active]:bg-[#e53935]/10 [&.active]:text-[#e53935] transition-colors">
            <div className="flex items-center gap-3"><ShoppingCart className="w-4 h-4" /> Pedidos</div>
            {pendingCount > 0 && <span className="bg-[#e53935] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>}
          </Link>
          <Link to="/categorias" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 [&.active]:bg-[#e53935]/10 [&.active]:text-[#e53935] transition-colors">
            <Tags className="w-4 h-4" /> Categorías
          </Link>
          <Link to="/clientes" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 [&.active]:bg-[#e53935]/10 [&.active]:text-[#e53935] transition-colors">
            <Users className="w-4 h-4" /> Clientes
          </Link>
          <Link to="/configuracion" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 [&.active]:bg-[#e53935]/10 [&.active]:text-[#e53935] transition-colors">
            <Settings className="w-4 h-4" /> Configuración
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link to="/" className="flex justify-center items-center gap-2 w-full py-2.5 bg-[#1a1a1a] border border-white/10 hover:bg-white/5 rounded-lg text-sm transition-colors">
            <ExternalLink className="w-4 h-4" /> Ver Tienda
          </Link>
          <button onClick={signOut} className="flex justify-center items-center gap-2 w-full py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto bg-[#050505]">
        <Outlet />
      </main>
    </div>
  );
}
