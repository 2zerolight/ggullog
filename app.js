// ChronosHub - JavaScript Application Logic

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initTimeCalculator();
    initSalaryCalculator();
    initTimeZoneConverter();
    initPomodoroTimer();
});

/* ==========================================================================
   1. NAVIGATION TABS
   ========================================================================== */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    window.switchTab = function(targetId) {
        // Deactivate all buttons & contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Activate matching elements
        const activeBtn = document.querySelector(`.tab-btn[data-target="${targetId}"]`);
        const activeContent = document.getElementById(targetId);

        if (activeBtn) activeBtn.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-target');
            switchTab(target);
        });
    });
}

/* ==========================================================================
   2. TIME CALCULATOR
   ========================================================================== */
let rowCounter = 2; // Initial rows count is 2 (row 0 and row 1)

function initTimeCalculator() {
    const addRowBtn = document.getElementById('add-time-row-btn');
    const clearBtn = document.getElementById('clear-time-calc-btn');
    const tbody = document.getElementById('time-calc-rows');

    // Bind event listeners to initial row inputs
    bindRowListeners(tbody.querySelectorAll('.time-row'));

    addRowBtn.addEventListener('click', () => {
        const newRow = document.createElement('tr');
        newRow.className = 'time-row';
        newRow.innerHTML = `
            <td>
                <select class="op-select" id="op-${rowCounter}">
                    <option value="add">+</option>
                    <option value="sub">-</option>
                </select>
            </td>
            <td><input type="number" class="time-input hrs" placeholder="0" min="0" value="0" id="hr-${rowCounter}"></td>
            <td><input type="number" class="time-input mins" placeholder="0" min="0" max="59" value="0" id="mn-${rowCounter}"></td>
            <td><input type="number" class="time-input secs" placeholder="0" min="0" max="59" value="0" id="sc-${rowCounter}"></td>
            <td><button class="btn-icon delete-row-btn" onclick="deleteTimeRow(this)"><i class="fa-regular fa-trash-can"></i></button></td>
        `;
        tbody.appendChild(newRow);
        bindRowListeners([newRow]);
        rowCounter++;
        calculateTimeSum();
    });

    clearBtn.addEventListener('click', () => {
        tbody.innerHTML = `
            <tr class="time-row">
                <td><span class="op-label first">시작</span></td>
                <td><input type="number" class="time-input hrs" placeholder="0" min="0" value="1" id="hr-0"></td>
                <td><input type="number" class="time-input mins" placeholder="0" min="0" max="59" value="30" id="mn-0"></td>
                <td><input type="number" class="time-input secs" placeholder="0" min="0" max="59" value="0" id="sc-0"></td>
                <td><button class="btn-icon delete-row-btn" disabled><i class="fa-regular fa-trash-can"></i></button></td>
            </tr>
            <tr class="time-row">
                <td>
                    <select class="op-select" id="op-1">
                        <option value="add">+</option>
                        <option value="sub">-</option>
                    </select>
                </td>
                <td><input type="number" class="time-input hrs" placeholder="0" min="0" value="0" id="hr-1"></td>
                <td><input type="number" class="time-input mins" placeholder="0" min="0" max="59" value="45" id="mn-1"></td>
                <td><input type="number" class="time-input secs" placeholder="0" min="0" max="59" value="30" id="sc-1"></td>
                <td><button class="btn-icon delete-row-btn" onclick="deleteTimeRow(this)"><i class="fa-regular fa-trash-can"></i></button></td>
            </tr>
        `;
        rowCounter = 2;
        bindRowListeners(tbody.querySelectorAll('.time-row'));
        calculateTimeSum();
    });

    // Initial calculation
    calculateTimeSum();
}

function bindRowListeners(rows) {
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const select = row.querySelector('select');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                validateMinMax(input);
                calculateTimeSum();
            });
        });
        
        if (select) {
            select.addEventListener('change', calculateTimeSum);
        }
    });
}

function validateMinMax(input) {
    let val = parseInt(input.value) || 0;
    const min = parseInt(input.getAttribute('min'));
    const max = parseInt(input.getAttribute('max'));

    if (val < min) val = min;
    if (max && val > max) val = max;
    
    input.value = val;
}

