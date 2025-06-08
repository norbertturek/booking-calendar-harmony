
import React, { useState } from 'react';
import { Search, Calendar, Clock, User, Mail, FileText, Edit2, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EditBookingModal from './EditBookingModal';
import { useUpdateBooking, useDeleteBooking, type Booking } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';
import { getStatusColor, getStatusText } from '@/lib/statusUtils';

interface BookingsListProps {
  bookings: Booking[];
  isLoading?: boolean;
}

const BookingsList = ({ bookings, isLoading }: BookingsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const { toast } = useToast();
  const updateBookingMutation = useUpdateBooking();
  const deleteBookingMutation = useDeleteBooking();

  const filteredAndSortedBookings = bookings
    .filter(booking => {
      const matchesSearch = 
        booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.notes && booking.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const updateBookingStatus = async (id: string, status: 'confirmed' | 'pending' | 'completed' | 'cancelled') => {
    try {
      await updateBookingMutation.mutateAsync({ id, updates: { status } });
      toast({
        title: "Sukces",
        description: "Status rezerwacji został zaktualizowany",
      });
         } catch (error: any) {
       toast({
         title: "Błąd",
         description: error?.message || "Nie udało się zaktualizować statusu",
         variant: "destructive",
       });
     }
  };

  const deleteBooking = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę rezerwację?')) {
      try {
        await deleteBookingMutation.mutateAsync(id);
        toast({
          title: "Sukces",
          description: "Rezerwacja została usunięta",
        });
             } catch (error: any) {
         toast({
           title: "Błąd",
           description: error?.message || "Nie udało się usunąć rezerwacji",
           variant: "destructive",
         });
       }
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleUpdateBooking = async (updatedBooking: Booking) => {
    try {
      await updateBookingMutation.mutateAsync({ 
        id: updatedBooking.id, 
        updates: {
          name: updatedBooking.name,
          email: updatedBooking.email,
          notes: updatedBooking.notes,
          date: updatedBooking.date,
          time: updatedBooking.time,
          status: updatedBooking.status
        }
      });
      toast({
        title: "Sukces",
        description: "Rezerwacja została zaktualizowana",
      });
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error?.message || "Nie udało się zaktualizować rezerwacji",
        variant: "destructive",
      });
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
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{bookings.length}</div>
            <div className="text-sm text-muted-foreground">Wszystkie</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <div className="text-sm text-muted-foreground">Potwierdzone</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Oczekujące</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter(b => b.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Zakończone</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {bookings.filter(b => b.status === 'cancelled').length}
            </div>
            <div className="text-sm text-muted-foreground">Anulowane</div>
          </div>
        </div>
      </Card>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po nazwisku, emailu lub notatkach..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="confirmed">Potwierdzone</SelectItem>
                <SelectItem value="pending">Oczekujące</SelectItem>
                <SelectItem value="completed">Zakończone</SelectItem>
                <SelectItem value="cancelled">Anulowane</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="name">Nazwisko</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredAndSortedBookings.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nie znaleziono rezerwacji spełniających kryteria wyszukiwania.' 
                : 'Brak rezerwacji do wyświetlenia.'
              }
            </div>
          </Card>
        ) : (
          filteredAndSortedBookings.map(booking => (
            <Card key={booking.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Booking Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{booking.time}</span>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusText(booking.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{booking.email}</span>
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm text-muted-foreground">{booking.notes}</span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  {booking.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Potwierdź
                    </Button>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Zakończ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="flex items-center gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        Anuluj
                      </Button>
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditBooking(booking)}
                    className="flex items-center gap-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edytuj
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteBooking(booking.id)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Usuń
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <EditBookingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onSubmit={handleUpdateBooking}
      />
    </div>
  );
};

export default BookingsList;
