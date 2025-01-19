// This store manages the state for the mess administrator onboarding process.
// It handles data collection, validation, and progress tracking across multiple steps.
// We use Zustand for state management due to its simplicity and integration with React.

import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { adminRegistrationService } from '@/src/services/adminRegistrationService';
import { useAuthStore } from '@/src/store/auth';

// Set up persistent storage using MMKV
const storage = new MMKV({
  id: 'onboarding-storage',
});
const zustandStorage = {
  getItem: async (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: async (name: string) => {
    storage.delete(name);
  },
};

// Define the 'onboarding_step' enum type based on the IDs
export type OnboardingStepId =
  | 'mess_details'
  | 'location_details'
  | 'contact_details'
  | 'timing_details'
  | 'media_files';

// Define comprehensive types for our onboarding data
export interface MessLocation {
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address: {
    street?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export interface MessContact {
  phone: string;
  alternatePhone?: string;
  email: string;
  website?: string;
}

// Define the structure for our working hours
// interface DaySchedule {
//   isOpen: boolean;
//   lunch?: {
//     start: string;
//     end: string;
//   };
//   dinner?: {
//     start: string;
//     end: string;
//   };
// }

// Type for our weekly schedule
// type WeeklySchedule = {
//   [key in DayOfWeek]: DaySchedule;
// };

// Define days of the week
type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

// export interface MessTiming {
//   lunch: {
//     start: string;
//     end: string;
//     closed: boolean;
//   };
//   dinner: {
//     start: string;
//     end: string;
//     closed: boolean;
//   };
//   workingDays: (
//     | 'monday'
//     | 'tuesday'
//     | 'wednesday'
//     | 'thursday'
//     | 'friday'
//     | 'saturday'
//     | 'sunday'
//   )[];
//   weeklySchedule: WeeklySchedule;
// }

// Types for specific time slots
export interface TimeSlot {
  start: string;
  end: string;
  isClosed: boolean;
}

// Schedule for a single day
interface DaySchedule {
  lunch: TimeSlot;
  dinner: TimeSlot;
}

// Type for our weekly schedule
export type WeeklySchedule = {
  [key in DayOfWeek]: DaySchedule;
};

// Main timing interface (simplified to remove redundancy)
export interface MessTiming {
  weeklySchedule: WeeklySchedule;
  // Optional: Default timings that can be used when creating new schedules
  defaultTimings?: {
    lunch: Omit<TimeSlot, 'isClosed'>;
    dinner: Omit<TimeSlot, 'isClosed'>;
  };
}

export interface MessDetails {
  name: string;
  description: string;
  type: 'veg' | 'non-veg' | 'both';
  specialties: string[];
  establishmentYear: string;
  capacity: number;
  monthlyRate: number;
  securityDeposit: number;
}

export interface MessMedia {
  photos: {
    dining?: string[];
    meals?: string[];
  };
}

// type ErrorState = Partial<Record<keyof OnboardingState, string>>;

// Interface for the complete onboarding state
interface OnboardingState {
  // Step tracking
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];

  // Data for each step
  messDetails: Partial<MessDetails>;
  location: Partial<MessLocation>;
  contact: Partial<MessContact>;
  timing: Partial<MessTiming>;
  media: Partial<MessMedia>;

  // Form validation errors
  errors: {
    [key: string]: string;
  };

  // Initialization state
  isInitialized: boolean;

  // Actions for updating state
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  updateMessDetails: (details: Partial<MessDetails>) => void;
  updateLocation: (location: Partial<MessLocation>) => void;
  updateContact: (contact: Partial<MessContact>) => void;
  updateTiming: (timing: Partial<MessTiming>) => void;
  updateMedia: (media: Partial<MessMedia>) => void;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  resetOnboarding: () => void;

  // Actions for supabase integration
  saveStepData: (step: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  loadSavedData: () => Promise<void>;

  // Initialization action
  initialize: () => Promise<void>;
}

// Initial state values
const initialState = {
  currentStep: 0,
  totalSteps: 5,
  completedSteps: [],
  messDetails: {},
  location: {},
  contact: {},
  timing: {
    workingDays: [
      'monday' as const,
      'tuesday' as const,
      'wednesday' as const,
      'thursday' as const,
      'friday' as const,
      'saturday' as const,
      'sunday' as const,
    ],
  },
  media: {
    photos: {},
    certificates: {},
  },
  errors: {},
  isInitialized: false,
};

// Create the store with persistence
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Initialization logic
      initialize: async () => {
        const data = await zustandStorage.getItem('onboarding-storage');
        await get().loadSavedData();
        set({ isInitialized: true });
      },

      // Navigation actions
      setCurrentStep: step => {
        const totalSteps = get().totalSteps;
        if (step < 0 || step >= totalSteps) {
          console.warn(`Invalid step: ${step}. Total steps: ${totalSteps}`);
          return;
        }
        set({ currentStep: step });
      },

      markStepComplete: step => {
        const completedSteps = get().completedSteps;
        if (!completedSteps.includes(step)) {
          set({ completedSteps: [...completedSteps, step].sort() });
        }
      },

      // Data update actions
      updateMessDetails: details => {
        if (details.name && details.name.trim() === '') {
          get().setError('messDetails.name', 'Name cannot be empty');
          return;
        }
        set(state => ({
          messDetails: {
            ...state.messDetails,
            ...details,
          },
        }));
      },

      updateLocation: location => {
        set(state => ({
          location: {
            ...state.location,
            ...location,
          },
        }));
      },

      updateContact: contact => {
        set(state => ({
          contact: {
            ...state.contact,
            ...contact,
          },
        }));
      },

      updateTiming: timing => {
        set(state => ({
          timing: {
            ...state.timing,
            ...timing,
          },
        }));
      },

      updateMedia: media => {
        set(state => ({
          media: {
            ...state.media,
            ...media,
          },
        }));
      },

      // Error handling
      setError: (field, message) => {
        set(state => ({
          errors: {
            ...state.errors,
            [field]: message,
          },
        }));
      },

      clearError: field => {
        set(state => {
          const { [field]: _, ...remainingErrors } = state.errors;
          return { errors: remainingErrors };
        });
      },

      // Reset function
      resetOnboarding: () => {
        set(state => ({
          ...state,
          currentStep: 0,
          completedSteps: [],
          messDetails: {},
          location: {},
          contact: {},
          timing: {
            ...state.timing, // Keep defaults intact
          },
          media: {
            ...state.media, // Keep defaults intact
          },
          errors: {},
        }));
      },

      saveStepData: async (step: string) => {
        try {
          console.log(
            'onbaordingStore/saveStepData:-> started saving stepdata',
          );
          const { user } = useAuthStore.getState();
          if (!user?.email) throw new Error('User email not found');

          let stepData;
          switch (step) {
            case 'mess_details':
              stepData = get().messDetails;
              break;
            case 'location_details':
              stepData = get().location;
              break;
            case 'contact_details':
              stepData = get().contact;
              break;
            case 'timing_details':
              stepData = get().timing;
              break;
            case 'media_files':
              stepData = get().media;
              break;
            default:
              throw new Error('Invalid step');
          }

          await adminRegistrationService.saveStepData(
            user.email,
            step,
            stepData,
          );
          await adminRegistrationService.updateRegistrationStatus(
            user.email,
            step,
          );
          console.log(
            'onbaordingStore/saveStepData:-> successfully saved stepdata in supabase',
          );
        } catch (error) {
          console.error('Error saving step data:', error);
          throw error;
        }
      },

      completeOnboarding: async () => {
        try {
          console.log(
            'onbaordingStore/completeOnboarding:-> started completion of onbaording',
          );
          const { user } = useAuthStore.getState();
          if (!user?.email) throw new Error('User email not found');

          const data = {
            messDetails: get().messDetails,
            location: get().location,
            contact: get().contact,
            timing: get().timing,
            media: get().media,
          };

          await adminRegistrationService.completeOnboarding(user.email, data);
          console.log(
            'onbaordingStore/completeOnboarding:-> completed the onbaording',
          );
        } catch (error) {
          console.error('Error completing onboarding:', error);
          throw error;
        }
      },

      loadSavedData: async () => {
        console.log(
          'onbaordingStore/loadSavedData:-> started loading saved data',
        );
        try {
          const { user } = useAuthStore.getState();
          if (!user?.email) throw new Error('User email not found');

          const data = await adminRegistrationService.loadOnboardingData(
            user.email,
          );

          set({
            messDetails: data.messDetails,
            location: data.location,
            contact: data.contact,
            timing: data.timing,
            media: data.media,
            isInitialized: true,
          });
          console.log(
            'onbaordingStore/loadSavedData:-> successfully loaded saved data',
          );
        } catch (error) {
          console.error('Error loading saved data:', error);
          set({ isInitialized: true }); // Still mark as initialized even if loading fails
          throw error;
        }
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

// Automatically initialize the store on app load
// useOnboardingStore.getState().initialize();

// Instead, create an initialization function that can be called at the right time
export const initializeOnboarding = async () => {
  const store = useOnboardingStore.getState();
  if (!store.isInitialized) {
    await store.initialize();
  }
};
