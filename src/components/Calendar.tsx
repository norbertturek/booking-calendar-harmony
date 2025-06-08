import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BookingModal from './BookingModal';
import BookingsList from './BookingsList';
import { useBookings, useAvailableSlots, type Booking } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';
import { formatDateToString } from '@/lib/dateUtils';
import { getStatusColor, getStatusText } from '@/lib/statusUtils';

type ViewMode = 'month' | 'week' | 'day';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); 
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const { toast } = useToast();

  // Hook do pobierania rezerwacji z Supabase
  const { data: bookings = [], isLoading, error } = useBookings();
  
  // Hook do sprawdzania dostępności dla wybranej daty
  const selectedDateStr = selectedDate ? formatDateToString(selectedDate) : '';
  const { data: availableSlots = [] } = useAvailableSlots(selectedDateStr);

  // Obsługa błędów
  if (error) {
    toast({
      title: "Błąd",
      description: "Nie udało się pobrać rezerwacji",
      variant: "destructive",
    });
  }

  const months = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Helper function to normalize time format for comparison
  const normalizeTime = (time: string) => {
    // Convert "HH:MM:SS" to "HH:MM" or keep "HH:MM" as is
    return time.split(':').slice(0, 2).join(':');
  };

  // Helper function to find booking for specific date and time
  const findBookingForSlot = (date: Date, time?: string) => {
    const dateStr = formatDateToString(date);
    return bookings.find(booking => 
      booking.date === dateStr && 
      (!time || normalizeTime(booking.time) === normalizeTime(time)) && 
      booking.status !== 'cancelled'
    );
  };



  const isDateBooked = (date: Date, time?: string) => {
    return !!findBookingForSlot(date, time);
  };

  const isTimeSlotAvailable = (date: Date, time: string) => {
    const now = new Date();
    const slotDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    slotDate.setHours(hours, minutes, 0, 0);
    
    return slotDate > now && !isDateBooked(date, time);
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    if (isTimeSlotAvailable(date, time)) {
      setSelectedDate(date);
      setSelectedTime(time);
      setIsBookingModalOpen(true);
    }
  };

  const handleBookingSubmit = (bookingData: { date: string; time: string; name: string; email: string; notes?: string; status: 'pending' }) => {
    // Booking creation will be handled by BookingModal component using useCreateBooking hook
    setIsBookingModalOpen(false);
    setSelectedDate(null);
    setSelectedTime('');
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Nie', 'Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob'];

    return (
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center font-semibold text-muted-foreground bg-muted/30">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const hasBookings = isDateBooked(day);
          
          return (
            <div
              key={index}
              className={`p-2 h-24 border border-border/50 transition-all hover:bg-accent/50 cursor-pointer ${
                !isCurrentMonth ? 'text-muted-foreground bg-muted/20' : 'bg-background'
              } ${isToday ? 'ring-2 ring-primary' : ''}`}
              onClick={() => {
                if (isCurrentMonth) {
                  setSelectedDate(day);
                  setViewMode('day');
                }
              }}
            >
              <div className={`text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
                {day.getDate()}
              </div>
              {hasBookings && (
                <div className="mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {bookings.filter(b => b.date === formatDateToString(day) && b.status !== 'cancelled').length} wizyt
                  </Badge>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays(currentDate);
    const weekDays = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    


    return (
      <div className="grid grid-cols-8 gap-1">
        <div className="p-3 text-center font-semibold text-muted-foreground">Godzina</div>
        {days.map((day, index) => (
          <div key={index} className="p-3 text-center font-semibold text-muted-foreground bg-muted/30">
            <div>{weekDays[day.getDay()]}</div>
            <div className="text-lg">{day.getDate()}</div>
          </div>
        ))}
        
        {timeSlots.map(time => (
          <React.Fragment key={time}>
            <div className="p-2 text-center text-sm font-medium border-r border-border/50 bg-muted/20">
              {time}
            </div>
            {days.map((day, dayIndex) => {
              const isAvailable = isTimeSlotAvailable(day, time);
              const isBooked = isDateBooked(day, time);
              const booking = findBookingForSlot(day, time);
              
              return (
                <div
                  key={`${time}-${dayIndex}`}
                  className={`p-2 h-12 border border-border/50 transition-all cursor-pointer relative ${
                    isBooked 
                      ? 'bg-destructive/20 cursor-not-allowed' 
                      : isAvailable 
                        ? 'bg-background hover:bg-primary/10 hover:border-primary/50' 
                        : 'bg-muted/50 cursor-not-allowed'
                  }`}
                  onClick={() => handleTimeSlotClick(day, time)}
                  title={booking ? `${booking.name} - ${booking.email}\nStatus: ${getStatusText(booking.status)}${booking.notes ? '\nUwagi: ' + booking.notes : ''}` : ''}
                >
                  {isBooked && booking && (
                    <div className="flex flex-col items-center justify-center h-full p-1 gap-1">
                      <Badge className={`text-xs px-1 py-0.5 ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </Badge>
                      <div className="text-xs text-center font-medium truncate w-full leading-tight">
                        {booking.name.split(' ')[0]}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const displayDate = selectedDate || currentDate;
    
    return (
      <div className="space-y-2">
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-semibold">
            {displayDate.toLocaleDateString('pl-PL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>
        
        <div className="grid gap-2">
          {timeSlots.map(time => {
            const isAvailable = isTimeSlotAvailable(displayDate, time);
            const isBooked = isDateBooked(displayDate, time);
            const booking = findBookingForSlot(displayDate, time);
            
            return (
              <div
                key={time}
                className={`p-4 border rounded-lg transition-all cursor-pointer ${
                  isBooked 
                    ? 'bg-destructive/10 border-destructive/30 cursor-not-allowed' 
                    : isAvailable 
                      ? 'bg-background hover:bg-primary/10 hover:border-primary/50 border-border' 
                      : 'bg-muted/50 border-muted cursor-not-allowed'
                }`}
                onClick={() => handleTimeSlotClick(displayDate, time)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{time}</span>
                  </div>
                  
                  {isBooked && booking ? (
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusText(booking.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {booking.name}
                      </span>
                    </div>
                  ) : isAvailable ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Dostępne
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Niedostępne</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Kalendarz Rezerwacji</h1>
            <p className="text-muted-foreground mt-1">
              Zarezerwuj dogodny dla siebie termin
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isAdminView ? "outline" : "default"}
              onClick={() => setIsAdminView(false)}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Kalendarz
            </Button>
            <Button
              variant={isAdminView ? "default" : "outline"}
              onClick={() => setIsAdminView(true)}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Zarządzanie ({bookings.length})
            </Button>
          </div>
        </div>
      </Card>

      {isAdminView ? (
        <BookingsList bookings={bookings} isLoading={isLoading} />
      ) : (
        <>
          {/* Navigation and View Controls */}
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <h2 className="text-xl font-semibold min-w-[200px] text-center">
                  {viewMode === 'month' && `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                  {viewMode === 'week' && `Tydzień ${currentDate.toLocaleDateString('pl-PL')}`}
                  {viewMode === 'day' && (selectedDate || currentDate).toLocaleDateString('pl-PL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-1 bg-muted p-1 rounded-lg">
                {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="capitalize"
                  >
                    {mode === 'month' ? 'Miesiąc' : mode === 'week' ? 'Tydzień' : 'Dzień'}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Calendar */}
          <Card className="p-6">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Ładowanie rezerwacji...</span>
                </div>
              ) : (
                <>
                  {viewMode === 'month' && renderMonthView()}
                  {viewMode === 'week' && renderWeekView()}
                  {viewMode === 'day' && renderDayView()}
                </>
              )}
            </div>
          </Card>

          {/* Legend */}
          <Card className="p-4">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-background border border-border rounded"></div>
                <span>Dostępne</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-destructive/20 border border-destructive/30 rounded"></div>
                <span>Zajęte</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted/50 border border-muted rounded"></div>
                <span>Niedostępne</span>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedDate(null);
          setSelectedTime('');
        }}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onSubmit={handleBookingSubmit}
      />
    </div>
  );
};

export default Calendar;
