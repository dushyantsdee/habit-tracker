// Data Storage
let habits = JSON.parse(localStorage.getItem('habits')) || [
    { id: 1, name: 'Wake up at 06:00', icon: '⏰', completed: Array(31).fill(false) },
    { id: 2, name: 'Meditation', icon: '🧘', completed: Array(31).fill(false) },
    { id: 3, name: 'GYM', icon: '💪', completed: Array(31).fill(false) },
    { id: 4, name: 'Cold Shower', icon: '🚿', completed: Array(31).fill(false) },
    { id: 5, name: 'Work', icon: '💼', completed: Array(31).fill(false) },
    { id: 6, name: 'Read 10 pages', icon: '📖', completed: Array(31).fill(false) },
    { id: 7, name: 'Learn a skill', icon: '🎯', completed: Array(31).fill(false) },
    { id: 8, name: 'No sugar', icon: '🍬', completed: Array(31).fill(false) },
    { id: 9, name: 'No alcohol', icon: '🍺', completed: Array(31).fill(false) },
    { id: 10, name: 'No social media', icon: '📱', completed: Array(31).fill(false) },
    { id: 11, name: 'Planning', icon: '📝', completed: Array(31).fill(false) },
    { id: 12, name: 'Sleep before 11:00', icon: '😴', completed: Array(31).fill(false) }
];

let editingId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderDaysHeader();
    renderHabits();
    renderDailyProgress();
    renderWeeklyProgress();
    renderAnalysis();
    renderTopHabits();
    renderMoodBars();
    renderTrendChart();
    updateStats();
});

// Render Days Header
function renderDaysHeader() {
    const header = document.getElementById('daysHeader');
    header.innerHTML = '';
    
    for (let i = 1; i <= 31; i++) {
        const dayLabel = document.createElement('div');
        dayLabel.className = 'day-label';
        dayLabel.textContent = i;
        header.appendChild(dayLabel);
    }
}

// Render Habits with Edit & Delete
function renderHabits() {
    const container = document.getElementById('habitsList');
    container.innerHTML = '';
    
    habits.forEach(habit => {
        const row = document.createElement('div');
        row.className = 'habit-row';
        
        // Habit Info with Action Buttons
        const info = document.createElement('div');
        info.className = 'habit-info';
        info.innerHTML = `
            <span class="habit-icon">${habit.icon}</span>
            <span class="habit-name">${habit.name}</span>
            <div class="habit-actions">
                <button class="btn-edit" onclick="startEdit(${habit.id})" title="Edit">✏️</button>
                <button class="btn-delete" onclick="deleteHabit(${habit.id})" title="Delete">🗑️</button>
            </div>
        `;
        
        // Days Checkboxes
        const daysContainer = document.createElement('div');
        daysContainer.className = 'habit-days';
        
        habit.completed.forEach((checked, day) => {
            const checkbox = document.createElement('div');
            checkbox.className = `day-checkbox ${checked ? 'checked' : ''}`;
            checkbox.textContent = checked ? '✓' : '';
            checkbox.onclick = () => toggleHabit(habit.id, day);
            daysContainer.appendChild(checkbox);
        });
        
        row.appendChild(info);
        row.appendChild(daysContainer);
        container.appendChild(row);
    });
}

// Toggle Habit
function toggleHabit(habitId, day) {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
        habit.completed[day] = !habit.completed[day];
        saveData();
        renderHabits();
        updateStats();
        renderAnalysis();
        renderTopHabits();
        renderDailyProgress();
    }
}

// Start Edit Habit
function startEdit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    editingId = habitId;
    
    // Fill form with existing data
    document.getElementById('newHabit').value = habit.name;
    document.getElementById('habitIcon').value = habit.icon;
    
    // Change button to "Update"
    const btn = document.querySelector('.add-habit button');
    btn.textContent = '💾 Update Habit';
    btn.onclick = updateHabit;
    
    // Add cancel button
    if (!document.getElementById('cancelBtn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancelBtn';
        cancelBtn.textContent = '❌ Cancel';
        cancelBtn.onclick = cancelEdit;
        cancelBtn.style.backgroundColor = '#999';
        document.querySelector('.add-habit').appendChild(cancelBtn);
    }
    
    // Scroll to form
    document.querySelector('.add-habit').scrollIntoView({ behavior: 'smooth' });
}

// Update Habit
function updateHabit() {
    const input = document.getElementById('newHabit');
    const iconSelect = document.getElementById('habitIcon');
    const name = input.value.trim();
    const icon = iconSelect.value.split(' ')[0];
    
    if (!name) {
        alert('Please enter habit name!');
        return;
    }
    
    const habit = habits.find(h => h.id === editingId);
    if (habit) {
        habit.name = name;
        habit.icon = icon;
        saveData();
        renderHabits();
        updateStats();
        renderAnalysis();
        renderTopHabits();
        cancelEdit();
    }
}

// Cancel Edit
function cancelEdit() {
    editingId = null;
    document.getElementById('newHabit').value = '';
    document.getElementById('habitIcon').selectedIndex = 0;
    
    const btn = document.querySelector('.add-habit button');
    btn.textContent = '+ Add Habit';
    btn.onclick = addHabit;
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.remove();
}

// Delete Habit
function deleteHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    // Confirm before delete
    if (confirm(`Delete "${habit.name}"?`)) {
        habits = habits.filter(h => h.id !== habitId);
        saveData();
        renderHabits();
        updateStats();
        renderAnalysis();
        renderTopHabits();
        renderDailyProgress();
    }
}

