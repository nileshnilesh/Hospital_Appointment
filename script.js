// Doctors Data
const doctors = [
    {
        id: '1',
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiologist',
        department: 'Cardiology',
        experience: 15,
        rating: 4.9,
        education: 'MD, Harvard Medical School',
        availability: ['Monday', 'Wednesday', 'Friday'],
        image: 'https://images.unsplash.com/photo-1758691463626-0ab959babe00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
    },
    {
        id: '2',
        name: 'Dr. Michael Chen',
        specialty: 'General Physician',
        department: 'General Medicine',
        experience: 12,
        rating: 4.8,
        education: 'MD, Johns Hopkins University',
        availability: ['Tuesday', 'Thursday', 'Saturday'],
        image: 'https://images.unsplash.com/photo-1758691463626-0ab959babe00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
    },
    {
        id: '3',
        name: 'Dr. Emily Rodriguez',
        specialty: 'Pediatrician',
        department: 'Pediatrics',
        experience: 10,
        rating: 4.9,
        education: 'MD, Stanford University',
        availability: ['Monday', 'Tuesday', 'Thursday'],
        image: 'https://images.unsplash.com/photo-1758691463626-0ab959babe00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
    },
    {
        id: '4',
        name: 'Dr. James Wilson',
        specialty: 'Orthopedic Surgeon',
        department: 'Orthopedics',
        experience: 18,
        rating: 4.7,
        education: 'MD, Mayo Clinic',
        availability: ['Wednesday', 'Friday', 'Saturday'],
        image: 'https://images.unsplash.com/photo-1758691463626-0ab959babe00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
    },
    {
        id: '5',
        name: 'Dr. Lisa Anderson',
        specialty: 'Neurologist',
        department: 'Neurology',
        experience: 14,
        rating: 4.8,
        education: 'MD, Yale School of Medicine',
        availability: ['Monday', 'Wednesday', 'Friday'],
        image: 'https://images.unsplash.com/photo-1758691463626-0ab959babe00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
    },
    {
        id: '6',
        name: 'Dr. Robert Kumar',
        specialty: 'Dermatologist',
        department: 'Dermatology',
        experience: 11,
        rating: 4.9,
        education: 'MD, Columbia University',
        availability: ['Tuesday', 'Thursday', 'Saturday'],
        image: 'https://images.unsplash.com/photo-1758691463626-0ab959babe00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
    }
];

// Time slots for appointments
const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

// Global state
let currentPage = 'home';
let appointments = [];
let currentStep = 1;
let selectedDoctor = null;
let selectedDate = null;
let selectedTime = null;
let currentTab = 'all';

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    loadAppointments();
    initializeDoctorsPage();
    initializeBookingPage();
    updateAppointmentBadge();
    setupMobileMenu();
});

// Navigation
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show selected page
    document.getElementById(`${page}-page`).classList.add('active');
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    currentPage = page;
    
    // Close mobile menu
    document.getElementById('mobile-nav').classList.remove('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Initialize page-specific content
    if (page === 'doctors') {
        renderDoctors();
    } else if (page === 'appointments') {
        renderAppointments();
    }
}

// Mobile menu
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
    });
}

// LocalStorage functions
function loadAppointments() {
    const saved = localStorage.getItem('hospital_appointments');
    if (saved) {
        try {
            appointments = JSON.parse(saved).map(apt => ({
                ...apt,
                date: new Date(apt.date)
            }));
        } catch (error) {
            console.error('Error loading appointments:', error);
            appointments = [];
        }
    }
}

function saveAppointments() {
    localStorage.setItem('hospital_appointments', JSON.stringify(appointments));
}

function updateAppointmentBadge() {
    const upcomingCount = appointments.filter(apt => apt.status === 'scheduled').length;
    const badge = document.getElementById('appointment-badge');
    const mobileBadge = document.getElementById('mobile-appointment-badge');
    
    if (upcomingCount > 0) {
        badge.textContent = upcomingCount;
        badge.style.display = 'flex';
        mobileBadge.textContent = upcomingCount;
        mobileBadge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
        mobileBadge.style.display = 'none';
    }
}

// Doctors Page
function initializeDoctorsPage() {
    // Populate department filter
    const departments = ['all', ...new Set(doctors.map(d => d.department))];
    const departmentFilter = document.getElementById('department-filter');
    
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept === 'all' ? 'All Departments' : dept;
        departmentFilter.appendChild(option);
    });
    
    // Add event listeners
    document.getElementById('doctor-search').addEventListener('input', renderDoctors);
    departmentFilter.addEventListener('change', renderDoctors);
}

