import { createContext } from 'react';
import type { PlannerContextValue } from './planner';

// Keep the context identity outside the hot-reloaded provider/helpers module.
// Existing providers and updated consumers must always use the same context.
export const PlannerContext = createContext<PlannerContextValue | null>(null);