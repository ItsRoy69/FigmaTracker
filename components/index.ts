export interface Project {
    id: string;
    name: string;
    lastModified: string;
    teamId: string;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  }
  
  export interface ContributionStats {
    streak: number;
    total: number;
    lastContribution: string;
  }