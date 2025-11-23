class ThreatManager {
    constructor() {
        this.threats = [];
        this.filters = {
            types: ['crime', 'accident', 'nature', 'infrastructure', 'health', 'other'],
            levels: [1,2,3,4,5,6,7,8,9,10],
            voteStatus: 'all',
            search: ''
        };
        this.userId = 'user_' + Math.random().toString(36).substr(2, 9);
    }

    async loadThreats() {
        try {
            const response = await fetch('/api/threats');
            this.threats = await response.json();
            return this.threats;
        } catch (error) {
            console.error('Błąd ładowania danych:', error);
            return [];
        }
    }

    async addThreat(threatData) {
        try {
            const response = await fetch('/api/threats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(threatData)
            });

            if (response.ok) {
                const newThreat = await response.json();
                this.threats.push(newThreat);
                return newThreat;
            } else {
                throw new Error('Błąd serwera');
            }
        } catch (error) {
            throw error;
        }
    }

    async voteOnThreat(threatId, vote) {
        try {
            const response = await fetch(`/api/threats/${threatId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    vote: vote,
                    voter: this.userId 
                })
            });

            if (response.ok) {
                const updatedThreat = await response.json();
                const threatIndex = this.threats.findIndex(threat => threat.id === threatId);
                if (threatIndex !== -1) {
                    this.threats[threatIndex] = updatedThreat;
                }
                return updatedThreat;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Błąd głosowania');
            }
        } catch (error) {
            throw error;
        }
    }

    async deleteThreat(threatId) {
        try {
            const response = await fetch(`/api/threats/${threatId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.threats = this.threats.filter(threat => threat.id !== threatId);
                return true;
            } else {
                throw new Error('Błąd usuwania');
            }
        } catch (error) {
            throw error;
        }
    }

    isThreatVisible(threat) {
        const typeMatch = this.filters.types.includes(threat.type);
        const levelMatch = this.filters.levels.includes(threat.level);
        const searchMatch = !this.filters.search || threat.description.toLowerCase().includes(this.filters.search);
        
        const totalVotes = threat.votes.resolved + threat.votes.notResolved;
        const resolvedPercentage = totalVotes > 0 ? (threat.votes.resolved / totalVotes) * 100 : 0;
        
        let voteStatusMatch = true;
        if (this.filters.voteStatus === 'mostlyResolved') {
            voteStatusMatch = resolvedPercentage >= 50;
        } else if (this.filters.voteStatus === 'mostlyNotResolved') {
            voteStatusMatch = resolvedPercentage < 50;
        }
        
        return typeMatch && levelMatch && searchMatch && voteStatusMatch;
    }

    getVisibleThreats() {
        return this.threats.filter(threat => this.isThreatVisible(threat));
    }

    getStats() {
        const today = new Date().toDateString();
        const todayThreats = this.threats.filter(threat => 
            new Date(threat.date).toDateString() === today
        );

        const totalVotes = this.threats.reduce((sum, threat) => {
            return sum + threat.votes.resolved + threat.votes.notResolved;
        }, 0);

        return {
            today: todayThreats.length,
            totalVotes: totalVotes,
            total: this.threats.length
        };
    }

    getTypeName(type) {
        const names = {
            'crime': 'Przestępczość',
            'accident': 'Wypadek',
            'nature': 'Zagrożenie naturalne',
            'infrastructure': 'Infrastruktura',
            'health': 'Zdrowotne',
            'other': 'Inne'
        };
        return names[type] || 'Nieznany typ';
    }

    getThreatColor(level) {
        const colors = {
            1: '#27ae60', 2: '#2ecc71', 3: '#f1c40f', 4: '#f39c12',
            5: '#e67e22', 6: '#d35400', 7: '#e74c3c', 8: '#c0392b',
            9: '#8e44ad', 10: '#2c3e50'
        };
        return colors[level] || '#95a5a6';
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

    hasUserVoted(threat) {
        return threat.votes.voters.includes(this.userId);
    }

    getUserVotedThreats() {
        return this.threats.filter(threat => this.hasUserVoted(threat));
    }
}
