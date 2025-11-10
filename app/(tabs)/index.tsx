import React, { useCallback, useMemo } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { Screen, Text, LoadingSpinner } from '@/components/ui';
import { useTheme } from '@/theme/index';
import { Section } from '@/components/dashboard/Section';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useUploadScan } from '@/features/scans/useUploadScan';
import { useScans } from '@/features/scans/useScans';
import { useRouter } from 'expo-router';
import { useProfileCompletionGuard } from '@/hooks/useProfileCompletionGuard';

export default function HomeTabScreen() {
    const { colors, spacing } = useTheme();
    const router = useRouter();
    const { user } = useAuth();
    const { uploadScan, isUploading } = useUploadScan();
    const { isProfileComplete, ensureProfileComplete } = useProfileCompletionGuard();
    const { latestScan, isLoading: isLoadingScans, fetchPage, clearCache, fetchTotalCount } = useScans(1, {
        enabled: isProfileComplete,
    });

    const styles = useMemo(
        () =>
            StyleSheet.create({
                content: {
                    paddingHorizontal: spacing.xl,
                    paddingVertical: spacing.xl,
                    gap: spacing.lg,
                },
                quickActions: {
                    flexDirection: 'row',
                    gap: spacing.md,
                },
                actionCard: {
                    flex: 1,
                    backgroundColor: colors.surface,
                    borderRadius: 20,
                    paddingVertical: spacing.lg,
                    paddingHorizontal: spacing.md,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: colors.border,
                    alignItems: 'center',
                    gap: spacing.sm,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 3,
                },
                actionText: {
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.text,
                    textAlign: 'center',
                },
            }),
        [colors, spacing]
    );

    const latestScanTimestamp = useMemo(() => {
        if (!latestScan) return null;
        return (
            latestScan.capturedAtDate ??
            latestScan.createdAtDate ??
            latestScan.updatedAtDate ??
            null
        );
    }, [latestScan]);

    const greetingName = useMemo(() => {
        if (user?.displayName) return user.displayName.toLocaleUpperCase();
        if (user?.email) return user.email.split('@')[0];
        return 'Explorer';
    }, [user]);

    const pickImage = useCallback(
        async (source: 'camera' | 'library') => {
            if (!ensureProfileComplete('upload a scan')) {
                return;
            }
            try {
                if (source === 'camera') {
                    const permission = await ImagePicker.requestCameraPermissionsAsync();
                    if (permission.status !== ImagePicker.PermissionStatus.GRANTED) {
                        Alert.alert('Permission Required', 'Camera access is needed to capture a new scan.');
                        return;
                    }
                    const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.8,
                    });
                    if (!result.canceled) {
                        const uploaded = await uploadScan(result.assets[0]);
                        if (uploaded) {
                            clearCache();
                            await fetchTotalCount();
                            await fetchPage(1, 1);
                            Alert.alert('Scan Uploaded', 'Your photo has been uploaded. Analysis will appear shortly.');
                        }
                    }
                } else {
                    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (permission.status !== ImagePicker.PermissionStatus.GRANTED) {
                        Alert.alert('Permission Required', 'Media library access is needed to upload a scan.');
                        return;
                    }
                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.8,
                    });
                    if (!result.canceled) {
                        const uploaded = await uploadScan(result.assets[0]);
                        if (uploaded) {
                            clearCache();
                            await fetchTotalCount();
                            await fetchPage(1, 1);
                            Alert.alert('Scan Uploaded', 'Your selected image has been uploaded. Analysis will appear shortly.');
                        }
                    }
                }
            } catch (error) {
                console.error('Image selection error:', error);
                Alert.alert('Upload Failed', 'We were unable to access your media. Please try again.');
            }
        },
        [clearCache, ensureProfileComplete, fetchPage, fetchTotalCount, uploadScan]
    );

    const handleUploadScan = useCallback(() => {
        if (!ensureProfileComplete('upload a scan')) {
            return;
        }
        Alert.alert('Upload Scan', 'Choose how you would like to add a new scan.', [
            {
                text: 'Take Photo',
                onPress: () => pickImage('camera'),
            },
            {
                text: 'Choose from Library',
                onPress: () => pickImage('library'),
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    }, [ensureProfileComplete, pickImage]);

    const handleViewHistory = useCallback(() => {
        if (!ensureProfileComplete('view scan history')) {
            return;
        }
        router.push('/scan-history');
    }, [ensureProfileComplete, router]);

    const uploadDisabled = !isProfileComplete || isUploading;
    const historyDisabled = !isProfileComplete;

    return (
        <Screen scrollable contentContainerStyle={styles.content}>
            <Section
                title={`Welcome, ${greetingName}`}
                subtitle="Here is a snapshot of your dermatology insights."
            >
                <Text style={{ color: colors.textSecondary }}>
                    Upload your first skin scan to unlock AI-powered diagnostics, treatment suggestions, and weather-aware
                    guidance tailored to you.
                </Text>
            </Section>

            <Section title="Latest Scan" subtitle="Insights from your most recent skin analysis.">
                {!isProfileComplete ? (
                    <EmptyState
                        icon="lock"
                        message="Complete your demographic profile to unlock scan insights."
                    />
                ) : isLoadingScans ? (
                    <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
                        <LoadingSpinner size="small" />
                        <Text color="textSecondary">Fetching your latest scan…</Text>
                    </View>
                ) : latestScan ? (
                    <View
                        style={{
                            backgroundColor: colors.surface,
                            borderRadius: 20,
                            borderWidth: StyleSheet.hairlineWidth,
                            borderColor: colors.border,
                            padding: spacing.lg,
                            gap: spacing.sm,
                            shadowColor: colors.primary,
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.06,
                            shadowRadius: 12,
                            elevation: 2,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                            <FontAwesome name="camera" size={18} color={colors.primary} />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>
                                Most Recent Scan
                            </Text>
                        </View>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                            Status: {latestScan.status?.toUpperCase() ?? 'PENDING'}
                        </Text>
                        <Text style={{ color: colors.textSecondary }}>
                            Captured: {latestScanTimestamp ? latestScanTimestamp.toLocaleString() : 'Awaiting timestamp'}
                        </Text>
                        <View
                            style={{
                                marginTop: spacing.sm,
                                width: '100%',
                                aspectRatio: 1.6,
                                borderRadius: 16,
                                backgroundColor: colors.surface,
                                overflow: 'hidden',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {latestScan.imageUrl ? (
                                <Image
                                    source={{ uri: latestScan.imageUrl }}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <FontAwesome name="image" size={28} color={colors.textSecondary} />
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={handleViewHistory}
                            style={{
                                marginTop: spacing.sm,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: spacing.xs,
                            }}
                        >
                            <FontAwesome name="history" size={14} color={colors.primary} />
                            <Text style={{ color: colors.primary, fontWeight: '600' }}>View detailed history</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <EmptyState
                        icon="camera"
                        message="You haven't scanned any images yet. Tap 'Upload Scan' to get started."
                    />
                )}
            </Section>

            <Section title="Quick Actions" subtitle="Access the most common workflows.">
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.actionCard, uploadDisabled && { opacity: 0.35 }]}
                        onPress={handleUploadScan}
                        disabled={uploadDisabled}
                    >
                        <FontAwesome name="cloud-upload" size={22} color={colors.primary} />
                        <Text style={styles.actionText}>
                            {isUploading ? 'Uploading…' : 'Upload Scan'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionCard, historyDisabled && { opacity: 0.35 }]}
                        onPress={handleViewHistory}
                        disabled={historyDisabled}
                    >
                        <FontAwesome name="history" size={22} color={colors.primary} />
                        <Text style={styles.actionText}>View History</Text>
                    </TouchableOpacity>
                </View>
            </Section>

            <Section
                title="Recommended Actions"
                subtitle="Personalized suggestions once scans and ancestral data are available."
            >
                <EmptyState
                    icon="lightbulb-o"
                    message="AI-powered recommendations will appear here after your first scan."
                />
            </Section>
        </Screen>
    );
}


