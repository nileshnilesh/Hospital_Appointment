import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { DoctorsPage, Doctor } from "./components/DoctorsPage";
import {
  BookingPage,
  Appointment,
} from "./components/BookingPage";
import { AppointmentsPage } from "./components/AppointmentsPage";
import { projectId, publicAnonKey } from './utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-6fbd1962`;

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [appointments, setAppointments] = useState<
    Appointment[]
  >([]);
  const [selectedDoctor, setSelectedDoctor] = useState<
    Doctor | undefined
  >();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Load doctors and appointments from backend on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch doctors
        const doctorsResponse = await fetch(`${API_URL}/doctors`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        if (!doctorsResponse.ok) {
          throw new Error(`Failed to fetch doctors: ${doctorsResponse.statusText}`);
        }
        
        const doctorsData = await doctorsResponse.json();
        setDoctors(doctorsData.doctors || []);
        
        // Fetch appointments
        const appointmentsResponse = await fetch(`${API_URL}/appointments`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        if (!appointmentsResponse.ok) {
          throw new Error(`Failed to fetch appointments: ${appointmentsResponse.statusText}`);
        }
        
        const appointmentsData = await appointmentsResponse.json();
        
        // Convert date strings back to Date objects
        const appointmentsWithDates = (appointmentsData.appointments || []).map(
          (apt: any) => ({
            ...apt,
            date: new Date(apt.date),
          })
        );
        setAppointments(appointmentsWithDates);
      } catch (error) {
        console.error("Error loading data from backend:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedDoctor(undefined);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setCurrentPage("book");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAppointmentBooked = async (
    appointment: Appointment,
  ) => {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(appointment),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to book appointment: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAppointments((prev) => [...prev, data.appointment]);
      
      // Navigate to appointments page after booking
      setTimeout(() => {
        setCurrentPage("appointments");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 3000);
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to cancel appointment: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id
            ? { ...apt, status: "cancelled" as const }
            : apt,
        ),
      );
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        appointmentCount={
          appointments.filter(
            (apt) => apt.status === "scheduled",
          ).length
        }
      />

      <main className="flex-1">
        {loading ? (
          <div className="container mx-auto px-4 py-20 text-center">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {currentPage === "home" && (
              <HomePage onNavigate={handleNavigate} />
            )}

            {currentPage === "doctors" && (
              <DoctorsPage
                onBookAppointment={handleBookAppointment}
                doctors={doctors}
              />
            )}

            {currentPage === "book" && (
              <BookingPage
                preSelectedDoctor={selectedDoctor}
                onAppointmentBooked={handleAppointmentBooked}
                doctors={doctors}
              />
            )}

            {currentPage === "appointments" && (
              <AppointmentsPage
                appointments={appointments}
                onCancelAppointment={handleCancelAppointment}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}