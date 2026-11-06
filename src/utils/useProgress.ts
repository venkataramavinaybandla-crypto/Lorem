import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lorem_completed_concepts';

export function getCompletedConceptIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function saveCompletedConceptIds(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
    window.dispatchEvent(new Event('lorem_progress_updated'));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
}

export function useProgress() {
  const [completed, setCompleted] = useState<Set<string>>(() => getCompletedConceptIds());

  useEffect(() => {
    const handleUpdate = () => {
      setCompleted(getCompletedConceptIds());
    };
    window.addEventListener('lorem_progress_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('lorem_progress_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const toggleConcept = (conceptId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(conceptId)) {
        next.delete(conceptId);
      } else {
        next.add(conceptId);
      }
      saveCompletedConceptIds(next);
      return next;
    });
  };

  const isConceptCompleted = (conceptId: string) => completed.has(conceptId);

  const getCOProgress = (conceptIds: string[]) => {
    if (!conceptIds || conceptIds.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const done = conceptIds.filter((id) => completed.has(id)).length;
    return {
      completed: done,
      total: conceptIds.length,
      percentage: Math.round((done / conceptIds.length) * 100),
    };
  };

  return {
    completed,
    toggleConcept,
    isConceptCompleted,
    getCOProgress,
  };
}

