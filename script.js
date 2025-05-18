// Variables globales
const PLAFOND_ABATT_10_SALAIRES = 800000;
const PLAFOND_ABATT_10_PENSIONS = 550000;
const PLAFOND_ABATT_20 = 1800000;
const PLAFOND_RETRAITE = 3776500;

// Tranches d'imposition
const TRANCHES = [
    { min: 0, max: 1000000, taux: 0 },
    { min: 1000001, max: 1800000, taux: 4 },
    { min: 1800001, max: 3000000, taux: 12 },
    { min: 3000001, max: 4500000, taux: 25 },
    { min: 4500001, max: Infinity, taux: 40 }
];

// Fonctions d'initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners
    document.getElementById('situation-V').addEventListener('change', toggleVeufOptions);
    document.getElementById('NBENF').addEventListener('change', updateTotalEnfants);
    document.getElementById('NBETUD').addEventListener('change', updateTotalEnfants);
    document.getElementById('NBENFAC').addEventListener('change', updateTotalEnfants);
    document.getElementById('NBENFACH').addEventListener('change', updateTotalEnfants);
    document.getElementById('NBENFALT').addEventListener('change', updateTotalEnfants);
    document.getElementById('NBHANDIALT').addEventListener('change', updateTotalEnfants);
    document.getElementById('your-status').addEventListener('change', updateProfessionalFields);
    document.getElementById('spouse-status').addEventListener('change', updateSpouseProfessionalFields);
    document.getElementById('your-salary').addEventListener('input', calculateRetirementContributions);
    document.getElementById('your-indice').addEventListener('input', calculateRetirementContributions);
    document.getElementById('spouse-salary').addEventListener('input', calculateRetirementContributions);
    document.getElementById('spouse-indice').addEventListener('input', calculateRetirementContributions);
    document.getElementById('calculate-btn').addEventListener('click', calculateTax);
    
    // Initialisation
    updateTotalEnfants();
    updateProfessionalFields();
    updateSpouseProfessionalFields();
    calculateRetirementContributions();
});

// Fonctions utilitaires
function formatNumber(number) {
    return new Intl.NumberFormat('fr-FR').format(Math.round(number));
}

function toggleVeufOptions() {
    const veufRadio = document.getElementById('situation-V');
    const veufOptions = document.querySelectorAll('.veuf-option');
    
    veufOptions.forEach(option => {
        option.classList.toggle('hidden', !veufRadio.checked);
    });
}

function updateTotalEnfants() {
    const nbenf = parseInt(document.getElementById('NBENF').value) || 0;
    const nbetud = parseInt(document.getElementById('NBETUD').value) || 0;
    const nbenfac = parseInt(document.getElementById('NBENFAC').value) || 0;
    const nbenfach = parseInt(document.getElementById('NBENFACH').value) || 0;
    const nbenfalt = parseInt(document.getElementById('NBENFALT').value) || 0;
    const nbhandialt = parseInt(document.getElementById('NBHANDIALT').value) || 0;
    
    const total = nbenf + nbetud + nbenfac + nbenfach + nbenfalt + nbhandialt;
    document.getElementById('total-enfants').textContent = total;
}

function updateProfessionalFields() {
    const status = document.getElementById('your-status').value;
    const salaryFields = document.querySelectorAll('.status-salarie');
    const fonctionnaireFields = document.querySelectorAll('.status-fonctionnaire');
    
    salaryFields.forEach(field => field.classList.toggle('hidden', status !== 'salarie'));
    fonctionnaireFields.forEach(field => field.classList.toggle('hidden', status !== 'fonctionnaire-territorial' && status !== 'fonctionnaire-etat'));
    
    calculateRetirementContributions();
}

function updateSpouseProfessionalFields() {
    const status = document.getElementById('spouse-status').value;
    const salaryFields = document.querySelectorAll('.status-salarie-spouse');
    const fonctionnaireFields = document.querySelectorAll('.status-fonctionnaire-spouse');
    
    salaryFields.forEach(field => field.classList.toggle('hidden', status !== 'salarie'));
    fonctionnaireFields.forEach(field => field.classList.toggle('hidden', status !== 'fonctionnaire-territorial' && status !== 'fonctionnaire-etat'));
    
    calculateRetirementContributions();
}

