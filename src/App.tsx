import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Route-level code splitting
const Home = lazy(() => import('./pages/Home'));
const COPage = lazy(() => import('./pages/COPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const CheatSheet = lazy(() => import('./pages/CheatSheet'));

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-3 border-[#9f4122]/30 border-t-[#9f4122] animate-spin" />
        <span className="text-xs font-mono text-[#89726b]">Loading module...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="co/:id/cheat-sheet"
          element={
            <Suspense fallback={<PageFallback />}>
              <CheatSheet />
            </Suspense>
          }
        />
        <Route element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<PageFallback />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="co/:id"
            element={
              <Suspense fallback={<PageFallback />}>
                <COPage />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<PageFallback />}>
                <NotFound />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
