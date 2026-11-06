# YAML Content Schema
```yaml
part:                        # Part metadata
  id: string                 # Part ID (e.g. co1-part-01)
  co: string                 # Parent CO code (CO1 - CO6)
  title: string              # Part title
  order: number              # Order within CO
  concept_ids: string[]      # Concept keys
concepts:                    # Array of concepts in this part
  - id, code, title: string  # Identifiers & title
    session: number|string   # Session number
    eli5: string             # Plain-language explanation
    key_points: string[]     # Summary bullet points
    deep_dive: string        # Architectural & implementation depth
    formulas: string[]       # Mathematical formulas
    common_mistakes: string[]# Pitfalls to avoid
    mini_task: string        # Applied exercise
    quiz: [{ type, question, options?, answer, explanation }]
    exam_tags: string[]      # Evaluation tags (mid-term, end-sem)
```
