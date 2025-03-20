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

  function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => {
      addTaskToDOM(task.title, task.date, task.status);
    });
  }

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

    const statusSelect = taskItem.querySelector('.change-status');
    statusSelect.addEventListener('change', (e) => {
      taskItem.className = `task-item task-${e.target.value}`;
      saveTasks();
    });

    tasks.appendChild(taskItem);
  }

  for (let year = 2020; year <= 2090; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }

  const now = new Date();
  yearSelect.value = now.getFullYear();
  monthSelect.value = now.getMonth();

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

    document.querySelectorAll('td[data-date]').forEach(td => {
      td.addEventListener('click', (e) => {
        selectedDate = e.target.dataset.date;
        modal.style.display = 'block';
      });
    });
  }

  yearSelect.addEventListener('change', () => {
    generateCalendar(yearSelect.value, parseInt(monthSelect.value));
  });

  monthSelect.addEventListener('change', () => {
    generateCalendar(yearSelect.value, parseInt(monthSelect.value));
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskTitle.value;
    const status = taskStatus.value;

    addTaskToDOM(title, selectedDate, status);

    saveTasks();
    form.reset();
    modal.style.display = 'none';
  });

  loadTasks();

  generateCalendar(now.getFullYear(), now.getMonth());
});
