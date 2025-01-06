// This component manages media uploads during the mess onboarding process.
// It handles both photo uploads to showcase the facility and document uploads
// for business verification. The implementation prioritizes image quality
// and efficient upload management while maintaining a user-friendly interface.

import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import {
  Card,
  Button,
  IconButton,
  Portal,
  Modal,
  useTheme,
  ProgressBar,
  List,
  Divider,
  HelperText,
} from 'react-native-paper';

import { Text } from '../../../../src/components/common/Text';
import { useOnboardingStore } from '../store/onboardingStore';
// import * as ImagePicker from 'expo-image-picker';
// import * as DocumentPicker from 'expo-document-picker';

// Define types for our media categories
interface PhotoCategory {
  id: 'entrance' | 'dining' | 'kitchen';
  title: string;
  description: string;
  required: boolean;
  maxPhotos: number;
  aspectRatio?: number;
}

interface DocumentCategory {
  id: 'fssai' | 'gst' | 'other';
  title: string;
  description: string;
  required: boolean;
  acceptedTypes: string[];
}

// Define our photo categories with their requirements
const PHOTO_CATEGORIES: PhotoCategory[] = [
  {
    id: 'entrance',
    title: 'Entrance & Exterior',
    description: 'Show your mess entrance and building exterior',
    required: true,
    maxPhotos: 3,
    aspectRatio: 4 / 3,
  },
  {
    id: 'dining',
    title: 'Dining Area',
    description: 'Showcase your dining space and seating arrangements',
    required: true,
    maxPhotos: 5,
    aspectRatio: 16 / 9,
  },
  {
    id: 'kitchen',
    title: 'Kitchen',
    description: 'Display your clean and well-maintained kitchen',
    required: true,
    maxPhotos: 4,
    aspectRatio: 4 / 3,
  },
];

// Define document categories with their requirements
const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  {
    id: 'fssai',
    title: 'FSSAI License',
    description: 'Food Safety and Standards Authority of India license',
    required: true,
    acceptedTypes: ['image/*', 'application/pdf'],
  },
  {
    id: 'gst',
    title: 'GST Registration',
    description: 'Goods and Services Tax registration certificate',
    required: false,
    acceptedTypes: ['image/*', 'application/pdf'],
  },
  {
    id: 'other',
    title: 'Other Documents',
    description: 'Any additional licenses or certificates',
    required: false,
    acceptedTypes: ['image/*', 'application/pdf'],
  },
];

