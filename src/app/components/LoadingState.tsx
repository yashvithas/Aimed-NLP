import { Loader2, Brain, FileSearch, Activity } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        <Loader2 className="w-16 h-16 text-teal-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-8 h-8 text-teal-600" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg text-teal-700">Analyzing input using AI and NLP techniques...</h3>
        <p className="text-sm text-gray-500">This may take a few moments</p>
      </div>

      <div className="flex gap-8 mt-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
            <FileSearch className="w-6 h-6 text-teal-600" />
          </div>
          <span className="text-xs text-gray-600">Processing</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-xs text-gray-600">Analyzing</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-xs text-gray-600">Predicting</span>
        </div>
      </div>
    </div>
  );
}