// Calcul des cotisations retraite
function calculateRetirementContributions() {
    // Pour le contribuable
    const yourStatus = document.getElementById('your-status').value;
    let yourContributions = 0;
    
    if (yourStatus === 'salarie') {
        const grossSalary = parseFloat(document.getElementById('your-salary').value) || 0;
        yourContributions = calculateSalaryContributions(grossSalary);
    } else if (yourStatus === 'fonctionnaire-territorial') {
        const indice = parseFloat(document.getElementById('your-indice').value) || 0;
        const grossSalary = indice * 587.11344 * 1.73 * 12;
        yourContributions = grossSalary * 0.388; // 38.8% pour les fonctionnaires territoriaux
    } else if (yourStatus === 'fonctionnaire-etat') {
        const indice = parseFloat(document.getElementById('your-indice').value) || 0;
        const grossSalary = indice * 587.11344 * 12;
        yourContributions = grossSalary * 0.9538; // 95.38% pour les fonctionnaires d'état
    }
    
    // Pour le conjoint
    const spouseStatus = document.getElementById('spouse-status').value;
    let spouseContributions = 0;
    
    if (spouseStatus === 'salarie') {
        const grossSalary = parseFloat(document.getElementById('spouse-salary').value) || 0;
        spouseContributions = calculateSalaryContributions(grossSalary);
    } else if (spouseStatus === 'fonctionnaire-territorial') {
        const indice = parseFloat(document.getElementById('spouse-indice').value) || 0;
        const grossSalary = indice * 587.11344 * 1.73 * 12;
        spouseContributions = grossSalary * 0.388; // 38.8% pour les fonctionnaires territoriaux
    } else if (spouseStatus === 'fonctionnaire-etat') {
        const indice = parseFloat(document.getElementById('spouse-indice').value) || 0;
        const grossSalary = indice * 587.11344 * 12;
        spouseContributions = grossSalary * 0.9538; // 95.38% pour les fonctionnaires d'état
    }
    
    // Mettre à jour les affichages
    document.getElementById('your-contributions').textContent = formatNumber(yourContributions);
    document.getElementById('spouse-contributions').textContent = formatNumber(spouseContributions);
    
    // Calcul du plafond global
    const totalContributions = yourContributions + spouseContributions;
    document.getElementById('total-contributions').textContent = formatNumber(totalContributions);
    
    const householdLimit = Math.max(0, PLAFOND_RETRAITE - totalContributions);
    document.getElementById('household-limit').textContent = formatNumber(householdLimit);
    
    // Message d'information sur le plafond
    const limitMessage = document.getElementById('limit-message');
    if (householdLimit <= 0) {
        limitMessage.innerHTML = "<strong class='warning'>Attention :</strong> Vous avez atteint ou dépassé le plafond de déduction. Aucune cotisation supplémentaire ne sera déductible fiscalement.";
    } else if (householdLimit < 500000) {
        limitMessage.innerHTML = "Votre plafond disponible est limité. Vous pouvez encore déduire jusqu'à " + formatNumber(householdLimit) + " F de cotisations retraite complémentaires.";
    } else {
        limitMessage.innerHTML = "Ce montant représente votre capacité maximale de déduction fiscale pour vos cotisations retraite complémentaires (case XT du formulaire).";
    }
}

function calculateSalaryContributions(grossSalary) {
    const plafondSS = 6583200; // Plafond sécurité sociale
    
    // CAFAT Retraite : 14% jusqu'au plafond
    const cafatRetraite = Math.min(grossSalary, plafondSS) * 0.14;
    
    // Tranches pour les régimes complémentaires
    const tranche1 = Math.min(grossSalary, plafondSS);
    const tranche2 = Math.max(0, Math.min(grossSalary - plafondSS, 7 * plafondSS));
    
    // CRE (ARRCO) : 7.87% sur T1
    const cre = tranche1 * 0.0787;
    
    // IRCAFEX (AGIRC) : 21.59% sur T2
    const ircafex = tranche2 * 0.2159;
    
    // CET : 0.35% sur T1+T2
    const cet = (tranche1 + tranche2) * 0.0035;
    
    // CEG : 2.15% sur T1 et 2.70% sur T2
    const cegT1 = tranche1 * 0.0215;
    const cegT2 = tranche2 * 0.027;
    
    return cafatRetraite + cre + ircafex + cet + cegT1 + cegT2;
}

