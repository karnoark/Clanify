// src/store/memberStores/absenceStore.ts
import { create } from 'zustand';

import type {
  AbsenceState,
  AbsenceActions,
  AbsencePlan,
} from '@/src/types/member/absence';

export const useAbsenceStore = create<AbsenceState & AbsenceActions>()(
  (set, get) => ({
    // Initial state
    plannedAbsences: [],
    isLoading: false,
    error: null,

    // Data loading actions
    loadAbsenceData: async () => {
      try {
        set({ isLoading: true, error: null });
        await get().getPlannedAbsences();
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to load absence data',
        });
      } finally {
        set({ isLoading: false });
      }
    },

    getPlannedAbsences: async () => {
      try {
        // TODO: Replace with actual API call
        // const absences = await api.getPlannedAbsences();

        const absencePlans: AbsencePlan[] = [
          {
            id: 'absence-1',
            startDate: new Date('2025-02-01'),
            endDate: new Date('2025-02-05'),
            startMeal: 'lunch',
            endMeal: 'dinner',
          },
          {
            id: 'absence-2',
            startDate: new Date('2025-03-10'),
            endDate: new Date('2025-03-12'),
            startMeal: 'dinner',
            endMeal: 'lunch',
          },
        ];

        set({ plannedAbsences: absencePlans });
      } catch (error) {
        throw error;
      }
    },

    setPlannedAbsences: async (newAbsences: AbsencePlan[]) => {
      try {
        set({ isLoading: true, error: null });

        // TODO: Replace with actual API call
        // await api.setPlannedAbsences(newAbsences);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update local state with new absences
        const currentAbsences = get().plannedAbsences;
        set({
          plannedAbsences: [...currentAbsences, ...newAbsences],
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to set planned absences',
        });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    deletePlannedAbsence: async (absenceId: string) => {
      try {
        set({ isLoading: true, error: null });

        // TODO: Replace with actual API call
        // await api.deletePlannedAbsence(absenceId);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update local state by removing the deleted absence
        const currentAbsences = get().plannedAbsences;
        set({
          plannedAbsences: currentAbsences.filter(
            absence => absence.id !== absenceId,
          ),
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to delete planned absence',
        });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
  }),
);
