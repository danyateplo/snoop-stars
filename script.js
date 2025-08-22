// Simple settings loader (from localStorage or settings.json)
let SETTINGS = {
  owner: 'https://t.me/your_owner',
  bank: 'Тинькофф',
  cardNumber: '5536 9138 1234 5678',
  cardHolder: 'Иван Иванов',
  prices: [{stars:50,price:49},{stars:100,price:95},{stars:200,price:189},{stars:300,price:279},{stars:500,price:450},{stars:1000,price:890}],
};

const gridEl = () => document.querySelector('.grid');
const amountEl = () => document.getElementById('amount');
const starsEl = () => document.getElementById('starsCount');
const usernameEl = () => document.getElementById('username');
const payBtn = () => document.getElementById('payBtn');
const modal = () => document.getElementById('modal');
const contactLink = () => document.getElementById('contact-link');
const closeModal = () => document.getElementById('closeModal');
const copyBtn = () => document.getElementById('copy-btn');

let selected = 0;

async function loadSettings(){
  try{
    const local = localStorage.getItem('snoop-stars-settings');
    if(local){ SETTINGS = JSON.parse(local); }
    else{
      const r = await fetch('settings.json'); 
      if(r.ok){ SETTINGS = await r.json(); }
    }
  }catch(e){ console.warn('settings load error', e); }
}

function renderTiers(){
  const g = gridEl(); 
  if (!g) return;
  
  g.innerHTML = '';
  SETTINGS.prices.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'pill';
    btn.textContent = `${p.stars} ★`;
    if(selected === p.stars) btn.classList.add('active');
    btn.onclick = () => { 
      selected = p.stars; 
      updateSummary(); 
      renderTiers(); 
    };
    g.appendChild(btn);
  });
}

function updateSummary(){
  const tier = SETTINGS.prices.find(x => x.stars === selected);
  if (starsEl()) starsEl().value = selected ? selected : '';
  if (amountEl()) amountEl().value = tier ? (tier.price.toFixed(2)) : '0.00';
  
  const can = !!selected && !!usernameEl().value;
  if (payBtn()) payBtn().disabled = !can;
}

function openModal(){
  const tier = SETTINGS.prices.find(x => x.stars === selected);
  const username = usernameEl().value;
  
  // Обновляем данные в модальном окне
  document.getElementById('bank-name').textContent = SETTINGS.bank;
  document.getElementById('card-number').textContent = SETTINGS.cardNumber;
  document.getElementById('card-holder').textContent = SETTINGS.cardHolder;
  document.getElementById('payment-sum').textContent = tier ? `${tier.price.toFixed(2)} ₽` : '0.00 ₽';
  document.getElementById('payment-purpose').textContent = `Звёзды для ${username}`;
  
  // Формируем сообщение для администратора
  const message = encodeURIComponent(`💫 Заказ звёзд SNOOP STARS

👤 Покупатель: ${username}
⭐ Количество звёзд: ${selected}
💰 Сумма: ${tier.price} ₽
📝 Назначение: Звёзды для ${username}

Я оплатил(а) заказ, прилагаю скриншот подтверждения оплаты.`);
  
  if (contactLink()) contactLink().href = `${SETTINGS.owner}?text=${message}`;
  
  if (modal()) modal().classList.add('open');
  
  // Добавляем обработчик для закрытия по ESC
  document.addEventListener('keydown', handleEscapeKey);
  
  // Предотвращаем прокрутку фонового контента
  document.body.style.overflow = 'hidden';
}

function closeModalFunc(){
  if (modal()) modal().classList.remove('open');
  document.removeEventListener('keydown', handleEscapeKey);
  
  // Возвращаем возможность прокрутки
  document.body.style.overflow = 'auto';
}

function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    closeModalFunc();
  }
}

function copyPaymentDetails() {
  const text = SETTINGS.cardNumber.replace(/\s/g, '');
  
  navigator.clipboard.writeText(text).then(() => {
    const originalText = copyBtn().textContent;
    copyBtn().textContent = '✓ Скопировано!';
    copyBtn().classList.add('copied');
    
    setTimeout(() => {
      copyBtn().textContent = originalText;
      copyBtn().classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Ошибка копирования: ', err);
    alert('Не удалось скопировать номер. Скопируйте вручную.');
  });
}

function init(){
  // Проверяем, открыто ли через Telegram WebApp
  const isTelegramWebApp = typeof Telegram !== 'undefined' && Telegram.WebApp;
  
  // Telegram prefill if available
  try{
    if (isTelegramWebApp) {
      Telegram.WebApp.ready();
      Telegram.WebApp.expand();
      const u = Telegram.WebApp.initDataUnsafe?.user?.username;
      if(u){ 
        if (usernameEl()) usernameEl().value = `@${u}`; 
      }
    }
  }catch(e){ console.log('Telegram WebApp not available'); }

  renderTiers(); 
  updateSummary();
  
  // Добавляем обработчики событий
  if (document.getElementById('helpBtn')) {
    document.getElementById('helpBtn').onclick = () => alert('Выберите пакет звёзд, укажите ваш @username в Telegram, затем нажмите «Перейти к оплате». После оплаты отправьте скриншот чека администратору.');
  }
  
  if (usernameEl()) {
    usernameEl().addEventListener('input', updateSummary);
  }
  
  if (payBtn()) {
    payBtn().addEventListener('click', openModal);
  }
  
  if (closeModal()) {
    closeModal().addEventListener('click', closeModalFunc);
  }
  
  if (copyBtn()) {
    copyBtn().addEventListener('click', copyPaymentDetails);
  }
  
  // Закрытие модального окна при клике вне его
  if (modal()) {
    modal().addEventListener('click', (e) => {
      if (e.target === modal()) {
        closeModalFunc();
      }
    });
  }
  
  // Если открыто не через Telegram, показываем сообщение
  if (!isTelegramWebApp && window === window.top) {
    setTimeout(() => {
      alert('💫 Магазин SNOOP STARS работает через Telegram Mini App. Откройте его через бота для полного функционала.');
    }, 1000);
  }
}

// Запускаем приложение после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  loadSettings().then(init);
});

// Обработка изменения ориентации экрана
window.addEventListener('resize', () => {
  // Перерисовываем элементы при изменении размера
  renderTiers();
});