import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Step {
    id: number;
    label: string;
}

interface BookingStepperProps {
    currentStep: number;
    steps?: Step[];
}

export default function BookingStepper({ currentStep, steps = [
    { id: 1, label: 'Service' },
    { id: 2, label: 'Shop' },
    { id: 3, label: 'Payment' },
] }: BookingStepperProps) {

    return (
        <View style={styles.container}>
            {/* Progress Bar Container */}
            <View style={styles.progressTrack}>
                {steps.map((step, index) => {
                    const isCompleted = step.id < currentStep;
                    const isActive = step.id === currentStep;
                    const isFuture = step.id > currentStep;

                    return (
                        <React.Fragment key={step.id}>
                            {/* Line connecting steps */}
                            {index > 0 && (
                                <View
                                    style={[
                                        styles.line,
                                        { backgroundColor: currentStep >= step.id ? '#4CAF50' : '#E0E0E0' }
                                    ]}
                                />
                            )}

                            {/* Step Circle */}
                            <View style={{ alignItems: 'center' }}>
                                <View style={[
                                    styles.circle,
                                    isActive && styles.circleActive,
                                    isCompleted && styles.circleCompleted,
                                    isFuture && styles.circleFuture
                                ]}>
                                    {isCompleted ? (
                                        <Ionicons name="checkmark" size={14} color="#fff" />
                                    ) : (
                                        <Text style={[
                                            styles.stepNumber,
                                            isActive && styles.stepNumberActive,
                                            isFuture && styles.stepNumberFuture
                                        ]}>
                                            {step.id}
                                        </Text>
                                    )}
                                </View>
                                <Text style={[
                                    styles.label,
                                    isActive && styles.labelActive,
                                    isCompleted && styles.labelCompleted
                                ]}>
                                    {step.label}
                                </Text>
                            </View>
                        </React.Fragment>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#fff', // Match header bg
    },
    progressTrack: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    line: {
        flex: 1,
        height: 2,
        marginHorizontal: 5,
        marginBottom: 14, // Align with center of circle
    },
    circle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginBottom: 4,
    },
    circleActive: {
        backgroundColor: '#fff',
        borderColor: '#4CAF50',
        borderWidth: 2,
    },
    circleCompleted: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    circleFuture: {
        backgroundColor: '#f5f5f5',
        borderColor: '#E0E0E0',
    },
    stepNumber: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepNumberActive: {
        color: '#4CAF50',
    },
    stepNumberFuture: {
        color: '#BDBDBD',
    },
    label: {
        fontSize: 10,
        color: '#BDBDBD',
        fontWeight: '500',
    },
    labelActive: {
        color: '#1a1a1a',
        fontWeight: 'bold',
    },
    labelCompleted: {
        color: '#4CAF50',
    },
});
