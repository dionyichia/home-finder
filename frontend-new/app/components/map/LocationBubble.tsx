import React from 'react';

interface LocationBubbleProps {
  rank: number;
  onClick?: () => void;
}

export default function LocationBubbleComp({ rank, onClick }: LocationBubbleProps) {
  return (
    <div 
      className="flex items-center justify-center rounded-full bg-blue-500 text-white font-bold shadow-lg cursor-pointer hover:bg-blue-600 transition-colors duration-200"
      style={{ 
        width: '32px', 
        height: '32px',
        fontSize: '14px'
      }}
      onClick={onClick}
    >
      {rank}
    </div>
  );
}

// import React, { useState } from 'react';

// interface LocationBubbleProps {
//     activeCategory?: string;
//     name: string;
//     rank: number;
//     properties: Record<string, any>;
// }

// export default function LocationBubbleComp({ activeCategory, name, rank, properties }: LocationBubbleProps) {
//   const [expanded, setExpanded] = useState(false);
  
//   return (
//     <div 
//       className="bg-white rounded-lg shadow-lg p-2 cursor-pointer min-w-[150px] max-w-[250px] transform transition-all duration-300 ease-in-out hover:scale-105"
//       onClick={() => setExpanded(!expanded)}
//       style={{ 
//         fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', // Responsive font size
//         transformOrigin: 'bottom center'
//       }}
//     >
//       <div className="flex justify-between items-center">
//         <h3 className="font-bold">{name}</h3>
//         <span className="text-xs text-gray-500">Rank: {rank}</span>
//       </div>
      
//       {expanded && (
//         <div className="mt-2 space-y-1">
//           {Object.entries(properties)
//             .filter(([key]) => key !== 'name' && key !== 'location_name')
//             .map(([key, value]) => (
//               <p key={key} className="text-xs">
//                 <span className="font-semibold">{key}:</span> {value}
//               </p>
//             ))}
//         </div>
//       )}
//     </div>
//   );
// }