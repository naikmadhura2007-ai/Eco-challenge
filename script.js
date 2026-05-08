/**
 * EcoHero — App Engine 4.0
 * Multi-page state management and UI rendering
 */

const INITIAL_DATA = {
    user: {
        name: "Dheeraj",
        avatar: "🦸",
        points: 3200,
        level: 4,
        cleanups: 15,
        location: "Mallapura, Karnataka",
        rank: "Elite Hero",
        isLoggedIn: false
    },
    challenges: [
        { id: 1, title: "BC Road Junction Cleanup", location: "BC Road, Bantwal", status: "active", image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80", points: 50, lat: 12.89, lon: 75.03 },
        { id: 2, title: "Bantwal Market Drive", location: "Bantwal Market", status: "active", image: "https://images.unsplash.com/photo-1488459711615-228751460f80?auto=format&fit=crop&w=600&q=80", points: 30, lat: 12.88, lon: 75.04 },
        { id: 3, title: "Adyar Riverside Clean", location: "Adyar, Netravati", status: "completed", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80", points: 20, lat: 12.87, lon: 74.92 },
        { id: 4, title: "Farangipete Roadside", location: "Farangipete", status: "active", image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=600&q=80", points: 45, lat: 12.88, lon: 74.96 },
        { id: 5, title: "Thumbe Dam Viewpoint", location: "Thumbe", status: "active", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80", points: 60, lat: 12.88, lon: 74.98 },
        { id: 6, title: "Bantwal Bypass Drive", location: "Bantwal Bypass", status: "active", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80", points: 55, lat: 12.89, lon: 75.05 }
    ],
    leaderboard: [
        { rank: 1, name: "Karthik", cleanups: 45, points: 5200 },
        { rank: 2, name: "Dhanush", cleanups: 38, points: 4950 },
        { rank: 3, name: "Aditiya", cleanups: 32, points: 3820 },
        { rank: 4, name: "Likhil", cleanups: 28, points: 3710 },
        { rank: 5, name: "Dheeraj", cleanups: 15, points: 3200, isUser: true }
    ],
    badges: [
        { name: "Starter Hero", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913564.png", unlocked: true, desc: "Joined the movement" },
        { name: "Waste Warrior", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913604.png", unlocked: true, desc: "Completed 5 cleanups" },
        { name: "Nature Guardian", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913520.png", unlocked: false, desc: "Restored a major park" },
        { name: "Elite Scout", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913444.png", unlocked: false, desc: "Reported 10 polluted areas" }
    ],
    communities: [
        { id: 1, name: "Goa Beach Warriors", location: "North Goa", members: 125, description: "Dedicated to coastal cleanup and marine protection.", isJoined: true },
        { id: 2, name: "Urban Foresters", location: "Margao", members: 45, description: "Tree plantation and urban gardening initiatives.", isJoined: false }
    ],
    avatars: ["👤", "🦊", "🌿", "🦸", "🌲", "🦁", "🐢", "🐳", "🐨", "🍄", "🍃", "🧤", "🏔️", "🐾", "🦋"]
};

let appState = JSON.parse(localStorage.getItem('eco_hero_state')) || INITIAL_DATA;
if (!localStorage.getItem('eco_hero_state')) {
    localStorage.setItem('eco_hero_state', JSON.stringify(appState));
}

function getRankBadge(level) {
    if (level >= 20) return { name: 'Platinum', class: 'rank-platinum', icon: '💎' };
    if (level >= 10) return { name: 'Gold', class: 'rank-gold', icon: '🥇' };
    if (level >= 5) return { name: 'Silver', class: 'rank-silver', icon: '🥈' };
    return { name: 'Bronze', class: 'rank-bronze', icon: '🥉' };
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Auth check
        const url = window.location.href.toLowerCase();
        const isLoginPage = url.includes('login.html');
        
        if (!appState.user.isLoggedIn && !isLoginPage) {
            window.location.href = 'login.html';
            return;
        } else if (appState.user.isLoggedIn && isLoginPage) {
            window.location.href = 'index.html';
            return;
        }

        // Force update leaderboard for existing users
        if (appState.leaderboard && appState.leaderboard[0].name === "EcoSentinel") {
            appState.leaderboard = INITIAL_DATA.leaderboard;
            saveState();
        }

        // Sync new challenges or update coordinates/titles for existing ones
        INITIAL_DATA.challenges.forEach(initialC => {
            const existingIndex = appState.challenges.findIndex(c => c.id === initialC.id);
            if (existingIndex === -1) {
                appState.challenges.push(initialC);
            } else {
                // Update all fields to match latest regional data
                appState.challenges[existingIndex].title = initialC.title;
                appState.challenges[existingIndex].location = initialC.location;
                appState.challenges[existingIndex].lat = initialC.lat;
                appState.challenges[existingIndex].lon = initialC.lon;
                appState.challenges[existingIndex].image = initialC.image;
            }
        });
        saveState();

        initApp();
    } catch (error) {
        console.error("App Initialization Failed:", error);
    }
});

function initApp() {
    updateCommonUI();
    
    // Determine which page we are on
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";

    if (page === "index.html" || page === "") {
        renderDashboard();
        initMap();
    } else if (page === "profile.html") {
        renderProfile();
        initMap();
    } else if (page === "challenges.html") {
        renderChallengesPage();
        initMap();
    } else if (page === "leaderboard.html") {
        renderLeaderboardPage();
    } else if (page === "community.html") {
        renderCommunityPage();
        initMap();
    }

    // Attach global form listeners if they exist on the page
    const challengeForm = document.getElementById('challenge-form');
    if (challengeForm) challengeForm.addEventListener('submit', handleCreateChallenge);

    const profileForm = document.getElementById('profile-form');
    if (profileForm) profileForm.addEventListener('submit', handleProfileUpdate);

    const communityForm = document.getElementById('community-form');
    if (communityForm) communityForm.addEventListener('submit', handleCreateCommunity);
}

function updateCommonUI() {
    const user = appState.user;
    const rank = getRankBadge(user.level);
    
    // Sidebar update
    const sidebarName = document.getElementById('sidebar-name');
    if (sidebarName) sidebarName.textContent = user.name;
    
    const sidebarPoints = document.getElementById('sidebar-points');
    if (sidebarPoints) sidebarPoints.textContent = user.points.toLocaleString();
    
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    if (sidebarAvatar) {
        if (user.avatar.length > 2) { // Is URL
            sidebarAvatar.src = user.avatar;
        } else { // Is Emoji/Initial
            sidebarAvatar.src = `https://ui-avatars.com/api/?name=${user.name}&background=14532d&color=fff`;
        }
    }

    // Welcome text on dashboard
    const welcomeName = document.getElementById('welcome-name');
    if (welcomeName) welcomeName.textContent = user.name;

    // Add logout listener if button exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            appState.user.isLoggedIn = false;
            saveState();
            window.location.href = 'login.html';
        };
    }
}

function renderDashboard() {
    // Stats
    const dashPoints = document.getElementById('dash-points');
    if (dashPoints) dashPoints.textContent = appState.user.points.toLocaleString();
    
    const dashCleanups = document.getElementById('dash-cleanups');
    if (dashCleanups) dashCleanups.textContent = appState.user.cleanups;

    // Challenges
    const grid = document.getElementById('dash-challenges-grid');
    if (grid) {
        const activeChallenges = appState.challenges.filter(c => c.status === 'active').slice(0, 3);
        grid.innerHTML = activeChallenges.map(c => renderChallengeCard(c)).join('');
    }

    // Leaderboard snippet
    const lbList = document.getElementById('dash-leaderboard-list');
    if (lbList) {
        lbList.innerHTML = appState.leaderboard.slice(0, 5).map((u, i) => renderLeaderboardItem(u, i)).join('');
    }
}

function initMap() {
    if (typeof L === 'undefined') {
        console.error("Leaflet library not loaded yet.");
        setTimeout(initMap, 500); // Try again shortly
        return;
    }
    const mapContainer = document.getElementById('map');
    if (!mapContainer || window.ecoMap) return;

    // Initialize map centered on Bantwal/BC Road
    window.ecoMap = L.map('map').setView([12.89, 75.03], 13);
    const map = window.ecoMap;

    // Satellite View (Esri World Imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    // Add Labels on top
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Labels &copy; Esri'
    }).addTo(map);

    // Add high-visibility task markers
    console.log(`Rendering ${appState.challenges.length} challenges to map`);
    appState.challenges.forEach(c => {
        if (c.lat && c.lon) {
            const taskIcon = L.divIcon({
                html: `
                    <div class="task-marker-container">
                        <div class="task-pulse"></div>
                        <div class="task-marker-icon">
                            <i class="fas fa-trash-alt"></i>
                        </div>
                    </div>
                `,
                className: 'custom-task-icon',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            const marker = L.marker([c.lat, c.lon], { icon: taskIcon }).addTo(map);
            marker.bindPopup(`
                <div style="width: 200px; padding: 10px;">
                    <img src="${c.image}" onerror="this.src='https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;">
                    <h4 style="margin: 0; font-size: 1.1rem; color: var(--text-dark);">${c.title}</h4>
                    <p style="margin: 8px 0; font-size: 0.85rem; color: var(--text-muted);"><i class="fas fa-map-marker-alt"></i> ${c.location}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid #eee;">
                        <span style="font-weight: 800; color: var(--primary);">+${c.points} PTS</span>
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lon}" target="_blank" class="btn btn-primary btn-sm" style="font-size: 0.7rem; padding: 5px 10px;">
                            <i class="fas fa-directions"></i> Go
                        </a>
                    </div>
                </div>
            `);
        }
    });

    // Live Location Tracking
    if ("geolocation" in navigator) {
        // Use cached location
        if (appState.user.lastLat && appState.user.lastLon) {
            updateUserMarker(appState.user.lastLat, appState.user.lastLon);
            map.setView([appState.user.lastLat, appState.user.lastLon], 12);
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            appState.user.lastLat = userLat;
            appState.user.lastLon = userLon;
            saveState();
            updateUserMarker(userLat, userLon);
        }, (err) => {
            console.warn("Location error:", err);
        });
    }

    function updateUserMarker(lat, lon) {
        const userIcon = L.divIcon({
            className: 'user-location-marker',
            iconSize: [20, 20]
        });
        if (window.userMarker) map.removeLayer(window.userMarker);
        if (window.regionCircle) map.removeLayer(window.regionCircle);
        window.userMarker = L.marker([lat, lon], {icon: userIcon}).addTo(map);
        window.regionCircle = L.circle([lat, lon], {
            color: 'var(--primary)',
            fillOpacity: 0.1,
            radius: 10000
        }).addTo(map);
    }
}

function renderProfile() {
    const user = appState.user;
    const rank = getRankBadge(user.level);
    
    const pName = document.getElementById('profile-name');
    if (pName) pName.textContent = user.name;
    
    const pLocation = document.getElementById('profile-location');
    if (pLocation) pLocation.textContent = user.location;

    const pAvatar = document.getElementById('profile-avatar');
    const pImg = document.getElementById('profile-img');
    const pEmoji = document.getElementById('profile-emoji');
    
    if (pAvatar) {
        if (user.avatar.length > 2) { // Image path or Base64
            if (pImg) {
                pImg.src = user.avatar;
                pImg.style.display = 'block';
            }
            if (pEmoji) pEmoji.style.display = 'none';
        } else { // Emoji
            if (pEmoji) {
                pEmoji.textContent = user.avatar;
                pEmoji.style.display = 'block';
            }
            if (pImg) pImg.style.display = 'none';
        }
    }

    const pPoints = document.getElementById('profile-points');
    if (pPoints) pPoints.textContent = user.points.toLocaleString();

    const pCleanups = document.getElementById('profile-cleanups');
    if (pCleanups) pCleanups.textContent = user.cleanups;

    // Rank Badge in profile
    const pRankContainer = document.getElementById('profile-rank-container');
    if (pRankContainer) {
        pRankContainer.innerHTML = `<span class="rank-badge ${rank.class}">${rank.icon} ${rank.name} Hero</span>`;
    }

    // Mystery Gifts
    const giftGrid = document.getElementById('mystery-gift-grid');
    if (giftGrid) {
        const nextGiftLevel = Math.ceil((user.level + 0.1) / 10) * 10;
        const isUnlocked = user.level >= 10;
        
        giftGrid.innerHTML = `
            <div class="mystery-gift-card ${isUnlocked ? 'gift-unlocked' : 'gift-locked'}">
                <i class="fas fa-gift" style="font-size: 3rem; color: var(--primary); margin-bottom: 15px;"></i>
                <h3 style="color: #fff; margin-bottom: 5px;">${isUnlocked ? 'Gift Available!' : 'Mystery Reward'}</h3>
                <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 20px;">
                    ${isUnlocked ? 'You reached Level 10! Open your environmental impact kit.' : `Unlocks at Level ${nextGiftLevel}`}
                </p>
                <button class="btn ${isUnlocked ? 'btn-primary' : 'btn-outline'}" ${!isUnlocked ? 'disabled' : ''} style="width: 100%;">
                    ${isUnlocked ? 'Claim Reward' : `Locked (${user.level}/${nextGiftLevel})`}
                </button>
            </div>
        `;
    }

    // Badges
    const badgeGrid = document.getElementById('profile-badges');
    if (badgeGrid) {
        badgeGrid.innerHTML = appState.badges.map(b => `
            <div class="badge-card ${b.unlocked ? 'unlocked' : 'locked'}">
                <div class="badge-icon-container">
                    <img src="${b.icon}" style="width: 40px;">
                </div>
                <h4>${b.name}</h4>
                <p style="font-size: 0.75rem; color: var(--text-muted);">${b.desc}</p>
            </div>
        `).join('');
    }

    // Avatar Grid in Modal
    const avatarGrid = document.getElementById('avatar-grid');
    if (avatarGrid) {
        avatarGrid.innerHTML = appState.avatars.map(a => `
            <div class="avatar-option" onclick="selectAvatar(this, '${a}')" style="cursor:pointer; font-size:1.5rem; padding:10px; border-radius:8px; border:1px solid var(--border); ${a === user.avatar ? 'border-color:var(--primary); background:var(--primary-light);' : ''}">${a}</div>
        `).join('');
    }
}

function renderChallengesPage() {
    const grid = document.getElementById('challenges-grid');
    if (grid) {
        grid.innerHTML = appState.challenges.map(c => renderChallengeCard(c)).join('');
    }
}

function renderLeaderboardPage() {
    const list = document.getElementById('leaderboard-list');
    if (list) {
        // Show from rank 4 onwards in the list
        const remaining = appState.leaderboard.slice(3);
        list.innerHTML = remaining.map((u, i) => renderLeaderboardItem(u, i + 3)).join('');
    }

    // Populate Podium (Top 3)
    const podiumData = appState.leaderboard.slice(0, 3);
    podiumData.forEach((u, i) => {
        const rankIdx = i + 1;
        const nameEl = document.getElementById(`top${rankIdx}-name`);
        const pointsEl = document.getElementById(`top${rankIdx}-points`);
        const imgEl = document.getElementById(`top${rankIdx}-img`);
        
        if (nameEl) nameEl.textContent = u.name;
        if (pointsEl) pointsEl.textContent = `${u.points.toLocaleString()} pts`;
        if (imgEl) {
            const localPath = u.isUser ? appState.user.avatar : `assest/${u.name.toLowerCase()}.jpg`;
            console.log(`Loading podium image for ${u.name}: ${localPath}`);
            imgEl.src = localPath;
            imgEl.onerror = () => {
                console.warn(`Failed to load ${localPath}, falling back to avatar`);
                imgEl.src = `https://ui-avatars.com/api/?name=${u.name}&background=${i === 0 ? 'ffd700' : i === 1 ? 'c0c0c0' : 'cd7f32'}&color=000`;
            };
        }
    });
}

function renderCommunityPage() {
    const grid = document.getElementById('communities-grid');
    if (grid) {
        grid.innerHTML = appState.communities.map(c => `
            <div class="card">
                <div class="card-content">
                    <span class="badge badge-green">${c.location}</span>
                    <h3 style="margin-bottom: 10px;">${c.name}</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">${c.description}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.85rem; font-weight: 600;">${c.members.toLocaleString()} members</span>
                        <button class="btn ${c.isJoined ? 'btn-outline' : 'btn-primary'}" onclick="toggleJoinCommunity(${c.id})">
                            ${c.isJoined ? 'Joined' : 'Join'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function renderChallengeCard(c) {
    return `
        <div class="card challenge-card-compact">
            <div class="card-img-container">
                <img src="${c.image}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'">
                <span class="badge ${c.status === 'active' ? 'badge-yellow' : 'badge-green'} card-status-badge">${c.status}</span>
            </div>
            <div class="card-content" style="padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <h3 style="font-size: 1rem; margin: 0;">${c.title}</h3>
                    <span style="font-weight: 800; color: var(--primary); font-size: 0.85rem;">+${c.points} PTS</span>
                </div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 15px;"><i class="fas fa-map-marker-alt"></i> ${c.location}</p>
                ${c.status === 'active' ? `
                    <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="openCompleteModal(${c.id})">Complete</button>
                ` : `
                    <div class="verified-pill">
                        <i class="fas fa-check-circle"></i> Verified
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderLeaderboardItem(u, i) {
    const rank = i + 1;
    return `
        <div class="lb-hero-card ${u.isUser ? 'is-user' : ''}">
            <div style="display: flex; align-items: center; gap: 20px;">
                <span style="font-weight: 900; width: 30px; font-size: 1.2rem; color: var(--text-muted);">#${rank}</span>
                <img src="${u.isUser ? appState.user.avatar : `assest/${u.name.toLowerCase()}.jpg`}" 
                     onload="console.log('Loaded: ' + this.src)" 
                     onerror="this.src='https://ui-avatars.com/api/?name=${u.name}&background=random'; console.warn('Failed to load: ' + this.src)" 
                     style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid var(--border); object-fit: cover;">
                <div>
                    <h4 style="font-size: 1rem; margin: 0;">${u.name} ${u.isUser ? '<span class="badge badge-green" style="font-size: 0.6rem; margin-left: 5px;">YOU</span>' : ''}</h4>
                    <p style="font-size: 0.75rem; color: var(--text-muted);">${u.cleanups} cleanups</p>
                </div>
            </div>
            <div style="text-align: right;">
                <span style="font-weight: 800; color: var(--primary); font-size: 1.2rem;">${u.points.toLocaleString()}</span>
                <p style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Points</p>
            </div>
        </div>
    `;
}

/* Handlers */
function toggleModal(id, show) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = show ? 'flex' : 'none';
}

function selectAvatar(el, a) {
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.style.borderColor = 'var(--border)';
        opt.style.background = 'transparent';
    });
    el.style.borderColor = 'var(--primary)';
    el.style.background = 'var(--primary-light)';
    document.getElementById('profile-emoji-input').value = a;
}

async function detectLocation(inputId) {
    const locInput = document.getElementById(inputId);
    if (!locInput) return;
    
    locInput.placeholder = "Detecting...";
    
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const data = await response.json();
                const city = data.address.city || data.address.town || data.address.village || "Unknown Location";
                const state = data.address.state || "";
                locInput.value = `${city}, ${state}`;
            } catch (error) {
                locInput.value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            }
        }, (error) => {
            alert("Location access denied. Please type manually.");
            locInput.placeholder = "City or GPS coords";
        });
    } else {
        alert("Geolocation not supported by your browser.");
    }
}

function handleProfileUpdate(e) {
    e.preventDefault();
    appState.user.name = document.getElementById('profile-name-input').value || appState.user.name;
    appState.user.location = document.getElementById('profile-location-input').value || appState.user.location;
    appState.user.avatar = document.getElementById('profile-emoji-input').value || appState.user.avatar;
    
    saveState();
    location.reload();
}

function handleCreateChallenge(e) {
    e.preventDefault();
    const newC = {
        id: Date.now(),
        title: document.getElementById('task-name-input').value,
        location: document.getElementById('task-location-input').value,
        status: 'active',
        image: document.getElementById('before-preview').src || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
        points: 25
    };
    appState.challenges.unshift(newC);
    saveState();
    location.reload();
}

function handleCreateCommunity(e) {
    e.preventDefault();
    const newComm = {
        id: Date.now(),
        name: document.getElementById('comm-name-input').value,
        location: document.getElementById('comm-location-input').value,
        description: document.getElementById('comm-desc-input').value,
        members: 1,
        isJoined: true
    };
    appState.communities.unshift(newComm);
    saveState();
    location.reload();
}

function openCompleteModal(id) {
    window.currentChallengeId = id;
    toggleModal('complete-modal', true);
}

document.getElementById('complete-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const c = appState.challenges.find(ch => ch.id === window.currentChallengeId);
    if (c) {
        c.status = 'completed';
        appState.user.points += c.points;
        appState.user.cleanups += 1;
        saveState();
        alert("Cleanup Verified! You earned points.");
        location.reload();
    }
});

function toggleJoinCommunity(id) {
    const c = appState.communities.find(ch => ch.id === id);
    if (c) {
        c.isJoined = !c.isJoined;
        c.members += c.isJoined ? 1 : -1;
        saveState();
        location.reload();
    }
}

function previewImage(input, imgId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById(imgId);
            img.src = e.target.result;
            img.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// --- AI Report Logic ---
function handleCapture(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('before-preview');
            const wrapper = document.getElementById('preview-wrapper');
            const camBtn = document.querySelector('.camera-btn-container');
            
            preview.src = e.target.result;
            wrapper.style.display = 'block';
            camBtn.style.display = 'none'; // Hide camera button after upload
            
            // Simulate Geo-tagging
            const locInput = document.getElementById('task-location-input');
            locInput.value = "Detecting GPS...";
            
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const lat = pos.coords.latitude.toFixed(4);
                    const lon = pos.coords.longitude.toFixed(4);
                    locInput.value = `${lat}, ${lon} (Verified)`;
                    locInput.style.color = "var(--primary)";
                    locInput.style.fontWeight = "bold";
                }, () => {
                    locInput.value = "12.8904, 75.0312 (Bantwal Default)";
                });
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function deleteCapture() {
    const wrapper = document.getElementById('preview-wrapper');
    const camBtn = document.querySelector('.camera-btn-container');
    const fileInput = document.getElementById('before-photo-input');
    const locInput = document.getElementById('task-location-input');
    
    wrapper.style.display = 'none';
    camBtn.style.display = 'flex';
    fileInput.value = "";
    locInput.value = "";
}

// Update form submission for AI simulation
document.getElementById('challenge-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formContainer = document.getElementById('report-form-container');
    const aiContainer = document.getElementById('ai-analyzing-container');
    const successContainer = document.getElementById('report-success-container');
    const statusText = document.getElementById('ai-status-text');

    // Step 1: Show AI Analyzing
    formContainer.style.display = 'none';
    aiContainer.style.display = 'block';

    setTimeout(() => {
        statusText.textContent = "Scanning terrain for pollution type...";
    }, 1500);

    setTimeout(() => {
        statusText.textContent = "Matching pollution with satellite data...";
    }, 3000);

    setTimeout(() => {
        statusText.textContent = "Calculating regional impact score...";
    }, 4500);

    // Step 2: Show Done (6 seconds total)
    setTimeout(() => {
        aiContainer.style.display = 'none';
        successContainer.style.display = 'block';
        
        // Add to app state (simulated)
        const newId = appState.challenges.length + 1;
        const newChallenge = {
            id: newId,
            title: document.getElementById('task-name-input').value,
            location: "Bantwal Region",
            status: "active",
            image: document.getElementById('before-preview').src,
            points: 40,
            lat: 12.89 + (Math.random() * 0.05),
            lon: 75.03 + (Math.random() * 0.05)
        };
        
        appState.challenges.push(newChallenge);
        saveState();
        initApp();
    }, 6000);
});

function saveState() {
    localStorage.setItem('eco_hero_state', JSON.stringify(appState));
}