// Calcul de l'impôt
function calculateTax() {
    // Calcul des parts fiscales
    const parts = calculateParts();
    
    // Calcul du revenu net global
    const revenuNetGlobal = calculateNetIncome();
    
    // Calcul du revenu net par part
    const revenuParPart = revenuNetGlobal / parts;
    
    // Calcul de l'impôt par part
    const impotParPart = calculateTaxPerPart(revenuParPart);
    
    // Calcul de l'impôt total
    const impotTotal = impotParPart * parts;
    
    // Calcul du taux moyen d'imposition
    const tauxMoyen = revenuNetGlobal > 0 ? (impotTotal / revenuNetGlobal * 100) : 0;
    
    // Détermination du taux marginal
    const tauxMarginal = findMarginalRate(revenuParPart);
    
    // Affichage des résultats détaillés
    displayDetailedResults(parts, revenuNetGlobal, revenuParPart, impotParPart, impotTotal, tauxMoyen, tauxMarginal);
    
    // Afficher le module d'optimisation
    displayOptimizationResults(revenuNetGlobal, parts, tauxMarginal);
}

function calculateParts() {
    // Situation familiale
    let parts = 0;
    const situation = document.querySelector('input[name="situation"]:checked').value;
    
    // Parts de base selon situation familiale
    switch (situation) {
        case 'M':
        case 'P':
            parts = 2.0; // Marié(e) ou pacsé(e)
            break;
        case 'V':
            if (document.getElementById('veuf_q2').checked) {
                parts = 1.5; // Veuf/veuve avec enfant à charge
            } else {
                parts = 1.0; // Veuf/veuve sans enfant à charge
            }
            break;
        default:
            parts = 1.0; // Célibataire ou divorcé
    }
    
    // Ajout des parts pour enfants et personnes à charge
    const nbenf = parseInt(document.getElementById('NBENF').value) || 0;
    const nbetud = parseInt(document.getElementById('NBETUD').value) || 0;
    const nbenfac = parseInt(document.getElementById('NBENFAC').value) || 0;
    const nbenfach = parseInt(document.getElementById('NBENFACH').value) || 0;
    const nbenfalt = parseInt(document.getElementById('NBENFALT').value) || 0;
    const nbhandialt = parseInt(document.getElementById('NBHANDIALT').value) || 0;
    const nascac = parseInt(document.getElementById('NASCAC').value) || 0;
    
    // 1 part par enfant étudiant ou handicapé
    parts += nbetud * 1.0;
    parts += nbenfach * 1.0;
    
    // 0.5 part par enfant à charge normal ou ascendant
    parts += nbenf * 0.5;
    parts += nbenfac * 0.5;
    parts += nascac * 0.5;
    
    // 0.5 part par enfant handicapé en garde alternée
    parts += nbhandialt * 0.5;
    
    // 0.25 part par enfant en garde alternée
    parts += nbenfalt * 0.25;
    
    // Parts supplémentaires pour invalidité ou ancien combattant
    if (document.querySelector('input[name="invalidite_vous"]:checked').value !== 'aucun') {
        parts += 0.5;
    }
    if (document.querySelector('input[name="invalidite_conjoint"]:checked').value !== 'aucun' && 
        (situation === 'M' || situation === 'P')) {
        parts += 0.5;
    }
    
    return parts;
}

