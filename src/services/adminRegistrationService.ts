// src/services/adminRegistrationService.ts

import { createClient } from '@supabase/supabase-js';

import { supabase } from '@/src/lib/supabase';

import {
  MessDetails,
  MessLocation,
  MessContact,
  MessTiming,
  MessMedia,
} from '../store/onboardingStore';

export interface AdminRegistrationData {
  messDetails: Partial<MessDetails>;
  location: Partial<MessLocation>;
  contact: Partial<MessContact>;
  timing: Partial<MessTiming>;
  media: Partial<MessMedia>;
}

class AdminRegistrationService {
  // Update registration status and current step
  async updateRegistrationStatus(email: string, currentStep: string) {
    try {
      const { error } = await supabase
        .from('admin_registrations')
        .update({
          status: 'onboarding_in_progress',
          current_onboarding_step: currentStep,
        })
        .eq('email', email);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating registration status:', error);
      throw error;
    }
  }

  // Save step data
  async saveStepData(email: string, step: string, data: any) {
    try {
      const { error } = await supabase
        .from('admin_registrations')
        .update({
          [`${step}`]: data,
          current_onboarding_step: step,
        })
        .eq('email', email);

      if (error) throw error;
    } catch (error) {
      console.error(`Error saving ${step} data:`, error);
      throw error;
    }
  }

  // Complete onboarding
  async completeOnboarding(email: string, data: AdminRegistrationData) {
    try {
      // First, upload any media files
      const mediaUrls = await this.uploadMediaFiles(data.media);

      // Update admin_registrations with all data
      const { error } = await supabase
        .from('admin_registrations')
        .update({
          mess_details: data.messDetails,
          location_details: data.location,
          contact_details: data.contact,
          timing_details: data.timing,
          media_files: { ...mediaUrls },
          status: 'verification_pending',
          submitted_at: new Date().toISOString(),
        })
        .eq('email', email);

      if (error) throw error;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  // Upload media files to Supabase storage
  /*
  private async uploadMediaFiles(media: Partial<MessMedia>) {
    console.log(
      'adminRegistrationService/uploadMediaFiles:-> started uploading media',
    );
    if (!media.photos) return {};
    console.log('media.photos: ', media.photos);

    const uploadPromises = Object.entries(media.photos).map(
      async ([category, photos]) => {
        const uploadedUrls = await Promise.all(
          photos.map(async (photo, index) => {
            const fileName = `${Date.now()}_${index}.jpg`;
            const filePath = `mess_photos/${category}/${fileName}`;
            console.log('fileName: ', fileName);
            console.log('filePath: ', filePath);
            // Convert URI to Blob
            const response = await fetch(photo);
            const blob = await response.blob();
            console.log('response: ', response);
            console.log('blob: ', blob);

            const { data, error } = await supabase.storage
              .from('avatars')
              .upload(filePath, blob, {
                contentType: 'image/jpeg',
                upsert: true,
              });
            if (error) console.log('error uploading media: ', error);
            if (data) console.log('data: ', data);

            if (error) throw error;

            // Get public URL
            const {
              data: { publicUrl },
            } = supabase.storage.from('mess_media').getPublicUrl(filePath);

            return publicUrl;
          }),
        );

        return [category, uploadedUrls];
      },
    );

    const results = await Promise.all(uploadPromises);
    console.log(
      'adminRegistrationService/uploadMediaFiles:-> finished uploading media',
    );
    return Object.fromEntries(results);
  }
    */

  private async uploadMediaFiles(media: Partial<MessMedia>) {
    try {
      console.log('=== Starting Media Upload Process ===');

      // Check authentication status first
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();
      if (authError || !session) {
        throw new Error('Authentication required for file upload');
      }

      if (!media.photos) return {};

      const uploadPromises = Object.entries(media.photos).map(
        async ([category, photos]) => {
          console.log(`Processing category: ${category}`);

          const uploadedUrls = await Promise.all(
            photos.map(async (photo, index) => {
              try {
                const fileName = `${Date.now()}_${index}.jpg`;
                // Include user ID in path for better organization
                const filePath = `mess_photos/${session.user.id}/${category}/${fileName}`;
                console.log(`Processing ${filePath}`);

                // Read the file as base64 first
                const response = await fetch(photo);
                const blob = await response.blob();

                // Convert blob to base64
                return new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    try {
                      // Remove the data URL prefix to get just the base64 string
                      const base64Data = (reader.result as string).split(
                        ',',
                      )[1];

                      // Convert base64 back to Uint8Array for upload
                      const byteCharacters = atob(base64Data);
                      const byteNumbers = new Array(byteCharacters.length);

                      for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                      }

                      const uint8Array = new Uint8Array(byteNumbers);

                      // Upload to Supabase
                      const { data, error } = await supabase.storage
                        .from('mess_media')
                        .upload(filePath, uint8Array, {
                          contentType: 'image/jpeg',
                          upsert: true,
                        });

                      if (error) {
                        console.error('Supabase upload error:', error);
                        throw error;
                      }

                      console.log('Upload successful:', data);

                      // Get public URL
                      const {
                        data: { publicUrl },
                      } = supabase.storage
                        .from('mess_media')
                        .getPublicUrl(filePath);

                      resolve(publicUrl);
                    } catch (uploadError) {
                      console.error('Upload processing error:', uploadError);
                      reject(uploadError);
                    }
                  };

                  reader.onerror = () => {
                    reject(new Error('FileReader error'));
                  };

                  reader.readAsDataURL(blob);
                });
              } catch (photoError) {
                console.error(`Error processing photo ${index}:`, photoError);
                throw photoError;
              }
            }),
          );

          return [category, uploadedUrls];
        },
      );

      const results = await Promise.all(uploadPromises);
      return Object.fromEntries(results);
    } catch (error) {
      console.error('Fatal error in uploadMediaFiles:', error);
      throw error;
    }
  }

  // Load saved onboarding data
  async loadOnboardingData(email: string) {
    try {
      const { data, error } = await supabase
        .from('admin_registrations')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;

      return {
        messDetails: data.mess_details || {},
        location: data.location_details || {},
        contact: data.contact_details || {},
        timing: data.timing_details || {},
        media: data.media_files || { photos: {} },
      };
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      throw error;
    }
  }
}

export const adminRegistrationService = new AdminRegistrationService();
