export interface VizParam {
  name: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  default: number;
  unit?: string;
}

export interface VizOutcome {
  when: string;
  title: string;
  explain: string;
  severity?: 'info' | 'warn' | 'error' | 'success';
}

export interface VizCombo {
  set: Record<string, number>;
  lesson: string;
}

export interface VizData {
  type: string;
  description?: string;
  params?: VizParam[];
  compute?: Record<string, unknown>;
  outcomes?: VizOutcome[];
  combos_to_try?: VizCombo[];
}

export interface VizComponentProps {
  viz: VizData;
}

