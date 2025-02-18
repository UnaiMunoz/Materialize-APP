document.addEventListener('DOMContentLoaded', function () {
    // Inicializar componentes de Materialize
    M.Sidenav.init(document.querySelectorAll('.sidenav'));
    M.Tabs.init(document.querySelectorAll('.tabs'), { swipeable: true });

    // Cargar la lista de Pokémon
    fetchPokemon();

    // Configurar la cámara
    const cameraButton = document.getElementById('camera-button');
    const cameraPreview = document.getElementById('camera-preview');
    const captureButton = document.getElementById('capture-button');
    const photoCanvas = document.getElementById('photo-canvas');
    const userAvatar = document.getElementById('user-avatar');

    let stream;

    cameraButton.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraPreview.srcObject = stream;
            cameraPreview.style.display = 'block';
            captureButton.style.display = 'block';
        } catch (error) {
            console.error('Error accessing the camera:', error);
        }
    });

    captureButton.addEventListener('click', () => {
        const context = photoCanvas.getContext('2d');
        photoCanvas.width = cameraPreview.videoWidth;
        photoCanvas.height = cameraPreview.videoHeight;
        context.drawImage(cameraPreview, 0, 0, photoCanvas.width, photoCanvas.height);

        // Convertir la imagen a una URL y actualizar la foto de perfil
        const imageUrl = photoCanvas.toDataURL('image/png');
        userAvatar.src = imageUrl;

        // Detener la cámara
        stream.getTracks().forEach(track => track.stop());
        cameraPreview.style.display = 'none';
        captureButton.style.display = 'none';
    });
});

// Función para obtener y mostrar la lista de Pokémon
async function fetchPokemon() {
    const pokemonList = document.getElementById('pokemon-list');
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
        const data = await response.json();
        data.results.forEach(async (pokemon) => {
            const pokemonData = await fetch(pokemon.url).then(res => res.json());
            const card = document.createElement('div');
            // Dentro de fetchPokemon, después de crear la tarjeta:
            card.addEventListener('click', () => showPokemonDetails(pokemonData));
            card.className = 'col s12 m6 l4';
            card.innerHTML = `
                <div class="card">
                    <div class="card-image">
                        <img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}">
                    </div>
                    <div class="card-content">
                        <span class="card-title">${pokemonData.name}</span>
                    </div>
                </div>
            `;
            pokemonList.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
    }
}

function showPokemonDetails(pokemon) {
    // Cambiar a la segunda pestaña
    const tabsInstance = M.Tabs.getInstance(document.querySelector('.tabs'));
    tabsInstance.select('test-swipe-2');

    // Crear contenido de detalles
    const detailsContainer = document.getElementById('pokemon-details');
    detailsContainer.innerHTML = `
        <div class="card">
            <div class="card-image center">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" style="max-width: 200px;">
            </div>
            <div class="card-content">
                <span class="card-title">${pokemon.name.toUpperCase()}</span>
                <p>Altura: ${pokemon.height / 10}m</p>
                <p>Peso: ${pokemon.weight / 10}kg</p>
                
                <h5>Habilidades</h5>
                <div class="collection">
                    ${pokemon.abilities.map(ability => 
                        `<div class="collection-item">${ability.ability.name}</div>`
                    ).join('')}
                </div>

                <h5>Estadísticas</h5>
                <ul class="collection">
                    ${pokemon.stats.map(stat => `
                        <li class="collection-item">
                            ${stat.stat.name}: ${stat.base_stat}
                            <div class="progress">
                                <div class="determinate" style="width: ${(stat.base_stat / 255) * 100}%"></div>
                            </div>
                        </li>`
                    ).join('')}
                </ul>
            </div>
        </div>
    `;
}