function calculateNetIncome() {
    // Revenus salariés et traitements
    const na = parseFloat(document.getElementById('NA').value) || 0;
    const nb = parseFloat(document.getElementById('NB').value) || 0;
    const nc = parseFloat(document.getElementById('NC').value) || 0;
    
    // Frais réels
    const oa = parseFloat(document.getElementById('OA').value) || 0;
    const ob = parseFloat(document.getElementById('OB').value) || 0;
    const oc = parseFloat(document.getElementById('OC').value) || 0;
    
    // Statut gérant majoritaire
    const gerantVous = document.getElementById('gerant_vous').checked;
    const gerantConjoint = document.getElementById('gerant_conjoint').checked;
    const gerantCharge = document.getElementById('gerant_charge').checked;
    
    // Cotisations retraite et sociales
    const od = parseFloat(document.getElementById('OD').value) || 0;
    const oe = parseFloat(document.getElementById('OE').value) || 0;
    const of = parseFloat(document.getElementById('OF').value) || 0;
    const og = parseFloat(document.getElementById('OG').value) || 0;
    const oh = parseFloat(document.getElementById('OH').value) || 0;
    const oi = parseFloat(document.getElementById('OI').value) || 0;
    
    // Pensions et retraites
    const pa = parseFloat(document.getElementById('PA').value) || 0;
    const pb = parseFloat(document.getElementById('PB').value) || 0;
    const pc = parseFloat(document.getElementById('PC').value) || 0;
    
    // Calcul des revenus nets après déduction des frais professionnels et cotisations
    let revenuNet = 0;
    
    // Traitement des salaires et traitements
    let salairesVous = na;
    let salairesConjoint = nb;
    let salairesCharges = nc;
    
    // Pour gérants - déduction des cotisations avant abattements
    if (gerantVous) {
        salairesVous = Math.max(0, salairesVous - od - og);
    }
    if (gerantConjoint) {
        salairesConjoint = Math.max(0, salairesConjoint - oe - oh);
    }
    if (gerantCharge) {
        salairesCharges = Math.max(0, salairesCharges - of - oi);
    }
    
    // Application de l'abattement de 10% pour frais professionnels ou frais réels
    const abattementVous = Math.min(salairesVous * 0.1, PLAFOND_ABATT_10_SALAIRES);
    const abattementConjoint = Math.min(salairesConjoint * 0.1, PLAFOND_ABATT_10_SALAIRES);
    const abattementCharges = Math.min(salairesCharges * 0.1, PLAFOND_ABATT_10_SALAIRES);
    
    const netSalaireVous = salairesVous - Math.max(abattementVous, oa);
    const netSalaireConjoint = salairesConjoint - Math.max(abattementConjoint, ob);
    const netSalaireCharges = salairesCharges - Math.max(abattementCharges, oc);
    
    // Traitement des pensions et retraites
    const abattPensionVous = Math.min(pa * 0.1, PLAFOND_ABATT_10_PENSIONS);
    const abattPensionConjoint = Math.min(pb * 0.1, PLAFOND_ABATT_10_PENSIONS);
    const abattPensionCharges = Math.min(pc * 0.1, PLAFOND_ABATT_10_PENSIONS);
    
    const netPensionVous = pa - abattPensionVous;
    const netPensionConjoint = pb - abattPensionConjoint;
    const netPensionCharges = pc - abattPensionCharges;
    
    // Cumul des revenus nets après abattement de 10%
    const totalRevenusApresAbatt10 = netSalaireVous + netSalaireConjoint + netSalaireCharges +
                                     netPensionVous + netPensionConjoint + netPensionCharges;
    
    // Application de l'abattement de 20%
    const abattement20 = Math.min(totalRevenusApresAbatt10 * 0.2, PLAFOND_ABATT_20);
    const totalRevenusApresAbatt20 = totalRevenusApresAbatt10 - abattement20;
    
    // Ajout des revenus fonciers
    const revenusFonciers = parseFloat(document.getElementById('AA').value) || 0;
    const deficitFoncier = parseFloat(document.getElementById('AG').value) || 0;
    
    // Déduction des charges
    const xe = parseFloat(document.getElementById('XE').value) || 0; // Retraite avant 92
    const xt = parseFloat(document.getElementById('XT').value) || 0; // Retraite après 92
    const xy = parseFloat(document.getElementById('XY').value) || 0; // Autres cotisations
    
    // Calcul du revenu net global
    revenuNet = totalRevenusApresAbatt20 + revenusFonciers - deficitFoncier - xe - xt - xy;
    
    // Prise en compte des cotisations pour non-gérants
    if (!gerantVous) {
        revenuNet -= od;
    }
    if (!gerantConjoint) {
        revenuNet -= oe;
    }
    if (!gerantCharge) {
        revenuNet -= of;
    }
    
    if (!gerantVous) {
        revenuNet -= og;
    }
    if (!gerantConjoint) {
        revenuNet -= oh;
    }
    if (!gerantCharge) {
        revenuNet -= oi;
    }
    
    return Math.max(0, revenuNet);
}

