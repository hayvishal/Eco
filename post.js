import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, query, orderBy, getDocs, serverTimestamp, updateDoc, increment, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    let currentUser = null;

    // --- DOM Element References ---
    const mainPostContainer = document.getElementById('main-post-container');
    const postActionsContainer = document.getElementById('post-actions');
    const loadingMessage = document.getElementById('loading-post');
    const repliesSection = document.getElementById('replies-section');
    const repliesList = document.getElementById('replies-list');
    const addReplyFormContainer = document.getElementById('add-reply-form-container');
    const addReplyForm = document.getElementById('add-reply-form');
    const submitReplyBtn = document.getElementById('submit-reply-btn');
    const backToForumBtn = document.getElementById('back-to-forum');

    // --- Get Post ID from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    // --- Auth State Observer ---
    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user;
            document.getElementById('header-user-display-name').textContent = user.displayName || 'User';
            if (user.photoURL) {
                document.getElementById('header-profile-photo').src = user.photoURL;
            }
            if (postId) {
                loadPostAndReplies();
            } else {
                mainPostContainer.innerHTML = '<p class="text-red-600">Error: No post ID provided.</p>';
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    // --- Functions ---
    async function loadPostAndReplies() {
        try {
            const postRef = doc(db, "forumPosts", postId);
            const postSnap = await getDoc(postRef);

            if (!postSnap.exists()) {
                mainPostContainer.innerHTML = '<p class="text-red-600">Error: Post not found.</p>';
                return;
            }

            const post = postSnap.data();
            loadingMessage.style.display = 'none';

            const postDate = post.createdAt?.toDate().toLocaleString('en-IN') || 'N/A';
            mainPostContainer.innerHTML = `
                <div class="main-post">
                    <h1 class="text-3xl font-bold">${post.title}</h1>
                    <div class="post-meta">
                        Posted by <strong>${post.authorName || 'Anonymous'}</strong> on ${postDate}
                    </div>
                    <p class="post-content">${post.content}</p>
                </div>
            `;

            if (currentUser && currentUser.uid === post.authorId) {
                displayDeleteButton();
            }
            
            await loadReplies();
            addReplyFormContainer.style.display = 'block';

        } catch (error) {
            console.error("Error loading post: ", error);
            loadingMessage.textContent = 'Could not load the post.';
        }
    }

    function displayDeleteButton() {
        postActionsContainer.innerHTML = '';
        const deleteButton = document.createElement('button');
        deleteButton.id = 'delete-post-btn';
        deleteButton.className = 'glass-button-base glass-button-danger';
        deleteButton.textContent = 'Delete Post';
        deleteButton.addEventListener('click', handleDeletePost);
        postActionsContainer.appendChild(deleteButton);
    }

    async function handleDeletePost() {
        const isConfirmed = window.confirm("Are you sure you want to delete this post? This action cannot be undone.");
        
        if (isConfirmed && postId) {
            try {
                const postRef = doc(db, "forumPosts", postId);
                await deleteDoc(postRef);
                // Note: Deleting a document does NOT automatically delete its subcollections.
                // For a production app, a Cloud Function would be needed to delete all replies.
                alert("Post deleted successfully.");
                window.location.href = 'forum.html';
            } catch (error) {
                console.error("Error deleting post: ", error);
                alert("Could not delete the post. Please try again.");
            }
        }
    }

    async function loadReplies() {
        const repliesRef = collection(db, "forumPosts", postId, "replies");
        const q = query(repliesRef, orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);

        repliesList.innerHTML = '';
        if (querySnapshot.empty) {
            repliesList.innerHTML = '<p class="text-gray-500">No replies yet. Be the first to comment!</p>';
        } else {
            querySnapshot.forEach(replyDoc => {
                const reply = replyDoc.data();
                const replyId = replyDoc.id;
                const replyElement = document.createElement('div');
                replyElement.className = 'reply-item';
                replyElement.setAttribute('data-reply-id', replyId);
                const replyDate = reply.createdAt?.toDate().toLocaleString('en-IN') || 'N/A';

                // Check if the current user is the author of the reply
                const isAuthor = currentUser && currentUser.uid === reply.authorId;

                replyElement.innerHTML = `
                    <div class="reply-avatar">
                        <img src="${reply.authorPhotoURL || 'https://placehold.co/40x40/cccccc/333333?text=👤'}" alt="Author photo">
                    </div>
                    <div class="reply-content">
                        <div class="reply-meta">
                            <strong>${reply.authorName || 'Anonymous'}</strong>
                            <span>${replyDate}</span>
                        </div>
                        <p>${reply.content}</p>
                    </div>
                    ${isAuthor ? `<button class="delete-reply-btn" data-reply-id="${replyId}">Delete</button>` : ''}
                `;
                repliesList.appendChild(replyElement);
            });
        }
        repliesSection.style.display = 'block';

        // Add event listeners to all delete buttons
        document.querySelectorAll('.delete-reply-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const replyIdToDelete = e.target.dataset.replyId;
                handleDeleteReply(replyIdToDelete);
            });
        });
    }

    async function handleDeleteReply(replyId) {
        const isConfirmed = window.confirm("Are you sure you want to delete this reply?");
        if (isConfirmed && postId && replyId) {
            try {
                // 1. Delete the reply document
                const replyRef = doc(db, "forumPosts", postId, "replies", replyId);
                await deleteDoc(replyRef);

                // 2. Decrement the replyCount on the main post
                const postRef = doc(db, "forumPosts", postId);
                await updateDoc(postRef, {
                    replyCount: increment(-1)
                });

                // 3. Remove the reply from the UI
                const replyElement = document.querySelector(`.reply-item[data-reply-id="${replyId}"]`);
                if (replyElement) {
                    replyElement.remove();
                }

            } catch (error) {
                console.error("Error deleting reply:", error);
                alert("Could not delete reply. Please try again.");
            }
        }
    }

    async function handleReplySubmit(e) {
        e.preventDefault();
        if (!currentUser || !postId) return;

        const content = document.getElementById('reply-content-input').value;
        if (!content.trim()) {
            alert('Reply cannot be empty.');
            return;
        }

        submitReplyBtn.disabled = true;
        submitReplyBtn.textContent = 'Submitting...';

        try {
            const repliesRef = collection(db, "forumPosts", postId, "replies");
            await addDoc(repliesRef, {
                content: content,
                authorId: currentUser.uid,
                authorName: currentUser.displayName,
                authorPhotoURL: currentUser.photoURL,
                createdAt: serverTimestamp()
            });

            const postRef = doc(db, "forumPosts", postId);
            await updateDoc(postRef, {
                replyCount: increment(1)
            });

            addReplyForm.reset();
            await loadReplies();

        } catch (error) {
            console.error("Error adding reply: ", error);
            alert("Could not submit reply. Please try again.");
        } finally {
            submitReplyBtn.disabled = false;
            submitReplyBtn.textContent = 'Submit Reply';
        }
    }

    // --- Event Listeners ---
    addReplyForm.addEventListener('submit', handleReplySubmit);
    backToForumBtn.addEventListener('click', () => window.location.href = 'forum.html');
});
