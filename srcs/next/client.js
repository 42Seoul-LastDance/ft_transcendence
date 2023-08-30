const playerListElement = document.getElementById('playerList');

// Fetch player data from server
fetch('http://localhost:3000/player', { mode: 'cors' })
    .then(response => response.json())
    .then(data => {
        data.forEach(player => {
            const listItem = document.createElement('li');
            listItem.textContent = `${player.name} (ID: ${player.id}) - Points: ${player.point}`;
            playerListElement.appendChild(listItem);
        });
    })
    .catch(error => {
        console.error('Error fetching player data:', error);
    });