function renderDoctors() {
    const searchQuery = document.getElementById('doctor-search').value.toLowerCase();
    const selectedDepartment = document.getElementById('department-filter').value;
    
    const filtered = doctors.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(searchQuery) ||
                            doctor.specialty.toLowerCase().includes(searchQuery);
        const matchesDepartment = selectedDepartment === 'all' || doctor.department === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });
    
    const grid = document.getElementById('doctors-grid');
    const noResults = document.getElementById('no-doctors');
    
    if (filtered.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    grid.innerHTML = filtered.map(doctor => `
        <div class="doctor-card">
            <img src="${doctor.image}" alt="${doctor.name}" class="doctor-image">
            <div class="doctor-content">
                <div class="doctor-header">
                    <div>
                        <div class="doctor-name">${doctor.name}</div>
                        <div class="doctor-specialty">${doctor.specialty}</div>
                    </div>
                    <div class="doctor-rating">
                        <svg width="16" height="16" viewBox="0 0 24 24" class="star">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        <span>${doctor.rating}</span>
                    </div>
                </div>
                <div class="doctor-details">
                    <p>${doctor.education}</p>
                    <p>${doctor.experience} years experience</p>
                </div>
                <div class="availability">
                    <p>Available:</p>
                    <div class="availability-badges">
                        ${doctor.availability.map(day => `<span class="badge-day">${day}</span>`).join('')}
                    </div>
                </div>
                <button class="btn btn-primary btn-full" onclick="bookDoctor('${doctor.id}')">
                    Book Appointment
                </button>
            </div>
        </div>
    `).join('');
}

function bookDoctor(doctorId) {
    selectedDoctor = doctors.find(d => d.id === doctorId);
    navigateTo('book');
    
    // Pre-select the doctor
    setTimeout(() => {
        document.getElementById('select-doctor').value = doctorId;
        updateDoctorInfo();
    }, 100);
}

// Booking Page
function initializeBookingPage() {
    // Populate doctor select
    const doctorSelect = document.getElementById('select-doctor');
    doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = `${doctor.name} - ${doctor.specialty}`;
        doctorSelect.appendChild(option);
    });
    
    // Populate time slots
    const timeSelect = document.getElementById('appointment-time');
    timeSlots.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    });
    
    // Set minimum date to today
    const dateInput = document.getElementById('appointment-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Add event listeners
    doctorSelect.addEventListener('change', updateDoctorInfo);
    dateInput.addEventListener('change', () => {
        selectedDate = dateInput.value;
        checkStep2Complete();
    });
    document.getElementById('appointment-time').addEventListener('change', (e) => {
        selectedTime = e.target.value;
        checkStep2Complete();
    });
    
    // Form validation
    ['patient-name', 'patient-email', 'patient-phone', 'visit-reason'].forEach(id => {
        document.getElementById(id).addEventListener('input', checkStep3Complete);
    });
    
    // Form submission
    document.getElementById('booking-form').addEventListener('submit', handleBookingSubmit);
}

function updateDoctorInfo() {
    const doctorId = document.getElementById('select-doctor').value;
    const doctorInfo = document.getElementById('doctor-info');
    const nextBtn = document.getElementById('step-1-next');
    
    if (!doctorId) {
        doctorInfo.style.display = 'none';
        nextBtn.disabled = true;
        selectedDoctor = null;
        return;
    }
    
    selectedDoctor = doctors.find(d => d.id === doctorId);
    nextBtn.disabled = false;
    
    doctorInfo.style.display = 'block';
    doctorInfo.innerHTML = `
        <p><span style="color: var(--gray-600)">Specialty:</span> ${selectedDoctor.specialty}</p>
        <p><span style="color: var(--gray-600)">Department:</span> ${selectedDoctor.department}</p>
        <p><span style="color: var(--gray-600)">Experience:</span> ${selectedDoctor.experience} years</p>
        <p><span style="color: var(--gray-600)">Available:</span> ${selectedDoctor.availability.join(', ')}</p>
    `;
}

function checkStep2Complete() {
    const nextBtn = document.getElementById('step-2-next');
    nextBtn.disabled = !selectedDate || !selectedTime;
}

function checkStep3Complete() {
    const name = document.getElementById('patient-name').value.trim();
    const email = document.getElementById('patient-email').value.trim();
    const phone = document.getElementById('patient-phone').value.trim();
    const reason = document.getElementById('visit-reason').value.trim();
    
    const confirmBtn = document.getElementById('confirm-btn');
    confirmBtn.disabled = !name || !email || !phone || !reason;
}

function nextStep() {
    if (currentStep < 3) {
        currentStep++;
        updateBookingStep();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateBookingStep();
    }
}

function updateBookingStep() {
    // Update progress steps
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index < currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.step-line').forEach((line, index) => {
        if (index < currentStep - 1) {
            line.classList.add('active');
        } else {
            line.classList.remove('active');
        }
    });
    
    // Update visible step
    document.querySelectorAll('.booking-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step-${currentStep}`).classList.add('active');
    
    // Update title
    const titles = ['Select Doctor', 'Choose Date & Time', 'Your Information'];
    document.getElementById('step-title').textContent = titles[currentStep - 1];
}

