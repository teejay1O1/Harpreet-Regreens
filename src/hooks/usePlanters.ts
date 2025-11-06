import { useState, useEffect } from 'react';
import { supabase, Planter } from '../lib/supabase';

export const usePlanters = () => {
  const [planters, setPlanters] = useState<Planter[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlanters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('planters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlanters(data || []);
    } catch (error) {
      console.error('Error fetching planters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanters();

    const subscription = supabase
      .channel('planters')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'planters',
      }, () => {
        fetchPlanters();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { planters, loading, refetch: fetchPlanters };
};
