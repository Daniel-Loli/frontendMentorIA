import { CheckCircle, Clock } from 'lucide-react';

export default function MissionCard({ mission, onSelect }) {
  return (
    <div 
      onClick={() => onSelect(mission)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden 
                 hover:shadow-lg transition-all group cursor-pointer flex flex-col"
    >
      {/* Imagen */}
      <div className={`h-32 w-full bg-cover bg-center relative`}
           style={{ backgroundImage: `url(${mission.imagen || '/img/default-mission.jpg'})` }}>
        
        {mission.isNew && (
          <div className="absolute top-3 right-3 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
            Nueva
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-text-main line-clamp-2">{mission.titulo}</h3>

        <p className="text-sm text-gray-500 mt-2 flex-1 line-clamp-3">
          {mission.descripcion}
        </p>

        {/* Progreso */}
        <div className="mt-3">
          <div className="flex justify-between text-xs font-medium mb-1">
            <span>{mission.status === 'COMPLETADA' ? 'Completada' : `${mission.progress}%`}</span>
            <span>3/5 tareas</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all 
                ${mission.status === 'COMPLETADA' ? 'bg-green-500' : 'bg-secondary'}`}
              style={{ width: `${mission.status === 'COMPLETADA' ? '100%' : mission.progress + '%'}` }}
            ></div>
          </div>
        </div>

        <button className="mt-4 bg-secondary text-white py-2 rounded-lg font-semibold hover:bg-secondary-hover">
          {mission.status === 'COMPLETADA' ? 'Ver Resultado' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}
