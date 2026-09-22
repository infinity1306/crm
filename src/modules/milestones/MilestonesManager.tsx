import React from 'react';
import { ProjectDetail } from '../projects/ProjectDetail';

interface MilestonesManagerProps {
  projectId: string;
}

export const MilestonesManager: React.FC<MilestonesManagerProps> = ({ projectId }) => {
  return <ProjectDetail projectId={projectId} initialTab="milestones" />;
};
