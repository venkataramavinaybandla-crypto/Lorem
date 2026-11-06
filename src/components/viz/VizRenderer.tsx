import React from 'react';
import type { VizData, VizComponentProps } from './types';
import ProcessFlowViz from './ProcessFlowViz';
import TestHarnessViz from './TestHarnessViz';
import DecisionMatrixViz from './DecisionMatrixViz';
import SequenceGenerationViz from './SequenceGenerationViz';
import ProbabilityDistributionViz from './ProbabilityDistributionViz';
import StoppingConditionViz from './StoppingConditionViz';
import EmbeddingSpaceViz from './EmbeddingSpaceViz';
import SimilarityMetricViz from './SimilarityMetricViz';
import ModelSelectionViz from './ModelSelectionViz';

// Explicit mapping from YAML viz.type to corresponding interactive React component
export const vizRegistry: Record<string, React.ComponentType<VizComponentProps>> = {
  process_flow: ProcessFlowViz,
  test_harness: TestHarnessViz,
  decision_matrix: DecisionMatrixViz,
  sequence_generation: SequenceGenerationViz,
  probability_distribution: ProbabilityDistributionViz,
  stopping_condition: StoppingConditionViz,
  embedding_space: EmbeddingSpaceViz,
  similarity_metric: SimilarityMetricViz,
  model_selection: ModelSelectionViz,
};

interface VizRendererProps {
  viz?: VizData | Record<string, unknown>;
}

export default function VizRenderer({ viz }: VizRendererProps) {
  if (!viz || typeof viz !== 'object' || !('type' in viz) || typeof viz.type !== 'string') {
    return null;
  }

  const Component = vizRegistry[viz.type];

  // Graceful fallback for unknown / future types
  if (!Component) {
    return (
      <div className="my-4 p-4 rounded-2xl border border-dashed border-[#89726b]/30 bg-white/40 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#89726b] mb-1">
          <span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
          <span>Interactive Visualization</span>
        </div>
        <p className="text-[11px] text-[#56423c]">
          Visualization type <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#ddc0b8]">{viz.type}</code> is not available yet.
        </p>
      </div>
    );
  }

  return <Component viz={viz as VizData} />;
}
