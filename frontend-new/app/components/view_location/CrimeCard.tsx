import { useState } from "react";

interface CrimeData {
    Date: string;
    Summary: string;
    "Link to Reference": string;
    "Planning Area": string;
    Time: string | null;
    "Type of Crime": string;
}

const CrimeCard = ({ crime }: { crime: CrimeData }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Get the first sentence of the summary
    const firstSentence = crime.Summary.split(/(?<=[.!?])\s+/)[0];
    
    return (
        <div
            className="bg-gray-100 p-4 rounded-lg mt-2 cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-800">{crime.Date}</h4>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                    {crime["Type of Crime"]}
                </span>
            </div>
            
            <div className={`mt-2 text-gray-700 ${isExpanded ? "" : "line-clamp-1"}`}>
                <p>{crime.Summary}</p>
            </div>
            
            {isExpanded && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-500">Area:</span> {crime["Planning Area"]}
                        </div>
                        {crime.Time && crime.Time !== "Null" && (
                            <div>
                                <span className="text-gray-500">Time:</span> {crime.Time}
                            </div>
                        )}
                    </div>
                    
                    {crime["Link to Reference"] && crime["Link to Reference"] !== "Link" && (
                        <a 
                            href={crime["Link to Reference"]} 
                            className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
                            </svg>
                            View News Article
                        </a>
                    )}
                </div>
            )}
            
            <div className="mt-1 text-gray-500 text-xs flex justify-end">
                {isExpanded ? "Click to collapse" : "Click to expand"}
            </div>
        </div>
    );
};

export default CrimeCard;
