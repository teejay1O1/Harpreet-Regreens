import React, { useState } from 'react';
import { Heart, ShoppingCart, Clock } from 'lucide-react';
import { Planter, Reservation } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useReservations } from '../hooks/useReservations';

interface PlanterCardProps {
  planter: Planter;
  reservation?: Reservation;
  onReservationChange?: () => void;
}

const PlanterCard: React.FC<PlanterCardProps> = ({ planter, reservation, onReservationChange }) => {
  const { user } = useAuth();
  const { reservations } = useReservations();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  React.useEffect(() => {
    if (!reservation) return;

    const updateTimer = () => {
      const expiresAt = new Date(reservation.expires_at).getTime();
      const now = new Date().getTime();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [reservation]);

  const handleReserve = async () => {
    if (!user) {
      alert('Please sign in to reserve a planter');
      return;
    }

    if (reservations.length >= 2) {
      alert('You can only reserve up to 2 planters at a time');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('reservations').insert({
        user_id: user.id,
        planter_id: planter.id,
        status: 'active',
      });

      if (error) {
        if (error.message.includes('duplicate')) {
          alert('This planter has already been reserved');
        } else {
          throw error;
        }
      } else {
        onReservationChange?.();
      }
    } catch (error) {
      console.error('Error reserving planter:', error);
      alert('Failed to reserve planter');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!reservation) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservation.id);

      if (error) throw error;
      onReservationChange?.();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Failed to cancel reservation');
    } finally {
      setLoading(false);
    }
  };

  const isAvailable = planter.status === 'available';
  const isReservedByUser = !!reservation;
  const isSold = planter.status === 'sold';

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={planter.image_url}
          alt={planter.name}
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
        />
        <div className="absolute top-3 right-3">
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition">
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {isSold && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Sold Out</span>
          </div>
        )}

        {planter.status === 'reserved' && !isReservedByUser && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Reserved</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">{planter.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{planter.description}</p>

        <div className="flex items-baseline justify-between mb-4">
          <span className="text-2xl font-bold text-gray-900">${planter.price.toFixed(2)}</span>
          <span className="text-xs text-gray-500">Hand-crafted</span>
        </div>

        {isReservedByUser && reservation && (
          <div className="mb-3 p-2 bg-green-50 rounded-lg flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-700" />
            <span className="text-sm font-medium text-green-700">{timeLeft}</span>
          </div>
        )}

        <div className="space-y-2">
          {isReservedByUser ? (
            <>
              <button
                onClick={() => {}}
                disabled={true}
                className="w-full py-2 bg-green-700 text-white font-medium rounded-lg opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Reserved
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="w-full py-2 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition disabled:opacity-50"
              >
                Cancel Reservation
              </button>
            </>
          ) : isAvailable ? (
            <button
              onClick={handleReserve}
              disabled={loading || reservations.length >= 2}
              className="w-full py-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {loading ? 'Reserving...' : 'Reserve Now'}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
            >
              Not Available
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanterCard;