window.deleteTimeRow = function(btn) {
    const row = btn.closest('tr');
    row.remove();
    calculateTimeSum();
};

function calculateTimeSum() {
    const rows = document.querySelectorAll('#time-calc-rows .time-row');
    let totalSeconds = 0;

    rows.forEach((row, index) => {
        const hr = parseInt(row.querySelector('.hrs').value) || 0;
        const mn = parseInt(row.querySelector('.mins').value) || 0;
        const sc = parseInt(row.querySelector('.secs').value) || 0;

        const seconds = (hr * 3600) + (mn * 60) + sc;

        if (index === 0) {
            totalSeconds = seconds;
        } else {
            const op = row.querySelector('.op-select').value;
            if (op === 'add') {
                totalSeconds += seconds;
            } else {
                totalSeconds -= seconds;
            }
        }
    });

    const isNegative = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);

    const h = Math.floor(absSeconds / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);
    const s = absSeconds % 60;

    let resultText = '';
    if (isNegative) resultText += '마이너스 ';
    
    if (h > 0) resultText += `${h}시간 `;
    if (m > 0 || h > 0) resultText += `${m}분 `;
    resultText += `${s}초`;

    document.getElementById('time-calc-result').innerText = resultText || '0초';
    
    const decimalMins = (absSeconds / 60).toFixed(1);
    document.getElementById('time-calc-details').innerText = 
        `${isNegative ? '-' : ''}총 ${absSeconds.toLocaleString()}초 (${decimalMins}분)`;
}

/* ==========================================================================
   3. SALARY CALCULATOR
   ========================================================================== */
function initSalaryCalculator() {
    const hourlyWageInput = document.getElementById('hourly-wage');
    const startInput = document.getElementById('work-start');
    const endInput = document.getElementById('work-end');
    const breakInput = document.getElementById('break-mins');
    const daysSelect = document.getElementById('weekly-days');

    const inputs = [hourlyWageInput, startInput, endInput, breakInput, daysSelect];
    inputs.forEach(input => {
        input.addEventListener('input', calculateSalary);
    });

    // Run initial calculation
    calculateSalary();
}

function calculateSalary() {
    const wage = parseInt(document.getElementById('hourly-wage').value) || 0;
    const start = document.getElementById('work-start').value;
    const end = document.getElementById('work-end').value;
    const breakMins = parseInt(document.getElementById('break-mins').value) || 0;
    const days = parseInt(document.getElementById('weekly-days').value) || 5;

    if (!start || !end) return;

    // Parse start and end times
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
    
    // If end time is before start time, assume it spans midnight
    if (diffMins < 0) {
        diffMins += 24 * 60;
    }

    // Subtract break time
    let actualWorkMins = diffMins - breakMins;
    if (actualWorkMins < 0) actualWorkMins = 0;

    const dailyHours = actualWorkMins / 60;
    const dailyPay = Math.round(dailyHours * wage);

    const weeklyHours = dailyHours * days;
    const weeklyPay = dailyPay * days;
    
    // Standard average weeks per month is 4.345
    const monthlyPay = Math.round(weeklyPay * 4.345);

    // Update DOM
    document.getElementById('daily-work-hours').innerText = `${dailyHours.toFixed(2)} 시간`;
    document.getElementById('daily-salary').innerText = `₩ ${dailyPay.toLocaleString()}`;
    document.getElementById('weekly-work-hours').innerText = `${weeklyHours.toFixed(2)} 시간`;
    document.getElementById('weekly-salary').innerText = `₩ ${weeklyPay.toLocaleString()}`;
    document.getElementById('monthly-salary').innerText = `₩ ${monthlyPay.toLocaleString()}`;
}

/* ==========================================================================
   4. TIME ZONE CONVERTER
   ========================================================================== */
function initTimeZoneConverter() {
    const slider = document.getElementById('time-slider');
    
    slider.addEventListener('input', updateTimeZones);
    
    // Set slider initial value to current Seoul time
    const now = new Date();
    // Get time in Seoul currently
    const seoulFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Seoul',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    });
    const formatted = seoulFormatter.format(now);
    const [h, m] = formatted.split(':').map(Number);
    
    slider.value = h * 60 + m;
    
    // Run initial display
    updateTimeZones();
}

