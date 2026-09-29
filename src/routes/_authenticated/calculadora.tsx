import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Calculator, Save } from 'lucide-react';
import { formatPrice } from '@/lib/products';

export const Route = createFileRoute('/_authenticated/calculadora')({
  component: Calculadora3D,
});

function Calculadora3D() {
  // Variables del material
  const [peso, setPeso] = useState<number>(100); // gramos
  const [precioKilo, setPrecioKilo] = useState<number>(85000); // COP

  // Variables de impresión
  const [horas, setHoras] = useState<number>(4);
  const [minutos, setMinutos] = useState<number>(30);
  const [costoHoraElectricidad, setCostoHoraElectricidad] = useState<number>(300); // COP/hr aprox consumo impresora
  
  // Amortización / Desgaste
  const [costoImpresora, setCostoImpresora] = useState<number>(1500000); // Costo de la máquina
  const [horasVidaUtil, setHorasVidaUtil] = useState<number>(8000); // Horas antes de mantenimiento mayor o cambio

  // Post-procesado (Mano de obra)
  const [minutosPost, setMinutosPost] = useState<number>(15);
  const [pagoHoraLabor, setPagoHoraLabor] = useState<number>(15000); // COP/hr de trabajo humano

  // Margen de ganancia y fallos
  const [margenGanancia, setMargenGanancia] = useState<number>(50); // %
  const [tasaFallo, setTasaFallo] = useState<number>(10); // % para imprevistos

  // Cálculos
  const tiempoTotalHoras = horas + (minutos / 60);
  
  const costoMaterial = (peso / 1000) * precioKilo;
  const costoEnergia = tiempoTotalHoras * costoHoraElectricidad;
  const desgasteMaquina = tiempoTotalHoras * (costoImpresora / horasVidaUtil);
  const costoManoObra = (minutosPost / 60) * pagoHoraLabor;

  const subtotalCostoBase = costoMaterial + costoEnergia + desgasteMaquina + costoManoObra;
  const costoFallo = subtotalCostoBase * (tasaFallo / 100);
  const costoTotalReal = subtotalCostoBase + costoFallo;

  const gananciaNeta = costoTotalReal * (margenGanancia / 100);
  const precioSugerido = costoTotalReal + gananciaNeta;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Calculator className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold font-sans tracking-tight">Calculadora de Precios 3D</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna de inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-primary">1. Costos de Material</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Peso de la pieza (gramos)</label>
                <input type="number" value={peso} onChange={(e) => setPeso(Number(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Precio del Filamento (1 Kg)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input type="number" value={precioKilo} onChange={(e) => setPrecioKilo(Number(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 pl-8 text-white outline-none focus:border-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-primary">2. Tiempo y Energía</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Horas de impresión</label>
                <input type="number" value={horas} onChange={(e) => setHoras(Number(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Minutos extra</label>
                <input type="number" value={minutos} onChange={(e) => setMinutos(Number(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Costo Energía (por hora)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input type="number" value={costoHoraElectricidad} onChange={(e) => setCostoHoraElectricidad(Number(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 pl-8 text-white outline-none focus:border-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-primary">3. Post-procesado (Mano de obra)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Tiempo de preparación/limpieza (minutos)</label>
                <input type="number" value={minutosPost} onChange={(e) => setMinutosPost(Number(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Costo de tu hora laboral</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input type="number" value={pagoHoraLabor} onChange={(e) => setPagoHoraLabor(Number(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 pl-8 text-white outline-none focus:border-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-primary">4. Máquina y Ganancia</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Costo de la Impresora</label>
                <input type="number" value={costoImpresora} onChange={(e) => setCostoImpresora(Number(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Margen de Ganancia (%)</label>
                <div className="relative">
                  <input type="number" value={margenGanancia} onChange={(e) => setMargenGanancia(Number(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 pr-8 text-white outline-none focus:border-primary" />
                  <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Vida útil de máquina (Horas)</label>
                <input type="number" value={horasVidaUtil} onChange={(e) => setHorasVidaUtil(Number(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Margen de Fallos (%)</label>
                <div className="relative">
                  <input type="number" value={tasaFallo} onChange={(e) => setTasaFallo(Number(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 pr-8 text-white outline-none focus:border-primary" />
                  <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Columna de Resumen (Fija) */}
        <div className="space-y-6">
          <div className="bg-[#050505] border border-primary/30 rounded-xl p-6 sticky top-24 shadow-[0_0_30px_rgba(124,58,237,0.1)]">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Resumen de Costos</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Material</span>
                <span className="text-white">{formatPrice(costoMaterial)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Energía Eléctrica</span>
                <span className="text-white">{formatPrice(costoEnergia)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Desgaste de Máquina</span>
                <span className="text-white">{formatPrice(desgasteMaquina)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Post-procesado (Mano de obra)</span>
                <span className="text-white">{formatPrice(costoManoObra)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-orange-400/80">
                <span>Margen de fallos ({tasaFallo}%)</span>
                <span>+{formatPrice(costoFallo)}</span>
              </div>
              
              <div className="border-t border-white/10 my-2 pt-2 flex justify-between items-center font-semibold">
                <span className="text-gray-300">Costo Base Real</span>
                <span className="text-white">{formatPrice(costoTotalReal)}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-emerald-400">
                <span>Ganancia Neta ({margenGanancia}%)</span>
                <span>+{formatPrice(gananciaNeta)}</span>
              </div>
            </div>

            <div className="p-4 bg-primary/10 rounded-xl border border-primary/30 text-center">
              <span className="block text-sm text-primary font-semibold uppercase tracking-wider mb-1">Precio de Venta Sugerido</span>
              <span className="text-4xl font-bold text-white">{formatPrice(precioSugerido)}</span>
            </div>

            <div className="mt-6 flex justify-center text-xs text-gray-500 text-center">
              Esta calculadora es una herramienta de estimación. Ajusta los valores de energía y vida útil según tus equipos.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
