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
import GenericViz from './GenericViz';

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

/** Registered components need object params (they read `param.name`). */
function hasComponentParams(viz: Record<string, unknown>): boolean {
  if (!Array.isArray(viz.params)) return true;
  return viz.params.every((param) => Boolean(param) && typeof param === 'object');
}

export default function VizRenderer({ viz }: VizRendererProps) {
  if (!viz || typeof viz !== 'object') {
    return null;
  }

  const definition = viz as Record<string, unknown>;
  const type = typeof definition.type === 'string' ? definition.type : '';
  const Component = type ? vizRegistry[type] : undefined;

  // Dedicated interactive component when one exists and the data matches its shape
  if (Component && hasComponentParams(definition)) {
    return <Component viz={viz as VizData} />;
  }

  // Complete generic rendering for every other visualization definition
  return <GenericViz viz={definition} />;
}
