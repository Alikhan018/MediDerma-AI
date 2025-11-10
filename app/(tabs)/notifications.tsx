import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Screen } from '@/components/ui';
import { useTheme } from '@/theme/index';
import { Section } from '@/components/dashboard/Section';
import { EmptyState } from '@/components/dashboard/EmptyState';

export default function NotificationsTabScreen() {
    const { colors, spacing } = useTheme();

    const styles = useMemo(
        () =>
            StyleSheet.create({
                content: {
                    paddingHorizontal: spacing.xl,
                    paddingVertical: spacing.xl,
                    gap: spacing.lg,
                },
            }),
        [colors, spacing]
    );

    return (
        <Screen scrollable contentContainerStyle={styles.content}>
            <Section
                title="Weather Alerts"
                subtitle="Personalized tips based on local conditions."
                action={<FontAwesome name="cloud" size={20} color={colors.primary} />}
            >
                <EmptyState
                    icon="sun-o"
                    message="Weather-aware skin care tips will appear here once the AI model is connected."
                />
            </Section>

            <Section
                title="UV & Air Quality Insights"
                subtitle="Protective guidance derived from UV index and pollutants."
            >
                <EmptyState
                    icon="line-chart"
                    message="AI-driven alerts are on the way. Check back after the next release."
                />
            </Section>
        </Screen>
    );
}


