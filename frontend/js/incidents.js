document.addEventListener('DOMContentLoaded', () => {
    // Initialisation
    loadIncidents();
    loadDeliveries();

    // Gestionnaire de soumission
    const form = document.getElementById('incident-form');
    if (form) {
        form.addEventListener('submit', createIncident);
    }
});

// Charger la liste des livraisons pour le select
async function loadDeliveries() {
    try {
        const select = document.getElementById('inc-del');
        if (!select) return;

        // Récupérer les livraisons depuis l'API
        const result = await api.request('/api/livraisons/');
        let deliveries = result;

        // Gérer la pagination
        if (result.results) {
            deliveries = result.results;
        }

        // Vider et remplir le select
        select.innerHTML = '<option value="">-- Aucune livraison liée --</option>';

        if (Array.isArray(deliveries)) {
            deliveries.forEach(d => {
                const option = document.createElement('option');
                option.value = d.id_livraison;
                option.textContent = `Livraison #${d.id_livraison} - ${d.destination || 'Destination inconnue'}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Erreur chargement livraisons:", error);
        // Ne pas bloquer l'UI, le select restera vide ou par défaut
    }
}

// Charger la liste des incidents
async function loadIncidents() {
    try {
        const tbody = document.getElementById('incidents-body');
        if (!tbody) return;

        // Indicateur de chargement
        tbody.innerHTML = '<tr><td colspan="5" class="text-center"><i class="fas fa-spinner fa-spin"></i> Chargement...</td></tr>';

        // Appel API
        const result = await api.request('/api/incidents/');
        let incidents = result;

        // Gérer la pagination DRF
        if (result.results) {
            incidents = result.results;
        }

        if (!incidents || incidents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Aucun incident signalé</td></tr>';
            return;
        }

        // Construire le HTML
        const html = incidents.map(i => {
            const date = new Date(i.date_incident).toLocaleString('fr-FR');
            const statutClass = i.statut === 'Ouvert' ? 'status-pending' : 'status-ok';
            const livraisonTxt = i.livraison ? `#${i.livraison}` : '<span class="text-muted">Aucune</span>';

            return `
                <tr>
                    <td><strong>#${i.id_incident}</strong></td>
                    <td>${i.type_incident}</td>
                    <td>${date}</td>
                    <td><span class="badge ${statutClass}">${i.statut}</span></td>
                    <td>${livraisonTxt}</td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = html;

    } catch (error) {
        console.error("Erreur chargement incidents:", error);
        const tbody = document.getElementById('incidents-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-danger">Erreur lors du chargement des données.</td></tr>';
    }
}

// Créer un nouvel incident
async function createIncident(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';

    try {
        const type = document.getElementById('inc-type').value;
        const description = document.getElementById('inc-desc').value;
        const livraisonId = document.getElementById('inc-del').value;

        const data = {
            type_incident: type,
            description: description,
            statut: 'Ouvert'
        };

        // Ajouter l'ID livraison seulement si sélectionné
        if (livraisonId) {
            data.livraison = parseInt(livraisonId);
        }

        await api.request('/api/incidents/', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        // Succès
        alert('Incident signalé avec succès !');
        e.target.reset();
        loadIncidents(); // Recharger la liste

    } catch (error) {
        console.error("Erreur création incident:", error);
        alert("Erreur lors de l'envoi du signalement. Veuillez réessayer.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}