function handleBookingSubmit(e) {
    e.preventDefault();
    
    const appointment = {
        id: Date.now().toString(),
        patientName: document.getElementById('patient-name').value.trim(),
        email: document.getElementById('patient-email').value.trim(),
        phone: document.getElementById('patient-phone').value.trim(),
        doctor: selectedDoctor,
        date: new Date(selectedDate),
        time: selectedTime,
        reason: document.getElementById('visit-reason').value.trim(),
        status: 'scheduled'
    };
    
    appointments.push(appointment);
    saveAppointments();
    updateAppointmentBadge();
    
    // Show success message
    document.getElementById('booking-form').style.display = 'none';
    const successDiv = document.getElementById('booking-success');
    successDiv.style.display = 'block';
    
    const summary = document.getElementById('appointment-summary');
    summary.innerHTML = `
        <p><span style="color: var(--gray-600)">Doctor:</span> ${selectedDoctor.name}</p>
        <p><span style="color: var(--gray-600)">Date:</span> ${new Date(selectedDate).toLocaleDateString()}</p>
        <p><span style="color: var(--gray-600)">Time:</span> ${selectedTime}</p>
    `;
    
    // Reset and redirect after 3 seconds
    setTimeout(() => {
        resetBookingForm();
        navigateTo('appointments');
    }, 3000);
}

function resetBookingForm() {
    currentStep = 1;
    selectedDoctor = null;
    selectedDate = null;
    selectedTime = null;
    
    document.getElementById('booking-form').reset();
    document.getElementById('booking-form').style.display = 'block';
    document.getElementById('booking-success').style.display = 'none';
    document.getElementById('doctor-info').style.display = 'none';
    
    updateBookingStep();
}

// Appointments Page
function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
    
    renderAppointments();
}

function renderAppointments() {
    const content = document.getElementById('appointments-content');
    const noResults = document.getElementById('no-appointments');
    
    // Update counts
    const allCount = appointments.length;
    const upcomingCount = appointments.filter(a => a.status === 'scheduled').length;
    const completedCount = appointments.filter(a => a.status === 'completed').length;
    const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;
    
    document.getElementById('count-all').textContent = allCount;
    document.getElementById('count-upcoming').textContent = upcomingCount;
    document.getElementById('count-completed').textContent = completedCount;
    document.getElementById('count-cancelled').textContent = cancelledCount;
    
    // Filter appointments
    let filtered = appointments;
    if (currentTab !== 'all') {
        const statusMap = {
            'upcoming': 'scheduled',
            'completed': 'completed',
            'cancelled': 'cancelled'
        };
        filtered = appointments.filter(a => a.status === statusMap[currentTab]);
    }
    
    if (allCount === 0) {
        content.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    if (filtered.length === 0) {
        content.innerHTML = '<div class="no-results"><p>No appointments in this category.</p></div>';
        noResults.style.display = 'none';
        return;
    }
    
    noResults.style.display = 'none';
    
    content.innerHTML = `
        <div class="appointments-grid">
            ${filtered.map(apt => renderAppointmentCard(apt)).join('')}
        </div>
    `;
}

function renderAppointmentCard(appointment) {
    const statusIcons = {
        scheduled: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
        completed: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        cancelled: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
    };
    
    return `
        <div class="appointment-card">
            <div class="appointment-header">
                <div class="appointment-doctor">
                    <h3>${appointment.doctor.name}</h3>
                    <p style="color: var(--gray-600); font-size: 0.875rem;">${appointment.doctor.specialty}</p>
                </div>
                <span class="status-badge status-${appointment.status}">
                    ${statusIcons[appointment.status]}
                    <span style="text-transform: capitalize">${appointment.status}</span>
                </span>
            </div>
            <div class="appointment-body">
                <div class="appointment-details">
                    <div class="detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                        </svg>
                        <span>${appointment.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div class="detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>${appointment.time}</span>
                    </div>
                    <div class="detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>${appointment.patientName}</span>
                    </div>
                    <div class="detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span>${appointment.phone}</span>
                    </div>
                    <div class="detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <span>${appointment.email}</span>
                    </div>
                    <div class="detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <span style="color: var(--gray-600)">${appointment.reason}</span>
                    </div>
                </div>
                ${appointment.status === 'scheduled' ? `
                    <button class="btn btn-danger btn-full" onclick="cancelAppointment('${appointment.id}')">
                        Cancel Appointment
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function cancelAppointment(id) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        const index = appointments.findIndex(a => a.id === id);
        if (index !== -1) {
            appointments[index].status = 'cancelled';
            saveAppointments();
            updateAppointmentBadge();
            renderAppointments();
        }
    }
}
