import React from "react";

interface SavedInterviewCardProps {
  interview: {
    id: string;
    title: string;
    experience: string;
    date: string;
    time: string;
  };
  onViewDetails?: (interview: any) => void;
  onRemove?: (payload: { saved_slot_id?: string | number; interview_slot_id?: string | number; id?: string | number }) => void;
}

const SavedInterviewCard: React.FC<SavedInterviewCardProps> = ({
  interview,
  onViewDetails,
  onRemove,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 font-medium">
          INTERVIEW ID: {interview.interview_code ?? interview.interview_slot_id ?? interview.id}
        </span>
        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
      </div>
      <h3 className="font-medium text-gray-800 text-sm mb-1">
        {interview.title}
      </h3>
      <p className="text-xs text-gray-600 mb-1">{interview.experience}</p>
      <p className="text-xs text-gray-600 mb-3">
        {interview.date} - {interview.time}
      </p>
      <div className="flex gap-2">
        <button
          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          onClick={() => onViewDetails && onViewDetails(interview)}
        >
          View Details
        </button>
        <button
          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          onClick={() => onRemove && onRemove({ saved_slot_id: (interview as any).saved_slot_id, interview_slot_id: (interview as any).interview_slot_id, id: interview.id })}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default SavedInterviewCard;
