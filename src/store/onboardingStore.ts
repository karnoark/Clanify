// This store manages the state for the mess administrator onboarding process.
// It handles data collection, validation, and progress tracking across multiple steps.
// We use Zustand for state management due to its simplicity and integration with React.

import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Set up persistent storage using MMKV
const storage = new MMKV();
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

// Define comprehensive types for our onboarding data
export interface MessLocation {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface MessContact {
  phone: string;
  alternatePhone?: string;
  email: string;
  website?: string;
}

export interface MessTiming {
  lunch: {
    start: string;
    end: string;
    closed: boolean;
  };
  dinner: {
    start: string;
    end: string;
    closed: boolean;
  };
  workingDays: (
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'
  )[];
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
  logo?: string;
  photos: {
    entrance?: string[];
    dining?: string[];
    kitchen?: string[];
  };
  certificates: {
    fssai?: string;
    gst?: string;
    other?: string[];
  };
}

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
};

// Create the store with persistence
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation actions
      setCurrentStep: step => {
        if (step >= 0 && step < get().totalSteps) {
          set({ currentStep: step });
        }
      },

      markStepComplete: step => {
        const completedSteps = get().completedSteps;
        if (!completedSteps.includes(step)) {
          set({ completedSteps: [...completedSteps, step].sort() });
        }
      },

      // Data update actions
      updateMessDetails: details => {
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
        set(initialState);
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
