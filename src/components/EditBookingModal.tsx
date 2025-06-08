import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Mail, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Booking {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSubmit: (updatedBooking: Booking) => void;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
];

const EditBookingModal = ({ isOpen, onClose, booking, onSubmit }: EditBookingModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: '',
    date: '',
    time: '',
    status: 'pending' as 'confirmed' | 'pending' | 'completed' | 'cancelled'
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (booking && isOpen) {
      setFormData({
        name: booking.name,
        email: booking.email,
        notes: booking.notes || '',
        date: booking.date,
        time: booking.time,
        status: booking.status
      });
    }
  }, [booking, isOpen]);

  if (!isOpen || !booking) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Imię i nazwisko jest wymagane';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Podaj prawidłowy adres email';
    }

    if (!formData.date) {
      newErrors.date = 'Data jest wymagana';
    }

    if (!formData.time) {
      newErrors.time = 'Godzina jest wymagana';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Symulacja API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedBooking: Booking = {
      ...booking,
      name: formData.name,
      email: formData.email,
      notes: formData.notes,
      date: formData.date,
      time: formData.time,
      status: formData.status
    };
    
    onSubmit(updatedBooking);
    
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 p-6 bg-background border shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Edytuj Rezerwację</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Imię i nazwisko *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Wprowadź imię i nazwisko"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Adres email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="twoj@email.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Date Field */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={errors.date ? 'border-destructive' : ''}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>

          {/* Time Field */}
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Godzina *
            </Label>
            <Select value={formData.time} onValueChange={(value) => handleInputChange('time', value)}>
              <SelectTrigger className={errors.time ? 'border-destructive' : ''}>
                <SelectValue placeholder="Wybierz godzinę" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(time => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.time && (
              <p className="text-sm text-destructive">{errors.time}</p>
            )}
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as 'confirmed' | 'pending' | 'completed' | 'cancelled')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Oczekująca</SelectItem>
                <SelectItem value="confirmed">Potwierdzona</SelectItem>
                <SelectItem value="completed">Zakończona</SelectItem>
                <SelectItem value="cancelled">Anulowana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dodatkowe informacje
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Opcjonalne notatki lub specjalne wymagania..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditBookingModal;
