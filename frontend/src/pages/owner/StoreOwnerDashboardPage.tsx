import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { RatingItem, Store } from '../../types';
import { Header } from '../../components/common/Header';
import { StarRating } from '../../components/common/StarRating';
import { Store as StoreIcon, Star, Users, MapPin, AlertCircle } from 'lucide-react';

export const StoreOwnerDashboardPage: React.FC = () => {
  const [hasStore, setHasStore] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [ratingsList, setRatingsList] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/stores/owner/dashboard');
        if (!res.data.hasStore) {
          setHasStore(false);
        } else {
          setHasStore(true);
          setStore(res.data.store);
          setAverageRating(res.data.averageRating);
          setTotalRatings(res.data.totalRatings);
          setRatingsList(res.data.ratingsList);
        }
      } catch (err) {
        console.error('Failed to load store owner dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <Header />
        <main className="main-content" style={{ textAlign: 'center', padding: '4rem' }}>
          Loading dashboard metrics...
        </main>
      </div>
    );
  }

  if (!hasStore) {
    return (
      <div className="app-container">
        <Header />
        <main className="main-content">
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <AlertCircle size={48} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>No Store Assigned Yet</h2>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem', maxWidth: '500px', margin: '0.5rem auto 0 auto' }}>
              Your store owner account is created, but no store has been assigned to you by the System Administrator yet.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* Store Title */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-icon" style={{ width: '44px', height: '44px' }}>
              <StoreIcon size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 700 }}>{store?.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                <MapPin size={15} />
                <span>{store?.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Metrics Overview */}
        <div className="grid-3">
          <div className="metric-card">
            <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Star size={28} />
            </div>
            <div className="metric-data">
              <h3>Average Store Rating</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                <span className="value" style={{ fontSize: '2.2rem' }}>{averageRating}</span>
                <StarRating rating={averageRating} size={22} />
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
              <Users size={28} />
            </div>
            <div className="metric-data">
              <h3>Total User Reviews</h3>
              <div className="value">{totalRatings}</div>
            </div>
          </div>
        </div>

        {/* Submitter Ratings Table */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            Customer Feedback & Ratings List
          </h2>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>User Email</th>
                  <th>Submitted Rating</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {ratingsList.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '2.5rem' }}>
                      No ratings have been submitted for your store yet.
                    </td>
                  </tr>
                ) : (
                  ratingsList.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.user.name}</td>
                      <td>{item.user.email}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <StarRating rating={item.rating} size={16} />
                          <span style={{ fontWeight: 700 }}>{item.rating} / 5</span>
                        </div>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        {new Date(item.submittedAt).toLocaleDateString()} at{' '}
                        {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
