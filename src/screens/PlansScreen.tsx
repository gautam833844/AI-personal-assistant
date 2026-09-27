import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { PlanCard } from '../components/PlanCard';
import { PlanDetailModal } from '../components/PlanDetailModal';
import { PlanFormModal } from '../components/PlanFormModal';
import { Plan } from '../types/plan';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface PlansScreenProps {
  plans: Plan[];
  onTogglePlanTask: (planId: string, taskId: string) => void;
  onAddTaskToPlan: (planId: string, taskTitle: string) => void;
  onToggleCompletePlan: (planId: string) => void;
  onSavePlan: (
    planData: {
      name: string;
      targetDate: string;
      description?: string;
    },
    editingPlanId?: string
  ) => void;
}

export const PlansScreen: React.FC<PlansScreenProps> = ({
  plans,
  onTogglePlanTask,
  onAddTaskToPlan,
  onToggleCompletePlan,
  onSavePlan,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || null;

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (planData: {
    name: string;
    targetDate: string;
    description?: string;
  }) => {
    onSavePlan(planData, editingPlan?.id);
    setEditingPlan(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Plans</Text>
          <Text style={styles.headerSubtitle}>
            {plans.filter((p) => !p.completed).length} active goals & projects
          </Text>
        </View>

        {/* Plans List */}
        <View style={styles.planList}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onPress={() => setSelectedPlanId(plan.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button (+) */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.fab}
        onPress={() => {
          setEditingPlan(null);
          setIsFormModalOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Create new plan"
      >
        <Plus size={24} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Plan Detail Modal */}
      <PlanDetailModal
        plan={selectedPlan}
        visible={Boolean(selectedPlan)}
        onClose={() => setSelectedPlanId(null)}
        onToggleTask={onTogglePlanTask}
        onAddTaskToPlan={onAddTaskToPlan}
        onToggleCompletePlan={onToggleCompletePlan}
        onEditPlan={handleOpenEdit}
      />

      {/* Create / Edit Plan Modal */}
      <PlanFormModal
        visible={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingPlan(null);
        }}
        onSubmit={handleFormSubmit}
        initialPlan={editingPlan}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 110,
    gap: SPACING.xl,
  },
  header: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    gap: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  planList: {
    gap: SPACING.md,
  },
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: 80,
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textAccent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.textAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});
