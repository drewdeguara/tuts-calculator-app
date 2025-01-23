let memberCount = 0;
const maxMembers = 8;
let totalDays = 0;
let totalExpenses = 0;
const members = [];

document.addEventListener('DOMContentLoaded', () => {
    addMember();  // Automatically add the first member

    document.getElementById('expenses-form').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addMember();
        }
    });
});

function addMember() {
    if (memberCount < maxMembers) {
        memberCount++;
        const memberDiv = document.createElement('div');
        memberDiv.className = 'member';
        memberDiv.id = `member${memberCount}`;
        memberDiv.innerHTML = `
            <input type="text" placeholder="Name" id="name${memberCount}" class="fadeIn1">
            <input type="number" placeholder="Days" id="days${memberCount}" class="fadeIn2">
            <input type="number" placeholder="Expenses" id="expenses${memberCount}" class="fadeIn3">
            <button type="button" onclick="removeMember(${memberCount})">X</button>
        `;
        document.getElementById('members').appendChild(memberDiv);

        if (memberCount === maxMembers) {
            document.getElementById('add-member-button').classList.add('disabled');
        }
    }
}

function removeMember(memberId) {
    const memberDiv = document.getElementById(`member${memberId}`);
    memberDiv.remove();
    memberCount--;

    if (memberCount < maxMembers) {
        document.getElementById('add-member-button').classList.remove('disabled');
    }
}

function calculateExpenses() {
    totalDays = 0;
    totalExpenses = 0;
    members.length = 0;

    for (let i = 1; i <= memberCount; i++) {
        const memberDiv = document.getElementById(`member${i}`);
        if (memberDiv) {
            const name = document.getElementById(`name${i}`).value || `Member ${i}`;
            const days = parseFloat(document.getElementById(`days${i}`).value) || 0;
            const expenses = parseFloat(document.getElementById(`expenses${i}`).value) || 0;
            totalDays += days;
            totalExpenses += expenses;
            members.push({ name, days, expenses });
        }
    }

    const dailyExpenseRate = totalExpenses / totalDays;
    let resultsHtml = '<h2>Results</h2>';

    members.forEach((member) => {
        const fairShare = member.days * dailyExpenseRate;
        const balance = fairShare - member.expenses;
        member.balance = balance;
        const balanceClass = balance >= 0 ? 'pay' : 'receive';
        resultsHtml += `<p class="${balanceClass}">${member.name}: ${balance >= 0 ? '-' : '+'} €${Math.abs(balance).toFixed(2)}</p>`;
    });

    // Determine who owes whom
    const payers = members.filter(member => member.balance > 0).sort((a, b) => b.balance - a.balance);
    const receivers = members.filter(member => member.balance < 0).sort((a, b) => a.balance - b.balance);

    resultsHtml += '<h2>Who Owes Whom</h2>';
    while (payers.length && receivers.length) {
        const payer = payers[0];
        const receiver = receivers[0];
        const amount = Math.min(payer.balance, -receiver.balance);

        resultsHtml += `<p>${payer.name} owes ${receiver.name} €${amount.toFixed(2)}</p>`;

        payer.balance -= amount;
        receiver.balance += amount;

        if (payer.balance === 0) payers.shift();
        if (receiver.balance === 0) receivers.shift();
    }

    document.getElementById('results').innerHTML = resultsHtml;
    fadeInResults();

    // Show the "Details" button
    document.getElementById('details-button').style.display = 'block'; // Now visible after calculation
}


function fadeInResults() {
    const results = document.getElementById('results');
    const children = Array.from(results.childNodes);
    results.innerHTML = '';

    children.forEach((child, index) => {
        child.style.opacity = 0;
        child.style.transition = `opacity 0.5s ease ${index * 0.1}s`;
        results.appendChild(child);

        setTimeout(() => {
            child.style.opacity = 1;
        }, 0);
    });
}

function showDetailedResults() {
    let detailedResultsHtml = '<h2>Detailed Results</h2>';
    detailedResultsHtml += `<p>Total Days: ${totalDays}</p>`;
    detailedResultsHtml += `<p>Total Expenses: €${totalExpenses.toFixed(2)}</p>`;
    detailedResultsHtml += `<p>Daily Expense Rate: €${(totalExpenses / totalDays).toFixed(2)}</p>`;
    detailedResultsHtml += `<p>Formula: Daily Expense Rate = Total Expenses / Total Days</p>`;

    members.forEach((member) => {
        const fairShare = member.days * (totalExpenses / totalDays);
        const balance = fairShare - member.expenses;
        detailedResultsHtml += `<h3>${member.name}</h3>`;
        detailedResultsHtml += `<p>Days: ${member.days}</p>`;
        detailedResultsHtml += `<p>Expenses: €${member.expenses.toFixed(2)}</p>`;
        detailedResultsHtml += `<p>Fair Share: €${fairShare.toFixed(2)} (Days * Daily Expense Rate)</p>`;
        detailedResultsHtml += `<p>Balance: ${balance >= 0 ? 'Pay' : 'Receive'} €${Math.abs(balance).toFixed(2)} (Fair Share - Expenses)</p>`;
    });

    // Populate the detailed results into the overlay content
    document.getElementById('detailed-results-content').innerHTML = detailedResultsHtml;

    // Show the overlay
    document.getElementById('overlay').style.display = 'flex';
}

// Close the overlay when the close button is clicked
document.getElementById('close-overlay').addEventListener('click', () => {
    document.getElementById('overlay').style.display = 'none';
});
