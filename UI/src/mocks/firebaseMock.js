export const getDoc = jest.fn();
export const db = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc, // Ensure you export getDoc here
  onSnapshot: jest.fn(),
  updateDoc: jest.fn(),
};

export const auth = {
  currentUser: {
    uid: 'mockUserId',
  },
};