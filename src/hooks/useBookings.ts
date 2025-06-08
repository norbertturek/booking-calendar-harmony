import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';

export type Booking = Tables<'bookings'>;
export type BookingInsert = TablesInsert<'bookings'>;
export type BookingUpdate = TablesUpdate<'bookings'>;

// Query Keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...bookingKeys.lists(), { filters }] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

// Hook do pobierania wszystkich rezerwacji
export const useBookings = (filters?: {
  startDate?: string;
  endDate?: string;
  status?: string;
}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: bookingKeys.list(filters || {}),
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      // Filtruj po datach jeśli podane
      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as Booking[];
    },
    enabled: !!user, // Wykonaj query tylko gdy użytkownik jest zalogowany
  });
};

// Hook do pobierania pojedynczej rezerwacji
export const useBooking = (id: string) => {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Booking;
    },
    enabled: !!id,
  });
};

// Hook do tworzenia nowej rezerwacji
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newBooking: Omit<BookingInsert, 'user_id'>) => {
      if (!user) {
        throw new Error('Użytkownik musi być zalogowany');
      }

      // Sprawdź czy termin jest dostępny
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('date', newBooking.date)
        .eq('time', newBooking.time)
        .neq('status', 'cancelled')
        .single();

      if (existingBooking) {
        throw new Error('Ten termin jest już zajęty');
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...newBooking,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Booking;
    },
    onSuccess: () => {
      // Invalidate i refetch booking queries
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
};

// Hook do aktualizacji rezerwacji
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BookingUpdate }) => {
      // Jeśli aktualizujemy datę lub czas, sprawdź dostępność
      if (updates.date || updates.time) {
        const { data: existingBooking } = await supabase
          .from('bookings')
          .select('id')
          .eq('date', updates.date || '')
          .eq('time', updates.time || '')
          .neq('id', id)
          .neq('status', 'cancelled')
          .single();

        if (existingBooking) {
          throw new Error('Ten termin jest już zajęty');
        }
      }

      const { data, error } = await supabase
        .from('bookings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Booking;
    },
    onSuccess: (data) => {
      // Update specific booking in cache
      queryClient.setQueryData(bookingKeys.detail(data.id), data);
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

// Hook do usuwania rezerwacji  
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: bookingKeys.detail(deletedId) });
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

// Hook do sprawdzania dostępności terminów
export const useAvailableSlots = (date: string) => {
  return useQuery({
    queryKey: ['available-slots', date],
    queryFn: async () => {
      // Pobierz zajęte terminy dla danej daty
      const { data: bookedSlots, error } = await supabase
        .from('bookings')
        .select('time')
        .eq('date', date)
        .neq('status', 'cancelled');

      if (error) {
        throw new Error(error.message);
      }

      // Pobierz dostępne sloty czasowe
      const { data: timeSlots, error: timeSlotsError } = await supabase
        .from('time_slots')
        .select('time')
        .eq('is_active', true)
        .order('time');

      if (timeSlotsError) {
        throw new Error(timeSlotsError.message);
      }

      // Filtruj dostępne sloty
      const bookedTimes = bookedSlots?.map(slot => slot.time) || [];
      const availableSlots = timeSlots?.filter(slot => 
        !bookedTimes.includes(slot.time)
      ) || [];

      return availableSlots.map(slot => slot.time);
    },
    enabled: !!date,
  });
}; 