// Add New Habit
function addHabit() {
    const input = document.getElementById('newHabit');
    const iconSelect = document.getElementById('habitIcon');
    const name = input.value.trim();
    
    if (!name) {
        alert('Please enter habit name!');
        return;
    }
    
    const newHabit = {
        id: Date.now(),
        name: name,
        icon: iconSelect.value.split(' ')[0],
        completed: Array(31).fill(false)
    };
    
    habits.push(newHabit);
    saveData();
    renderHabits();
    updateStats();
    input.value = '';
}

// Render Daily Progress
function renderDailyProgress() {
    const container = document.getElementById('dailyProgress');
    container.innerHTML = '';
    
    for (let day = 0; day < 31; day++) {
        const completed = habits.filter(h => h.completed[day]).length;
        const percentage = habits.length > 0 ? (completed / habits.length) * 100 : 0;
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${percentage}%`;
        bar.title = `Day ${day + 1}: ${Math.round(percentage)}%`;
        container.appendChild(bar);
    }
}

// Render Weekly Progress
function renderWeeklyProgress() {
    const container = document.getElementById('weeklyProgress');
    container.innerHTML = '';
    
    for (let week = 0; week < 5; week++) {
        let weekCompleted = 0;
        let weekTotal = 0;
        
        for (let day = week * 7; day < Math.min((week + 1) * 7, 31); day++) {
            habits.forEach(h => {
                weekTotal++;
                if (h.completed[day]) weekCompleted++;
            });
        }
        
        const percentage = weekTotal > 0 ? (weekCompleted / weekTotal) * 100 : 0;
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${percentage}%`;
        bar.style.flex = '2';
        bar.title = `Week ${week + 1}: ${Math.round(percentage)}%`;
        container.appendChild(bar);
    }
}

// Update Stats
function updateStats() {
    let totalCompleted = 0;
    let totalPossible = habits.length * 31;
    
    habits.forEach(h => {
        totalCompleted += h.completed.filter(c => c).length;
    });
    
    const totalLeft = totalPossible - totalCompleted;
    const percentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    
    document.getElementById('totalGoal').textContent = totalPossible;
    document.getElementById('totalCompleted').textContent = totalCompleted;
    document.getElementById('totalLeft').textContent = totalLeft;
    
    const donut = document.querySelector('.donut');
    if (donut) {
        donut.style.setProperty('--progress', percentage);
        donut.querySelector('span').textContent = `${percentage}%`;
    }
}

// Render Analysis
function renderAnalysis() {
    const tbody = document.getElementById('analysisBody');
    tbody.innerHTML = '';
    
    habits.forEach(habit => {
        const completed = habit.completed.filter(c => c).length;
        const goal = 31;
        const left = goal - completed;
        const percentage = Math.round((completed / goal) * 100);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${goal}</td>
            <td>${completed}</td>
            <td>${left}</td>
            <td class="progress-cell">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </td>
            <td>${percentage}%</td>
        `;
        tbody.appendChild(row);
    });
}

// Render Top Habits
function renderTopHabits() {
    const list = document.getElementById('topHabitsList');
    list.innerHTML = '';
    
    const sortedHabits = [...habits].sort((a, b) => {
        const aCompleted = a.completed.filter(c => c).length;
        const bCompleted = b.completed.filter(c => c).length;
        return bCompleted - aCompleted;
    }).slice(0, 10);
    
    sortedHabits.forEach(habit => {
        const li = document.createElement('li');
        li.textContent = `${habit.icon} ${habit.name}`;
        list.appendChild(li);
    });
}

// Render Mood Bars
function renderMoodBars() {
    const moodContainer = document.getElementById('moodBars');
    const motivationContainer = document.getElementById('motivationBars');
    
    if (!moodContainer || !motivationContainer) return;
    
    moodContainer.innerHTML = '';
    motivationContainer.innerHTML = '';
    
    const moodData = Array(31).fill(0).map(() => Math.floor(Math.random() * 5) + 5);
    const motivationData = Array(31).fill(0).map(() => Math.floor(Math.random() * 5) + 4);
    
    moodData.forEach(val => {
        const bar = document.createElement('div');
        bar.className = 'mood-bar';
        bar.style.height = `${val * 10}%`;
        moodContainer.appendChild(bar);
    });
    
    motivationData.forEach(val => {
        const bar = document.createElement('div');
        bar.className = 'mood-bar';
        bar.style.height = `${val * 10}%`;
        motivationContainer.appendChild(bar);
    });
}

// Render Trend Chart
function renderTrendChart() {
    const canvas = document.getElementById('trendCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 600;
    canvas.height = canvas.offsetHeight || 150;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const data = [];
    for (let i = 0; i < 31; i++) {
        const completed = habits.filter(h => h.completed[i]).length;
        data.push(habits.length > 0 ? (completed / habits.length) * height : 0);
    }
    
    ctx.beginPath();
    ctx.strokeStyle = '#5a5852';
    ctx.lineWidth = 2;
    
    data.forEach((val, idx) => {
        const x = (idx / 30) * width;
        const y = height - val - 10;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    
    ctx.stroke();
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(90, 88, 82, 0.1)';
    ctx.fill();
}

// Save to LocalStorage
function saveData() {
    localStorage.setItem('habits', JSON.stringify(habits));
}
