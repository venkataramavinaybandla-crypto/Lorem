import VizCardWrapper from './VizCardWrapper';
import type { VizComponentProps } from './types';

export default function ProcessFlowViz({ viz }: VizComponentProps) {
  const stages = (viz.compute?.stages as string[]) || [
    'v0.1 logged LLM client',
    'Transformer generation',
    'RAG',
    'Prompt engineering',
    'Fine-tuning and platform engineering',
    'v1.0 governed application',
  ];

  return (
    <VizCardWrapper
      viz={viz}
      title="Project Lifecycle Process Flow"
      renderVisual={(params, setParams) => {
        const currentStage = params.stage ?? 1;

        return (
          <div className="space-y-4">
            {/* Visual SVG Timeline */}
            <div className="relative py-4 px-2 overflow-x-auto">
              <div className="flex items-center justify-between min-w-[500px] relative">
                {/* Connecting Line */}
                <div className="absolute top-5 left-4 right-4 h-1 bg-[#89726b]/20 -z-0" />
                <div
                  className="absolute top-5 left-4 h-1 bg-[#9f4122] transition-all duration-300 -z-0"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((currentStage - 1) / (stages.length - 1)) * 100))}%`,
                  }}
                />

                {stages.map((stageName, idx) => {
                  const stageNum = idx + 1;
                  const isActive = stageNum === currentStage;
                  const isCompleted = stageNum < currentStage;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setParams({ stage: stageNum })}
                      className="group flex flex-col items-center gap-2 cursor-pointer z-10 focus:outline-none"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                          isActive
                            ? 'bg-[#9f4122] text-white ring-4 ring-[#ff8a65]/40 scale-110 shadow-md'
                            : isCompleted
                            ? 'bg-[#d6ed7a] text-[#3f4c00] border-2 border-white'
                            : 'bg-white text-[#89726b] border-2 border-[#ddc0b8]'
                        }`}
                      >
                        {isCompleted ? '✓' : stageNum}
                      </div>
                      <span
                        className={`text-[10px] text-center max-w-[80px] leading-tight font-medium transition-colors ${
                          isActive ? 'text-[#9f4122] font-bold' : 'text-[#56423c]'
                        }`}
                      >
                        {stageName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage Detail Card */}
            <div className="p-3.5 rounded-xl bg-white/70 border border-white/80 shadow-sm flex items-center justify-between text-xs">
              <span className="text-[#56423c]">Current Milestone:</span>
              <span className="font-bold text-[#9f4122]">
                Stage {currentStage}: {stages[currentStage - 1] || 'Completed'}
              </span>
            </div>
          </div>
        );
      }}
    />
  );
}
