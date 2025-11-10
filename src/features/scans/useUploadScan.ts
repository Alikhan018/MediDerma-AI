import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { ImagePickerAsset } from 'expo-image-picker';
import { collection, doc } from 'firebase/firestore';

import { useAuth } from '@/hooks/useAuth';
import { FirebaseFirestoreService } from '@/services/firebase/firestore.firebase';
import { FirebaseStorageService } from '@/services/firebase/storage.firebase';
import { firestore } from '@/firebase/firebase.config';

export interface UploadScanResult {
    scanId: string;
    storagePath: string;
    downloadUrl: string;
}

export function useUploadScan() {
    const { user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);

    const firestoreService = useMemo(() => new FirebaseFirestoreService(), []);
    const storageService = useMemo(() => new FirebaseStorageService(), []);

    const uploadScan = useCallback(
        async (asset: ImagePickerAsset): Promise<UploadScanResult | null> => {
            if (!user) {
                Alert.alert('Authentication Required', 'Please sign in to upload a scan.');
                return null;
            }

            setIsUploading(true);

            try {
                const compressed = await ImageManipulator.manipulateAsync(
                    asset.uri,
                    [],
                    { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
                );

                const scanCollectionRef = collection(firestore, 'users', user.uid, 'scans');
                const scanDocumentRef = doc(scanCollectionRef);
                const scanId = scanDocumentRef.id;

                const { downloadUrl, storagePath } = await storageService.uploadScanImage(
                    user.uid,
                    scanId,
                    compressed.uri
                );

                await firestoreService.createScanDocument({
                    userId: user.uid,
                    scanId,
                    imagePath: storagePath,
                    downloadUrl,
                    status: 'pending_analysis',
                });

                // TODO: Invoke AI inference service with the uploaded scan.

                return { scanId, storagePath, downloadUrl };
            } catch (error) {
                console.error('Upload scan failed:', error);
                Alert.alert('Upload Failed', 'We could not upload your scan. Please try again.');
                return null;
            } finally {
                setIsUploading(false);
            }
        },
        [user, firestoreService, storageService]
    );

    return { uploadScan, isUploading };
}

