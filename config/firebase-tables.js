// firebase-tables.js
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-config");
const firebaseConfig = JSON.parse(process.env.firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
});

const db = admin.firestore();

const createUsersCollection = async () => {
  const usersRef = db.collection("users");
  await usersRef.doc("exampleUser").set({
    username: "example",
    email: "example@example.com",
    password: "hashedpassword",
    verified: false,
    profilePicUrl: null,
  });
  console.log("Users collection created (or already exists).");
};

const createPostsCollection = async () => {
  const postsRef = db.collection("posts");
  await postsRef.doc("examplePost").set({
    title: "Example Title",
    postText: "Example text for the post.",
    username: "example",
    postImageUrl: null,
  });
  console.log("Posts collection created (or already exists).");
};

const createCommentsCollection = async () => {
  const commentsRef = db.collection("comments");
  await commentsRef.doc("exampleComment").set({
    post_id: "examplePost", // Reference to post ID
    comment_desc: "Example comment text.",
    username: "example",
  });
  console.log("Comments collection created (or already exists).");
};

const createLikesCollection = async () => {
  const likesRef = db.collection("likes");
  await likesRef.doc("exampleLike").set({
    post_id: "examplePost", // Reference to post ID
    username: "example",
  });
  console.log("Likes collection created (or already exists).");
};

const createOtpVerificationCollection = async () => {
  const otpRef = db.collection("userOtpVerification");
  await otpRef.doc("exampleOtp").set({
    email: "example@example.com",
    otp: "123456",
    createdAt: admin.firestore.Timestamp.now(),
    expiresAt: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 5 * 60 * 1000)
    ), // Expires in 5 minutes
  });
  console.log("OTP Verification collection created (or already exists).");
};

const setupFirestore = async () => {
  try {
    await createUsersCollection();
    await createPostsCollection();
    await createCommentsCollection();
    await createLikesCollection();
    await createOtpVerificationCollection();

    console.log("Firestore setup completed successfully!");
  } catch (error) {
    console.error("Error setting up Firestore:", error);
  }
};

module.exports = {
  setupFirestore,
};
