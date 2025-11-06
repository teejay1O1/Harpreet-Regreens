import React from 'react';
import { Leaf, Award, Clock, Heart } from 'lucide-react';
import PlanterCard from '../components/PlanterCard';
import { usePlanters } from '../hooks/usePlanters';
import { useReservations } from '../hooks/useReservations';

const Home: React.FC = () => {
  const { planters, loading } = usePlanters();
  const { reservations, refetch: refetchReservations } = useReservations();

  const getReservationForPlanter = (planterId: string) => {
    return reservations.find(r => r.planter_id === planterId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Harpreet Regreens
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Hand-crafted planters nurtured with care for months and years. Each piece is a unique work of art, grown with passion and perfected to bring life to your space.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                <Award className="w-5 h-5 text-green-700" />
                <span className="text-sm font-medium">Handcrafted Quality</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                <Clock className="w-5 h-5 text-green-700" />
                <span className="text-sm font-medium">Years in the Making</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                <Heart className="w-5 h-5 text-green-700" />
                <span className="text-sm font-medium">One of a Kind</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Natural Beauty</h3>
              <p className="text-sm text-gray-600">Each planter is carefully cultivated from premium materials using sustainable practices.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Artisan Crafted</h3>
              <p className="text-sm text-gray-600">Every piece is hand-crafted by artisans with years of experience and dedication.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Unique Collection</h3>
              <p className="text-sm text-gray-600">No two planters are the same. Reserve yours today and own a truly exclusive piece.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Planters Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Exclusive Collection
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin">
                <Leaf className="w-8 h-8 text-green-700" />
              </div>
            </div>
          ) : planters.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600">No planters available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {planters.map(planter => (
                <PlanterCard
                  key={planter.id}
                  planter={planter}
                  reservation={getReservationForPlanter(planter.id)}
                  onReservationChange={refetchReservations}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Limited Edition Availability</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Each planter in our collection represents months or years of careful nurturing and craftsmanship. Once reserved or sold, it's gone forever. Reserve yours for 15 minutes to complete your purchase.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-3xl font-bold text-green-400 mb-2">15 min</p>
              <p className="text-gray-300">Reservation window to checkout</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400 mb-2">2</p>
              <p className="text-gray-300">Maximum planters per person</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400 mb-2">100%</p>
              <p className="text-gray-300">Hand-crafted authentic pieces</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
