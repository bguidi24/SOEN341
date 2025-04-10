# Requirements

Everyone can develop on this UI design and propose new changes as the project goes on.

Remember to write "npm i" in your termnal to install the node js packages that go with the UI.

To run the virtual environment, type in "npm run dev" in the terminal and you'll get provided a certain link to observe the UI changes.



Use this code (in the database's rule tab) to make the connections between the database and the app work (then change it back to what it was):

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /servers/{serverId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /channels/{channelId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /channels/{channelId}/messages/{messageId} {
      allow read, write: if true;
    }
  }
}


This is used until user authentication works for Group-Messaging.
