class SafePlaceApp {
    constructor() {
        this.map = new SafePlaceMap();
        this.threatManager = new ThreatManager();
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadThreats();
        this.updateDisplay();
        this.setupLevelIndicator();
    }

    setupEventListeners() {
        // FORMULARZ ZGŁOSZEŃ
        document.getElementById('threat-report').addEventListener('submit', (e) => {
            this.handleReportSubmit(e);
        });

        document.getElementById('cancel-report').addEventListener('click', () => {
            this.closeReportForm();
        });

        // SUWAK POZIOMU ZAGROŻENIA
        document.getElementById('threat-level').addEventListener('input', (e) => {
            const level = e.target.value;
            document.getElementById('current-level').textContent = level;
            this.updateLevelIndicator(level);
        });

        // SYSTEM POMOCY
        document.getElementById('help-btn').addEventListener('click', () => {
            this.showHelp();
        });

        document.getElementById('help-floating-btn').addEventListener('click', () => {
            this.showHelp();
        });

        document.getElementById('close-help').addEventListener('click', () => {
            this.hideHelp();
        });

        document.getElementById('close-help-btn').addEventListener('click', () => {
            this.hideHelp();
        });

        document.getElementById('help-modal').addEventListener('click', (e) => {
            if (e.target.id === 'help-modal') {
                this.hideHelp();
            }
        });

        // FILTRY W CZASIE RZECZYWISTYM
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.threatManager.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateTypeFilters();
                this.applyFilters();
            });
        });

        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.classList.toggle('active');
                this.updateLevelFilters();
                this.applyFilters();
            });
        });

        document.querySelectorAll('input[name="voteStatus"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.threatManager.filters.voteStatus = e.target.value;
                this.applyFilters();
            });
        });

        // WYCZYSZCZANIE FILTRÓW
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });

        // PANEL ZGŁOSZEŃ
        document.getElementById('show-reports-btn').addEventListener('click', () => {
            this.toggleReportsSidebar();
        });

        document.getElementById('show-reports-btn-sidebar').addEventListener('click', () => {
            this.toggleReportsSidebar();
        });

        document.getElementById('close-reports').addEventListener('click', () => {
            this.closeReportsSidebar();
        });

        // KLIKNIĘCIE MAPY
        document.addEventListener('mapClick', (e) => {
            this.openReportForm(e.detail.latlng);
        });

        // ZAKŁADKI W PANELU ZGŁOSZEŃ
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.tab + '-tab').classList.add('active');
                this.updateReportsList();
            });
        });
    }

    showHelp() {
        document.getElementById('help-modal').classList.add('active');
    }

    hideHelp() {
        document.getElementById('help-modal').classList.remove('active');
    }

    setupLevelIndicator() {
        this.updateLevelIndicator(5);
    }

    updateLevelIndicator(level) {
        const levelFill = document.getElementById('level-fill');
        const percentage = (level / 10) * 100;
        
        levelFill.style.width = `${percentage}%`;
        
        let color;
        if (level <= 2) {
            color = 'linear-gradient(90deg, #27ae60, #2ecc71)';
        } else if (level <= 4) {
            color = 'linear-gradient(90deg, #27ae60, #f1c40f)';
        } else if (level <= 6) {
            color = 'linear-gradient(90deg, #f1c40f, #e67e22)';
        } else if (level <= 8) {
            color = 'linear-gradient(90deg, #e67e22, #e74c3c)';
        } else {
            color = 'linear-gradient(90deg, #e74c3c, #8e44ad)';
        }
        
        levelFill.style.background = color;
    }

    async loadThreats() {
        await this.threatManager.loadThreats();
        this.threatManager.threats.forEach(threat => {
            this.map.addThreatMarker(threat);
        });
    }

    openReportForm(latlng) {
        const form = document.getElementById('report-form');
        form.classList.add('active');
        form.dataset.lat = latlng.lat;
        form.dataset.lng = latlng.lng;
        this.setupLevelIndicator();
    }

    closeReportForm() {
        document.getElementById('report-form').classList.remove('active');
        document.getElementById('threat-report').reset();
        document.getElementById('current-level').textContent = '5';
        this.updateLevelIndicator(5);
        delete document.getElementById('report-form').dataset.lat;
        delete document.getElementById('report-form').dataset.lng;
    }

    async handleReportSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const lat = parseFloat(form.parentElement.dataset.lat);
        const lng = parseFloat(form.parentElement.dataset.lng);
        
        if (!lat || !lng) {
            this.showNotification('Błąd: Nie wybrano lokalizacji na mapie!', 'error');
            return;
        }

        const threatData = {
            lat: lat,
            lng: lng,
            type: document.getElementById('threat-type').value,
            level: parseInt(document.getElementById('threat-level').value),
            description: document.getElementById('threat-description').value
        };

        if (!threatData.type || !threatData.description) {
            this.showNotification('Proszę wypełnić wszystkie wymagane pola!', 'error');
            return;
        }

        try {
            const newThreat = await this.threatManager.addThreat(threatData);
            this.map.addThreatMarker(newThreat);
            this.closeReportForm();
            this.updateDisplay();
            this.showNotification('Zgłoszenie zostało dodane!', 'success');
        } catch (error) {
            this.showNotification('Błąd podczas dodawania zgłoszenia', 'error');
        }
    }

    async voteOnThreat(threatId, vote) {
        try {
            const updatedThreat = await this.threatManager.voteOnThreat(threatId, vote);
            this.map.updateMarker(updatedThreat);
            this.updateDisplay();
            this.showNotification('Twój głos został zapisany!', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async deleteThreat(threatId) {
        if (!confirm('Czy na pewno chcesz usunąć to zgłoszenie?')) {
            return;
        }

        try {
            await this.threatManager.deleteThreat(threatId);
            this.map.removeMarker(threatId);
            this.updateDisplay();
            this.showNotification('Zgłoszenie zostało usunięte', 'success');
        } catch (error) {
            this.showNotification('Błąd podczas usuwania zgłoszenia', 'error');
        }
    }

    updateDisplay() {
        this.applyFilters();
        this.updateStats();
        this.updateReportsList();
    }

    updateStats() {
        const stats = this.threatManager.getStats();
        document.getElementById('today-count').textContent = stats.today;
        document.getElementById('total-votes').textContent = stats.totalVotes;
        document.getElementById('total-count').textContent = stats.total;
    }

    updateReportsList() {
        const activeReportsList = document.getElementById('active-reports-list');
        const votedReportsList = document.getElementById('voted-reports-list');
        
        const visibleThreats = this.threatManager.getVisibleThreats();
        const votedThreats = this.threatManager.getUserVotedThreats();
        
        activeReportsList.innerHTML = '';
        votedReportsList.innerHTML = '';
        
        if (visibleThreats.length === 0) {
            activeReportsList.innerHTML = '<div class="report-item"><p>Brak zgłoszeń spełniających kryteria</p></div>';
        } else {
            visibleThreats.slice(-10).reverse().forEach(threat => {
                activeReportsList.appendChild(this.createReportItem(threat));
            });
        }
        
        if (votedThreats.length === 0) {
            votedReportsList.innerHTML = '<div class="report-item"><p>Nie zagłosowałeś jeszcze na żadne zgłoszenie</p></div>';
        } else {
            votedThreats.slice(-10).reverse().forEach(threat => {
                votedReportsList.appendChild(this.createReportItem(threat));
            });
        }
    }

    createReportItem(threat) {
        const totalVotes = threat.votes.resolved + threat.votes.notResolved;
        const resolvedPercentage = totalVotes > 0 ? Math.round((threat.votes.resolved / totalVotes) * 100) : 0;
        const hasVoted = this.threatManager.hasUserVoted(threat);

        const reportItem = document.createElement('div');
        reportItem.className = `report-item ${hasVoted ? 'voted' : ''}`;
        reportItem.innerHTML = `
            <div class="report-type">${this.threatManager.getTypeName(threat.type)}</div>
            <div class="report-level" style="background: ${this.threatManager.getThreatColor(threat.level)}">
                Poziom ${threat.level}
            </div>
            <div class="report-description">${threat.description}</div>
            <div class="report-votes">
                ${resolvedPercentage}% uważa za rozwiązane (${threat.votes.resolved} 👍 / ${threat.votes.notResolved} 👎)
            </div>
            <div class="report-date">${this.threatManager.formatDate(threat.date)}</div>
            <button class="btn btn-danger btn-small" onclick="app.deleteThreat('${threat.id}')" style="margin-top: 8px;">Usuń</button>
            ${hasVoted ? '<div class="report-date">✅ Zagłosowano</div>' : ''}
        `;
        
        reportItem.addEventListener('click', () => {
            this.map.focusOnThreat(threat);
            this.closeReportsSidebar();
        });
        
        return reportItem;
    }

    toggleReportsSidebar() {
        this.updateReportsList();
        document.getElementById('reports-sidebar').classList.toggle('active');
    }

    closeReportsSidebar() {
        document.getElementById('reports-sidebar').classList.remove('active');
    }

    applyFilters() {
        this.map.filterMarkers((threat) => this.threatManager.isThreatVisible(threat));
        this.updateStats();
        this.updateReportsList();
    }

    updateTypeFilters() {
        this.threatManager.filters.types = [];
        document.querySelectorAll('.filter-option input[type="checkbox"]:checked').forEach(checkbox => {
            this.threatManager.filters.types.push(checkbox.dataset.type);
        });
    }

    updateLevelFilters() {
        this.threatManager.filters.levels = [];
        document.querySelectorAll('.level-btn.active').forEach(btn => {
            this.threatManager.filters.levels.push(parseInt(btn.dataset.level));
        });
    }

    clearFilters() {
        // Resetuj wszystkie kontrolki filtrów
        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
        });
        
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.add('active');
        });
        
        document.querySelector('input[value="all"]').checked = true;
        
        document.getElementById('search-input').value = '';
        
        // Zresetuj filtry w managerze
        this.threatManager.filters.types = ['crime', 'accident', 'nature', 'infrastructure', 'health', 'other'];
        this.threatManager.filters.levels = [1,2,3,4,5,6,7,8,9,10];
        this.threatManager.filters.voteStatus = 'all';
        this.threatManager.filters.search = '';
        
        // Automatycznie zastosuj wyczyszczone filtry
        this.applyFilters();
        
        this.showNotification('Filtry zostały wyczyszczone', 'success');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SafePlaceApp();
});
