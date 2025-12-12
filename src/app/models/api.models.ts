export interface ProjectDto {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
}

export interface ProjectCreateUpdateDto {
  name: string;
  description?: string | null;
}

export interface DfdDiagramDto {
  id: number;
  projectId: number;
  name: string;
  level: string;
  description?: string | null;
}

export interface DfdDiagramCreateUpdateDto {
  name: string;
  level: string;
  description?: string | null;
}

export interface DfdDiagramVersionDto {
  id: number;
  dfdDiagramId: number;
  versionNumber: number;
  createdAt: string;
  author?: string | null;
  content: string; // JSON string
}

export interface DfdDiagramVersionCreateDto {
  author?: string | null;
  content: string;
}