function updateTimeZones() {
    const sliderValue = parseInt(document.getElementById('time-slider').value);
    
    // Create base UTC timestamp where Seoul time (UTC+9) matches the slider's hour/minute.
    const now = new Date();
    const sliderH = Math.floor(sliderValue / 60);
    const sliderM = sliderValue % 60;
    
    // Set base time relative to Seoul: UTC_hours = Seoul_hours - 9
    const baseDate = new Date(now);
    baseDate.setUTCHours(sliderH - 9, sliderM, 0, 0);

    // Formatter functions
    const timeFormatter = (tz) => new Intl.DateTimeFormat('ko-KR', {
        timeZone: tz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    const dateFormatter = (tz) => new Intl.DateTimeFormat('ko-KR', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
    });

    // Helper to calculate date relative offset labels (Today, Yesterday, Tomorrow)
    const getDateLabel = (tz, baseDate) => {
        const localNowStr = new Intl.DateTimeFormat('ko-KR', { timeZone: tz, day: 'numeric' }).format(new Date());
        const targetDateStr = new Intl.DateTimeFormat('ko-KR', { timeZone: tz, day: 'numeric' }).format(baseDate);
        
        const localNow = parseInt(localNowStr);
        const targetDate = parseInt(targetDateStr);
        
        if (localNow === targetDate) {
            return '오늘';
        } else if (targetDate === localNow - 1 || (localNow === 1 && targetDate > 25)) { // Approximation for yesterday
            return '어제';
        } else if (targetDate === localNow + 1 || (targetDate === 1 && localNow > 25)) { // Approximation for tomorrow
            return '내일';
        }
        return '';
    };

    // 1. Seoul (UTC+9)
    const seoulTimeStr = timeFormatter('Asia/Seoul').format(baseDate);
    const seoulDateStr = dateFormatter('Asia/Seoul').format(baseDate);
    document.getElementById('time-seoul').innerText = seoulTimeStr;
    document.getElementById('date-seoul').innerText = seoulDateStr;
    
    // Update main slider label
    document.getElementById('slider-time-label').innerText = `${seoulTimeStr} (서울 기준)`;
    
    const rawSeoulDate = new Intl.DateTimeFormat('ko-KR', { day: 'numeric' }).format(new Date());
    const targetSeoulDate = new Intl.DateTimeFormat('ko-KR', { day: 'numeric' }).format(baseDate);
    document.getElementById('slider-date-label').innerText = rawSeoulDate === targetSeoulDate ? '오늘' : (parseInt(targetSeoulDate) < parseInt(rawSeoulDate) ? '어제' : '내일');

    // 2. New York (UTC-4 / UTC-5)
    document.getElementById('time-newyork').innerText = timeFormatter('America/New_York').format(baseDate);
    document.getElementById('date-newyork').innerText = `${dateFormatter('America/New_York').format(baseDate)} (${getDateLabel('America/New_York', baseDate)})`;

    // 3. London (UTC+1 / UTC+0)
    document.getElementById('time-london').innerText = timeFormatter('Europe/London').format(baseDate);
    document.getElementById('date-london').innerText = `${dateFormatter('Europe/London').format(baseDate)} (${getDateLabel('Europe/London', baseDate)})`;

    // 4. Tokyo (UTC+9)
    document.getElementById('time-tokyo').innerText = timeFormatter('Asia/Tokyo').format(baseDate);
    document.getElementById('date-tokyo').innerText = `${dateFormatter('Asia/Tokyo').format(baseDate)} (${getDateLabel('Asia/Tokyo', baseDate)})`;

    // 5. Sydney (UTC+10 / UTC+11)
    document.getElementById('time-sydney').innerText = timeFormatter('Australia/Sydney').format(baseDate);
    document.getElementById('date-sydney').innerText = `${dateFormatter('Australia/Sydney').format(baseDate)} (${getDateLabel('Australia/Sydney', baseDate)})`;
}

/* ==========================================================================
   5. POMODORO TIMER
   ========================================================================== */
let pomoInterval = null;
let pomoTimeLeft = 25 * 60; // 25 minutes default
let pomoDuration = 25 * 60;
let isPomoRunning = false;
let currentMode = 'work'; // 'work', 'short-break', 'long-break'

function initPomodoroTimer() {
    const startBtn = document.getElementById('pomo-start-btn');
    const pauseBtn = document.getElementById('pomo-pause-btn');
    const resetBtn = document.getElementById('pomo-reset-btn');
    
    const preset25 = document.getElementById('btn-preset-25');
    const preset5 = document.getElementById('btn-preset-5');
    const preset15 = document.getElementById('btn-preset-15');

    startBtn.addEventListener('click', startPomo);
    pauseBtn.addEventListener('click', pausePomo);
    resetBtn.addEventListener('click', resetPomo);

    preset25.addEventListener('click', () => setMode('work', 25, preset25));
    preset5.addEventListener('click', () => setMode('short-break', 5, preset5));
    preset15.addEventListener('click', () => setMode('long-break', 15, preset15));

    // Update progress ring initially
    updatePomoProgress();
}

function setMode(mode, mins, buttonEl) {
    // Clear dynamic state
    clearInterval(pomoInterval);
    isPomoRunning = false;
    currentMode = mode;
    pomoDuration = mins * 60;
    pomoTimeLeft = pomoDuration;
    
    // Toggle button UI classes
    document.querySelectorAll('.preset-buttons .btn').forEach(btn => btn.classList.remove('active'));
    buttonEl.classList.add('active');

    // Toggle timer status labels
    const labels = {
        'work': '집중 시간',
        'short-break': '짧은 휴식',
        'long-break': '긴 휴식'
    };
    document.getElementById('pomo-status-label').innerText = labels[mode];

    // Toggle button states
    document.getElementById('pomo-start-btn').disabled = false;
    document.getElementById('pomo-pause-btn').disabled = true;

    // Render updates
    updatePomoDisplay();
    updatePomoProgress();
}

function startPomo() {
    if (isPomoRunning) return;
    
    isPomoRunning = true;
    document.getElementById('pomo-start-btn').disabled = true;
    document.getElementById('pomo-pause-btn').disabled = false;

    pomoInterval = setInterval(() => {
        pomoTimeLeft--;
        updatePomoDisplay();
        updatePomoProgress();

        if (pomoTimeLeft <= 0) {
            clearInterval(pomoInterval);
            isPomoRunning = false;
            document.getElementById('pomo-start-btn').disabled = false;
            document.getElementById('pomo-pause-btn').disabled = true;
            triggerTimerEndAlarm();
        }
    }, 1000);
}

function pausePomo() {
    if (!isPomoRunning) return;
    
    clearInterval(pomoInterval);
    isPomoRunning = false;
    document.getElementById('pomo-start-btn').disabled = false;
    document.getElementById('pomo-pause-btn').disabled = true;
}

function resetPomo() {
    clearInterval(pomoInterval);
    isPomoRunning = false;
    pomoTimeLeft = pomoDuration;
    
    document.getElementById('pomo-start-btn').disabled = false;
    document.getElementById('pomo-pause-btn').disabled = true;

    updatePomoDisplay();
    updatePomoProgress();
}

function updatePomoDisplay() {
    const mins = Math.floor(pomoTimeLeft / 60);
    const secs = pomoTimeLeft % 60;
    
    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.getElementById('pomo-time-display').innerText = formattedTime;
}

function updatePomoProgress() {
    const progressRing = document.getElementById('timer-progress-ring');
    const circumference = 2 * Math.PI * 110; // r=110
    
    const percent = pomoTimeLeft / pomoDuration;
    const offset = circumference * (1 - percent);
    
    progressRing.style.strokeDashoffset = offset;
}

// Alarm audio using Web Audio API to bypass missing physical file assets
function triggerTimerEndAlarm() {
    const isSoundEnabled = document.getElementById('sound-chk').checked;
    if (!isSoundEnabled) return;

    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContextClass();
        
        // Frequency chime 1
        playTone(ctx, 523.25, 0.15, 0); // C5
        // Frequency chime 2
        playTone(ctx, 659.25, 0.15, 0.15); // E5
        // Frequency chime 3
        playTone(ctx, 783.99, 0.35, 0.3); // G5
        
    } catch (e) {
        console.warn('Web Audio API is not supported or blocked by user interaction', e);
    }
}

function playTone(ctx, freq, duration, delay) {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
    
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
}
