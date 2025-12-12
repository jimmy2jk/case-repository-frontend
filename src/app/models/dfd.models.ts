export type DfdNodeType = 'process' | 'dataStore' | 'externalEntity';

export interface DfdBaseNode {
  id: string;
  name: string;
  description?: string;
  x: number;
  y: number;
}

export interface DfdProcess extends DfdBaseNode {}
export interface DfdDataStore extends DfdBaseNode {}
export interface DfdExternalEntity extends DfdBaseNode {}

export interface DfdDataFlow {
  id: string;
  fromType: DfdNodeType;
  fromId: string;
  toType: DfdNodeType;
  toId: string;
  label: string;
  description?: string;
}

export interface DfdDiagramModel {
  processes: DfdProcess[];
  dataStores: DfdDataStore[];
  externalEntities: DfdExternalEntity[];
  dataFlows: DfdDataFlow[];
}

export function createEmptyDfdModel(): DfdDiagramModel {
  return {
    processes: [],
    dataStores: [],
    externalEntities: [],
    dataFlows: []
  };
}
