// utils/firestoreHelper.js - SIN orderBy (funciona inmediatamente)
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// PROYECTOS
// ============================================

export const getProjects = async (userId) => {
  try {
    const q = query(collection(db, 'projects'));  // ✅ Sin orderBy
    
    const snapshot = await getDocs(q);
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar en memoria
    return projects.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    return [];
  }
};

export const subscribeToProjects = (userId, callback) => {
  const q = query(collection(db, 'projects'));  // ✅ Sin orderBy

  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar en memoria
    const sorted = projects.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
    callback(sorted);
  }, (error) => {
    console.error('Error al suscribirse a proyectos:', error);
    callback([]);
  });
};

export const addProject = async (projectData) => {
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al agregar proyecto:', error);
    throw error;
  }
};

export const updateProject = async (projectId, projectData) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      ...projectData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    throw error;
  }
};

export const deleteProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    throw error;
  }
};

// ============================================
// TAREAS
// ============================================

export const getTasks = async (userId) => {
  try {
    const q = query(collection(db, 'tasks'));  // ✅ Sin orderBy
    
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar en memoria
    return tasks.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return [];
  }
};

export const subscribeToTasks = (userId, callback) => {
  const q = query(collection(db, 'tasks'));  // ✅ Sin orderBy

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar en memoria
    const sorted = tasks.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
    callback(sorted);
  }, (error) => {
    console.error('Error al suscribirse a tareas:', error);
    callback([]);
  });
};

export const addTask = async (taskData) => {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al agregar tarea:', error);
    throw error;
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...taskData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    throw error;
  }
};

// ============================================
// MIEMBROS DEL EQUIPO
// ============================================

export const getMembers = async (userId) => {
  try {
    const q = query(collection(db, 'teamMembers'));  // ✅ Sin orderBy
    
    const snapshot = await getDocs(q);
    const members = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar en memoria por nombre
    return members.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  } catch (error) {
    console.error('Error al obtener miembros:', error);
    return [];
  }
};

export const subscribeToMembers = (userId, callback) => {
  const q = query(collection(db, 'teamMembers'));  // ✅ Sin orderBy

  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar en memoria por nombre
    const sorted = members.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    callback(sorted);
  }, (error) => {
    console.error('Error al suscribirse a miembros:', error);
    callback([]);
  });
};

export const addMember = async (memberData) => {
  try {
    const docRef = await addDoc(collection(db, 'teamMembers'), {
      ...memberData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al agregar miembro:', error);
    throw error;
  }
};

export const updateMember = async (memberId, memberData) => {
  try {
    const memberRef = doc(db, 'teamMembers', memberId);
    await updateDoc(memberRef, memberData);
  } catch (error) {
    console.error('Error al actualizar miembro:', error);
    throw error;
  }
};

export const deleteMember = async (memberId) => {
  try {
    await deleteDoc(doc(db, 'teamMembers', memberId));
  } catch (error) {
    console.error('Error al eliminar miembro:', error);
    throw error;
  }
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

export const getTasksByProject = async (projectId) => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId)
    );
    
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar en memoria
    return tasks.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error al obtener tareas del proyecto:', error);
    return [];
  }
};

export const getTasksByAssignee = async (assigneeName) => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('assignee', '==', assigneeName)
    );
    
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar en memoria
    return tasks.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error al obtener tareas del usuario:', error);
    return [];
  }
};

export const countTasksByStatus = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'tasks'));
    const counts = {
      todo: 0,
      'in-progress': 0,
      review: 0,
      done: 0
    };
    
    snapshot.docs.forEach(doc => {
      const status = doc.data().status;
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    
    return counts;
  } catch (error) {
    console.error('Error al contar tareas:', error);
    return { todo: 0, 'in-progress': 0, review: 0, done: 0 };
  }
};
