import { useEffect } from 'react';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

export const DesignSystem = () => {
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply Global Colors
    root.style.setProperty('--primary-green', COLORS.primaryGreen);
    root.style.setProperty('--accent-green', COLORS.accentGreen);
    root.style.setProperty('--green-soft', COLORS.greenSoft);
    root.style.setProperty('--background', COLORS.background);
    root.style.setProperty('--surface', COLORS.surface);
    root.style.setProperty('--border', COLORS.border);
    root.style.setProperty('--divider', COLORS.divider);
    root.style.setProperty('--text', COLORS.text);
    root.style.setProperty('--text-secondary', COLORS.textSecondary);
    
    root.style.setProperty('--surface-subtle', COLORS.surfaceSubtle);
    root.style.setProperty('--surface-soft', COLORS.surfaceSoft);
    root.style.setProperty('--surface-alert', COLORS.surfaceAlert);
    root.style.setProperty('--surface-warning', COLORS.surfaceWarning);
    
    // Apply Status Colors
    root.style.setProperty('--todo-bg', COLORS.todo.bg);
    root.style.setProperty('--todo-text', COLORS.todo.text);
    root.style.setProperty('--progress-bg', COLORS.progress.bg);
    root.style.setProperty('--progress-text', COLORS.progress.text);
    root.style.setProperty('--done-bg', COLORS.done.bg);
    root.style.setProperty('--done-text', COLORS.done.text);
    
    // Apply Priority Colors
    root.style.setProperty('--high-bg', COLORS.priority.high.bg);
    root.style.setProperty('--high-text', COLORS.priority.high.text);
    root.style.setProperty('--medium-bg', COLORS.priority.medium.bg);
    root.style.setProperty('--medium-text', COLORS.priority.medium.text);
    root.style.setProperty('--low-bg', COLORS.priority.low.bg);
    root.style.setProperty('--low-text', COLORS.priority.low.text);
    
    // Apply Typography
    root.style.setProperty('--font-family', TYPOGRAPHY.fontFamily);
    
    // Apply Typography Scales
    root.style.setProperty('--fs-page-title', TYPOGRAPHY.sizes.pageTitle);
    root.style.setProperty('--fs-section-title', TYPOGRAPHY.sizes.sectionTitle);
    root.style.setProperty('--fs-metric-number', TYPOGRAPHY.sizes.metricNumber);
    root.style.setProperty('--fs-card-label', TYPOGRAPHY.sizes.cardLabel);
    root.style.setProperty('--fs-task-title', TYPOGRAPHY.sizes.taskTitle);
    root.style.setProperty('--fs-secondary', TYPOGRAPHY.sizes.secondaryText);
    root.style.setProperty('--fs-badge', TYPOGRAPHY.sizes.badgeText);
    
    root.style.setProperty('--fw-regular', TYPOGRAPHY.weights.regular);
    root.style.setProperty('--fw-medium', TYPOGRAPHY.weights.medium);
    root.style.setProperty('--fw-semibold', TYPOGRAPHY.weights.semibold);
    root.style.setProperty('--fw-bold', TYPOGRAPHY.weights.bold);
    
  }, []);

  return null;
};
