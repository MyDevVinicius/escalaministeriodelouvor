const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let teamSchedule = {};

// Elementos do DOM
const modal = document.getElementById("scheduleModal");
const modalTitle = document.getElementById("modalTitle");
const modalSchedule = document.getElementById("modalSchedule");
const closeModalBtn = document.getElementById("closeModal");
const calendarDays = document.getElementById("calendarDays");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

// Função para abrir o modal
function openModal(day, schedule, fixedEvents) {
    modalTitle.textContent = `${day} de ${months[currentMonth]} de ${currentYear}`;
    modalSchedule.innerHTML = "";

    if (fixedEvents.length === 0 && schedule.length === 0) {
        modalSchedule.innerHTML = "<li>Nenhum evento ou escala para este dia. Estão de Folga Graça e Paz</li>";
    } else {
        fixedEvents.forEach(event => {
            modalSchedule.innerHTML += `
                <li class="text-gray-700 font-semibold">${event}</li>
            `;
        });
        schedule.forEach(person => {
            modalSchedule.innerHTML += `
                <li>${person.name} - ${person.instrument}</li>
            `;
        });
    }

    modal.classList.remove("hidden");
}

// Fechar o modal
closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }
});

// Delegação de eventos para os dias
calendarDays.addEventListener("click", (e) => {
    const dayElement = e.target.closest(".day");
    if (dayElement) {
        const day = parseInt(dayElement.querySelector("span").textContent);
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        const schedule = teamSchedule[day.toString()] || [];
        let fixedEvents = [];
        if (dayOfWeek === 2) fixedEvents.push("Culto de Ensino as 19:30 - Recomendavel que Todos Apareçam  ");
        if (dayOfWeek === 3) fixedEvents.push("Ensaio Geral 19:30 as 21:00");
        if (dayOfWeek === 5) fixedEvents.push("Ensaio Geral 19:30 as 21:00");

        openModal(day, schedule, fixedEvents);
    }
});

// Carregar o JSON do mês
async function loadSchedule(month, year) {
    const monthName = months[month].toLowerCase();
    const fileName = `${monthName}.json`;
    try {
        const response = await fetch(fileName);
        const data = await response.json();
        teamSchedule = data.schedule;
        updateCalendar();
    } catch (error) {
        console.error(`Erro ao carregar ${fileName}:`, error);
        teamSchedule = {};
        updateCalendar();
    }
}

function renderCalendar(month, year) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();

    document.getElementById("monthYear").textContent = `${months[month]} ${year}`;
    
    const weekdaysDiv = document.getElementById("weekdays");
    weekdaysDiv.innerHTML = "";
    weekdays.forEach(day => {
        weekdaysDiv.innerHTML += `
            <div class="text-center p-1 bg-gray-300 font-semibold text-xs sm:text-sm">
                ${day}
            </div>
        `;
    });

    calendarDays.innerHTML = "";
    let dayOffset = firstDay.getDay();

    for (let i = 0; i < dayOffset; i++) {
        calendarDays.innerHTML += `<div class="bg-white"></div>`;
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const isToday = isCurrentMonth && day === today.getDate();
        const schedule = teamSchedule[day.toString()] || [];

        // Eventos fixos
        let fixedEvents = [];
        if (dayOfWeek === 2) fixedEvents.push("Ensino da Palavra");
        if (dayOfWeek === 3) fixedEvents.push("Ensaio Geral 19:30 as 21:00");
        if (dayOfWeek === 5) fixedEvents.push("Ensaio Geral 19:30 as 21:00");

        // Definir cor de fundo com base no dia da semana
        let bgColor = "bg-white";
        if (dayOfWeek === 0) bgColor = "bg-yellow-200"; // Domingo
        else if (dayOfWeek === 4) bgColor = "bg-blue-700 text-white font-bold"; // Quinta
        else if (dayOfWeek === 5) bgColor = "bg-red-400 text-gray-800 font-bold"; //sexta
        else if (dayOfWeek === 2) bgColor = "bg-red-400 text-gray-800 font-bold"; //terca 
        else if (dayOfWeek === 6) bgColor = "bg-purple-700 text-white font-bold"; // Sábado
        if (isToday) bgColor = "bg-green-600 font-bold"; // Prioridade para o dia atual

        let scheduleHTML = "";
        if (schedule.length > 0 || fixedEvents.length > 0) {
            scheduleHTML = `
                <div class="schedule mt-1 text-[10px] sm:text-xs max-h-[80px] sm:max-h-[120px] overflow-y-auto">
                    ${fixedEvents.map(event => `
                        <div class="person truncate font-semibold text-gray-700">${event}</div>
                    `).join('')}
                    ${schedule.map(person => `
                        <div class="person truncate">${person.name} - ${person.instrument}</div>
                    `).join('')}
                </div>
            `;
        }

        calendarDays.innerHTML += `
            <div class="day ${bgColor} p-2 sm:p-3 min-h-[100px] sm:min-h-[150px] hover:bg-opacity-80 transition cursor-pointer
                ${isToday ? 'text-white hover:bg-green-600' : ''}">
                <span class="font-bold text-sm sm:text-base">${day}</span>
                ${scheduleHTML}
            </div>
        `;
    }
}

function updateCalendar() {
    renderCalendar(currentMonth, currentYear);
}

// Eventos de navegação
prevMonthBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    loadSchedule(currentMonth, currentYear);
});

nextMonthBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    loadSchedule(currentMonth, currentYear);
});

// Inicialização
window.onload = () => loadSchedule(currentMonth, currentYear);