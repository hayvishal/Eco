import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    let currentUser = null;
    let allPosts = []; // To store all fetched posts for searching

    // --- DOM Element References ---
    const postsListContainer = document.getElementById('forum-posts-list');
    const loadingMessage = document.getElementById('loading-posts');
    const createPostBtn = document.getElementById('create-new-post-btn');
    const backToFeaturesBtn = document.getElementById('back-to-features');
    const searchInput = document.getElementById('search-input');
    
    // Modal elements
    const modal = document.getElementById('new-post-modal');
    const cancelPostBtn = document.getElementById('cancel-post-btn');
    const newPostForm = document.getElementById('new-post-form');
    const submitPostBtn = document.getElementById('submit-post-btn');

    // --- Auth State Observer ---
    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user;
            document.getElementById('header-user-display-name').textContent = user.displayName || 'User';
            if (user.photoURL) {
                document.getElementById('header-profile-photo').src = user.photoURL;
            }
            loadPosts();
        } else {
            window.location.href = 'login.html';
        }
    });

    // --- Functions ---
    async function loadPosts() {
        try {
            const postsRef = collection(db, "forumPosts");
            const q = query(postsRef, orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            allPosts = []; // Clear previous posts
            querySnapshot.forEach(doc => {
                allPosts.push({ id: doc.id, ...doc.data() });
            });
            
            displayPosts(allPosts);

        } catch (error) {
            console.error("Error loading posts: ", error);
            postsListContainer.innerHTML = '<p>Could not load posts.</p>';
        }
    }

    function displayPosts(posts) {
        postsListContainer.innerHTML = ''; // Clear current list

        if (posts.length === 0) {
            postsListContainer.innerHTML = '<p class="text-gray-600">No posts found.</p>';
            return;
        }

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            postElement.setAttribute('data-id', post.id);

            const postDate = post.createdAt?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) || 'Just now';

            postElement.innerHTML = `
                <div class="post-item-avatar">
                    <img src="${post.authorPhotoURL || 'https://placehold.co/48x48/cccccc/333333?text=👤'}" alt="Author photo">
                </div>
                <div class="post-item-content">
                    <div class="post-item-title">${post.title}</div>
                    <div class="post-item-meta">
                        Posted by <strong>${post.authorName || 'Anonymous'}</strong> on ${postDate}
                    </div>
                </div>
                <div class="post-item-stats">
                    <div>${post.replyCount || 0}</div>
                    <div>Replies</div>
                </div>
            `;
            postsListContainer.appendChild(postElement);
            
            postElement.addEventListener('click', () => {
                window.location.href = `post.html?id=${post.id}`;
            });
        });
    }

    async function handlePostSubmit(e) {
        e.preventDefault();
        if (!currentUser) return;

        const title = document.getElementById('post-title-input').value;
        const content = document.getElementById('post-content-input').value;

        if (!title.trim() || !content.trim()) {
            alert('Please fill out both the title and content.');
            return;
        }

        submitPostBtn.disabled = true;
        submitPostBtn.textContent = 'Submitting...';

        try {
            await addDoc(collection(db, "forumPosts"), {
                title: title,
                content: content,
                authorId: currentUser.uid,
                authorName: currentUser.displayName,
                authorPhotoURL: currentUser.photoURL,
                createdAt: serverTimestamp(),
                replyCount: 0
            });
            closeModal();
            loadPosts(); // Refresh the posts list
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Could not create post. Please try again.");
        } finally {
            submitPostBtn.disabled = false;
            submitPostBtn.textContent = 'Submit Post';
        }
    }
    
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredPosts = allPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm)
        );
        displayPosts(filteredPosts);
    }

    function showModal() {
        newPostForm.reset();
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    // --- Event Listeners ---
    createPostBtn.addEventListener('click', showModal);
    cancelPostBtn.addEventListener('click', closeModal);
    newPostForm.addEventListener('submit', handlePostSubmit);
    backToFeaturesBtn.addEventListener('click', () => window.location.href = 'features.html');
    searchInput.addEventListener('input', handleSearch);
});