function calculateTaxPerPart(revenuParPart) {
    let impotParPart = 0;
    
    // Calcul de l'impôt par tranche
    for (let i = 0; i < TRANCHES.length; i++) {
        const tranche = TRANCHES[i];
        if (revenuParPart > tranche.min) {
            const montantDansLaTranche = Math.min(revenuParPart, tranche.max) - tranche.min;
            impotParPart += montantDansLaTranche * tranche.taux / 100;
        }
    }
    
    return impotParPart;
}

function findMarginalRate(revenuParPart) {
    let tauxMarginal = 0;
    
    for (let i = 0; i < TRANCHES.length; i++) {
        if (revenuParPart > TRANCHES[i].min) {
            tauxMarginal = TRANCHES[i].taux;
        }
    }
    
    return tauxMarginal;
}

function displayDetailedResults(parts, revenuNetGlobal, revenuParPart, impotParPart, impotTotal, tauxMoyen, tauxMarginal) {
    // Afficher le nombre de parts
    document.getElementById('total-parts').textContent = parts.toFixed(2);
    
    // Détail du calcul des parts
    let detailParts = '';
    const situation = document.querySelector('input[name="situation"]:checked').value;
    
    switch (situation) {
        case 'M':
            detailParts += "<p>Marié(e) : 2 parts</p>";
            break;
        case 'P':
            detailParts += "<p>Pacsé(e) : 2 parts</p>";
            break;
        case 'C':
            detailParts += "<p>Célibataire : 1 part</p>";
            break;
        case 'D':
            detailParts += "<p>Divorcé(e) ou séparé(e) : 1 part</p>";
            break;
        case 'V':
            if (document.getElementById('veuf_q2').checked) {
                detailParts += "<p>Veuf/veuve avec enfant à charge : 1,5 parts</p>";
            } else {
                detailParts += "<p>Veuf/veuve : 1 part</p>";
            }
            break;
    }
    
    const nbenf = parseInt(document.getElementById('NBENF').value) || 0;
    if (nbenf > 0) {
        detailParts += `<p>Enfants à charge : ${nbenf} × 0,5 part = ${nbenf * 0.5} parts</p>`;
    }
    
    const nbetud = parseInt(document.getElementById('NBETUD').value) || 0;
    if (nbetud > 0) {
        detailParts += `<p>Étudiants hors territoire/handicapés : ${nbetud} × 1 part = ${nbetud} parts</p>`;
    }
    
    const nbenfac = parseInt(document.getElementById('NBENFAC').value) || 0;
    if (nbenfac > 0) {
        detailParts += `<p>Enfants accueillis : ${nbenfac} × 0,5 part = ${nbenfac * 0.5} parts</p>`;
    }
    
    const nbenfach = parseInt(document.getElementById('NBENFACH').value) || 0;
    if (nbenfach > 0) {
        detailParts += `<p>Enfants handicapés accueillis : ${nbenfach} × 1 part = ${nbenfach} parts</p>`;
    }
    
    const nbenfalt = parseInt(document.getElementById('NBENFALT').value) || 0;
    if (nbenfalt > 0) {
        detailParts += `<p>Enfants en garde alternée : ${nbenfalt} × 0,25 part = ${nbenfalt * 0.25} parts</p>`;
    }
    
    const nbhandialt = parseInt(document.getElementById('NBHANDIALT').value) || 0;
    if (nbhandialt > 0) {
        detailParts += `<p>Enfants handicapés en garde alternée : ${nbhandialt} × 0,5 part = ${nbhandialt * 0.5} parts</p>`;
    }
    
    const nascac = parseInt(document.getElementById('NASCAC').value) || 0;
    if (nascac > 0) {
        detailParts += `<p>Ascendants à charge : ${nascac} × 0,5 part = ${nascac * 0.5} parts</p>`;
    }
    
    const invaliditeVous = document.querySelector('input[name="invalidite_vous"]:checked').value;
    if (invaliditeVous !== 'aucun') {
        detailParts += "<p>Invalidité ou ancien combattant (vous) : 0,5 part</p>";
    }
    
    const invaliditeConjoint = document.querySelector('input[name="invalidite_conjoint"]:checked').value;
    if (invaliditeConjoint !== 'aucun' && (situation === 'M' || situation === 'P')) {
        detailParts += "<p>Invalidité ou ancien combattant (conjoint) : 0,5 part</p>";
    }
    
    document.getElementById('parts-detail').innerHTML = detailParts;
    
    // Détail du revenu
    const na = parseFloat(document.getElementById('NA').value) || 0;
    const nb = parseFloat(document.getElementById('NB').value) || 0;
    const nc = parseFloat(document.getElementById('NC').value) || 0;
    const pa = parseFloat(document.getElementById('PA').value) || 0;
    const pb = parseFloat(document.getElementById('PB').value) || 0;
    const pc = parseFloat(document.getElementById('PC').value) || 0;
    const revenusFonciers = parseFloat(document.getElementById('AA').value) || 0;
    
    let revenueDetail = "";
    revenueDetail += "<p><strong>Revenus bruts :</strong></p>";
    revenueDetail += "<ul>";
    if (na > 0) revenueDetail += `<li>Salaires (vous) : ${formatNumber(na)} F</li>`;
    if (nb > 0) revenueDetail += `<li>Salaires (conjoint) : ${formatNumber(nb)} F</li>`;
    if (nc > 0) revenueDetail += `<li>Salaires (personnes à charge) : ${formatNumber(nc)} F</li>`;
    if (pa > 0) revenueDetail += `<li>Pensions et retraites (vous) : ${formatNumber(pa)} F</li>`;
    if (pb > 0) revenueDetail += `<li>Pensions et retraites (conjoint) : ${formatNumber(pb)} F</li>`;
    if (pc > 0) revenueDetail += `<li>Pensions et retraites (personnes à charge) : ${formatNumber(pc)} F</li>`;
    if (revenusFonciers > 0) revenueDetail += `<li>Revenus fonciers : ${formatNumber(revenusFonciers)} F</li>`;
    revenueDetail += "</ul>";
    
    document.getElementById('revenue-detail').innerHTML = revenueDetail;
    
    // Détail des abattements
    const gerantVous = document.getElementById('gerant_vous').checked;
    const gerantConjoint = document.getElementById('gerant_conjoint').checked;
    const gerantCharge = document.getElementById('gerant_charge').checked;
    const od = parseFloat(document.getElementById('OD').value) || 0;
    const oe = parseFloat(document.getElementById('OE').value) || 0;
    const of = parseFloat(document.getElementById('OF').value) || 0;
    const og = parseFloat(document.getElementById('OG').value) || 0;
    const oh = parseFloat(document.getElementById('OH').value) || 0;
    const oi = parseFloat(document.getElementById('OI').value) || 0;
    
    let deductionDetail = "";
    
    // Déduction des cotisations pour gérants
    if (gerantVous || gerantConjoint || gerantCharge) {
        deductionDetail += "<p><strong>Déduction des cotisations (gérants majoritaires) :</strong></p>";
        deductionDetail += "<ul>";
        if (gerantVous && (od > 0 || og > 0)) {
            deductionDetail += `<li>Cotisations (vous) : ${formatNumber(od + og)} F</li>`;
        }
        if (gerantConjoint && (oe > 0 || oh > 0)) {
            deductionDetail += `<li>Cotisations (conjoint) : ${formatNumber(oe + oh)} F</li>`;
        }
        if (gerantCharge && (of > 0 || oi > 0)) {
            deductionDetail += `<li>Cotisations (personnes à charge) : ${formatNumber(of + oi)} F</li>`;
        }
        deductionDetail += "</ul>";
    }
    
    // Calcul et affichage des abattements
    deductionDetail += "<p><strong>Abattement de 10% :</strong></p>";
    deductionDetail += "<ul>";
    
    const salairesVous = gerantVous ? Math.max(0, na - od - og) : na;
    const salairesConjoint = gerantConjoint ? Math.max