class SafePlaceMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.init();
    }

    init() {
        this.map = L.map('map').setView([52.0, 19.0], 6);

        this.map.setMaxBounds([
            [49.0, 14.0],
            [55.0, 24.5]
        ]);

        this.map.setMinZoom(6);
        this.map.setMaxZoom(13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(this.map);

        this.map.on('click', (e) => {
            const event = new CustomEvent('mapClick', { detail: { latlng: e.latlng } });
            document.dispatchEvent(event);
        });

        this.getUserLocation();
    }

    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    L.marker([userLocation.lat, userLocation.lng])
                        .addTo(this.map)
                        .bindPopup('Twoja aktualna lokalizacja')
                        .openPopup();
                    
                    this.map.setView([userLocation.lat, userLocation.lng], 13);
                },
                (error) => {
                    console.log('Błąd geolokalizacji:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        }
    }

    addThreatMarker(threat) {
        const threatColors = {
            1: '#27ae60', 2: '#2ecc71', 3: '#f1c40f', 4: '#f39c12',
            5: '#e67e22', 6: '#d35400', 7: '#e74c3c', 8: '#c0392b',
            9: '#8e44ad', 10: '#2c3e50'
        };

        const customIcon = L.divIcon({
            className: 'custom-threat-marker',
            html: `<div style="
                width: 24px; 
                height: 24px; 
                background: ${threatColors[threat.level]}; 
                border: 3px solid white; 
                border-radius: 50%; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
                animation: pulse 2s infinite;
            "></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const marker = L.marker([threat.lat, threat.lng], { icon: customIcon })
            .addTo(this.map)
            .bindPopup(this.createPopupContent(threat));

        this.markers.push({
            id: threat.id,
            marker: marker,
            threat: threat
        });

        return marker;
    }

    createPopupContent(threat) {
        const typeNames = {
            'crime': 'Przestępczość',
            'accident': 'Wypadek',
            'nature': 'Zagrożenie naturalne',
            'infrastructure': 'Uszkodzona infrastruktura',
            'health': 'Zagrożenie zdrowotne',
            'other': 'Inne'
        };

        const threatColors = {
            1: '#27ae60', 2: '#2ecc71', 3: '#f1c40f', 4: '#f39c12',
            5: '#e67e22', 6: '#d35400', 7: '#e74c3c', 8: '#c0392b',
            9: '#8e44ad', 10: '#2c3e50'
        };

        const totalVotes = threat.votes.resolved + threat.votes.notResolved;
        const resolvedPercentage = totalVotes > 0 ? Math.round((threat.votes.resolved / totalVotes) * 100) : 0;

        return `
            <div class="threat-popup">
                <h3>${typeNames[threat.type]}</h3>
                <p><strong>Poziom zagrożenia:</strong> 
                    <span class="threat-level-badge" style="background: ${threatColors[threat.level]}">
                        ${threat.level}/10
                    </span>
                </p>
                <p><strong>Opis:</strong> ${threat.description}</p>
                <p><strong>Data:</strong> ${this.formatDate(threat.date)}</p>
                <p><strong>Zgłoszono przez:</strong> ${threat.reportedBy}</p>
                
                <div class="vote-section">
                    <h4>Spoleczna weryfikacja:</h4>
                    <div class="vote-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${resolvedPercentage}%"></div>
                        </div>
                        <div class="vote-percentage">${resolvedPercentage}% uważa za rozwiązane</div>
                    </div>
                    <div class="vote-buttons">
                        <button class="vote-btn resolved" onclick="app.voteOnThreat('${threat.id}', 'resolved')">
                            👍 Rozwiązane
                        </button>
                        <button class="vote-btn not-resolved" onclick="app.voteOnThreat('${threat.id}', 'notResolved')">
                            👎 Nierozwiązane
                        </button>
                    </div>
                    <p style="font-size: 0.8rem; margin-top: 8px; color: #7f8c8d;">
                        Głosów: ${totalVotes} (${threat.votes.resolved} 👍 / ${threat.votes.notResolved} 👎)
                    </p>
                </div>

                <div class="popup-actions">
                    <button class="delete-btn" onclick="app.deleteThreat('${threat.id}')">Usuń zgłoszenie</button>
                </div>
            </div>
        `;
    }

    removeMarker(threatId) {
        const markerIndex = this.markers.findIndex(m => m.id === threatId);
        if (markerIndex !== -1) {
            this.map.removeLayer(this.markers[markerIndex].marker);
            this.markers.splice(markerIndex, 1);
        }
    }

    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker.marker);
        });
        this.markers = [];
    }

    filterMarkers(shouldShow) {
        this.markers.forEach(markerData => {
            const { marker, threat } = markerData;
            
            if (shouldShow(threat)) {
                if (!this.map.hasLayer(marker)) {
                    marker.addTo(this.map);
                }
            } else {
                if (this.map.hasLayer(marker)) {
                    this.map.removeLayer(marker);
                }
            }
        });
    }

    formatDate(date) {
        return new Date(date).toLocaleString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    focusOnThreat(threat) {
        this.map.setView([threat.lat, threat.lng], 15);
        const marker = this.markers.find(m => m.id === threat.id);
        if (marker) {
            marker.marker.openPopup();
        }
    }

    updateMarker(threat) {
        this.removeMarker(threat.id);
        this.addThreatMarker(threat);
    }
}
