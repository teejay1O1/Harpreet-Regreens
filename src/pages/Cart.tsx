import React, { useState } from 'react';
import { Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useReservations } from '../hooks/useReservations';
import { usePlanters } from '../hooks/usePlanters';

interface CartProps {
  onBackClick?: () => void;
}

const Cart: React.FC<CartProps> = ({ onBackClick }) => {
  const { user } = useAuth();
  const { reservations, refetch: refetchReservations } = useReservations();
  const { planters } = usePlanters();
  const [loading, setLoading] = useState(false);

  const cartItems = reservations
    .map(res => ({
      reservation: res,
      planter: planters.find(p => p.id === res.planter_id),
    }))
    .filter(item => item.planter);

  const total = cartItems.reduce((sum, item) => sum + (item.planter?.price || 0), 0);

  const handleRemoveItem = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId);

      if (error) throw error;
      refetchReservations();
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Please sign in first');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      // Create orders for each item
      const orders = cartItems.map(item => ({
        user_id: user.id,
        planter_id: item.planter?.id,
        reservation_id: item.reservation.id,
        total_price: item.planter?.price || 0,
        status: 'completed' as const,
      }));

      const { error: orderError } = await supabase
        .from('orders')
        .insert(orders);

      if (orderError) throw orderError;

      // Update planter statuses to sold
      for (const item of cartItems) {
        await supabase
          .from('planters')
          .update({ status: 'sold' })
          .eq('id', item.planter?.id);
      }

      // Delete reservations
      for (const item of cartItems) {
        await supabase
          .from('reservations')
          .delete()
          .eq('id', item.reservation.id);
      }

      alert('Purchase successful! Thank you for your order.');
      refetchReservations();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="flex items-center gap-2 text-green-700 hover:text-green-800 mb-8 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </button>
          )}
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600">Start reserving some beautiful planters!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="flex items-center gap-2 text-green-700 hover:text-green-800 mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Reservations</h1>

            <div className="space-y-4">
              {cartItems.map(item => {
                const timeLeft = Math.max(0, new Date(item.reservation.expires_at).getTime() - new Date().getTime());
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);

                return (
                  <div key={item.reservation.id} className="bg-white rounded-lg shadow-sm p-4 flex gap-4">
                    <img
                      src={item.planter?.image_url}
                      alt={item.planter?.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.planter?.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.planter?.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-gray-900">
                          ${item.planter?.price.toFixed(2)}
                        </span>
                        <span className="text-sm font-medium text-yellow-700">
                          {minutes}:{seconds.toString().padStart(2, '0')} left
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.reservation.id)}
                      className="text-red-600 hover:text-red-800 transition p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="my-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-green-700">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-bold rounded-lg transition mb-3"
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  Your reservation expires in 15 minutes. Complete your purchase to secure your planter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
