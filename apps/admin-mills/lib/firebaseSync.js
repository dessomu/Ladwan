// Re-exported from centralized @ladwan/firebase/firestore
import {
  saveMill,
  getMill,
  listenMill,
  saveProduct,
  listenProducts,
  listenOrders,
  updateOrderStatus,
  saveOrder,
  seedMillToFirestore,
} from "@ladwan/firebase/firestore";

export const firestoreSync = {
  saveMill,
  getMill,
  listenMill,
  saveProduct,
  listenProducts,
  listenOrders,
  updateOrderStatus,
  saveOrder,
  seedInitialDataToFirestore: seedMillToFirestore,
};

export {
  saveMill,
  getMill,
  listenMill,
  saveProduct,
  listenProducts,
  listenOrders,
  updateOrderStatus,
  saveOrder,
  seedMillToFirestore,
};
