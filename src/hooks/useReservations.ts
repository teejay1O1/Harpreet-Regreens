import { useState, useEffect } from 'react';
import { supabase, Reservation } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useReservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReservations = async () => {
    if (!user) {
      setReservations([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  useEffect(() => {
    fetchReservations();

    if (!user) return;

    const subscription = supabase
      .channel('reservations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reservations',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchReservations();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { reservations, loading, refetch: fetchReservations };
};
