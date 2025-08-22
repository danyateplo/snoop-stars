document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const loginSection = document.getElementById('login-section');
    const adminSection = document.getElementById('admin-section');
    const pricesContainer = document.getElementById('prices-container');
    const ownerLinkInput = document.getElementById('owner-link');
    const bankInput = document.getElementById('bank-input');
    const cardNumberInput = document.getElementById('card-number-input');
    const cardHolderInput = document.getElementById('card-holder-input');
    const saveButton = document.getElementById('save-settings');
    
    const ADMIN_PASSWORD = 'admin123';
    
    let settings = {};
    
    // Проверка параметров URL
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    
    if (adminParam === ADMIN_PASSWORD) {
        showAdminPanel();
    }
    
    // Обработчик входа
    loginButton.addEventListener('click', function() {
        if (passwordInput.value === ADMIN_PASSWORD) {
            showAdminPanel();
            window.history.replaceState({}, '', `?admin=${ADMIN_PASSWORD}`);
        } else {
            alert('Неверный пароль');
        }
    });
    
    // Вход по нажатию Enter
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });
    
    // Показать админ-панель
    function showAdminPanel() {
        loginSection.style.display = 'none';
        adminSection.style.display = 'block';
        loadSettings();
    }
    
    // Загрузка настроек
    function loadSettings() {
        fetch('settings.json')
            .then(response => response.json())
            .then(data => {
                settings = data;
                renderPrices();
                ownerLinkInput.value = data.owner || '';
                bankInput.value = data.bank || '';
                cardNumberInput.value = data.cardNumber || '';
                cardHolderInput.value = data.cardHolder || '';
            })
            .catch(error => {
                console.error('Ошибка загрузки настроек:', error);
                settings = {
                    owner: "https://t.me/your_owner",
                    bank: "Тинькофф",
                    cardNumber: "5536 9138 1234 5678",
                    cardHolder: "Иван Иванов",
                    prices: [
                        {stars: 50, price: 49},
                        {stars: 100, price: 95},
                        {stars: 200, price: 189},
                        {stars: 300, price: 279},
                        {stars: 500, price: 450},
                        {stars: 1000, price: 890}
                    ]
                };
                renderPrices();
            });
    }
    
    // Отображение цен
    function renderPrices() {
        pricesContainer.innerHTML = '';
        
        // Добавляем заголовок
        const priceHeader = document.createElement('div');
        priceHeader.className = 'price-header';
        priceHeader.innerHTML = `
            <div class="price-label-header">Звёзды</div>
            <div class="price-label-header">Цена (₽)</div>
        `;
        pricesContainer.appendChild(priceHeader);
        
        for (const [index, price] of settings.prices.entries()) {
            const priceItem = document.createElement('div');
            priceItem.className = 'price-item';
            priceItem.innerHTML = `
                <input type="number" class="price-input" data-index="${index}" data-field="stars" value="${price.stars}" step="1" min="1">
                <input type="number" class="price-input" data-index="${index}" data-field="price" value="${price.price}" step="0.01" min="0">
                <button class="remove-price" data-index="${index}">×</button>
            `;
            pricesContainer.appendChild(priceItem);
        }
        
        // Добавляем кнопку для новой цены
        const addPriceButton = document.createElement('button');
        addPriceButton.id = 'add-price';
        addPriceButton.textContent = '+ Добавить пакет';
        addPriceButton.addEventListener('click', addNewPrice);
        pricesContainer.appendChild(addPriceButton);
        
        // Добавляем обработчики для кнопок удаления
        const removeButtons = document.querySelectorAll('.remove-price');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                if (settings.prices.length > 1) {
                    settings.prices.splice(index, 1);
                    renderPrices();
                } else {
                    alert('Должен остаться хотя бы один пакет');
                }
            });
        });
    }
    
    // Добавление новой цены
    function addNewPrice() {
        settings.prices.push({stars: 100, price: 100});
        renderPrices();
    }
    
    // Сохранение настроек
    saveButton.addEventListener('click', function() {
        // Обновляем цены
        const priceInputs = document.querySelectorAll('.price-input[data-field="price"]');
        const starInputs = document.querySelectorAll('.price-input[data-field="stars"]');
        
        settings.prices = [];
        for (let i = 0; i < priceInputs.length; i++) {
            const price = parseFloat(priceInputs[i].value) || 0;
            const stars = parseInt(starInputs[i].value) || 0;
            if (stars > 0 && price > 0) {
                settings.prices.push({stars, price});
            }
        }
        
        // Обновляем остальные настройки
        settings.owner = ownerLinkInput.value;
        settings.bank = bankInput.value;
        settings.cardNumber = cardNumberInput.value;
        settings.cardHolder = cardHolderInput.value;
        
        // Сохраняем настройки
        saveSettings();
    });
    
    // Функция сохранения настроек
    function saveSettings() {
        localStorage.setItem('snoop-stars-settings', JSON.stringify(settings));
        
        // Показываем уведомление об успешном сохранении
        const notification = document.createElement('div');
        notification.textContent = 'Настройки сохранены в localStorage';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.background = 'var(--accent)';
        notification.style.color = '#0f221b';
        notification.style.padding = '12px 16px';
        notification.style.borderRadius = '8px';
        notification.style.zIndex = '1000';
        notification.style.fontWeight = '600';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    // При загрузке проверяем, есть ли сохраненные настройки в localStorage
    const savedSettings = localStorage.getItem('snoop-stars-settings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    }
});