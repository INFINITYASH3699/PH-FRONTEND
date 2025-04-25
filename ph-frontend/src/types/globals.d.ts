import { Connection } from 'mongoose';

declare global {
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

// Declare react-beautiful-dnd module for TypeScript
declare module 'react-beautiful-dnd' {
  import * as React from 'react';

  // DragDropContext
  export interface DragDropContextProps {
    onDragEnd: (result: DropResult) => void;
    onDragStart?: (initial: DragStart) => void;
    onDragUpdate?: (update: DragUpdate) => void;
    children: React.ReactNode;
  }
  export const DragDropContext: React.FC<DragDropContextProps>;

  // Droppable
  export interface DroppableProps {
    droppableId: string;
    type?: string;
    mode?: 'standard' | 'virtual';
    isDropDisabled?: boolean;
    isCombineEnabled?: boolean;
    direction?: 'horizontal' | 'vertical';
    ignoreContainerClipping?: boolean;
    renderClone?: any;
    getContainerForClone?: any;
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactNode;
  }
  export const Droppable: React.FC<DroppableProps>;

  // Draggable
  export interface DraggableProps {
    draggableId: string;
    index: number;
    isDragDisabled?: boolean;
    disableInteractiveElementBlocking?: boolean;
    shouldRespectForcePress?: boolean;
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: DraggableRubric) => React.ReactNode;
  }
  export const Draggable: React.FC<DraggableProps>;

  // Types for provided and snapshot objects
  export interface DroppableProvided {
    innerRef: (element: HTMLElement | null) => void;
    droppableProps: {
      [key: string]: any;
    };
    placeholder?: React.ReactNode;
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith?: string;
    draggingFromThisWith?: string;
    isUsingPlaceholder: boolean;
  }

  export interface DraggableProvided {
    draggableProps: {
      [key: string]: any;
    };
    dragHandleProps: {
      [key: string]: any;
    } | null;
    innerRef: (element: HTMLElement | null) => void;
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean;
    isDropAnimating: boolean;
    isClone: boolean;
    dropAnimation?: {
      duration: number;
      curve: string;
      moveTo: {
        x: number;
        y: number;
      };
    };
    draggingOver?: string;
    combineWith?: string;
    combineTargetFor?: string;
    mode?: 'FLUID' | 'SNAP';
  }

  export interface DraggableRubric {
    draggableId: string;
    type: string;
    source: {
      droppableId: string;
      index: number;
    };
    mode: 'FLUID' | 'SNAP';
  }

  // Result types
  export interface DropResult {
    draggableId: string;
    type: string;
    source: {
      droppableId: string;
      index: number;
    };
    destination?: {
      droppableId: string;
      index: number;
    };
    reason: 'DROP' | 'CANCEL';
    mode: 'FLUID' | 'SNAP';
    combine?: {
      draggableId: string;
      droppableId: string;
    };
  }

  export interface DragStart {
    draggableId: string;
    type: string;
    source: {
      droppableId: string;
      index: number;
    };
    mode: 'FLUID' | 'SNAP';
  }

  export interface DragUpdate extends DragStart {
    destination?: {
      droppableId: string;
      index: number;
    };
    combine?: {
      draggableId: string;
      droppableId: string;
    };
  }
}

export {}
