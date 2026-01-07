import React from "react";
import { Users, UserCheck, Clock, Percent } from "lucide-react";

// ✅ Interface para props que recibe desde el componente padre
interface StatsCardsProps {
  totalGuests: number;
  totalConfirmed: number;
  totalPending: number;
  confirmationRate: number;
  totalGuestCount: number;
  loading: boolean;
  error: string | null;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalGuests,
  totalConfirmed,
  totalPending,
  confirmationRate,
  totalGuestCount,
  loading,
  error
}) => {

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-100 to-gray-200 h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 p-4 rounded-2xl border-2 border-red-200 bg-red-50">
        <p className="text-red-600 text-center">❌ {error}</p>
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Invitados",
      value: totalGuests,
      subtitle: `${totalGuestCount} personas total`,
      icon: Users,
      gradient: "from-aurora-lavanda to-aurora-rosa",
      bgGradient: "rgba(230, 217, 255, 0.1)",
      borderColor: "var(--color-aurora-lavanda)",
      iconBg: "var(--color-aurora-lavanda)",
    },
    {
      title: "Confirmados",
      value: totalConfirmed,
      subtitle: `${confirmationRate}% confirmación`,
      icon: UserCheck,
      gradient: "from-green-400 to-emerald-500",
      bgGradient: "rgba(34, 197, 94, 0.1)",
      borderColor: "#22c55e",
      iconBg: "#22c55e",
    },
    {
      title: "Pendientes",
      value: totalPending,
      subtitle: "Sin confirmar",
      icon: Clock,
      gradient: "from-aurora-oro to-yellow-400",
      bgGradient: "rgba(255, 242, 204, 0.2)",
      borderColor: "var(--color-aurora-oro)",
      iconBg: "var(--color-aurora-oro)",
    },
    {
      title: "Tasa Confirmación",
      value: `${confirmationRate}%`,
      subtitle: "Respuesta general",
      icon: Percent,
      gradient: "from-aurora-rosa to-pink-400",
      bgGradient: "rgba(255, 179, 217, 0.1)",
      borderColor: "var(--color-aurora-rosa)",
      iconBg: "var(--color-aurora-rosa)",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <div
            key={index}
            className="relative overflow-hidden rounded-2xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            style={{
              background: `linear-gradient(135deg, ${stat.bgGradient}, rgba(253, 252, 252, 0.95))`,
              borderColor: stat.borderColor,
            }}
          >
            {/* Shimmer effect decorativo */}
            <div
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent animate-vip-shimmer-aurora opacity-40"
              style={{ color: stat.borderColor }}
            ></div>

            {/* Icono con animación */}
            <div className="flex items-center justify-between mb-4">
              <div
                className="p-3 rounded-xl shadow-md animate-vip-pulse-aurora"
                style={{ backgroundColor: stat.iconBg }}
              >
                <Icon className="w-6 h-6 text-black" />
              </div>

              {/* Elemento decorativo flotante */}
              <div
                className="w-8 h-8 rounded-full opacity-20 animate-vip-float-aurora group-hover:opacity-30 transition-opacity"
                style={{ backgroundColor: stat.iconBg }}
              ></div>
            </div>

            {/* Contenido principal */}
            <div className="space-y-2">
              <h3
                className="text-sm text-blue-700 font-medium opacity-80"
                //style={{ color: stat.iconBg }}
              >
                {stat.title}
              </h3>

              <div
                className="text-3xl text-pink-600 font-bold leading-none"
                style={{
                  //background: `linear-gradient(135deg, ${stat.gradient.replace('from-', '').replace('to-', '')})`,
                  WebkitBackgroundClip: "text",
                  //WebkitTextFillColor: 'transparent',
                  backgroundClip: "text",
                }}
              >
                {stat.value}
              </div>

              <p
                className="text-xs text-emerald-700 opacity-70"
                //style={{ color: stat.iconBg }}
              >
                {stat.subtitle}
              </p>
            </div>

            {/* Efecto hover en el fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
