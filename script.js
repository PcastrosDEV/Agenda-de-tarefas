document.addEventListener('DOMContentLoaded', () => {
  const calendarContainer = document.getElementById('calendar-container');
  const modal = document.getElementById('task-modal');
  const form = document.getElementById('task-form');
  const taskTitle = document.getElementById('task-title');
  const taskStatus = document.getElementById('task-status');
  const tasks = document.getElementById('tasks');
  const yearSelect = document.getElementById('year-select');
  const monthSelect = document.getElementById('month-select');
  let selectedDate = null;

  // Carrega tarefas salvas no Local Storage
  function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => {
      addTaskToDOM(task.title, task.date, task.status);
    });
  }

  // Salva tarefas no Local Storage
  function saveTasks() {
    const taskItems = document.querySelectorAll('.task-item');
    const tasksArray = Array.from(taskItems).map(taskItem => {
      const title = taskItem.querySelector('strong').textContent;
      const date = taskItem.dataset.date;
      const status = taskItem.querySelector('.change-status').value;
      return { title, date, status };
    });
    localStorage.setItem('tasks', JSON.stringify(tasksArray));
  }

  // Adiciona tarefa ao DOM
  function addTaskToDOM(title, date, status) {
    const taskItem = document.createElement('li');
    taskItem.classList.add('task-item', `task-${status}`);
    taskItem.setAttribute('data-date', date);
    taskItem.innerHTML = `
      <div>
        <strong>${title}</strong> - ${date} (${status})
      </div>
      <select class="change-status">
        <option value="pendente" ${status === 'pendente' ? 'selected' : ''}>Pendente</option>
        <option value="concluida" ${status === 'concluida' ? 'selected' : ''}>Concluída</option>
        <option value="em_atraso" ${status === 'em_atraso' ? 'selected' : ''}>Em Atraso</option>
        <option value="cancelada" ${status === 'cancelada' ? 'selected' : ''}>Cancelada</option>
      </select>
    `;

    // Atualiza a classe da tarefa ao mudar o status
    const statusSelect = taskItem.querySelector('.change-status');
    statusSelect.addEventListener('change', (e) => {
      taskItem.className = `task-item task-${e.target.value}`;
      saveTasks();
    });

    tasks.appendChild(taskItem);
  }

  // Popula os anos no seletor de ano
  for (let year = 2020; year <= 2090; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }

  // Define o ano e o mês atual como padrão
  const now = new Date();
  yearSelect.value = now.getFullYear();
  monthSelect.value = now.getMonth();

  // Função para gerar o calendário
  function generateCalendar(year, month) {
    const date = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let calendarHTML = '<table><tr>';

    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    for (const day of daysOfWeek) {
      calendarHTML += `<th>${day}</th>`;
    }
    calendarHTML += '</tr><tr>';

    for (let i = 0; i < date.getDay(); i++) {
      calendarHTML += '<td></td>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      calendarHTML += `<td data-date="${year}-${month + 1}-${day}">${day}</td>`;
      if (date.getDay() === 6) calendarHTML += '</tr><tr>';
      date.setDate(day + 1);
    }

    calendarHTML += '</tr></table>';
    calendarContainer.innerHTML = calendarHTML;

    // Adiciona eventos de clique nos dias
    document.querySelectorAll('td[data-date]').forEach(td => {
      td.addEventListener('click', (e) => {
        selectedDate = e.target.dataset.date;
        modal.style.display = 'block';
      });
    });
  }

  // Atualiza o calendário quando o ano ou o mês forem alterados
  yearSelect.addEventListener('change', () => {
    generateCalendar(yearSelect.value, parseInt(monthSelect.value));
  });

  monthSelect.addEventListener('change', () => {
    generateCalendar(yearSelect.value, parseInt(monthSelect.value));
  });

  // Fecha o modal ao clicar fora dele
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Adiciona tarefa ao salvar no formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskTitle.value;
    const status = taskStatus.value;

    addTaskToDOM(title, selectedDate, status);

    saveTasks(); // Salva após adicionar a tarefa
    form.reset();
    modal.style.display = 'none';
  });

  // Carrega as tarefas salvas ao iniciar o site
  loadTasks();

  // Gera o calendário inicial
  generateCalendar(now.getFullYear(), now.getMonth());
});