export function MediaStep() {
  const theme = useTheme();
  const { media, updateMedia, errors, setError, clearError } =
    useOnboardingStore();
  const [selectedCategory, setSelectedCategory] =
    useState<PhotoCategory | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Request necessary permissions for media access
  // React.useEffect(() => {
  //   (async () => {
  //     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //     if (status !== 'granted') {
  //       setError('permissions', 'Media library access is required for uploads');
  //     }
  //   })();
  // }, []);

  // Handle photo selection and upload
  // const handleSelectPhotos = async (category: PhotoCategory) => {
  //   try {
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //       allowsMultipleSelection: true,
  //       quality: 0.8,
  //       aspect: [category.aspectRatio ? category.aspectRatio * 10 : 4, 10],
  //       allowsEditing: true,
  //     });

  //     if (!result.canceled) {
  //       // Simulate upload progress
  //       setIsUploading(true);
  //       setUploadProgress(0);

  //       // In a real app, you would upload to your server here
  //       // For now, we'll simulate the upload
  //       for (let i = 0; i <= 100; i += 10) {
  //         await new Promise(resolve => setTimeout(resolve, 100));
  //         setUploadProgress(i / 100);
  //       }

  //       // Update the store with the new photos
  //       const categoryPhotos = media.photos?.[category.id] || [];
  //       const newPhotos = [
  //         ...categoryPhotos,
  //         ...result.assets.map(asset => asset.uri),
  //       ].slice(0, category.maxPhotos);

  //       updateMedia({
  //         photos: {
  //           ...media.photos,
  //           [category.id]: newPhotos,
  //         },
  //       });

  //       setIsUploading(false);
  //       clearError(category.id);
  //     }
  //   } catch (error) {
  //     setError(category.id, 'Failed to upload photos. Please try again.');
  //     setIsUploading(false);
  //   }
  // };

  // // Handle document selection and upload
  // const handleSelectDocument = async (category: DocumentCategory) => {
  //   try {
  //     const result = await DocumentPicker.getDocumentAsync({
  //       type: category.acceptedTypes,
  //     });

  //     if (result.assets && result.assets.length > 0) {
  //       // Simulate upload progress
  //       setIsUploading(true);
  //       setUploadProgress(0);

  //       // In a real app, you would upload to your server here
  //       // For now, we'll simulate the upload
  //       for (let i = 0; i <= 100; i += 10) {
  //         await new Promise(resolve => setTimeout(resolve, 100));
  //         setUploadProgress(i / 100);
  //       }

  //       // Update the store with the new document
  //       updateMedia({
  //         certificates: {
  //           ...media.certificates,
  //           [category.id]: result.assets[0].uri,
  //         },
  //       });

  //       setIsUploading(false);
  //       clearError(category.id);
  //     }
  //   } catch (error) {
  //     setError(category.id, 'Failed to upload document. Please try again.');
  //     setIsUploading(false);
  //   }
  // };

  // // Handle photo removal
  // const handleRemovePhoto = (category: string, index: number) => {
  //   const categoryPhotos = media.photos?.[category] || [];
  //   const updatedPhotos = categoryPhotos.filter((_, i) => i !== index);

  //   updateMedia({
  //     photos: {
  //       ...media.photos,
  //       [category]: updatedPhotos,
  //     },
  //   });
  // };

  // Render photo category card
  const renderPhotoCategory = (category: PhotoCategory) => (
    <Card key={category.id} style={styles.categoryCard}>
      <Card.Content>
        <Text variant="titleMedium">{category.title}</Text>
        <Text variant="bodySmall" style={styles.categoryDescription}>
          {category.description}
        </Text>

        <View style={styles.photoGrid}>
          {(media.photos?.[category.id] || []).map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <IconButton
                icon="close"
                size={20}
                style={styles.removeButton}
                // onPress={() => handleRemovePhoto(category.id, index)}
              />
            </View>
          ))}

          {(media.photos?.[category.id]?.length || 0) < category.maxPhotos && (
            <Button
              mode="outlined"
              icon="camera"
              // onPress={() => handleSelectPhotos(category)}
              style={styles.addButton}
            >
              Add Photo
            </Button>
          )}
        </View>

        {errors[category.id] && (
          <HelperText type="error" visible={true}>
            {errors[category.id]}
          </HelperText>
        )}

        <HelperText type="info" visible={true}>
          {`${media.photos?.[category.id]?.length || 0}/${category.maxPhotos} photos uploaded`}
        </HelperText>
      </Card.Content>
    </Card>
  );

  // Render document category card
  const renderDocumentCategory = (category: DocumentCategory) => (
    <Card key={category.id} style={styles.categoryCard}>
      <Card.Content>
        <Text variant="titleMedium">{category.title}</Text>
        <Text variant="bodySmall" style={styles.categoryDescription}>
          {category.description}
        </Text>

        {media.certificates?.[category.id] ? (
          <View style={styles.documentPreview}>
            <Text variant="bodyMedium" numberOfLines={1}>
              Document uploaded
            </Text>
            <IconButton
              icon="close"
              size={20}
              onPress={() => {
                updateMedia({
                  certificates: {
                    ...media.certificates,
                    [category.id]: undefined,
                  },
                });
              }}
            />
          </View>
        ) : (
          <Button
            mode="outlined"
            icon="file-upload"
            // onPress={() => handleSelectDocument(category)}
            style={styles.documentButton}
          >
            Upload Document
          </Button>
        )}

        {errors[category.id] && (
          <HelperText type="error" visible={true}>
            {errors[category.id]}
          </HelperText>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Text variant="titleLarge" style={styles.title}>
        Photos & Documents
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Help customers know your mess better with photos and verify your
        business with required documents
      </Text>

      {/* Photos Section */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Mess Photos
      </Text>
      {PHOTO_CATEGORIES.map(renderPhotoCategory)}

      {/* Documents Section */}
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, styles.topSpacing]}
      >
        Business Documents
      </Text>
      {DOCUMENT_CATEGORIES.map(renderDocumentCategory)}

      {/* Upload Progress Modal */}
      <Portal>
        <Modal
          visible={isUploading}
          dismissable={false}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="titleMedium" style={styles.modalTitle}>
            Uploading...
          </Text>
          <ProgressBar progress={uploadProgress} style={styles.progressBar} />
        </Modal>
      </Portal>

      {/* Help Card */}
      <Card style={styles.helpCard}>
        <Card.Content>
          <Text variant="bodySmall" style={styles.helpText}>
            High-quality photos help attract more customers. Make sure your
            photos are well-lit and clearly show your facilities. All documents
            should be clear and up-to-date.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.7,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  topSpacing: {
    marginTop: 24,
  },
  categoryCard: {
    marginBottom: 16,
  },
  categoryDescription: {
    marginTop: 4,
    marginBottom: 16,
    opacity: 0.7,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    margin: -8,
  },
  addButton: {
    width: 100,
    height: 100,
    justifyContent: 'center',
  },
  documentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  documentButton: {
    marginTop: 8,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  helpCard: {
    marginTop: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  helpText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
